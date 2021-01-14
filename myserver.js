let ws =  require('ws').Server;
let myserver = new ws({port:3000});

let users = {};

function sendTo(connection, message) { 
    connection.send(JSON.stringify(message)); 
}
function sendAll(message) {
    for(let item in users){
        users[item].send(JSON.stringify(message))
    }
}
myserver.on('connection',function(connection){
    console.log('server is starting');
    connection.on('message',function(message) {
        let data = null;
        try{
            data = JSON.parse(message);
        }catch(e){
            console.log(e);
            data = null;
        }
        switch(data.type){  // 用户登录
            case 'login': // data = {type:'login,user:'xxx'}
                console.log('login   ' + data.from)
                if(users[data.from]) { 
                    sendTo(connection, { 
                       type: "login", 
                       success: false 
                    }); 
                 } else { 
                    //save user connection on the server 
                    users[data.from] = connection; 
                    connection.name = data.from; 
                    sendAll({ 
                       type: "login", 
                       user:data.from,
                       success: true 
                    }); 
                 } 
                break;
            case 'offer': // a发送offer给某个人
                console.log('send offer to ' +  data.call) // data = {type:'offer',offer:'',user:'user}
                var callOnes =  users[data.call]; // 这个人是b
                if(callOnes !== undefined) {
                    connection.linkUser = data.call; // a的联系人是b
                    sendTo(callOnes,{ // {type:'offer,offer:offer,from:'谁发起的'}
                        type:'offer',
                        offer:data.offer,
                        from:data.from
                    })
                }else {
                    console.log('没有找到该用户') // {type:'offer,success:false,message}
                    sendTo(connection,{
                        type:'offer',
                        success:false,
                        message:'该用户不在线'
                    })
                }
                break;
            case 'answer': // a收到某个人的应答
                console.log('send answer to ' + data.call);
                var callOnes =  users[data.call];
                if(callOnes !== undefined) {
                    connection.linkUser = data.call; // b的联系人是a
                    sendTo(callOnes,{  // 被应答方向应答方发送answer、
                        type:'answer',
                        answer:data.answer,
                        from:data.from
                    })
                }else {
                    sendTo(connection,{ // 被应答方没有应答
                        type:'answer',
                        success:false,
                        message:'该用户不想和您通话'
                    })
                }
                break;
            case "candidate": 
                console.log("Sending candidate to:",data.call); 
                var conn = users[data.call];
                if(conn != undefined) { 
                    sendTo(conn,{ 
                        type: "candidate", 
                        candidate: data.candidate ,
                        from:data.from
                    }); 
                } else {
                    console.log('没有candidate')
                }
                break;
            case "leave":  // 视频的一方结束了
                console.log("Disconnecting from", data.from); 
                var conn = users[data.call]; 
                // conn.otherName = null; 
                //notify the other user so he can disconnect his peer connection 
                if(conn != null) { 
                   sendTo(conn,{ 
                      type: "leave",
                   }); 
                } 
                break;
            default:
                sendAll({
                    type:'error',
                    message:'常规操作'
                })
                break;
        }
    })
    connection.on('close', function(e){
        if(connection.name) {
            delete users[connection.name];
            if(connection.linkUser){ // a断开连接，告诉a的联系人他走了，让他们也断开连接
                let conn = users[connection.linkUser];
                if(conn.linkUser){
                    conn.linkUser = null;
                }
                if(conn != undefined){
                    sendTo(conn,{
                        type:'leave'
                    })
                }
            }
        }
        console.log(connection.name + '断开了链接')
        console.log(Object.keys(users).length)
        console.log('server is close');
    })
})
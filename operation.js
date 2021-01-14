const ipc = require('electron').ipcRenderer;  // 子页面的交互
let nowTitle;
let nowNumber; // 记录当前窗口

document.getElementById('smallBtn').addEventListener('click',function(){ // 这里应该存储单个页面的title，记录窗口的名字
    console.log('samll')
    ipc.send('browserOperation','small',nowNumber)
})
document.getElementById('returnBtn').addEventListener('click',function(){
    console.log('return')
    ipc.send('browserOperation','return',nowNumber)
})
document.getElementById('closeBtn').addEventListener('click',function(){
    console.log('close')
    ipc.send('browserOperation','close',nowNumber)
})
ipc.on('setTitle',function(e,title,number){
    nowNumber = number;
    nowTitle = title;
    console.log(title,number);
    document.getElementById('titleName').textContent = title + number;
})
setTimeout(()=>{ // 
   ipc.send('getTitle')
    console.log(value)
},100)

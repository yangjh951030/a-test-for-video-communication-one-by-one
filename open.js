const ipc = require('electron').ipcRenderer;   // 首个页面的交互
let browser = 0;
document.getElementById('newBrowser').addEventListener('click',function(){ // 点击之后的browser+1，记录子窗口数
    browser++;
    ipc.send('openBrowser','browser',browser)
})
document.getElementById('smallBtn').addEventListener('click',function(){
    console.log('samll')
    ipc.send('browserOperation','small','main')
})
document.getElementById('returnBtn').addEventListener('click',function(){
    console.log('return')
    ipc.send('browserOperation','return','main')
})
document.getElementById('closeBtn').addEventListener('click',function(){
    console.log('close')
    ipc.send('browserOperation','close','main')
})

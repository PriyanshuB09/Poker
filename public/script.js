const socket = io();
const input = document.getElementById('msgInput');
const list = document.getElementById('messages');

socket.on('message', msg => {
    const li = document.createElement('li');
    li.textContent = msg;
    list.appendChild(li);
});

function sendMsg() {
    const msg = input.value;
    socket.emit('message', msg);
    input.value = '';
}
const socket = io();

const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const loginForm = document.getElementById('login-form');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messages = document.getElementById('messages');
const typingIndicator = document.getElementById('typing');

let username = '';
let typingTimeout;

// Handle login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    username = document.getElementById('username').value.trim();
    if (username) {
        loginContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        socket.emit('join', username);
        addSystemMessage(`Welcome to the chat, ${username}!`);
    }
});

// Handle sending messages
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('message', message);
        messageInput.value = '';
    }
});

// Handle typing indicator
messageInput.addEventListener('input', () => {
    socket.emit('typing');
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('stopTyping');
    }, 1000);
});

// Socket event listeners
socket.on('message', (data) => {
    addMessage(data);
    scrollToBottom();
});

socket.on('userJoined', (user) => {
    addSystemMessage(`${user} joined the chat`);
});

socket.on('userLeft', (user) => {
    if (user) {
        addSystemMessage(`${user} left the chat`);
    }
});

socket.on('typing', (user) => {
    typingIndicator.textContent = `${user} is typing...`;
    setTimeout(() => {
        typingIndicator.textContent = '';
    }, 1000);
});

// Helper functions
function addMessage(data) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${data.user === username ? 'sent' : 'received'}`;
    
    if (data.user !== username) {
        const usernameDiv = document.createElement('div');
        usernameDiv.className = 'username';
        usernameDiv.textContent = data.user;
        messageDiv.appendChild(usernameDiv);
    }
    
    const textDiv = document.createElement('div');
    textDiv.className = 'text';
    textDiv.textContent = data.text;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'time';
    timeDiv.textContent = data.time;
    
    messageDiv.appendChild(textDiv);
    messageDiv.appendChild(timeDiv);
    messages.appendChild(messageDiv);
}

function addSystemMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'system-message';
    messageDiv.textContent = text;
    messages.appendChild(messageDiv);
    scrollToBottom();
}

function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
}

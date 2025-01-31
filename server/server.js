const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('public'));

const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const users = new Map();

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join', (username) => {
        users.set(socket.id, username);
        socket.broadcast.emit('userJoined', username);
    });

    socket.on('message', (message) => {
        const user = users.get(socket.id);
        io.emit('message', {
            user: user,
            text: message,
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on('typing', () => {
        const user = users.get(socket.id);
        socket.broadcast.emit('typing', user);
    });

    socket.on('disconnect', () => {
        const username = users.get(socket.id);
        users.delete(socket.id);
        socket.broadcast.emit('userLeft', username);
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

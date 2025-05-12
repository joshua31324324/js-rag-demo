const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3002;
const users = {}; // Store connected users

// Serve static files from the public directory
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Simulated async welcome message fetch
async function fetchWelcomeMessage() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("Welcome to the Simple WebSocket Chat!");
        }, 1500);
    });
}

// Socket.IO Logic
io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Set username
    socket.on('set username', async (username) => {
        users[socket.id] = username || 'Guest'; // Default to "Guest"
        console.log(`👤 ${socket.id} set username: ${users[socket.id]}`);

        socket.broadcast.emit('system message', `${users[socket.id]} has joined the chat!`);

        try {
            const welcomeMessage = await fetchWelcomeMessage();
            socket.emit('system message', welcomeMessage);
        } catch (error) {
            console.error("Error fetching welcome message:", error);
        }
    });

    // Typing indicator with debouncing
    let typingTimer;
    socket.on('typing', () => {
        clearTimeout(typingTimer);
        const username = users[socket.id] || 'Anonymous';
        socket.broadcast.emit('typing', username);

        typingTimer = setTimeout(() => {
            socket.broadcast.emit('stop typing');
        }, 2000);
    });

    // Handle chat messages
    socket.on('chat message', (msg) => {
        const username = users[socket.id] || 'Guest';
        io.emit('chat message', { user: username, msg });
    });

    // Private Messaging
    socket.on('private message', ({ to, msg }) => {
        const sender = users[socket.id] || 'Anonymous';
        io.to(to).emit('chat message', { user: sender, msg, private: true });
    });

    // Message reactions
    socket.on('reaction', (data) => {
        io.emit('reaction', data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        const username = users[socket.id];
        if (username) {
            console.log(`❌ User ${username} disconnected`);
            socket.broadcast.emit('system message', `${username} has left the chat.`);
            delete users[socket.id];
        }
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});

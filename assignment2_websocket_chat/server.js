// server.js
const express = require('express');
const http = require('http');
const { Server } = require("socket.io"); // Import the Server class from socket.io

const app = express();
const server = http.createServer(app); // Create an HTTP server using Express
const io = new Server(server); // Initialize Socket.IO, passing it the HTTP server

const PORT = process.env.PORT || 3001; // Changed port to 3001

// Keep track of connected users (socket.id -> username)
const users = {};

// --- ASYNC/PROMISE Demonstration ---
/**
 * Simulates fetching a welcome message asynchronously.
 * Returns a Promise that resolves with the message after a delay.
 * DEMONSTRATES: Returning a Promise, using setTimeout for async simulation.
 */
function fetchWelcomeMessage() {
    console.log('⏳ Simulating fetching welcome message...');
    // Return a new Promise. The function passed to the Promise constructor
    // takes two arguments: `resolve` and `reject`.
    return new Promise((resolve, reject) => {
        // Simulate a network delay (e.g., 1.5 seconds)
        setTimeout(() => {
            // On success, call `resolve` with the result.
            const welcomeMsg = "Welcome to the Simple WebSocket Chat!";
            console.log('✅ Welcome message fetched.');
            resolve(welcomeMsg);
            // If there was an error, you would call `reject(errorObject)`
        }, 1500);
    });
}

// Serve the index.html file when someone visits the root URL
// This uses an ANONYMOUS FUNCTION (the arrow function `(req, res) => { ... }`)
// as a CALLBACK for the Express route handler.
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// --- Socket.IO Logic ---

// Register an event listener for new connections.
// The function passed here `async (socket) => { ... }` is:
// 1. ANONYMOUS: It has no name.
// 2. A CALLBACK: `io.on` will call this function back when a 'connection' event happens.
// 3. ASYNC: Marked with `async` so we can use `await` inside it.
io.on('connection', async (socket) => {
  console.log('✅ A user connected:', socket.id); // Log when a new client connects

  // Listen for the client setting their username
  // Another ANONYMOUS FUNCTION CALLBACK
  socket.on('set username', async (username) => { // Mark inner callback as async too for await
    users[socket.id] = username;
    console.log(`👤 User ${socket.id} set username to: ${username}`);

    // Broadcast to *other* users that this user has joined
    // `.broadcast` sends to everyone *except* the current socket
    socket.broadcast.emit('system message', `${username} has joined the chat!`);

    // --- ASYNC/AWAIT Demonstration ---
    try {
        // Use `await` to pause execution here until the Promise returned
        // by `fetchWelcomeMessage()` resolves. This makes async code look
        // more like synchronous code.
        const welcomeMessage = await fetchWelcomeMessage();

        // Send the fetched welcome message only back to the newly connected user
        socket.emit('system message', welcomeMessage);

    } catch (error) {
        console.error("Error fetching welcome message:", error);
        socket.emit('system message', "Sorry, couldn't fetch the welcome message.");
    }
  });


  // Listen for 'disconnect' events
  // ANONYMOUS FUNCTION CALLBACK
  socket.on('disconnect', () => {
    const username = users[socket.id]; // Get username before deleting
    if (username) {
      console.log(`❌ User ${username} (${socket.id}) disconnected`);
      // Broadcast to other users that this user has left
      socket.broadcast.emit('system message', `${username} has left the chat.`);
      delete users[socket.id]; // Remove user from our tracking object
    } else {
        console.log(`❌ User ${socket.id} (no username set) disconnected`);
    }
  });

  // Listen for 'chat message' events from a client
  // ANONYMOUS FUNCTION CALLBACK
  socket.on('chat message', (msg) => {
    const username = users[socket.id];
    if (username) {
      console.log(`💬 Message from ${username} (${socket.id}): ${msg}`);
      // Broadcast the message object to ALL connected clients (including the sender)
      // Now includes the username!
      io.emit('chat message', { user: username, msg: msg });
    } else {
      // Handle case where message received before username is set (optional)
      console.log(`💬 Message from anonymous user (${socket.id}): ${msg}`);
       socket.emit('system message', "Please set a username before sending messages.");
    }
  });
});
// --- End Socket.IO Logic ---


// Start the server
// ANONYMOUS FUNCTION CALLBACK for when the server is ready
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

# Assignment 2: Building a Real-Time WebSocket Chat

## Introduction

Welcome to Assignment 2! In the previous assignment, we explored how AI understands language through embeddings. Now, we shift gears to a different but equally important aspect of modern web development: **real-time communication**.

Imagine applications like live chats, collaborative document editing, real-time dashboards, or online multiplayer games. These require information to flow instantly between users and servers without constantly refreshing the page. This is achieved using **WebSockets**.

In this assignment, we will build a simple web-based chat application using Node.js, Express, and a popular library called **Socket.IO**, which simplifies working with WebSockets. Along the way, we'll break down key JavaScript concepts crucial for asynchronous and event-driven programming.

**Learning Objectives:**

*   Understand the difference between traditional HTTP request/response and WebSocket communication.
*   Learn the basics of Socket.IO for establishing real-time, bidirectional connections.
*   Set up a simple Node.js/Express server.
*   Implement basic chat functionality (sending and receiving messages).
*   Understand and identify **anonymous functions**, **callbacks**, and **async/await** in the context of the chat application.
*   Grasp the concept of **streaming** data over a persistent connection.

## What are WebSockets? (And why not just HTTP?)

Think about how you usually browse the web. You click a link (make an **HTTP request**), the server processes it and sends back a whole web page (an **HTTP response**), and then the connection closes. If you want new information, you have to make another request (e.g., refresh the page). This is the standard **request-response** model.

**WebSockets** are different. They allow for a **persistent, bidirectional connection** between a client (like your web browser) and a server.

*   **Persistent:** Once established, the connection stays open.
*   **Bidirectional:** Both the client and the server can send messages to each other *at any time* without waiting for a request.

This makes WebSockets ideal for applications needing real-time updates. It's like having an open phone line instead of sending letters back and forth.

## What is Socket.IO?

While WebSockets are a standard web technology, working with them directly can sometimes be tricky, especially regarding browser compatibility or handling connection issues.

**Socket.IO** is a JavaScript library that makes working with real-time connections much easier.

*   It primarily uses WebSockets but can fall back to other techniques (like long-polling) if WebSockets aren't supported, ensuring broader compatibility.
*   It provides a simple API for sending and receiving events (messages) between the client and server.
*   It handles things like connection management and automatic reconnection.

We'll use Socket.IO to build our chat application.

## Setting up the Project

1.  **Create Project Directory:** If you haven't already, create a directory for this assignment.
2.  **Initialize npm:** Open your terminal in the project directory and run:
    ```bash
    npm init -y
    ```
3.  **Install Dependencies:** We need Express (a web framework for Node.js) and Socket.IO.
    ```bash
    npm install express socket.io
    ```
4.  **Create Files:** Create two files in your project directory:
    *   `server.js` (for our server-side code)
    *   `index.html` (for our client-side code)

## Building the Server (`server.js`)

Let's set up the basic server.

```javascript
// server.js
const express = require('express');
const http = require('http');
const { Server } = require("socket.io"); // Import the Server class from socket.io

const app = express();
const server = http.createServer(app); // Create an HTTP server using Express
const io = new Server(server); // Initialize Socket.IO, passing it the HTTP server

const PORT = process.env.PORT || 3000;

// Serve the index.html file when someone visits the root URL
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// --- Socket.IO Logic ---
io.on('connection', (socket) => {
  console.log('✅ A user connected:', socket.id); // Log when a new client connects

  // Listen for 'disconnect' events
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });

  // Listen for 'chat message' events from a client
  socket.on('chat message', (msg) => {
    console.log('💬 Message received:', msg);
    // Broadcast the message to ALL connected clients (including the sender)
    io.emit('chat message', msg);
  });
});
// --- End Socket.IO Logic ---


// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
```

**Code Breakdown (`server.js`):**

1.  **Imports:** We import `express`, Node.js's built-in `http` module, and the `Server` class from `socket.io`.
2.  **Express Setup:** We create an Express application (`app`).
3.  **HTTP Server:** We create a standard Node.js HTTP server (`server`) using our Express app. Socket.IO needs to attach to this underlying HTTP server.
4.  **Socket.IO Initialization:** We create a new Socket.IO `Server` instance (`io`), telling it to use our `server`.
5.  **Serving HTML:** `app.get('/', ...)` sets up a route. When a browser requests the main page (`/`), the server sends back the `index.html` file.
6.  **`io.on('connection', (socket) => { ... });`**: This is the core of Socket.IO on the server.
    *   `io.on(...)`: This registers an **event listener** on the main Socket.IO server instance.
    *   `'connection'`: This specific event fires *every time a new client successfully connects* to the server via Socket.IO.
    *   `(socket) => { ... }`: This is an **anonymous function** (also called an arrow function here). It doesn't have a name like `function myFunction() {}`. It's defined right here where it's used. This function is also a **callback** – it's a function passed as an argument to `io.on`, and Socket.IO will *call it back* later when the `'connection'` event happens.
    *   `socket`: The `socket` parameter inside the callback represents the *individual connection* to that specific client. Each connected user gets their own `socket` object.
7.  **`socket.on('disconnect', () => { ... });`**: Inside the connection callback, we set up another event listener, this time *on the individual `socket`*.
    *   `'disconnect'`: This event fires when *that specific client* disconnects.
    *   `() => { ... }`: Another anonymous function (callback) executed when disconnection occurs.
8.  **`socket.on('chat message', (msg) => { ... });`**: We listen for a custom event named `'chat message'` coming from a specific client.
    *   `(msg) => { ... }`: An anonymous callback function. The `msg` parameter will contain the data sent by the client with this event (in our case, the chat message text).
    *   `io.emit('chat message', msg);`: This is how the server sends a message *out* to *all* connected clients. `io.emit` broadcasts the event `'chat message'` along with the data (`msg`) to everyone.

## Building the Client (`index.html`)

Now, let's create the user interface and the client-side JavaScript to connect to the server.

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Simple WebSocket Chat</title>
    <style>
        body { margin: 0; padding-bottom: 3rem; font-family: sans-serif; }
        #form { background: rgba(0, 0, 0, 0.15); padding: 0.25rem; position: fixed; bottom: 0; left: 0; right: 0; display: flex; height: 3rem; box-sizing: border-box; backdrop-filter: blur(10px); }
        #input { border: none; padding: 0 1rem; flex-grow: 1; border-radius: 2rem; margin: 0.25rem; }
        #input:focus { outline: none; }
        #form > button { background: #333; border: none; padding: 0 1rem; margin: 0.25rem; border-radius: 3px; outline: none; color: #fff; }
        #messages { list-style-type: none; margin: 0; padding: 0; }
        #messages > li { padding: 0.5rem 1rem; }
        #messages > li:nth-child(odd) { background: #efefef; }
    </style>
</head>
<body>
    <ul id="messages"></ul>
    <form id="form" action="">
        <input id="input" autocomplete="off" /><button>Send</button>
    </form>

    <!-- Include the Socket.IO client library -->
    <script src="/socket.io/socket.io.js"></script>
    <script>
        // Connect to the Socket.IO server (defaults to the server that served this page)
        const socket = io();

        // Get references to the HTML elements
        const form = document.getElementById('form');
        const input = document.getElementById('input');
        const messages = document.getElementById('messages');

        // --- Sending Messages ---
        // Add an event listener for when the form is submitted
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission (page reload)
            if (input.value) { // Check if the input field is not empty
                // Emit a 'chat message' event to the server with the input value
                socket.emit('chat message', input.value);
                input.value = ''; // Clear the input field
            }
        });

        // --- Receiving Messages ---
        // Add an event listener for 'chat message' events coming FROM the server
        socket.on('chat message', function(msg) {
            const item = document.createElement('li'); // Create a new list item element
            item.textContent = msg; // Set its text content to the received message
            messages.appendChild(item); // Add the list item to the messages list
            window.scrollTo(0, document.body.scrollHeight); // Scroll to the bottom
        });

        // --- Optional: Listen for connect/disconnect events on client ---
        socket.on('connect', () => {
            console.log('✅ Connected to server:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from server');
        });

    </script>
</body>
</html>
```

**Code Breakdown (`index.html`):**

1.  **HTML Structure:** Basic HTML for a message list (`<ul>`) and an input form (`<form>`).
2.  **`<script src="/socket.io/socket.io.js"></script>`:** This is crucial. When we initialized Socket.IO on the server (`new Server(server)`), it automatically made the client-side library available at this specific path. This script gives the browser the `io()` function.
3.  **`const socket = io();`:** This line establishes the WebSocket connection from the browser to the server. The `io()` function (provided by the script above) handles the connection setup.
4.  **Element References:** We get references to the form, input field, and message list using standard DOM methods.
5.  **Sending Messages (`form.addEventListener(...)`):**
    *   We listen for the `submit` event on the form.
    *   `function(event) { ... }`: This is another **anonymous function**. It's also a **callback** function, executed by the browser whenever the form is submitted.
    *   `event.preventDefault();`: Stops the browser from doing its default form submission (which would reload the page).
    *   `socket.emit('chat message', input.value);`: This sends the event named `'chat message'` *to the server*, along with the current text from the input field as data.
6.  **Receiving Messages (`socket.on('chat message', ...)`):**
    *   `socket.on(...)`: We listen for the `'chat message'` event *coming from the server*.
    *   `function(msg) { ... }`: An anonymous **callback** function executed whenever the server `emit`s a `'chat message'`. The `msg` parameter contains the message data sent by the server.
    *   Inside the callback, we create a new list item (`<li>`), set its text to the received message, and append it to the message list (`<ul>`).

## Running the Chat

1.  Open your terminal in the project directory.
2.  Run the server: `node server.js`
3.  Open your web browser and go to `http://localhost:3000`.
4.  Open the same address in *another* browser tab or window.
5.  Type messages in one window – they should appear in both! Check the terminal running `server.js` to see connection and message logs.

## Explaining the Code Concepts

Let's revisit the concepts you asked about:

1.  **Anonymous Functions:**
    *   **What:** Functions defined without a name, often right where they are needed. We used them extensively as callbacks for event listeners.
    *   **Examples:**
        *   `io.on('connection', (socket) => { /* code */ });` (Arrow function syntax)
        *   `form.addEventListener('submit', function(event) { /* code */ });` (Traditional function syntax)
    *   **Why:** Convenient for short, single-use functions. Avoids cluttering the code with lots of named functions that are only used once.

2.  **Callbacks:**
    *   **What:** A function passed as an argument to another function, which is then executed ("called back") later when a specific event occurs or an asynchronous operation completes. Event handling in JavaScript (and Node.js) relies heavily on callbacks.
    *   **Examples:** *All* the anonymous functions we passed to `.on()` and `addEventListener()` are callbacks. Socket.IO or the browser calls them back when the corresponding event (`'connection'`, `'disconnect'`, `'chat message'`, `'submit'`) happens.
    *   **Why:** Essential for handling asynchronous operations (like waiting for a connection or a message) without freezing the entire program. The program sets up the callback and continues running; the callback executes only when the event occurs.

3.  **Async/Await:**
    *   **What:** Modern JavaScript syntax (`async` and `await`) for handling asynchronous operations in a way that *looks* more synchronous and is often easier to read than nested callbacks or Promise `.then()` chains.
    *   **Where in *this* example?** Our simple chat example doesn't heavily feature `async`/`await` because Socket.IO's event-based nature (`.on`, `.emit`) handles the asynchronicity directly. However, if we were, for example, loading initial chat history from a database *before* starting the server, we might use `async`/`await`:
        ```javascript
        // Hypothetical example using async/await
        async function startServer() {
          try {
            // Assume loadHistory is an async function returning a Promise
            const history = await loadHistoryFromDatabase(); 
            console.log('Chat history loaded.');

            // Now proceed with server setup...
            io.on('connection', (socket) => {
                // Send history to new user, etc.
            });

            server.listen(PORT, () => {
              console.log(`🚀 Server listening on port ${PORT}`);
            });
          } catch (error) {
            console.error("Failed to start server:", error);
          }
        }

        startServer(); // Call the async function
        ```
        In this *hypothetical* case, `async function startServer()` declares an asynchronous function. `await loadHistoryFromDatabase()` pauses the `startServer` function *without blocking the rest of Node.js* until the database operation (which returns a Promise) completes. Then, the code continues.
    *   **Why:** Improves readability and error handling for Promise-based asynchronous code compared to older patterns.

4.  **Socket.IO (`.on`, `.emit`):**
    *   **`.on(eventName, callback)`:** Listens for an event. When the event `eventName` occurs, the `callback` function is executed. Used on both client and server to *receive* messages/events.
    *   **`.emit(eventName, data)`:** Sends (emits) an event named `eventName`, optionally including some `data`. Used on both client and server to *send* messages/events.
        *   `socket.emit(...)`: Sends *only* to the specific client represented by `socket` (client-side) or from that specific client (server-side, if sending back just to them).
        *   `io.emit(...)`: Sends to *all* connected clients (usually used server-side for broadcasting).

5.  **Streaming:**
    *   **What:** In this context, "streaming" refers to the continuous flow of data over the persistent WebSocket connection. Unlike the request-response model where data comes in discrete chunks (pages), WebSockets allow messages (data) to be sent and received continuously as events happen (like users typing chat messages).
    *   **How it relates:** Socket.IO manages this stream. Every time `socket.emit('chat message', ...)` is called, a piece of data (the message) is pushed onto the stream from the sender to the receiver(s). The receiver's `socket.on('chat message', ...)` listener picks up these pieces of data as they arrive from the stream. It's not one big download; it's a flow of smaller messages over time.

## Assignment Task

1.  **Implement Typing Indicators:**
    *   When a user starts typing in the input box, emit a `'typing'` event to the server.
    *   When the user stops typing (or clears the input), emit a `'stop typing'` event.
    *   The server should listen for these events.
    *   When the server receives `'typing'`, it should broadcast a `'user typing'` event to *all other* clients (not the original sender). You'll need the sender's `socket.id` or perhaps assign usernames.
    *   When the server receives `'stop typing'`, it should broadcast a `'user stopped typing'` event to *all other* clients.
    *   The client should listen for `'user typing'` and `'user stopped typing'` and display a message like "User XYZ is typing..." somewhere on the page (maybe below the message list). You'll need a way to manage multiple typing users.
2.  **Bonus: User List:** Display a list of currently connected users. You might need to maintain a list of connected users/socket IDs on the server and broadcast updates when users connect or disconnect.

Submit your modified `server.js` and `index.html` files. Good luck!


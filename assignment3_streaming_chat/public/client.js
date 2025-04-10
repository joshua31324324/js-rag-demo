// Get references to the necessary HTML elements from the DOM
const chatForm = document.getElementById('chat-form');       // The form containing the input and send button
const messageInput = document.getElementById('message-input'); // The text input field
const chatbox = document.getElementById('chatbox');           // The container where messages are displayed
const sendButton = document.getElementById('send-button');     // The send button

/**
 * Adds a message (either from the user or the AI) to the chatbox UI.
 * @param {string} sender - 'user' or 'ai' to indicate the message origin.
 * @param {string} text - The content of the message.
 * @returns {HTMLElement} The newly created message div element.
 */
function addMessage(sender, text) {
    // Create a new div element for the message
    const messageDiv = document.createElement('div');
    // Add CSS classes for styling: common 'message' class and specific sender class
    messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
    // Set the text content of the message div
    // Use innerHTML instead of textContent to allow basic HTML rendering (like code blocks)
    // **Security Note:** Ensure server-side sanitization if AI can generate arbitrary HTML.
    // For this example, we assume AI output is safe or contains only simple formatting.
    messageDiv.innerHTML = text; // Changed from textContent
    // Append the new message div to the chatbox
    chatbox.appendChild(messageDiv);
    // Automatically scroll the chatbox to the bottom to show the latest message
    chatbox.scrollTop = chatbox.scrollHeight;
    // Return the created div, useful for updating AI messages in place
    return messageDiv;
}

// Add an event listener to the chat form for the 'submit' event
chatForm.addEventListener('submit', async (event) => {
    // Prevent the default form submission behavior (which causes a page reload)
    event.preventDefault(); 

    // Get the user's message from the input field and remove leading/trailing whitespace
    const userMessage = messageInput.value.trim();
    // If the message is empty, do nothing
    if (!userMessage) return; 

    // Disable the input field and send button to prevent multiple submissions while processing
    messageInput.disabled = true;
    sendButton.disabled = true;

    // Display the user's message immediately in the chatbox
    addMessage('user', userMessage);
    // Clear the input field
    messageInput.value = ''; 

    // Create a placeholder div for the AI's response and add a loading indicator
    const aiMessageDiv = addMessage('ai', ''); // Start with empty text
    aiMessageDiv.classList.add('loading'); // Add class for loading animation

    try {
        // Send the user's message to the server's /chat endpoint using fetch
        const response = await fetch('/chat', {
            method: 'POST', // Use POST method
            headers: {
                'Content-Type': 'application/json', // Indicate JSON content type
            },
            body: JSON.stringify({ message: userMessage }), // Send message as JSON
        });

        // Check if the response status is not OK or if the response body is missing
        if (!response.ok || !response.body) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get a ReadableStream reader from the response body
        const reader = response.body.getReader();
        // Create a TextDecoder to convert stream bytes (Uint8Array) to text
        const decoder = new TextDecoder();
        let buffer = ''; // Buffer to store incoming chunks
        let currentAiText = ''; // Accumulator for the AI response text

        // Start reading the stream
        while (true) {
            // Read a chunk from the stream
            const { value, done } = await reader.read();
            // If the stream is finished, break the loop
            if (done) {
                // console.log("Stream finished."); // Debugging
                break;
            }

            // Decode the chunk (Uint8Array) to text and append to the buffer
            buffer += decoder.decode(value, { stream: true });
            // console.log("Received raw buffer:", buffer); // Debugging

            // Process Server-Sent Events (SSE) messages in the buffer
            // SSE messages are separated by double newlines (\n\n)
            let boundary = buffer.indexOf('\n\n');
            while (boundary !== -1) {
                // Extract a single SSE message chunk
                const messageChunk = buffer.substring(0, boundary);
                // Remove the processed chunk from the buffer
                buffer = buffer.substring(boundary + 2); // +2 for \n\n

                // Check if the chunk is a data event (starts with "data: ")
                if (messageChunk.startsWith('data: ')) {
                    // Extract the JSON string part (remove "data: ")
                    const jsonString = messageChunk.substring(6);
                    // console.log("Processing JSON:", jsonString); // Debugging
                    try {
                        // Parse the JSON data
                        const data = JSON.parse(jsonString);
                        
                        // If the data contains message content, append it
                        if (data.content) {
                            currentAiText += data.content;
                            // Update the AI message div's text content in real-time
                            aiMessageDiv.innerHTML = currentAiText; 
                            // Scroll chatbox down as new content arrives
                            chatbox.scrollTop = chatbox.scrollHeight; 
                        } 
                        // If the data signals the end of the stream
                        else if (data.event === 'end') {
                            // console.log("Received end event from server."); // Debugging
                            // Stream finished cleanly
                        } 
                        // If the data contains an error message from the server
                        else if (data.error) {
                            console.error("Server error message:", data.error);
                            aiMessageDiv.innerHTML = `Error: ${data.error}`;
                            aiMessageDiv.style.color = 'red'; // Style error messages
                            // Apply specific error class for better styling
                            aiMessageDiv.classList.add('error-message');
                        }
                    } catch (e) {
                        // Handle errors during JSON parsing (e.g., malformed JSON)
                        console.error('Error parsing JSON chunk:', jsonString, e);
                    }
                } else {
                    // Ignore lines that don't start with "data: " (e.g., comments or empty lines in SSE)
                     // console.log("Skipping non-data line:", messageChunk); // Debugging
                }
                
                // Look for the next SSE message boundary in the updated buffer
                boundary = buffer.indexOf('\n\n');
            }
        }
        
        // Note: Handling for partial messages remaining in the buffer after the loop is omitted
        // because SSE standard typically ensures messages end with \n\n.
        // A robust implementation might handle edge cases here.

    } catch (error) {
        // Handle errors during the fetch operation or stream reading
        console.error('Fetch/Stream error:', error);
        // Display an error message in the AI message placeholder
        aiMessageDiv.innerHTML = 'Error connecting to the server or processing the stream.';
        aiMessageDiv.style.color = 'red';
        // Apply specific error class for better styling
        aiMessageDiv.classList.add('error-message');
    } finally {
        // This block always executes, whether the try block succeeded or failed
        
        // Remove the loading indicator class from the AI message div
        aiMessageDiv.classList.remove('loading'); 
        
        // Re-enable the input field and send button
        messageInput.disabled = false;
        sendButton.disabled = false;
        
        // Set focus back to the message input field for user convenience
        messageInput.focus(); 
        // Ensure the chatbox is scrolled to the very bottom after processing is complete
        chatbox.scrollTop = chatbox.scrollHeight;
    }
});

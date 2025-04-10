# Assignment 3: Streaming Chat with Character Persona

## Goal

This assignment focuses on implementing a real-time streaming chat application where the AI responds based on a defined character persona loaded from a JSON file. It utilizes Server-Sent Events (SSE) for efficient streaming from a Node.js/Express backend to a simple HTML/CSS/JavaScript frontend.

## Key Concepts Demonstrated

*   **Node.js & Express:** Setting up a basic web server.
*   **Server-Sent Events (SSE):** Establishing a unidirectional connection from server to client for streaming data.
*   **LangChain & OpenAI:** Integrating with large language models (LLMs) for chat generation.
*   **Streaming Responses:** Handling and displaying streamed responses from the LLM chunk by chunk.
*   **System Prompts:** Using system messages to guide the AI's behavior and persona.
*   **Environment Variables:** Securely managing API keys using `.env` files.
*   **Basic Frontend Development:** Creating a simple chat interface with HTML, CSS, and vanilla JavaScript.
*   **Asynchronous JavaScript:** Using `async/await` for handling asynchronous operations like API calls and stream processing.
*   **JSON Handling:** Reading and parsing JSON data for configuration (character profile).

## Files

*   `server.js`: The Node.js backend server using Express. Handles SSE connections, interacts with the OpenAI API via LangChain, loads the character persona, and streams responses.
*   `character.json`: Contains the detailed profile of the AI character (demographics, personality, background, etc.).
*   `public/`: Directory containing the frontend files.
    *   `index.html`: The main HTML structure of the chat interface.
    *   `style.css`: CSS rules for styling the chat interface.
    *   `client.js`: Client-side JavaScript to handle form submission, send messages to the server, receive SSE messages, and update the chatbox UI.
*   `.env` (in parent directory): Should contain your `OPENAI_API_KEY`. **Remember to create this file if it doesn't exist!** Example:
    ```
    OPENAI_API_KEY=your_actual_openai_api_key_here
    ```
*   `package.json` & `package-lock.json`: Node.js project files defining dependencies and versions.

## Setup and Running

1.  **Navigate to this directory:**
    ```bash
    cd assignment3_streaming_chat
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Ensure `.env` file exists:** Make sure you have a `.env` file in the **parent** directory (`js-rag-demo`) with your `OPENAI_API_KEY`.
4.  **Run the server:**
    ```bash
    node server.js 
    ```
    (Or use `nodemon server.js` if you have nodemon installed for automatic restarts on file changes).
5.  **Open your browser:** Navigate to `http://localhost:3000` (or the port specified in `server.js` or your environment).

## Student Assignment

### Task: Enhance the Character Persona and Interaction

1.  **Modify the Character:**
    *   Open `character.json`.
    *   Change at least three aspects of the existing character's profile (e.g., change their name, add a new personality trait, alter their background summary, update a situational response).
    *   Add a *new* key-value pair under `situational_responses` representing a common interaction or topic relevant to the *new* character profile you've defined. For example, if you made the character a historian, you might add `"discussing_historical_event": "When considering the impact of that event, one must look at..."`.
2.  **Update the System Prompt:**
    *   Open `server.js`.
    *   Locate the `characterSystemPrompt` construction within the `try...catch` block.
    *   Modify the prompt string to accurately reflect *all* the changes you made to `character.json`, including the new situational response example. Ensure the prompt clearly instructs the AI based on the updated profile.
3.  **Test the Interaction:**
    *   Run the server (`node server.js`).
    *   Open the chat interface in your browser (`http://localhost:3000`).
    *   Engage in a conversation with the AI. Try to ask questions or make statements that would elicit responses related to the changes you made and the new situational response you added.
    *   Verify that the AI responds consistently with the modified persona.

### Bonus Challenge:

*   In `client.js`, add functionality to display the character's name (loaded from `character.json` on the server and potentially sent via a separate endpoint or initial SSE message) somewhere in the UI, perhaps near the title. This would require modifying both `server.js` and `client.js`.

### Submission:

*   Submit the modified `character.json`, `server.js`, and optionally `client.js` (if you did the bonus).
*   Include a short text file briefly describing the changes you made to the character and the prompt, and confirming that you tested the interaction.

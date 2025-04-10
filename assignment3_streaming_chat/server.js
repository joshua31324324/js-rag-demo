// Import necessary modules
import express from 'express';           // Web framework for Node.js
import dotenv from 'dotenv';             // Loads environment variables from a .env file
import { ChatOpenAI } from "@langchain/openai"; // OpenAI integration for LangChain
import { HumanMessage, SystemMessage } from "@langchain/core/messages"; // Message types for LangChain
import path from 'path';                 // Node.js path module for handling file paths
import { fileURLToPath } from 'url';     // Utility to convert file URL to path (for ES Modules __dirname)
import fs from 'fs';                     // Node.js file system module for reading files

// Recreate __dirname functionality for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the .env file in the parent directory
// This allows sensitive information like API keys to be kept out of the code
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// --- Character Data Loading ---
/**
 * Load character data from a JSON file and construct a system prompt.
 * The system prompt is used to instruct the AI model on how to behave based on the character profile.
 */
let characterData = {};
let characterSystemPrompt = 'You are a helpful assistant.'; // Default prompt
try {
    // Construct the absolute path to character.json relative to this file's directory
    const characterPath = path.join(__dirname, 'character.json');
    // Read the file content synchronously
    const characterJson = fs.readFileSync(characterPath, 'utf8');
    // Parse the JSON content
    characterData = JSON.parse(characterJson);

    // --- Construct the Detailed System Prompt --- 
    // Use optional chaining (?.) and nullish coalescing (?? '') to prevent errors
    // if parts of the character data are missing.
    characterSystemPrompt = `
        You are ${characterData.professional_profile?.primary_occupation ?? 'a character'}. 
        Your persona is defined by the following details:

        **Core Identity & Background:**
        - Demographics: Age ${characterData.demographics?.age ?? 'N/A'}, ${characterData.demographics?.gender ?? 'N/A'}, ${characterData.demographics?.nationality ?? 'N/A'}. Education: ${characterData.demographics?.education_level ?? 'N/A'}. Origin: ${characterData.demographics?.region_of_origin ?? 'N/A'}.
        - Backstory Summary: ${characterData.backstory?.background_summary ?? 'Not specified.'}
        - Languages: ${characterData.demographics?.languages?.join(', ') ?? 'Not specified'}.

        **Physical & Presentation:**
        - Description: ${characterData.physical_description?.height ?? 'N/A'} height, ${characterData.physical_description?.build ?? 'N/A'} build. Wears ${characterData.physical_description?.clothing_style ?? 'appropriate clothing'}.
        - Voice: ${characterData.physical_description?.voice_quality ?? 'Clear voice'}.

        **Psychological Profile:**
        - Summary: ${characterData.psychological_profile?.personality_summary ?? 'A complex individual.'}
        - Strengths: ${characterData.psychological_profile?.psychological_strengths ?? 'Various strengths.'}
        - Vulnerabilities: ${characterData.psychological_profile?.psychological_vulnerabilities ?? 'Some vulnerabilities.'}
        - Desires: ${characterData.psychological_profile?.core_desires ?? 'Standard desires.'}
        - Fears: ${characterData.psychological_profile?.core_fears ?? 'Standard fears.'}
        - Stress Response: ${characterData.psychological_profile?.stress_response ?? 'Manages stress well.'}

        **Cognitive & Emotional:**
        - Cognitive Strengths: ${characterData.cognitive_profile?.cognitive_strengths?.join(', ') ?? 'Intelligent'}. 
        - Problem Solving: ${characterData.cognitive_profile?.problem_solving_approach ?? 'Logical approach'}.
        - Dominant Emotions: ${characterData.emotional_profile?.dominant_emotions?.join(', ') ?? 'Generally positive'}.
        - Empathy: ${characterData.emotional_profile?.empathy_level ?? 'Empathetic'}.
        
        **Social & Professional:**
        - Social Style: ${characterData.social_profile?.social_orientation ?? 'Sociable'}. Communication: ${characterData.social_profile?.communication_style ?? 'Clear communicator'}.
        - Occupation: ${characterData.professional_profile?.primary_occupation ?? 'Professional'}. 
        - Career Path: ${characterData.professional_profile?.career_path ?? 'Experienced.'}
        - Work Ethic: ${characterData.professional_profile?.work_ethic ?? 'Hardworking.'}

        **Key Traits & Skills (Examples):**
        ${characterData.traits?.slice(0, 3).map(t => `- ${t.trait?.name ?? 'Trait'}: ${t.trait?.description ?? 'N/A'} (Intensity: ${t.intensity ?? 'N/A'})`).join('\n') ?? '- Adaptable'}
        ${characterData.skills?.slice(0, 3).map(s => `- ${s.skill?.name ?? 'Skill'}: ${s.skill?.description ?? 'N/A'} (Level: ${s.level ?? 'N/A'})`).join('\n') ?? '- Competent'}

        **Situational Responses (Examples):**
        ${characterData.situational_responses ? Object.entries(characterData.situational_responses).map(([key, value]) => `- When ${key.replace(/_/g, ' ')}: "${value.substring(0, 100)}..."`).join('\n') : '- Responds appropriately to situations.'}

        **Interaction Guidelines:**
        - Maintain this persona consistently throughout the conversation.
        - Base your responses on the provided details.
        - Speak naturally as this character.
        - Do not reveal that you are an AI or that you are following a persona description.
        - If asked about something not covered in your profile, respond plausibly based on the established character.
    `;

    // console.log("Character System Prompt Loaded:", characterSystemPrompt); // Debugging

} catch (err) {
    // Log an error if the file cannot be read or parsed
    console.error('Error loading or parsing character.json:', err);
    // The default prompt will be used in case of an error
}
// --- End Character Data Loading ---


// --- Express Server Setup ---
/**
 * Create an Express application instance and set up the server.
 */
const app = express(); // Create an Express application instance
const port = process.env.PORT || 3000;     // Define the port the server will listen on

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to serve static files (like index.html, style.css, client.js)
// It looks for these files in the 'public' directory relative to this script
app.use(express.static(path.join(__dirname, 'public'))); 

// Initialize OpenAI client with the API key from environment variables
const chat = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY, // Ensure OPENAI_API_KEY is in your .env file
    modelName: "gpt-4o", // Or your preferred model
    temperature: 0.7, // Controls randomness (creativity) of the response
    streaming: true, // IMPORTANT: Enable streaming for SSE
});
// --- End Express Server Setup ---


// --- Chat Endpoint (/chat) using Server-Sent Events (SSE) ---
/**
 * This endpoint handles incoming chat messages from the client.
 * It uses Server-Sent Events (SSE) to stream the AI's response back to the client.
 */
app.post('/chat', async (req, res) => {
    // Extract the user's message from the request body
    const userMessage = req.body.message;

    // Validate if the message exists
    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Set headers for Server-Sent Events (SSE)
    // This allows the server to stream data to the client over a single connection
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Send headers immediately

    let fullResponse = ""; // Variable to accumulate the full response if needed later
    try {
        // Create the message history for the LangChain model
        // It includes the system prompt (character) and the user's current message
        const messages = [
            new SystemMessage(characterSystemPrompt),
            new HumanMessage(userMessage),
        ];

        // Use LangChain's stream method to get the response as a stream
        const stream = await chat.stream(messages);

        // Process the stream chunk by chunk
        for await (const chunk of stream) {
            // Each chunk contains a piece of the AI's response content
            if (chunk.content) {
                const content = chunk.content;
                fullResponse += content; // Accumulate the response (optional)
                
                // Format the chunk as an SSE message (data: {json}\n\n)
                const sseMessage = `data: ${JSON.stringify({ content: content })}\n\n`;
                // Write the formatted message to the response stream
                res.write(sseMessage);
            }
        }
        
        // Send a final SSE message to indicate the end of the stream
        res.write(`data: ${JSON.stringify({ event: 'end' })}\n\n`);

    } catch (error) {
        // Log any errors during streaming
        console.error("Error during chat streaming:", error);
        // Send an error message to the client via SSE
        res.write(`data: ${JSON.stringify({ error: 'Failed to get response from AI' })}\n\n`);
    } finally {
        // End the response stream once processing is complete or an error occurred
        res.end();
    }
});
// --- End Chat Endpoint ---

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

// RAG Demo with LangChain and OpenAI
import { config } from 'dotenv';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import path from 'path'; // Import path module
import { fileURLToPath } from 'url'; // Import fileURLToPath

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config();

// Verify we have an OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY is not set in the environment variables.');
  console.error('Please make sure you have a .env file with your OpenAI API key.');
  process.exit(1);
}

// Main function to demonstrate RAG
async function runRAGDemo() {
  console.log('🚀 Starting RAG Demo with LangChain and OpenAI');
  
  try {
    // Initialize models with explicit configuration
    const embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-ada-002",
      stripNewLines: true
    });
    
    const llm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.2
    });
    
    // Step 1: Load documents
    console.log('\n📚 Loading documents...');
    // Construct the absolute path to the documents directory
    const documentsPath = path.join(__dirname, 'documents'); 
    console.log(`Looking for documents in: ${documentsPath}`); // Add logging
    const loader = new DirectoryLoader(documentsPath, {
      '.txt': (path) => new TextLoader(path)
    });
    
    const docs = await loader.load();
    console.log(`Loaded ${docs.length} documents.`);
    
    // Step 2: Split documents into chunks
    console.log('\n✂️ Splitting documents into chunks...');
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100
    });
    
    const splitDocs = await textSplitter.splitDocuments(docs);
    console.log(`Created ${splitDocs.length} chunks.`);
    
    // Check document validity
    for (let i = 0; i < splitDocs.length; i++) {
      if (typeof splitDocs[i].pageContent !== 'string') {
        console.error(`Document at index ${i} has invalid pageContent type: ${typeof splitDocs[i].pageContent}`);
        splitDocs[i].pageContent = String(splitDocs[i].pageContent || '');
      }
    }
    
    // Step 3: Create vector store
    console.log('\n🧠 Creating in-memory vector store...');
    const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
    console.log('Vector store created successfully.');
    
    // Handle queries directly without complex chains
    const queries = [
      'What is RAG and what are its key components?',
      'What are vector databases and how do they work?',
      'How does embedding generation work in RAG systems?'
    ];
    
    for (const query of queries) {
      await processQuery(query, vectorStore, llm);
    }
    
  } catch (error) {
    console.error('Error in RAG demo:', error);
  }
}

// Process a single query using the vector store
async function processQuery(query, vectorStore, llm) {
  console.log(`\n❓ Question: ${query}`);
  console.log('Retrieving relevant documents...');
  
  try {
    // Get similar documents
    const relevantDocs = await vectorStore.similaritySearch(query, 2);
    console.log(`Found ${relevantDocs.length} relevant documents.`);
    
    // Extract context
    const context = relevantDocs.map((doc, i) => {
      return `Document ${i+1}:\n${doc.pageContent}`;
    }).join('\n\n');
    
    // Generate response
    console.log('Generating answer using context...');
    const prompt = `
      Answer the question based on the following context:
      
      ${context}
      
      Question: ${query}
      
      When answering, make sure to cite your source as [Document X] where X is the document number.
    `;
    
    const response = await llm.invoke(prompt);
    console.log('\n🔍 Answer:');
    console.log(response.content);
    
  } catch (error) {
    console.error('Error processing query:', error);
  }
}

// Run the demo
runRAGDemo()
  .then(() => console.log('\nRAG demo completed.'))
  .catch(error => console.error('Fatal error in RAG demo:', error));

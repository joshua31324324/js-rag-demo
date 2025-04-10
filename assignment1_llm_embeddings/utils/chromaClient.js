// ChromaDB client utilities for the RAG application
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { OpenAIEmbeddings } from '@langchain/openai';

/**
 * Create a ChromaDB client with in-memory persistence
 * @returns {Object} ChromaDB client instance
 */
export async function createChromaClient() {
  // Initialize OpenAI embeddings
  const embeddings = new OpenAIEmbeddings();
  
  // ChromaDB collection name
  const collectionName = 'rag-demo-collection';
  
  // Create in-memory ChromaDB client
  return {
    embeddings,
    collectionName
  };
}

/**
 * Create a vector store from documents
 * @param {Array} documents - Array of document objects
 * @returns {Promise<Object>} Vector store instance
 */
export async function createVectorStore(documents) {
  // Get client configuration
  const { embeddings, collectionName } = await createChromaClient();
  
  try {
    // Create vector store from documents
    const vectorStore = await Chroma.fromDocuments(
      documents,
      embeddings,
      { collectionName }
    );
    
    return vectorStore;
  } catch (error) {
    console.error('Error creating ChromaDB vector store:', error);
    throw error;
  }
}

/**
 * Create retriever from an existing vector store
 * @param {Object} vectorStore - ChromaDB vector store
 * @param {number} k - Number of documents to retrieve (default: 3)
 * @returns {Object} Retriever instance
 */
export function createRetriever(vectorStore, k = 3) {
  return vectorStore.asRetriever({
    k,
    searchType: 'similarity'
  });
}

/**
 * Get similar documents from ChromaDB for a query
 * @param {Object} vectorStore - ChromaDB vector store
 * @param {string} query - User query
 * @param {number} k - Number of documents to retrieve
 * @returns {Promise<Array>} Array of retrieved documents
 */
export async function getSimilarDocuments(vectorStore, query, k = 3) {
  try {
    const results = await vectorStore.similaritySearch(query, k);
    return results;
  } catch (error) {
    console.error('Error retrieving documents from ChromaDB:', error);
    throw error;
  }
}

/**
 * Delete a ChromaDB collection
 * @param {string} collectionName - Name of collection to delete
 * @returns {Promise<void>}
 */
export async function deleteCollection(collectionName = 'rag-demo-collection') {
  try {
    const { embeddings } = await createChromaClient();
    const vectorStore = await Chroma.fromExistingCollection(embeddings, { 
      collectionName 
    });
    await vectorStore.delete();
    console.log(`Collection ${collectionName} deleted`);
  } catch (error) {
    console.error(`Error deleting collection ${collectionName}:`, error);
  }
}

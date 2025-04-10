// Utility functions for document processing in RAG applications
import fs from 'fs/promises';
import path from 'path';

/**
 * Extracts metadata from document content
 * @param {string} content - The document content
 * @param {string} filePath - The document file path
 * @returns {object} Document metadata
 */
export function extractMetadata(content, filePath) {
  // Get filename without extension
  const filename = path.basename(filePath, path.extname(filePath));
  
  // Extract title - first heading if available
  const titleMatch = content.match(/^#\s+(.*)/m);
  const title = titleMatch ? titleMatch[1].trim() : filename;
  
  // Count sections (headings)
  const sectionCount = (content.match(/^#{1,6}\s+/gm) || []).length;
  
  // Estimate reading time (average 200 words per minute)
  const wordCount = content.split(/\s+/).length;
  const readingTimeMinutes = Math.ceil(wordCount / 200);
  
  return {
    title,
    filename,
    filePath,
    sectionCount,
    wordCount,
    readingTimeMinutes,
    createdAt: new Date().toISOString()
  };
}

/**
 * Creates a document summary
 * @param {string} content - The document content
 * @returns {string} A brief summary of the document
 */
export function createDocumentSummary(content) {
  // Extract all headings
  const headings = [];
  const headingRegex = /^(#{1,6})\s+(.*)/gm;
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    headings.push({ level, text });
  }
  
  // Create outline
  let outline = 'Document outline:\n';
  headings.forEach(heading => {
    const indent = '  '.repeat(heading.level - 1);
    outline += `${indent}- ${heading.text}\n`;
  });
  
  return outline;
}

/**
 * Loads all available documents from the documents directory
 * @returns {Promise<Array>} Array of document info objects
 */
export async function listAvailableDocuments(documentsDir = './documents') {
  try {
    const files = await fs.readdir(documentsDir);
    const textFiles = files.filter(file => path.extname(file).toLowerCase() === '.txt');
    
    const documents = await Promise.all(
      textFiles.map(async (file) => {
        const filePath = path.join(documentsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const metadata = extractMetadata(content, filePath);
        
        return {
          id: path.basename(file, path.extname(file)),
          path: filePath,
          title: metadata.title,
          wordCount: metadata.wordCount,
          readingTime: metadata.readingTimeMinutes
        };
      })
    );
    
    return documents;
  } catch (error) {
    console.error('Error listing documents:', error);
    return [];
  }
}


'use server';

import { processDocuments, type DocumentProcessOutput } from '@/ai/flows/document-processing';

export async function processDocumentsOnServer(documentDataUris: string[]): Promise<DocumentProcessOutput> {
  try {
    const result = await processDocuments({ documentDataUris });
    return result;
  } catch (error) {
    console.error("Error processing documents:", error);
    // In a real app, you might want to throw a more specific, user-friendly error.
    throw new Error("Failed to process documents with AI. Please check the document quality and try again.");
  }
}

'use server';

/**
 * @fileOverview An AI flow for processing partner onboarding documents.
 *
 * - processDocuments - A function that handles document categorization and data extraction.
 * - DocumentProcessInput - The input type for the processDocuments function.
 * - DocumentProcessOutput - The return type for the processDocuments function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DocumentProcessInputSchema = z.object({
  documentDataUris: z
    .array(
      z
        .string()
        .describe(
          "A document image as a data URI, including MIME type and Base64 encoding."
        )
    )
    .describe('An array of documents to process.'),
});
export type DocumentProcessInput = z.infer<typeof DocumentProcessInputSchema>;

const ProcessedDocumentSchema = z.object({
  documentType: z
    .string()
    .describe(
      "The identified type of the document (e.g., 'PAN Card', 'GST Certificate', 'Unidentified')."
    ),
  details: z
    .record(z.string())
    .describe(
      'An object containing the extracted key-value pairs from the document.'
    ),
});

const DocumentProcessOutputSchema = z.array(ProcessedDocumentSchema);
export type DocumentProcessOutput = z.infer<typeof DocumentProcessOutputSchema>;


export async function processDocuments(
  input: DocumentProcessInput
): Promise<DocumentProcessOutput> {
  return processDocumentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'documentProcessingPrompt',
  input: { schema: DocumentProcessInputSchema },
  output: { schema: DocumentProcessOutputSchema },
  prompt: `You are an expert document analysis AI for a financial services company. Your task is to process a set of uploaded documents for partner onboarding, identify the type of each document, and extract key information.

For each document provided, identify it from the following types: PAN Card, GST Certificate, Cancelled Cheque, Business Address Proof, MSME Certificate. If you cannot identify a document, label it as 'Unidentified'.

After identifying a document, extract the following information if available:
- For a **PAN Card**: Extract the 'PAN Number' and 'Name'.
- For a **GST Certificate**: Extract the 'GSTIN' and 'Legal Name of Business'.
- For a **Cancelled Cheque**: Extract the 'Bank Name', 'Account Number', and 'IFSC Code'.
- For a **Business Address Proof** (like a utility bill or lease agreement): Extract the full 'Address'.
- For an **MSME Certificate**: Extract the 'Udyam Registration Number'.

Return the output as a valid JSON array matching the output schema, where each object represents one of the uploaded documents.

{{#each documentDataUris}}
Document to process: {{media url=this}}
{{/each}}
  `,
});

const processDocumentsFlow = ai.defineFlow(
  {
    name: 'processDocumentsFlow',
    inputSchema: DocumentProcessInputSchema,
    outputSchema: DocumentProcessOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

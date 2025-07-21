
'use server';

/**
 * @fileOverview An AI flow to extract structured data from an invoice document.
 *
 * - extractInvoiceData - A function that handles the data extraction process.
 * - ExtractInvoiceDataInput - The input type for the extractInvoiceData function.
 * - ExtractInvoiceDataOutput - The return type for the extractInvoiceData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractInvoiceDataInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A document (invoice or E-Way bill) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type ExtractInvoiceDataInput = z.infer<typeof ExtractInvoiceDataInputSchema>;

const ExtractInvoiceDataOutputSchema = z.object({
  invoiceNumber: z.string().describe('The unique invoice number or ID.'),
  dealerName: z.string().describe('The name of the dealer or buyer.'),
  documentType: z.string().describe('The type of document (e.g., "Invoice", "E-Way Bill", "Purchase Order").'),
  amount: z.number().describe('The total amount on the invoice.'),
  dueDate: z.string().describe('The due date of the invoice in YYYY-MM-DD format.'),
  utrNumber: z.string().optional().describe('The Unique Transaction Reference (UTR) number, if present.'),
});
export type ExtractInvoiceDataOutput = z.infer<typeof ExtractInvoiceDataOutputSchema>;


export async function extractInvoiceData(input: ExtractInvoiceDataInput): Promise<ExtractInvoiceDataOutput> {
  return extractInvoiceDataFlow(input);
}


const prompt = ai.definePrompt({
  name: 'extractInvoiceDataPrompt',
  input: {schema: ExtractInvoiceDataInputSchema},
  output: {schema: ExtractInvoiceDataOutputSchema},
  prompt: `You are an expert at extracting structured data from financial documents.
  Analyze the following document and extract the required information.

  Document: {{media url=documentDataUri}}

  Extract the invoice number, dealer name (who the bill is for), the document type (e.g., Invoice, E-Way Bill), the total amount, the payment due date, and the UTR number if it is available.
  Format the due date as YYYY-MM-DD.
  `,
});

const extractInvoiceDataFlow = ai.defineFlow(
  {
    name: 'extractInvoiceDataFlow',
    inputSchema: ExtractInvoiceDataInputSchema,
    outputSchema: ExtractInvoiceDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

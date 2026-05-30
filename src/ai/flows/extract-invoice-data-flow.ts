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
  dealerName: z.string().describe('The name of the dealer or buyer (NOT the supplier).'),
  documentType: z.string().describe('The type of document (e.g., "Invoice", "E-Way Bill", "Purchase Order").'),
  amount: z.number().describe('The total amount on the invoice.'),
  dueDate: z.string().describe('The due date of the invoice in YYYY-MM-DD format.'),
  utrNumber: z.string().optional().describe('The Unique Transaction Reference (UTR) number, if present.'),
  gstOrGstin: z.string().describe('The GST or GSTIN number of the dealer or buyer (NOT the supplier).'),
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
  Analyze the document and distinguish between the SUPPLIER/SELLER and the BUYER/CONSIGNEE.

  CRITICAL INSTRUCTIONS:
  - We ONLY want the details for the BUYER (the entity being billed and receiving the goods).
  - DO NOT extract the Supplier/Seller's name or GSTIN. The Supplier is the one issuing the invoice.
  - The Buyer/Dealer is usually found under labels like "Bill To", "Consignee", or "Buyer Details".
  - If multiple GST numbers are present, the Buyer's GST is the one associated with the "Billed To" address.

  Document: {{media url=documentDataUri}}

  Extract:
  1. Invoice Number.
  2. Buyer's Name (the Dealer).
  3. Buyer's GSTIN (the Dealer's GST).
  4. Document Type (e.g., Invoice, E-Way Bill).
  5. Total Invoice Amount.
  6. Payment Due Date (format as YYYY-MM-DD).
  7. UTR number if available.
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

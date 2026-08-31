'use server';

/**
 * @fileOverview An AI flow to extract structured data from financial documents (Invoices, POs, etc.).
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
      "A document (invoice, Purchase Order, or E-Way bill) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type ExtractInvoiceDataInput = z.infer<typeof ExtractInvoiceDataInputSchema>;

const ExtractInvoiceDataOutputSchema = z.object({
  documentType: z.string().describe('The type of document (e.g., "INVOICE", "PURCHASE_ORDER", "E-WAY_BILL").'),
  issuerName: z.string().optional().describe('Name of the entity that issued the document.'),
  issuerGstin: z.string().optional().describe('GSTIN of the issuer.'),
  buyerName: z.string().optional().describe('Name of the buyer/customer.'),
  buyerGstin: z.string().optional().describe('GSTIN of the buyer.'),
  supplierName: z.string().optional().describe('Name of the supplier/seller.'),
  supplierGstin: z.string().optional().describe('GSTIN of the supplier.'),
  toPartyName: z.string().optional().describe('Name of the party the document is addressed to.'),
  toPartyGstin: z.string().optional().describe('GSTIN of the "To" party.'),
  shipToName: z.string().optional().describe('Name of the ship-to party.'),
  invoiceNumber: z.string().optional().describe('Invoice number if applicable.'),
  poNumber: z.string().optional().describe('PO number if applicable.'),
  documentDate: z.string().optional().describe('Primary date on the document (YYYY-MM-DD).'),
  dueDate: z.string().optional().describe('Due date if applicable (YYYY-MM-DD).'),
  totalAmount: z.number().optional().describe('Total gross amount on the document.'),
  advanceAmount: z.number().optional().describe('Any advance or retention amount mentioned.'),
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
  Extract neutral data fields without making assumptions about who the system "Dealer" or "Anchor" is.
  
  CRITICAL INSTRUCTIONS:
  - Identify the document type: PURCHASE_ORDER, INVOICE, or EWAY_BILL.
  - For PURCHASE ORDER (PO): The Issuer/Buyer is usually the entity sending the PO (creating the request). The "To" or Supplier is the entity receiving the order.
  - For INVOICE: The Issuer/Supplier is the entity billing. The Buyer/Consignee is receiving the bill.
  - Extract the GSTINs precisely.
  - Format all dates as YYYY-MM-DD.
  - If multiple amounts are present, find the Total Amount and any specifically mentioned Advance/Retention amount.

  Document: {{media url=documentDataUri}}

  Provide the output in JSON format.`,
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

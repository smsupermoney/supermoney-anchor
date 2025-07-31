
'use server';

/**
 * @fileOverview An AI assistant flow for answering user questions about the platform.
 *
 * - askAi - A function that handles the question-answering process.
 * - AskAiInput - The input type for the askAi function.
 * - AskAiOutput - The return type for the askAi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { 
    getProgramSummaryTool, 
    getInvoiceSummaryTool, 
    getDealerSummaryTool,
    getFullProgramDataTool,
    getFullInvoiceDataTool,
    getFullDealerDataTool,
    getFullLeadDataTool
} from '../tools/data-tools';

const AskAiInputSchema = z.object({
  question: z.string().describe("The user's question."),
  anchorId: z.string().optional().describe("The ID of the anchor user asking the question. This is used to scope data."),
});
export type AskAiInput = z.infer<typeof AskAiInputSchema>;

const AskAiOutputSchema = z.object({
  answer: z.string().describe("The AI's answer to the question."),
});
export type AskAiOutput = z.infer<typeof AskAiOutputSchema>;

export async function askAi(input: AskAiInput): Promise<AskAiOutput> {
  return askAiFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askAiPrompt',
  input: {schema: AskAiInputSchema},
  output: {schema: AskAiOutputSchema},
  tools: [
    getProgramSummaryTool, 
    getInvoiceSummaryTool, 
    getDealerSummaryTool,
    getFullProgramDataTool,
    getFullInvoiceDataTool,
    getFullDealerDataTool,
    getFullLeadDataTool
  ],
  prompt: `You are a helpful AI assistant for a supply chain financing platform. Your name is Supermoney Assistant.

  A user has asked a question. Provide a concise and helpful answer based on the data provided by the tools.

  ## Tool Usage Strategy:
  - For high-level summary questions (e.g., "how many invoices are overdue?", "what is my total credit limit?"), use the simpler 'get...Summary' tools for efficiency.
  - For more specific or detailed questions (e.g., "list all dealers in the West region", "what is the total amount for invoices from 'Star Electronics'?", "how many leads are in 'Follow Up' status?"), you MUST use the more powerful 'getFull...Data' tools. These tools provide a full JSON dataset that you must analyze to compute the answer.
  - The 'getFullLeadDataTool' is the ONLY tool that can answer questions about leads.
  - When calling a tool, you must pass the anchorId provided in the input if it's available. The 'getFullLeadDataTool' uses 'leadAnchorId' which corresponds to the user's 'anchorId'.

  ## User Interaction:
  - If the user asks for information that the tools cannot provide, inform them of this limitation.
  - Format numbers and currency in a readable way (e.g., ₹1,23,456).
  - Be friendly and professional.

  User Question: {{{question}}}

  Answer the question as the Supermoney Assistant.
  `,
});

const askAiFlow = ai.defineFlow(
  {
    name: 'askAiFlow',
    inputSchema: AskAiInputSchema,
    outputSchema: AskAiOutputSchema,
  },
  async input => {
    // The 'leadAnchorId' for the lead tool corresponds to the general 'anchorId'
    const flowInput = {
        ...input,
        leadAnchorId: input.anchorId,
    };
    const {output} = await prompt(flowInput);
    return output!;
  }
);


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
    getFullProgramDataTool,
    getFullInvoiceDataTool,
    getFullDealerDataTool,
    getFullLeadDataTool
} from '../tools/data-tools';

const AskAiInputSchema = z.object({
  question: z.string().describe("The user's question."),
  anchorId: z.string().optional().describe("The ID of the anchor user asking the question. This is used to scope data for programs, invoices, and dealers."),
  leadAnchorId: z.string().optional().describe("The ID of the anchor user for scoping lead data. This might be different from the main anchorId."),
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
    getFullProgramDataTool,
    getFullInvoiceDataTool,
    getFullDealerDataTool,
    getFullLeadDataTool
  ],
  prompt: `You are a helpful AI assistant for a supply chain financing platform. Your name is Supermoney Assistant.

  A user has asked a question. Provide a concise and helpful answer by calling the necessary tools and analyzing their output.

  ## User and Tool Context:
  - You have been provided with 'anchorId' and 'leadAnchorId' from the user's session.
  - For all questions about programs, invoices, or dealers, you MUST use the 'anchorId' when calling tools.
  - For all questions about leads, you MUST use the 'leadAnchorId' when calling the 'getFullLeadDataTool'.

  ## Tool Usage Strategy:
  - You have four tools available: 'getFullProgramDataTool', 'getFullInvoiceDataTool', 'getFullDealerDataTool', and 'getFullLeadDataTool'.
  - To answer the user's question, you MUST call the appropriate tool to get the full dataset.
  - After receiving the JSON data from the tool, you MUST analyze it to compute the answer. For example, to count "active dealers", you must filter the results from 'getFullDealerDataTool' where the status is 'Active' and then count them.

  ## User Interaction Rules:
  - NEVER describe the tool you are about to use. Just call the tool, analyze the result, and give the final answer.
  - NEVER ask the user for an 'anchorId' or 'leadAnchorId'. You have been given this information. Use it.
  - If the user asks a question that seems general (e.g., "Give me the total number of invoices"), assume they mean for their own context and call the appropriate tool using the provided 'anchorId' (or 'leadAnchorId' for leads).
  - If the user asks a question that the tools cannot provide, inform them of this limitation.
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
    const {output} = await prompt(input);
    if (!output) {
      return { answer: "I'm sorry, I was unable to process that request. Please try again." };
    }
    return output;
  }
);

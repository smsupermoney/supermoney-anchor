
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
import { getProgramSummaryTool, getInvoiceSummaryTool, getDealerSummaryTool } from '../tools/data-tools';

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
  tools: [getProgramSummaryTool, getInvoiceSummaryTool, getDealerSummaryTool],
  prompt: `You are a helpful AI assistant for a supply chain financing platform. Your name is Supermoney Assistant.

  A user has asked a question. Provide a concise and helpful answer.
  If the question is about data summaries or aggregates (e.g., "how many invoices are overdue?", "what is my total credit limit?", "how many dealers do I have?"), you MUST use the provided tools to get real-time information.
  When calling a tool, you must pass the anchorId provided in the input if it's available.

  If the user asks for specific details that the tools don't provide (like details of a single invoice), you should inform them that you can only provide summary information and cannot look up specific items.

  User Question: {{{question}}}

  Answer the question as the Supermoney Assistant. Format numbers and currency in a readable way (e.g., ₹1,23,456). Be friendly and professional.
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
    return output!;
  }
);

'use server';

/**
 * @fileOverview AI-powered risk assessment tool that analyzes invoice data and provides a risk score for each dealer.
 *
 * - assessDealerRisk - A function that handles the risk assessment process.
 * - DealerRiskAssessmentInput - The input type for the assessDealerRisk function.
 * - DealerRiskAssessmentOutput - The return type for the assessDealerRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DealerRiskAssessmentInputSchema = z.object({
  dealerName: z.string().describe('The name of the dealer.'),
  invoiceData: z.string().describe('A summary of the invoice data for the dealer.'),
});
export type DealerRiskAssessmentInput = z.infer<typeof DealerRiskAssessmentInputSchema>;

const DealerRiskAssessmentOutputSchema = z.object({
  riskScore: z.number().describe('The risk score for the dealer (0-100).'),
  riskFactors: z.string().describe('The key factors contributing to the risk score.'),
  recommendations: z.string().describe('Recommendations for managing the risk.'),
});
export type DealerRiskAssessmentOutput = z.infer<typeof DealerRiskAssessmentOutputSchema>;

export async function assessDealerRisk(input: DealerRiskAssessmentInput): Promise<DealerRiskAssessmentOutput> {
  return assessDealerRiskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dealerRiskAssessmentPrompt',
  input: {schema: DealerRiskAssessmentInputSchema},
  output: {schema: DealerRiskAssessmentOutputSchema},
  prompt: `You are an AI-powered risk assessment tool for a supply chain financing platform.

  Analyze the invoice data for the dealer and provide a risk score (0-100), key risk factors, and recommendations for managing the risk.

  Dealer Name: {{{dealerName}}}
  Invoice Data: {{{invoiceData}}}

  Provide the output in JSON format.
  `,
});

const assessDealerRiskFlow = ai.defineFlow(
  {
    name: 'assessDealerRiskFlow',
    inputSchema: DealerRiskAssessmentInputSchema,
    outputSchema: DealerRiskAssessmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

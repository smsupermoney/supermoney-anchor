'use server';

/**
 * @fileOverview AI-powered risk assessment tool that analyzes invoice data and provides a risk score for each retailer.
 *
 * - assessRetailerRisk - A function that handles the risk assessment process.
 * - RiskAssessmentInput - The input type for the assessRetailerRisk function.
 * - RiskAssessmentOutput - The return type for the assessRetailerRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RiskAssessmentInputSchema = z.object({
  retailerName: z.string().describe('The name of the retailer.'),
  invoiceData: z.string().describe('A summary of the invoice data for the retailer.'),
});
export type RiskAssessmentInput = z.infer<typeof RiskAssessmentInputSchema>;

const RiskAssessmentOutputSchema = z.object({
  riskScore: z.number().describe('The risk score for the retailer (0-100).'),
  riskFactors: z.string().describe('The key factors contributing to the risk score.'),
  recommendations: z.string().describe('Recommendations for managing the risk.'),
});
export type RiskAssessmentOutput = z.infer<typeof RiskAssessmentOutputSchema>;

export async function assessRetailerRisk(input: RiskAssessmentInput): Promise<RiskAssessmentOutput> {
  return assessRetailerRiskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'riskAssessmentPrompt',
  input: {schema: RiskAssessmentInputSchema},
  output: {schema: RiskAssessmentOutputSchema},
  prompt: `You are an AI-powered risk assessment tool for a supply chain financing platform.

  Analyze the invoice data for the retailer and provide a risk score (0-100), key risk factors, and recommendations for managing the risk.

  Retailer Name: {{{retailerName}}}
  Invoice Data: {{{invoiceData}}}

  Provide the output in JSON format.
  `,
});

const assessRetailerRiskFlow = ai.defineFlow(
  {
    name: 'assessRetailerRiskFlow',
    inputSchema: RiskAssessmentInputSchema,
    outputSchema: RiskAssessmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

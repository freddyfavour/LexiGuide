'use server';

/**
 * @fileOverview A risk assessment AI agent for contract clauses.
 *
 * - assessRisk - A function that handles the risk assessment process.
 * - RiskAssessmentInput - The input type for the assessRisk function.
 * - RiskAssessmentOutput - The return type for the assessRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RiskAssessmentInputSchema = z.object({
  clauseText: z.string().describe('The text of the contract clause to assess.'),
});
export type RiskAssessmentInput = z.infer<typeof RiskAssessmentInputSchema>;

const RiskAssessmentOutputSchema = z.object({
  riskLevel: z
    .enum(['low', 'medium', 'high'])
    .describe('The level of risk associated with the clause (low, medium, or high).'),
  riskSummary: z
    .string()
    .describe('A brief summary of the potential risks identified in the clause.'),
  suggestedActions: z
    .string()
    .describe('Suggested actions to mitigate the identified risks.'),
});
export type RiskAssessmentOutput = z.infer<typeof RiskAssessmentOutputSchema>;

export async function assessRisk(input: RiskAssessmentInput): Promise<RiskAssessmentOutput> {
  return assessRiskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'riskAssessmentPrompt',
  input: {schema: RiskAssessmentInputSchema},
  output: {schema: RiskAssessmentOutputSchema},
  prompt: `You are an AI-powered legal risk assessment tool. Your task is to analyze a given contract clause and determine the level of risk associated with it.

  Analyze the following clause and provide a risk assessment:
  Clause Text: {{{clauseText}}}

  Based on your analysis, determine the riskLevel (low, medium, or high), provide a riskSummary explaining the potential risks, and suggest actions to mitigate those risks.
  Format your output as a JSON object conforming to the RiskAssessmentOutputSchema.
  `,
});

const assessRiskFlow = ai.defineFlow(
  {
    name: 'assessRiskFlow',
    inputSchema: RiskAssessmentInputSchema,
    outputSchema: RiskAssessmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

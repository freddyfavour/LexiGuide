
'use server';
/**
 * @fileOverview Provides an overall risk assessment and advice for an entire contract.
 *
 * - analyzeOverallContract - A function that performs holistic contract analysis.
 * - OverallContractAnalysisInput - The input type for the analyzeOverallContract function.
 * - OverallContractAnalysisOutput - The return type for the analyzeOverallContract function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { OverallContractAnalysisInput, OverallContractAnalysisOutput } from '@/types';

const OverallContractAnalysisInputSchema = z.object({
  contractText: z
    .string()
    .describe('The entire text of the contract to be analyzed.'),
});

const OverallContractAnalysisOutputSchema = z.object({
  generalRisks: z
    .string()
    .describe(
      'A summary of the general risks identified in the contract. This should be a holistic overview, not clause-specific.'
    ),
  exploitationPotential: z
    .string()
    .describe(
      'An assessment of any potential for exploitation within the contract terms, considering the contract as a whole.'
    ),
  generalAdvice: z
    .string()
    .describe(
      'General advice for the user regarding the contract, such as areas to pay close attention to, or general negotiation strategies. This advice should be based on the overall nature of the contract.'
    ),
});

export async function analyzeOverallContract(input: OverallContractAnalysisInput): Promise<OverallContractAnalysisOutput> {
  return overallContractAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'overallContractAnalysisPrompt',
  input: {schema: OverallContractAnalysisInputSchema},
  output: {schema: OverallContractAnalysisOutputSchema},
  prompt: `You are an AI Legal Analyst. You will receive the entire text of a contract.
Your task is to perform a holistic analysis and provide the following:
1.  A summary of the general, high-level risks present in the contract.
2.  An assessment of any potential for one party to exploit another based on the contract terms.
3.  General advice for the user regarding this contract.

Do not break down the analysis per clause. Focus on the overall implications of the contract.

Contract Text:
{{{contractText}}}

Provide your analysis in the specified JSON output format.
`,
});

const overallContractAnalysisFlow = ai.defineFlow(
  {
    name: 'overallContractAnalysisFlow',
    inputSchema: OverallContractAnalysisInputSchema,
    outputSchema: OverallContractAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

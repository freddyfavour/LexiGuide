
'use server';
/**
 * @fileOverview A comprehensive AI flow for contract analysis.
 * It segments the contract into clauses, summarizes each clause,
 * and provides an overall risk assessment and recommendations for the entire contract.
 *
 * - comprehensiveContractAnalysis - The main function to call for analysis.
 * - ComprehensiveContractAnalysisInput - The input type.
 * - ComprehensiveContractAnalysisOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import { ComprehensiveContractAnalysisInputSchema, ComprehensiveContractAnalysisOutputSchema } from '@/types';
import type { ComprehensiveContractAnalysisInput, ComprehensiveContractAnalysisOutput } from '@/types';
import {z} from 'genkit'; // Added this line

export async function comprehensiveContractAnalysis(input: ComprehensiveContractAnalysisInput): Promise<ComprehensiveContractAnalysisOutput> {
  return comprehensiveAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'comprehensiveContractAnalysisPrompt',
  input: {schema: ComprehensiveContractAnalysisInputSchema},
  output: {schema: ComprehensiveContractAnalysisOutputSchema},
  prompt: `You are an expert AI Legal Analyst. You will receive the entire text of a contract.
Your task is to:
1.  Identify and segment the provided contract text into distinct clauses.
2.  For each identified clause, you MUST provide:
    a.  The 'originalClauseText' - the full, verbatim text of that clause.
    b.  The 'plainEnglishSummary' - a clear, concise summary of that clause in plain English.
3.  After processing all clauses, provide an 'overallRiskAssessment' for the ENTIRE contract. This should be a holistic overview of potential risks.
4.  Finally, provide 'overallRecommendations' for the user regarding this contract. This should include general advice or areas to focus on.

Contract Text:
{{{contractText}}}

Ensure your output strictly adheres to the JSON schema provided for 'ComprehensiveContractAnalysisOutput'.
The 'analyzedClauses' field must be an array, where each element is an object containing 'originalClauseText' and 'plainEnglishSummary'.
`,
});

const comprehensiveAnalysisFlow = ai.defineFlow(
  {
    name: 'comprehensiveAnalysisFlow',
    inputSchema: ComprehensiveContractAnalysisInputSchema,
    outputSchema: ComprehensiveContractAnalysisOutputSchema,
  },
  async (input: ComprehensiveContractAnalysisInput) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return a valid output. The output was null or undefined.");
    }
    // Basic validation, more complex validation can be added here if needed
    if (!output.analyzedClauses || !output.overallRiskAssessment || !output.overallRecommendations) {
        console.error("Incomplete output from AI:", output);
        throw new Error("The AI model returned an incomplete structured output. Please check the model's response format.");
    }
    return output;
  }
);

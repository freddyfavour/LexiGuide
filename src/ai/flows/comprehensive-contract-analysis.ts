
'use server';
/**
 * @fileOverview A comprehensive AI flow for contract analysis.
 * It segments the contract into clauses, summarizes each clause,
 * assesses risk for each clause, and provides an overall risk assessment
 * and recommendations for the entire contract.
 *
 * - comprehensiveContractAnalysis - The main function to call for analysis.
 * - ComprehensiveContractAnalysisInput - The input type.
 * - ComprehensiveContractAnalysisOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import { ComprehensiveContractAnalysisInputSchema, ComprehensiveContractAnalysisOutputSchema } from '@/types';
import type { ComprehensiveContractAnalysisInput, ComprehensiveContractAnalysisOutput } from '@/types';
import {z} from 'genkit';

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
    c.  The 'riskLevel' - assess the risk for this specific clause as 'low', 'medium', or 'high'.
    d.  The 'riskExplanation' - provide a brief explanation for the assessed risk level of this clause. If the risk is 'low', this can be a short confirmation.
3.  After processing all clauses, provide an 'overallRiskAssessment' for the ENTIRE contract. This should be a holistic overview of potential risks, formatted as a bulleted list (e.g., using '*' or '-' at the start of each point).
4.  Finally, provide 'overallRecommendations' for the user regarding this contract. This should include general advice or areas to focus on, also formatted as a bulleted list (e.g., using '*' or '-' at the start of each point).

Contract Text:
{{{contractText}}}

Ensure your output strictly adheres to the JSON schema provided for 'ComprehensiveContractAnalysisOutput'.
The 'analyzedClauses' field must be an array, where each element is an object containing 'originalClauseText', 'plainEnglishSummary', 'riskLevel', and 'riskExplanation'.
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
    output.analyzedClauses.forEach(clause => {
      if (!clause.riskLevel || !['low', 'medium', 'high'].includes(clause.riskLevel)) {
        console.warn("Clause found with invalid or missing riskLevel:", clause);
        // Optionally, set a default or handle as an error
        // For now, we'll let it pass but log it. The UI should handle undefined risk gracefully.
      }
    });
    return output;
  }
);

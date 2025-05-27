'use server';

/**
 * @fileOverview Summarizes contract clauses into plain English.
 *
 * - summarizeClause - A function that summarizes a given contract clause.
 * - SummarizeClauseInput - The input type for the summarizeClause function.
 * - SummarizeClauseOutput - The return type for the summarizeClause function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeClauseInputSchema = z.object({
  clauseText: z
    .string()
    .describe('The contract clause text to be summarized.'),
});
export type SummarizeClauseInput = z.infer<typeof SummarizeClauseInputSchema>;

const SummarizeClauseOutputSchema = z.object({
  summary: z
    .string()
    .describe('A plain English summary of the contract clause.'),
});
export type SummarizeClauseOutput = z.infer<typeof SummarizeClauseOutputSchema>;

export async function summarizeClause(input: SummarizeClauseInput): Promise<SummarizeClauseOutput> {
  return summarizeClauseFlow(input);
}

const summarizeClausePrompt = ai.definePrompt({
  name: 'summarizeClausePrompt',
  input: {schema: SummarizeClauseInputSchema},
  output: {schema: SummarizeClauseOutputSchema},
  prompt: `Summarize the following contract clause into plain English:\n\n{{clauseText}}`,
});

const summarizeClauseFlow = ai.defineFlow(
  {
    name: 'summarizeClauseFlow',
    inputSchema: SummarizeClauseInputSchema,
    outputSchema: SummarizeClauseOutputSchema,
  },
  async input => {
    const {output} = await summarizeClausePrompt(input);
    return output!;
  }
);

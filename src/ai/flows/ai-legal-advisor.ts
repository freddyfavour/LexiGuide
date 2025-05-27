'use server';

/**
 * @fileOverview An AI legal advisor that answers user questions about a contract.
 *
 * - aiLegalAdvisor - A function that answers user questions about the contract.
 * - AiLegalAdvisorInput - The input type for the aiLegalAdvisor function.
 * - AiLegalAdvisorOutput - The return type for the aiLegalAdvisor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiLegalAdvisorInputSchema = z.object({
  contractText: z
    .string()
    .describe('The text of the contract to analyze.'),
  question: z
    .string()
    .describe('The question to ask the AI legal advisor about the contract.'),
});
export type AiLegalAdvisorInput = z.infer<typeof AiLegalAdvisorInputSchema>;

const AiLegalAdvisorOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question about the contract.'),
});
export type AiLegalAdvisorOutput = z.infer<typeof AiLegalAdvisorOutputSchema>;

export async function aiLegalAdvisor(input: AiLegalAdvisorInput): Promise<AiLegalAdvisorOutput> {
  return aiLegalAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiLegalAdvisorPrompt',
  input: {schema: AiLegalAdvisorInputSchema},
  output: {schema: AiLegalAdvisorOutputSchema},
  prompt: `You are an AI legal advisor. You will answer questions about the contract provided to you, clarifying specific clauses or legal implications.

Contract Text: {{{contractText}}}

Question: {{{question}}}

Answer:`,
});

const aiLegalAdvisorFlow = ai.defineFlow(
  {
    name: 'aiLegalAdvisorFlow',
    inputSchema: AiLegalAdvisorInputSchema,
    outputSchema: AiLegalAdvisorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

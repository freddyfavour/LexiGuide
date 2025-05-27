// use server'
'use server';

/**
 * @fileOverview Provides suggestions for negotiating contract terms based on identified risks.
 *
 * - negotiationSuggestions - A function that suggests edits and improvements to the contract language.
 * - NegotiationSuggestionsInput - The input type for the negotiationSuggestions function.
 * - NegotiationSuggestionsOutput - The return type for the negotiationSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NegotiationSuggestionsInputSchema = z.object({
  contractText: z
    .string()
    .describe('The complete text of the contract to be reviewed.'),
  clauseSummary: z
    .string()
    .describe('A plain English summary of the specific contract clause.'),
  riskAssessment: z
    .string()
    .describe(
      'An assessment of the risks associated with the specific contract clause, including any color-coded risk flags.'
    ),
});
export type NegotiationSuggestionsInput = z.infer<
  typeof NegotiationSuggestionsInputSchema
>;

const NegotiationSuggestionsOutputSchema = z.object({
  suggestedEdits: z
    .string()
    .describe(
      'Suggested edits and improvements to the contract language to mitigate identified risks. Should be suitable to copy-and-paste into the contract document.'
    ),
  explanation: z
    .string()
    .describe(
      'A detailed explanation of why the suggested edits are recommended, and how they address the identified risks.'
    ),
});
export type NegotiationSuggestionsOutput = z.infer<
  typeof NegotiationSuggestionsOutputSchema
>;

export async function negotiationSuggestions(
  input: NegotiationSuggestionsInput
): Promise<NegotiationSuggestionsOutput> {
  return negotiationSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'negotiationSuggestionsPrompt',
  input: {schema: NegotiationSuggestionsInputSchema},
  output: {schema: NegotiationSuggestionsOutputSchema},
  prompt: `You are an AI-powered legal advisor, skilled in contract negotiation.

You will receive a contract clause, a plain English summary of the clause, and a risk assessment of the clause. Your task is to suggest edits and improvements to the contract language to mitigate the identified risks.

Contract Text:
{{contractText}}

Clause Summary:
{{clauseSummary}}

Risk Assessment:
{{riskAssessment}}

Based on the contract text, clause summary, and risk assessment, provide specific suggested edits and improvements to the contract language. Also, explain why those edits are recommended.

Ensure that the suggested edits are suitable to copy-and-paste directly into the contract document. Be as specific as possible.

Output the suggested edits and improvements, and a detailed explanation of why they are recommended.


Here's an example of the format I would like in the response:

{
  "suggestedEdits": "To ensure clarity and avoid potential disputes, add the phrase 'within 30 days of the invoice date' to specify the payment timeframe.",
  "explanation": "Adding a specific timeframe for payment (e.g., within 30 days of the invoice date) ensures that both parties have a clear understanding of when payment is expected. This can prevent misunderstandings and potential legal disputes related to late payments."
}
`,
});

const negotiationSuggestionsFlow = ai.defineFlow(
  {
    name: 'negotiationSuggestionsFlow',
    inputSchema: NegotiationSuggestionsInputSchema,
    outputSchema: NegotiationSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

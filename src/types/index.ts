
import { z } from 'genkit';

export interface Clause {
  id: string;
  text: string;
  originalIndex: number;
}

// Represents a clause text, its summary, and risk assessment
export interface ProcessedClause { // This type might be more for internal client-side mapping now
  clauseText: string;
  summaryText: string;
  riskLevel?: 'low' | 'medium' | 'high';
  riskExplanation?: string;
  originalIndex: number;
}

// --- New Comprehensive Analysis Flow Types ---
const AnalyzedClauseSchema = z.object({
  originalClauseText: z.string().describe("The original text of the contract clause."),
  plainEnglishSummary: z.string().describe("The plain English summary of the contract clause."),
  riskLevel: z.enum(['low', 'medium', 'high']).describe("The assessed risk level for this specific clause (low, medium, or high)."),
  riskExplanation: z.string().optional().describe("A brief explanation of the identified risk for this clause, if any."),
  // originalIndex: z.number().describe("The original index of the clause if determinable, otherwise a sequential index."),
});
export type AnalyzedClause = z.infer<typeof AnalyzedClauseSchema>;

export const ComprehensiveContractAnalysisInputSchema = z.object({
  contractText: z
    .string()
    .describe('The entire text of the contract to be analyzed.'),
});
export type ComprehensiveContractAnalysisInput = z.infer<typeof ComprehensiveContractAnalysisInputSchema>;

export const ComprehensiveContractAnalysisOutputSchema = z.object({
  analyzedClauses: z.array(AnalyzedClauseSchema).describe("An array of all identified clauses, each with its original text, summary, risk level, and risk explanation."),
  overallRiskAssessment: z
    .string()
    .describe(
      'A holistic summary of the general risks identified in the entire contract, formatted as a bulleted list.'
    ),
  overallRecommendations: z
    .string()
    .describe(
      'General advice and recommendations for the user regarding the entire contract, formatted as a bulleted list.'
    ),
});
export type ComprehensiveContractAnalysisOutput = z.infer<typeof ComprehensiveContractAnalysisOutputSchema>;

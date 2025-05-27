
import { z } from 'genkit'; // Changed from "import type { z }"

export interface Clause {
  id: string; // Retained for unique key in React rendering
  text: string;
  originalIndex: number;
}

// Simplified: Represents a clause text and its pre-fetched summary
export interface ProcessedClause {
  clause: Clause;
  summary: string;
}

// --- New Comprehensive Analysis Flow Types ---
const AnalyzedClauseSchema = z.object({
  originalClauseText: z.string().describe("The original text of the contract clause."),
  plainEnglishSummary: z.string().describe("The plain English summary of the contract clause."),
  // originalIndex: z.number().describe("The original index of the clause if determinable, otherwise a sequential index."),
});

export const ComprehensiveContractAnalysisInputSchema = z.object({
  contractText: z
    .string()
    .describe('The entire text of the contract to be analyzed.'),
});
export type ComprehensiveContractAnalysisInput = z.infer<typeof ComprehensiveContractAnalysisInputSchema>;

export const ComprehensiveContractAnalysisOutputSchema = z.object({
  analyzedClauses: z.array(AnalyzedClauseSchema).describe("An array of all identified clauses, each with its original text and summary."),
  overallRiskAssessment: z
    .string()
    .describe(
      'A holistic summary of the general risks identified in the entire contract.'
    ),
  overallRecommendations: z
    .string()
    .describe(
      'General advice and recommendations for the user regarding the entire contract.'
    ),
});
export type ComprehensiveContractAnalysisOutput = z.infer<typeof ComprehensiveContractAnalysisOutputSchema>;

// Remove OverallContractAnalysisInput and OverallContractAnalysisOutput if they were identical or are now fully replaced.
// The old OverallContractAnalysisInput might be the same as the new ComprehensiveContractAnalysisInput.
// The old OverallContractAnalysisOutput is different from the new comprehensive one.

// Deprecated types (can be removed if no longer referenced, but kept for context if any old components are being phased out slowly)
// export type RiskLevel = 'low' | 'medium' | 'high';
// import type { RiskAssessmentOutput as GenkitRiskAssessmentOutput } from '@/ai/flows/risk-assessment'; // Will be removed
// export type RiskAssessmentOutput = GenkitRiskAssessmentOutput; // Will be removed

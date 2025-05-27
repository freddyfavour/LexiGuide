
import type { RiskAssessmentOutput as GenkitRiskAssessmentOutput } from '@/ai/flows/risk-assessment';
// import type { NegotiationSuggestionsOutput as GenkitNegotiationSuggestionsOutput } from '@/ai/flows/negotiation-suggestions'; // Deprecated

export interface Clause {
  id: string;
  text: string;
  originalIndex: number;
}

export type RiskLevel = 'low' | 'medium' | 'high';
export type RiskAssessmentOutput = GenkitRiskAssessmentOutput;
// export type NegotiationSuggestionsOutput = GenkitNegotiationSuggestionsOutput; // Deprecated

// This type was used by older UI components, kept for reference but not active
// export interface ClauseAnalysisData {
//   summary?: string;
//   risk?: RiskAssessmentOutput;
//   negotiation?: NegotiationSuggestionsOutput;
//   summaryError?: string;
//   riskError?: string;
//   negotiationError?: string;
// }

// Represents a clause along with its fetched summary and loading state for the new UI
export interface ProcessedClause {
  clause: Clause;
  summary?: string;
  summaryError?: string;
  isLoadingSummary: boolean;
  risk?: RiskAssessmentOutput;
  riskError?: string;
  isLoadingRisk: boolean;
}

// New types for overall contract analysis
export interface OverallContractAnalysisInput {
  contractText: string;
}

export interface OverallContractAnalysisOutput {
  generalRisks: string;
  exploitationPotential: string;
  generalAdvice: string;
}

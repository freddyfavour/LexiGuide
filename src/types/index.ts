
import type { RiskAssessmentOutput as GenkitRiskAssessmentOutput } from '@/ai/flows/risk-assessment';
import type { NegotiationSuggestionsOutput as GenkitNegotiationSuggestionsOutput } from '@/ai/flows/negotiation-suggestions';

export interface Clause {
  id: string;
  text: string;
  originalIndex: number;
}

// Re-exporting to avoid direct import from ai/flows in many places and to potentially extend them later
// These are kept for now as ProcessedContractView still uses RiskLevel and ClauseAnalysisData for structure,
// but the actual per-clause risk/negotiation flows are being deprecated in favor of overall analysis.
export type RiskLevel = 'low' | 'medium' | 'high';
export type RiskAssessmentOutput = GenkitRiskAssessmentOutput;
export type NegotiationSuggestionsOutput = GenkitNegotiationSuggestionsOutput;

export interface ClauseAnalysisData {
  summary?: string;
  risk?: RiskAssessmentOutput;
  negotiation?: NegotiationSuggestionsOutput;
  summaryError?: string;
  riskError?: string;
  negotiationError?: string;
}

// Represents a clause along with its fetched summary and loading state for the new UI
export interface ProcessedClause {
  clause: Clause;
  summary?: string;
  summaryError?: string;
  isLoadingSummary: boolean;
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

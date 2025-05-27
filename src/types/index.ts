import type { RiskAssessmentOutput as GenkitRiskAssessmentOutput } from '@/ai/flows/risk-assessment';
import type { NegotiationSuggestionsOutput as GenkitNegotiationSuggestionsOutput } from '@/ai/flows/negotiation-suggestions';

export interface Clause {
  id: string;
  text: string;
  originalIndex: number;
}

export type RiskLevel = 'low' | 'medium' | 'high';

// Re-exporting to avoid direct import from ai/flows in many places and to potentially extend them later
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

export interface AdvisorMessage {
  id: string;
  type: 'user' | 'ai' | 'error';
  content: string;
}

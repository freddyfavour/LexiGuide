
import { config } from 'dotenv';
config();

import '@/ai/flows/clause-summarization.ts';
// import '@/ai/flows/negotiation-suggestions.ts'; // Deprecated in favor of overall analysis
// import '@/ai/flows/ai-legal-advisor.ts'; // Deprecated, chat functionality removed
import '@/ai/flows/risk-assessment.ts'; // Re-activated for per-clause risk coloring
import '@/ai/flows/overall-contract-analysis.ts';

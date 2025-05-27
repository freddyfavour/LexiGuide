"use client";

import {
  FileText,
  ListCollapse,
  BookMarked,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Wand2,
  Sparkles,
  BotMessageSquare,
  BrainCircuit,
  UploadCloud,
  ClipboardPaste,
  Loader2,
  ChevronRight,
  Settings2,
  MessageSquareWarning,
  RotateCcw,
  Info,
  Lightbulb,
  Gavel,
  Scale,
} from 'lucide-react';

// General App Icons
export const LexiGuideLogoIcon = Gavel; // Or Scale, depending on preferred visual
export const ContractIcon = FileText;
export const ClauseListIcon = ListCollapse;
export const SettingsIcon = Settings2;
export const LoadingIcon = ({ className }: { className?: string }) => <Loader2 className={`animate-spin ${className}`} />;
export const InfoIcon = Info;
export const ResetIcon = RotateCcw;

// Feature Specific Icons
export const SummaryIcon = BookMarked;
export const RiskAssessmentIcon = ShieldAlert; // Generic, color will differentiate
export const NegotiationIcon = Lightbulb; // Was Wand2/Sparkles, Lightbulb is more common for suggestions
export const AdvisorIcon = BotMessageSquare; // Or BrainCircuit

// Risk Level Icons
export const LowRiskIcon = ShieldCheck;
export const MediumRiskIcon = ShieldAlert;
export const HighRiskIcon = ShieldX; // Or MessageSquareWarning for a different take on "high risk"

// Input Method Icons
export const UploadIcon = UploadCloud;
export const PasteIcon = ClipboardPaste;

// UI Interaction Icons
export const ExpandIcon = ChevronRight;

export const RiskLevelIndicator = ({ level }: { level: 'low' | 'medium' | 'high' }) => {
  switch (level) {
    case 'low':
      return <LowRiskIcon className="text-[hsl(var(--risk-low-foreground))]" />;
    case 'medium':
      return <MediumRiskIcon className="text-[hsl(var(--risk-medium-foreground))]" />;
    case 'high':
      return <HighRiskIcon className="text-[hsl(var(--risk-high-foreground))]" />;
    default:
      return <ShieldAlert className="text-muted-foreground" />;
  }
};

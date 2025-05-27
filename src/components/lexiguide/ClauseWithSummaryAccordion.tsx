
"use client";

import React from 'react';
import type { AnalyzedClause } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookMarked, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ClauseWithSummaryAccordionProps {
  clauseData: AnalyzedClause;
  clauseOriginalIndex: number;
}

const RiskIndicator: React.FC<{ level: 'low' | 'medium' | 'high' | undefined }> = ({ level }) => {
  if (level === 'low') {
    return <ShieldCheck className="w-4 h-4 text-[hsl(var(--risk-low-foreground))]" />;
  }
  if (level === 'medium') {
    return <ShieldAlert className="w-4 h-4 text-[hsl(var(--risk-medium-foreground))]" />;
  }
  if (level === 'high') {
    return <ShieldX className="w-4 h-4 text-[hsl(var(--risk-high-foreground))]" />;
  }
  return null;
};

const getRiskBadgeVariant = (level: 'low' | 'medium' | 'high' | undefined): string => {
  switch (level) {
    case 'low':
      return 'bg-[hsl(var(--risk-low-background))] text-[hsl(var(--risk-low-foreground))] border-[hsl(var(--risk-low-foreground))]';
    case 'medium':
      return 'bg-[hsl(var(--risk-medium-background))] text-[hsl(var(--risk-medium-foreground))] border-[hsl(var(--risk-medium-foreground))]';
    case 'high':
      return 'bg-[hsl(var(--risk-high-background))] text-[hsl(var(--risk-high-foreground))] border-[hsl(var(--risk-high-foreground))]';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

const getRiskTextColor = (level: 'low' | 'medium' | 'high' | undefined): string => {
  switch (level) {
    case 'low':
      return 'text-[hsl(var(--risk-low-foreground))]';
    case 'medium':
      return 'text-[hsl(var(--risk-medium-foreground))]';
    case 'high':
      return 'text-[hsl(var(--risk-high-foreground))]';
    default:
      return 'text-muted-foreground';
  }
}

export function ClauseWithSummaryAccordion({ clauseData, clauseOriginalIndex }: ClauseWithSummaryAccordionProps) {
  const { originalClauseText, plainEnglishSummary, riskLevel, riskExplanation } = clauseData;

  const summaryContainerStyle = cn(
    "p-3 rounded-md border mt-1",
    riskLevel === 'low' && "bg-[hsl(var(--risk-low-background))] border-[hsl(var(--risk-low-foreground))]/30",
    riskLevel === 'medium' && "bg-[hsl(var(--risk-medium-background))] border-[hsl(var(--risk-medium-foreground))]/30",
    riskLevel === 'high' && "bg-[hsl(var(--risk-high-background))] border-[hsl(var(--risk-high-foreground))]/30",
    !riskLevel && "bg-muted/30 border-border"
  );

  const summaryTextStyle = cn(
    "text-sm leading-relaxed whitespace-pre-wrap",
    riskLevel === 'low' && "text-[hsl(var(--risk-low-foreground))]",
    riskLevel === 'medium' && "text-[hsl(var(--risk-medium-foreground))]",
    riskLevel === 'high' && "text-[hsl(var(--risk-high-foreground))]",
    !riskLevel && "text-foreground"
  );


  return (
    <div className="py-4 border-b last:border-b-0">
      <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-1">Clause {clauseOriginalIndex + 1}</h3>
      <p className="text-sm font-mono whitespace-pre-wrap p-3 bg-secondary/30 rounded-md border border-secondary mb-2">
        {originalClauseText}
      </p>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={`clause-${clauseOriginalIndex}-summary`} className="border-b-0">
          <AccordionTrigger className="text-sm font-medium text-primary hover:no-underline py-2 px-3 rounded-md hover:bg-primary/10 data-[state=open]:bg-primary/10">
            <div className="flex items-center gap-2">
              <BookMarked className="w-4 h-4" />
              View Plain-English Summary & Risk
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-0 pl-3 pr-3">
            <div className={summaryContainerStyle}>
              {riskLevel && (
                <div className="mb-2">
                  <Badge variant="outline" className={cn("text-xs capitalize", getRiskBadgeVariant(riskLevel))}>
                    <RiskIndicator level={riskLevel} />
                    <span className="ml-1.5">{riskLevel} Risk</span>
                  </Badge>
                  {riskExplanation && (
                     <p className={cn("text-xs mt-1 italic", getRiskTextColor(riskLevel))}>
                       {riskExplanation}
                     </p>
                  )}
                </div>
              )}
              <p className={summaryTextStyle}>
                {plainEnglishSummary || "No summary was provided for this clause."}
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


"use client";

import React from 'react';
import type { ProcessedClause, RiskLevel } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MessageSquareWarning, InfoIcon, BookMarked, ShieldCheck, ShieldAlert, ShieldX, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClauseWithSummaryAccordionProps {
  processedClause: ProcessedClause;
}

const getRiskStyles = (riskLevel?: RiskLevel): string => {
  if (!riskLevel) return 'bg-muted/30 border-border';
  switch (riskLevel) {
    case 'low':
      return 'bg-[hsl(var(--risk-low-background))] text-[hsl(var(--risk-low-foreground))] border-[hsl(var(--risk-low-foreground))] border-opacity-30';
    case 'medium':
      return 'bg-[hsl(var(--risk-medium-background))] text-[hsl(var(--risk-medium-foreground))] border-[hsl(var(--risk-medium-foreground))] border-opacity-30';
    case 'high':
      return 'bg-[hsl(var(--risk-high-background))] text-[hsl(var(--risk-high-foreground))] border-[hsl(var(--risk-high-foreground))] border-opacity-30';
    default:
      return 'bg-muted/30 border-border';
  }
};

const RiskIndicatorIcon: React.FC<{ riskLevel?: RiskLevel }> = ({ riskLevel }) => {
  if (!riskLevel) return <HelpCircle className="w-4 h-4 text-muted-foreground" />;
  switch (riskLevel) {
    case 'low':
      return <ShieldCheck className="w-4 h-4 text-[hsl(var(--risk-low-foreground))]" />;
    case 'medium':
      return <ShieldAlert className="w-4 h-4 text-[hsl(var(--risk-medium-foreground))]" />;
    case 'high':
      return <ShieldX className="w-4 h-4 text-[hsl(var(--risk-high-foreground))]" />;
    default:
      return <HelpCircle className="w-4 h-4 text-muted-foreground" />;
  }
};

export function ClauseWithSummaryAccordion({ processedClause }: ClauseWithSummaryAccordionProps) {
  const { clause, summary, summaryError, isLoadingSummary, risk, riskError, isLoadingRisk } = processedClause;

  const riskLevel = risk?.riskLevel as RiskLevel | undefined;
  const summaryContainerStyles = getRiskStyles(riskLevel);

  return (
    <div className="py-4 border-b last:border-b-0">
      <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-1">Clause {clause.originalIndex + 1}</h3>
      <p className="text-sm font-mono whitespace-pre-wrap p-3 bg-secondary/30 rounded-md border border-secondary mb-2">
        {clause.text}
      </p>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={`clause-${clause.id}-summary`} className="border-b-0">
          <AccordionTrigger className="text-sm font-medium text-primary hover:no-underline py-2 px-3 rounded-md hover:bg-primary/10 data-[state=open]:bg-primary/10">
            <div className="flex items-center gap-2">
              <BookMarked className="w-4 h-4" />
              View Plain-English Summary & Risk
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-0 pl-3 pr-3">
            {isLoadingSummary || isLoadingRisk ? (
              <div className="space-y-2 py-2">
                {isLoadingSummary && <Skeleton className="h-4 w-full" />}
                {isLoadingSummary && <Skeleton className="h-4 w-5/6" />}
                {isLoadingRisk && <Skeleton className="h-4 w-1/3 mt-1" />}
              </div>
            ) : summaryError ? (
              <Alert variant="destructive" className="mt-2 text-xs">
                <MessageSquareWarning className="h-4 w-4" />
                <AlertTitle className="text-xs font-semibold">Summary Error</AlertTitle>
                <AlertDescription>{summaryError}</AlertDescription>
              </Alert>
            ) : summary ? (
              <div className={cn("p-3 rounded-md border mt-1", summaryContainerStyles)}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <RiskIndicatorIcon riskLevel={riskLevel} />
                  <span className={cn("text-xs font-semibold",
                    riskLevel === 'low' ? 'text-[hsl(var(--risk-low-foreground))]' :
                    riskLevel === 'medium' ? 'text-[hsl(var(--risk-medium-foreground))]' :
                    riskLevel === 'high' ? 'text-[hsl(var(--risk-high-foreground))]' :
                    'text-muted-foreground'
                  )}>
                    Risk Level: {riskLevel ? riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1) : 'N/A'}
                    {riskError && <span className="font-normal italic"> (Error: {riskError})</span>}
                    {!risk && !riskError && <span className="font-normal italic"> (Pending/Not Assessed)</span>}
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {summary}
                </p>
                {risk && risk.riskSummary && (
                   <p className="text-xs mt-2 italic">
                      <strong>Risk Detail:</strong> {risk.riskSummary}
                   </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/30 rounded-md border">
                <InfoIcon className="w-4 h-4" />
                <span>No summary could be generated for this clause.</span>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

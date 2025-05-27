
"use client";

import React from 'react';
import type { Clause, ProcessedClause } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MessageSquareWarning, InfoIcon, BookMarked } from 'lucide-react'; // SummaryIcon changed to BookMarked

interface ClauseWithSummaryAccordionProps {
  processedClause: ProcessedClause;
}

export function ClauseWithSummaryAccordion({ processedClause }: ClauseWithSummaryAccordionProps) {
  const { clause, summary, summaryError, isLoadingSummary } = processedClause;

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
              View Plain-English Summary
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-0 pl-3 pr-3">
            {isLoadingSummary ? (
              <div className="space-y-2 py-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : summaryError ? (
              <Alert variant="destructive" className="mt-2 text-xs">
                <MessageSquareWarning className="h-4 w-4" />
                <AlertTitle className="text-xs font-semibold">Summary Error</AlertTitle>
                <AlertDescription>{summaryError}</AlertDescription>
              </Alert>
            ) : summary ? (
              <p className="text-sm leading-relaxed bg-primary/5 p-3 rounded-md border border-primary/20 whitespace-pre-wrap">
                {summary}
              </p>
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

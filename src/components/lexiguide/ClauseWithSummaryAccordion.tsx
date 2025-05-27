
"use client";

import React from 'react';
import type { ProcessedClause as SimplifiedProcessedClause } from '@/types'; // Renaming to avoid confusion if old type is around
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookMarked } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClauseWithSummaryAccordionProps {
  // Expects clause text and its pre-fetched summary
  clauseText: string;
  summaryText: string;
  clauseOriginalIndex: number;
}

export function ClauseWithSummaryAccordion({ clauseText, summaryText, clauseOriginalIndex }: ClauseWithSummaryAccordionProps) {
  return (
    <div className="py-4 border-b last:border-b-0">
      <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-1">Clause {clauseOriginalIndex + 1}</h3>
      <p className="text-sm font-mono whitespace-pre-wrap p-3 bg-secondary/30 rounded-md border border-secondary mb-2">
        {clauseText}
      </p>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={`clause-${clauseOriginalIndex}-summary`} className="border-b-0">
          <AccordionTrigger className="text-sm font-medium text-primary hover:no-underline py-2 px-3 rounded-md hover:bg-primary/10 data-[state=open]:bg-primary/10">
            <div className="flex items-center gap-2">
              <BookMarked className="w-4 h-4" />
              View Plain-English Summary
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-0 pl-3 pr-3">
            {summaryText ? (
              <div className={cn("p-3 rounded-md border mt-1 bg-muted/30 border-border")}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {summaryText}
                </p>
              </div>
            ) : (
              <div className={cn("p-3 rounded-md border mt-1 bg-muted/30 border-border")}>
                <p className="text-sm text-muted-foreground">
                  No summary was provided for this clause.
                </p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

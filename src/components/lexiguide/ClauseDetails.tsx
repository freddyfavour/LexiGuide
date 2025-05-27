
"use client";

// This component is no longer used in the primary layout 
// after the UI refactor to a conversational flow.
// It's kept here for potential future use or if parts are needed elsewhere.
// For now, it's effectively deprecated in the new structure.

import React from 'react';
import type { Clause, ClauseAnalysisData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { SummaryIcon, InfoIcon } from './icons';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ClauseDetailsProps {
  clause: Clause | null;
  analysis: ClauseAnalysisData | null;
  isLoadingAnalysis: boolean;
}

export function ClauseDetails({ clause, analysis, isLoadingAnalysis }: ClauseDetailsProps) {
  if (!clause) {
    return (
      <Card className="shadow-lg h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Clause Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
            <InfoIcon className="w-16 h-16 mb-4 text-primary/50" />
            <p className="text-lg">Select a clause from the list to see its summary.</p>
            <p className="text-sm mt-2">The summary will appear here in an expandable section.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const summaryAvailable = !!analysis?.summary;
  const summaryError = analysis?.summaryError;
  const isLoadingSummary = isLoadingAnalysis && !summaryAvailable && !summaryError;

  return (
    <Card className="shadow-lg h-full overflow-y-auto">
      <CardHeader className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 border-b">
        <CardTitle className="text-lg font-semibold">Clause {clause.originalIndex + 1} Text</CardTitle>
        <CardDescription className="text-xs leading-relaxed max-h-32 overflow-y-auto font-mono bg-muted/50 p-2 rounded-sm border">
          {clause.text}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <Accordion type="single" collapsible defaultValue="summary-item" className="w-full">
          <AccordionItem value="summary-item">
            <AccordionTrigger className="text-md font-semibold flex items-center gap-2 text-primary hover:no-underline">
              <SummaryIcon className="w-5 h-5" />
              Plain-English Summary
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              {summaryError && (
                <Alert variant="destructive">
                  <AlertTitle>Error Summarizing</AlertTitle>
                  <AlertDescription>{summaryError}</AlertDescription>
                </Alert>
              )}
              {isLoadingSummary ? (
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : summaryAvailable ? (
                <p className="text-sm leading-relaxed bg-primary/5 p-3 rounded-md border border-primary/20">
                  {analysis.summary}
                </p>
              ) : (
                !summaryError && <p className="text-sm text-muted-foreground">No summary available for this clause.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

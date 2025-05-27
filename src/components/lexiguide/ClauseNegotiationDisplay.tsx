
"use client";

// This component is no longer used in the primary layout 
// after the UI refactor to a conversational flow.
// Its logic for displaying negotiation points is now integrated into LexiGuidePageContent.tsx
// for the "Key Negotiation Points" section.
// It's kept here for potential future reference or if parts are needed elsewhere.
// For now, it's effectively deprecated in the new structure.

import React from 'react';
import type { ClauseAnalysisData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { NegotiationIcon, InfoIcon } from './icons';

interface ClauseNegotiationDisplayProps {
  analysis: ClauseAnalysisData | null;
  isLoadingAnalysis: boolean;
  clauseSelected: boolean;
}

export function ClauseNegotiationDisplay({ analysis, isLoadingAnalysis, clauseSelected }: ClauseNegotiationDisplayProps) {
   if (!clauseSelected) {
    return (
      <Card className="shadow-lg h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <NegotiationIcon className="w-5 h-5 text-primary" />
            Negotiation Aid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
            <InfoIcon className="w-16 h-16 mb-4 text-primary/50" />
            <p className="text-lg">Select a clause to see negotiation suggestions.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const negotiationData = analysis?.negotiation;
  const negotiationError = analysis?.negotiationError;
  const isLoadingNegotiation = isLoadingAnalysis && !negotiationData && !negotiationError;

  return (
    <Card className="shadow-lg h-full overflow-y-auto">
      <CardHeader className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 border-b">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <NegotiationIcon className="w-5 h-5 text-primary" />
          Negotiation Aid
        </CardTitle>
        <CardDescription>Suggestions for negotiating the selected clause.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-4">
        {negotiationError && (
          <Alert variant="destructive">
            <AlertTitle>Error Generating Suggestions</AlertTitle>
            <AlertDescription>{negotiationError}</AlertDescription>
          </Alert>
        )}
        {isLoadingNegotiation ? (
           <div className="space-y-3 p-1">
            <Skeleton className="h-5 w-1/3 mb-2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-full mt-1" />
            <Skeleton className="h-5 w-1/3 mb-2 mt-3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-3/4 mt-1" />
          </div>
        ) : negotiationData ? (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Suggested Edits:</h4>
              <p className="text-sm leading-relaxed font-mono bg-accent/10 p-3 rounded-md border border-accent/20 text-accent-foreground dark:text-accent">
                {negotiationData.suggestedEdits}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Explanation:</h4>
              <p className="text-sm leading-relaxed bg-muted/70 p-3 rounded-md border border-border">
                {negotiationData.explanation}
              </p>
            </div>
          </div>
        ) : (
          !negotiationError && <p className="text-sm text-muted-foreground">No negotiation suggestions available for this clause.</p>
        )}
      </CardContent>
    </Card>
  );
}

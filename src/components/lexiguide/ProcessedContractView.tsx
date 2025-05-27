
"use client";

import React from 'react';
import type { ProcessedClause } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MessageSquareWarning } from 'lucide-react';

interface ProcessedContractViewProps {
  processedClauses: ProcessedClause[];
}

export function ProcessedContractView({ processedClauses }: ProcessedContractViewProps) {
  if (!processedClauses || processedClauses.length === 0) {
    return null; 
  }

  return (
    <Card className="shadow-xl mt-2 sm:mt-4">
      <CardContent className="p-4 md:p-6 space-y-6">
        {processedClauses.map(({ clause, summary, summaryError, isLoadingSummary }) => (
          <div key={clause.id} className="space-y-3 pb-4 border-b last:border-b-0 last:pb-0">
            <div>
              <p className="text-xs text-muted-foreground mb-1 uppercase font-medium">Clause {clause.originalIndex + 1}</p>
              <div className="p-3 rounded-md bg-secondary/50 border border-secondary">
                <p className="text-sm font-mono whitespace-pre-wrap">{clause.text}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-primary mb-1 uppercase font-semibold">Plain English Summary</p>
              {isLoadingSummary ? (
                <div className="space-y-2 p-3 rounded-md bg-primary/5 border border-primary/20">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : summaryError ? (
                <Alert variant="destructive" className="bg-destructive/10">
                   <MessageSquareWarning className="h-4 w-4 !left-3 !top-3.5" />
                  <AlertTitle className="text-sm font-semibold">Summary Error</AlertTitle>
                  <AlertDescription className="text-xs">{summaryError}</AlertDescription>
                </Alert>
              ) : summary ? (
                <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary}</p>
                </div>
              ) : (
                <div className="p-3 rounded-md bg-muted/30 border">
                    <p className="text-sm text-muted-foreground">No summary could be generated for this clause.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

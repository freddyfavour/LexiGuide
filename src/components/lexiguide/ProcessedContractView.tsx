
"use client";

import React from 'react';
import type { ProcessedClause, ClauseAnalysisData, RiskLevel } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MessageSquareWarning, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { RiskLevelIndicator, LoadingIcon } from './icons';
import { cn } from '@/lib/utils';

interface ProcessedContractViewProps {
  processedClauses: ProcessedClause[];
  clauseAnalyses: Record<string, Partial<Omit<ClauseAnalysisData, 'summary' | 'summaryError'>>>;
  isLoadingAnalyses: boolean;
}

export function ProcessedContractView({ 
  processedClauses, 
  clauseAnalyses,
  isLoadingAnalyses 
}: ProcessedContractViewProps) {
  if (!processedClauses || processedClauses.length === 0) {
    return null; 
  }

  return (
    <Card className="shadow-xl mt-2 sm:mt-4">
      <CardContent className="p-4 md:p-6 space-y-6">
        {processedClauses.map(({ clause, summary, summaryError, isLoadingSummary }) => {
          const analysis = clauseAnalyses[clause.id];
          const riskData = analysis?.risk;
          const riskError = analysis?.riskError;
          
          let riskBarColor = 'bg-muted'; // Default for neutral/pending
          let riskTextColor = 'text-muted-foreground';
          let riskStatusText = "Risk assessment pending or not applicable.";
          let RiskIconComponent = null;

          if (isLoadingAnalyses && !riskData && !riskError) {
            riskStatusText = "Assessing risk...";
            RiskIconComponent = <LoadingIcon className="w-4 h-4 mr-1" />;
          } else if (riskError) {
            riskBarColor = 'bg-destructive/70';
            riskTextColor = 'text-destructive';
            riskStatusText = `Could not assess risk: ${riskError}`;
            RiskIconComponent = <XCircle className="w-4 h-4 mr-1" />;
          } else if (riskData) {
            switch (riskData.riskLevel as RiskLevel) {
              case 'low':
                riskBarColor = 'bg-[hsl(var(--risk-low-background))]';
                riskTextColor = 'text-[hsl(var(--risk-low-foreground))]';
                riskStatusText = "Status: Low Risk. This clause appears generally safe.";
                RiskIconComponent = <RiskLevelIndicator level="low" />;
                break;
              case 'medium':
                riskBarColor = 'bg-[hsl(var(--risk-medium-background))]';
                riskTextColor = 'text-[hsl(var(--risk-medium-foreground))]';
                riskStatusText = `Status: Medium Risk. ${riskData.riskSummary}`;
                RiskIconComponent = <RiskLevelIndicator level="medium" />;
                break;
              case 'high':
                riskBarColor = 'bg-[hsl(var(--risk-high-background))]';
                riskTextColor = 'text-[hsl(var(--risk-high-foreground))]';
                riskStatusText = `Status: High Risk. ${riskData.riskSummary}`;
                RiskIconComponent = <RiskLevelIndicator level="high" />;
                break;
            }
          }

          return (
            <div key={clause.id} className="space-y-3 pb-4 border-b last:border-b-0 last:pb-0">
              <div className="flex gap-3">
                <div className={cn("w-1.5 shrink-0 rounded-full", riskBarColor)}></div>
                <div className="flex-1 min-w-0">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase font-medium">Clause {clause.originalIndex + 1}</p>
                    <div className="p-3 rounded-md bg-secondary/50 border border-secondary">
                      <p className="text-sm font-mono whitespace-pre-wrap">{clause.text}</p>
                    </div>
                  </div>

                  <div className="mt-2">
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

                  <div className="mt-2">
                    <p className={cn("text-xs mb-1 uppercase font-semibold", riskTextColor)}>Risk Status</p>
                    <div className={cn("p-3 rounded-md border flex items-center text-sm", 
                      riskData?.riskLevel === 'low' ? 'bg-[hsl(var(--risk-low-background))] border-[hsl(var(--risk-low-foreground))] text-[hsl(var(--risk-low-foreground))]' :
                      riskData?.riskLevel === 'medium' ? 'bg-[hsl(var(--risk-medium-background))] border-[hsl(var(--risk-medium-foreground))] text-[hsl(var(--risk-medium-foreground))]' :
                      riskData?.riskLevel === 'high' ? 'bg-[hsl(var(--risk-high-background))] border-[hsl(var(--risk-high-foreground))] text-[hsl(var(--risk-high-foreground))]' :
                      riskError ? 'bg-destructive/10 border-destructive text-destructive' : 
                      'bg-muted/30 border-muted-foreground/30 text-muted-foreground'
                    )}>
                      {RiskIconComponent && <span className="mr-2 shrink-0">{RiskIconComponent}</span>}
                      <p className="leading-relaxed">{riskStatusText}</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

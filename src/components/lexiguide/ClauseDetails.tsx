"use client";

import React from 'react';
import type { Clause, ClauseAnalysisData, RiskLevel } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { SummaryIcon, RiskAssessmentIcon, NegotiationIcon, RiskLevelIndicator, InfoIcon } from './icons';
import { Separator } from '../ui/separator';

interface ClauseDetailsProps {
  clause: Clause | null;
  analysis: ClauseAnalysisData | null;
  isLoadingAnalysis: boolean;
}

const RiskBadge: React.FC<{ level: RiskLevel; summary: string }> = ({ level, summary }) => {
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  let className = '';
  let text = level.toUpperCase();

  if (level === 'low') {
    className = 'bg-[hsl(var(--risk-low-background))] text-[hsl(var(--risk-low-foreground))] border-[hsl(var(--risk-low-foreground))]';
    text = 'Low Risk';
  } else if (level === 'medium') {
    className = 'bg-[hsl(var(--risk-medium-background))] text-[hsl(var(--risk-medium-foreground))] border-[hsl(var(--risk-medium-foreground))]';
    text = 'Medium Risk';
  } else if (level === 'high') {
    className = 'bg-[hsl(var(--risk-high-background))] text-[hsl(var(--risk-high-foreground))] border-transparent';
    text = 'High Risk';
  }

  return (
    <Badge variant="outline" className={`text-xs px-2.5 py-1 ${className} flex items-center gap-1.5`}>
      <RiskLevelIndicator level={level} />
      <span className="font-semibold">{text}:</span>
      <span className="font-normal">{summary}</span>
    </Badge>
  );
};

export function ClauseDetails({ clause, analysis, isLoadingAnalysis }: ClauseDetailsProps) {
  if (!clause) {
    return (
      <Card className="shadow-lg h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Clause Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
            <InfoIcon className="w-16 h-16 mb-4 text-primary/50" />
            <p className="text-lg">Select a clause from the list to see its details and AI analysis.</p>
            <p className="text-sm mt-2">Once a contract is processed, its clauses will appear on the left. Click any clause to begin.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderLoadingSkeletons = () => (
    <div className="space-y-6 p-1">
      <div>
        <Skeleton className="h-5 w-1/3 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full mt-1" />
        <Skeleton className="h-4 w-2/3 mt-1" />
      </div>
      <div>
        <Skeleton className="h-5 w-1/4 mb-2" />
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mt-1" />
      </div>
      <div>
        <Skeleton className="h-5 w-1/3 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full mt-1" />
      </div>
    </div>
  );

  return (
    <Card className="shadow-lg h-full overflow-y-auto">
      <CardHeader className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 border-b">
        <CardTitle className="text-lg font-semibold">Clause {clause.originalIndex + 1} Details</CardTitle>
        <CardDescription className="text-xs leading-relaxed max-h-20 overflow-y-auto font-mono bg-muted/50 p-2 rounded-sm border">
          {clause.text}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-6">
        {isLoadingAnalysis && !analysis ? renderLoadingSkeletons() : (
          <>
            {/* Summary Section */}
            <div className="space-y-2">
              <h3 className="text-md font-semibold flex items-center gap-2 text-primary">
                <SummaryIcon className="w-5 h-5" />
                Plain-English Summary
              </h3>
              {analysis?.summaryError && (
                <Alert variant="destructive">
                  <AlertTitle>Error Summarizing</AlertTitle>
                  <AlertDescription>{analysis.summaryError}</AlertDescription>
                </Alert>
              )}
              {isLoadingAnalysis && !analysis?.summary && !analysis?.summaryError ? <Skeleton className="h-16 w-full" /> :
                analysis?.summary ? <p className="text-sm leading-relaxed bg-primary/5 p-3 rounded-md border border-primary/20">{analysis.summary}</p> : <p className="text-sm text-muted-foreground">No summary available.</p>
              }
            </div>
            <Separator />
            {/* Risk Assessment Section */}
            <div className="space-y-2">
              <h3 className="text-md font-semibold flex items-center gap-2 text-primary">
                <RiskAssessmentIcon className="w-5 h-5" />
                Risk Assessment
              </h3>
              {analysis?.riskError && (
                <Alert variant="destructive">
                  <AlertTitle>Error Assessing Risk</AlertTitle>
                  <AlertDescription>{analysis.riskError}</AlertDescription>
                </Alert>
              )}
              {isLoadingAnalysis && !analysis?.risk && !analysis?.riskError ? <Skeleton className="h-20 w-full" /> : 
                analysis?.risk ? (
                  <div className="space-y-3">
                    <RiskBadge level={analysis.risk.riskLevel as RiskLevel} summary={analysis.risk.riskSummary} />
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">Suggested Actions:</h4>
                      <p className="text-sm leading-relaxed bg-muted/50 p-3 rounded-md border">{analysis.risk.suggestedActions}</p>
                    </div>
                  </div>
                ) : <p className="text-sm text-muted-foreground">No risk assessment available.</p>
              }
            </div>
            <Separator />
            {/* Negotiation Suggestions Section */}
            <div className="space-y-2">
              <h3 className="text-md font-semibold flex items-center gap-2 text-primary">
                <NegotiationIcon className="w-5 h-5" />
                Negotiation Suggestions
              </h3>
              {analysis?.negotiationError && (
                <Alert variant="destructive">
                  <AlertTitle>Error Generating Suggestions</AlertTitle>
                  <AlertDescription>{analysis.negotiationError}</AlertDescription>
                </Alert>
              )}
              {isLoadingAnalysis && !analysis?.negotiation && !analysis?.negotiationError ? <Skeleton className="h-24 w-full" /> :
                analysis?.negotiation ? (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">Suggested Edits:</h4>
                      <p className="text-sm leading-relaxed font-mono bg-green-50 dark:bg-green-900/30 p-3 rounded-md border border-green-500/50 text-green-700 dark:text-green-300">{analysis.negotiation.suggestedEdits}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">Explanation:</h4>
                      <p className="text-sm leading-relaxed bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md border border-blue-500/50 text-blue-700 dark:text-blue-300">{analysis.negotiation.explanation}</p>
                    </div>
                  </div>
                ) : <p className="text-sm text-muted-foreground">No negotiation suggestions available.</p>
              }
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

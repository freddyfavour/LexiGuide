
"use client";

// This component is no longer used in the primary layout 
// after the UI refactor to a conversational flow.
// Its logic for displaying risk is now integrated into LexiGuidePageContent.tsx
// for the "Key Risk Highlights" section.
// It's kept here for potential future reference or if parts are needed elsewhere.
// For now, it's effectively deprecated in the new structure.


import React from 'react';
import type { ClauseAnalysisData, RiskLevel } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { RiskAssessmentIcon, RiskLevelIndicator, InfoIcon } from './icons';
import { Separator } from '@/components/ui/separator';

interface ClauseRiskDisplayProps {
  analysis: ClauseAnalysisData | null;
  isLoadingAnalysis: boolean;
  clauseSelected: boolean;
}

const RiskBadge: React.FC<{ level: RiskLevel; summary: string }> = ({ level, summary }) => {
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
    <Badge variant="outline" className={`text-xs px-2.5 py-1 ${className} flex items-center gap-1.5 whitespace-normal text-left`}>
      <RiskLevelIndicator level={level} />
      <div className="flex flex-col">
        <span className="font-semibold">{text}</span>
        <span className="font-normal">{summary}</span>
      </div>
    </Badge>
  );
};

export function ClauseRiskDisplay({ analysis, isLoadingAnalysis, clauseSelected }: ClauseRiskDisplayProps) {
  if (!clauseSelected) {
    return (
      <Card className="shadow-lg h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <RiskAssessmentIcon className="w-5 h-5 text-primary" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
            <InfoIcon className="w-16 h-16 mb-4 text-primary/50" />
            <p className="text-lg">Select a clause to see its risk assessment.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const riskData = analysis?.risk;
  const riskError = analysis?.riskError;
  const isLoadingRisk = isLoadingAnalysis && !riskData && !riskError;

  return (
    <Card className="shadow-lg h-full overflow-y-auto">
      <CardHeader className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 border-b">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <RiskAssessmentIcon className="w-5 h-5 text-primary" />
          Risk Assessment
        </CardTitle>
        <CardDescription>Potential risks associated with the selected clause.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-4">
        {riskError && (
          <Alert variant="destructive">
            <AlertTitle>Error Assessing Risk</AlertTitle>
            <AlertDescription>{riskError}</AlertDescription>
          </Alert>
        )}
        {isLoadingRisk ? (
          <div className="space-y-3 p-1">
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-1" />
            <Separator className="my-3"/>
            <Skeleton className="h-5 w-1/3 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : riskData ? (
          <div className="space-y-3">
            <RiskBadge level={riskData.riskLevel as RiskLevel} summary={riskData.riskSummary} />
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Suggested Actions:</h4>
              <p className="text-sm leading-relaxed bg-muted/50 p-3 rounded-md border">{riskData.suggestedActions}</p>
            </div>
          </div>
        ) : (
          !riskError && <p className="text-sm text-muted-foreground">No risk assessment available for this clause.</p>
        )}
      </CardContent>
    </Card>
  );
}

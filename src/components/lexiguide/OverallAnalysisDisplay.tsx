
"use client";

import React from 'react';
import type { ComprehensiveContractAnalysisOutput } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Lightbulb, AlertCircle, InfoIcon as LucideInfoIcon } from 'lucide-react'; // Renamed InfoIcon to avoid conflict
import { LoadingIcon, InfoIcon } from './icons'; // Local InfoIcon

interface OverallAnalysisDisplayProps {
  analysis: ComprehensiveContractAnalysisOutput | null;
  isLoading: boolean;
  error?: string | null;
}

const renderListItems = (text: string | undefined, ItemIcon: React.ElementType, itemType: 'risk' | 'recommendation') => {
  if (!text) {
    return <p className="text-sm text-muted-foreground p-3">No {itemType} information provided.</p>;
  }

  const items = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('* ') || line.startsWith('- '))
    .map(line => line.substring(2).trim()) // Remove '* ' or '- '
    .filter(Boolean); // Remove any empty strings that might result

  if (items.length > 0) {
    return (
      <div className="space-y-2">
        {items.map((item, index) => (
          <div 
            key={`${itemType}-${index}`} 
            className="flex items-start gap-2.5 p-3 bg-muted/30 hover:bg-muted/50 transition-colors duration-150 rounded-lg border border-border/60 shadow-sm"
          >
            <ItemIcon className="w-4 h-4 text-primary mt-1 shrink-0" />
            <p className="text-sm leading-relaxed text-foreground/90">{item}</p>
          </div>
        ))}
      </div>
    );
  }
  // Fallback if no list items are parsed, render the original text
  return (
    <p className="text-sm leading-relaxed bg-muted/50 p-3 rounded-md border whitespace-pre-wrap">
      {text}
    </p>
  );
};


export function OverallAnalysisDisplay({ analysis, isLoading, error }: OverallAnalysisDisplayProps) {
  if (isLoading) {
    return (
      <Card className="shadow-xl mt-6 sm:mt-8">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <LoadingIcon className="w-5 h-5 sm:w-6 sm:w-6" />
            Overall Contract Analysis
          </CardTitle>
          <CardDescription>Generating holistic insights for your contract...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-xl mt-6 sm:mt-8">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-semibold text-destructive flex items-center gap-2">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:w-6" />
            Overall Analysis Error
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to Generate Overall Analysis</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
         <Card className="shadow-xl mt-6 sm:mt-8">
            <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                    <InfoIcon className="w-5 h-5 sm:w-6 sm:w-6 text-muted-foreground" /> {/* Using local InfoIcon */}
                    Overall Contract Analysis
                </CardTitle>
                 <CardDescription>Holistic insights for your contract will appear here once processed.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <p className="text-sm text-muted-foreground">No overall analysis data available yet. Process a contract to see insights.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="shadow-xl mt-6 sm:mt-8">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl font-semibold">Overall Contract Analysis</CardTitle>
        <CardDescription>Holistic insights based on the entire contract document.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-4 sm:p-6">
        <div>
          <h3 className="text-md sm:text-lg font-semibold mb-3 flex items-center gap-2 text-primary">
            <ShieldAlert className="w-5 h-5" />
            Overall Risk Assessment
          </h3>
          {renderListItems(analysis.overallRiskAssessment, ShieldAlert, 'risk')}
        </div>
        <div>
          <h3 className="text-md sm:text-lg font-semibold mb-3 flex items-center gap-2 text-primary">
            <Lightbulb className="w-5 h-5" />
            Overall Recommendations
          </h3>
          {renderListItems(analysis.overallRecommendations, Lightbulb, 'recommendation')}
        </div>
      </CardContent>
    </Card>
  );
}

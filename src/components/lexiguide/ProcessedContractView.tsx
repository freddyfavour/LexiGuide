
"use client";

// This component is now DEPRECATED.
// Its functionality of displaying clauses and summaries is now handled by
// LexiGuidePageContent.tsx rendering a list of ClauseWithSummaryAccordion.tsx components.
// The direct risk display within each clause item has also been superseded by the OverallAnalysisDisplay.tsx.

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquareWarning } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProcessedContractView() {
  return (
    <Card className="shadow-xl mt-2 sm:mt-4 opacity-50 pointer-events-none"> {/* Visually indicate deprecation */}
      <CardContent className="p-4 md:p-6 space-y-6">
        <div className="text-center text-muted-foreground p-4">
            <MessageSquareWarning className="w-8 h-8 mx-auto mb-2 text-destructive" />
            <p className="font-semibold">Deprecated Component</p>
            <p className="text-sm">Clause display is now handled by a new accordion-based view.</p>
        </div>
      </CardContent>
    </Card>
  );
}

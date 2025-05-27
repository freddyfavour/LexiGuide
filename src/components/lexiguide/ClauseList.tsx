
"use client";

// This component is no longer used in the primary layout 
// after the UI refactor to a conversational flow.
// It's kept here for potential future use or if parts are needed elsewhere.
// For now, it's effectively deprecated in the new structure.

import React from 'react';
import type { Clause } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ClauseListIcon } from './icons';

interface ClauseListProps {
  clauses: Clause[];
  selectedClauseId: string | null;
  onClauseSelect: (id: string) => void;
  isLoading: boolean;
}

export function ClauseList({ clauses, selectedClauseId, onClauseSelect, isLoading }: ClauseListProps) {
  if (!clauses.length) {
    return (
      <Card className="shadow-md h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <ClauseListIcon />
            Contract Clauses
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center p-4">
            Process a contract to see the list of clauses here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ClauseListIcon />
          Contract Clauses ({clauses.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-2">
        <ScrollArea className="h-full rounded-md border bg-muted/20 p-2">
          <div className="space-y-1">
            {clauses.map((clause) => (
              <Button
                key={clause.id}
                variant={selectedClauseId === clause.id ? 'default' : 'ghost'}
                className={cn(
                  "w-full justify-start text-left h-auto py-2 px-3 whitespace-normal text-sm",
                  selectedClauseId === clause.id && "bg-primary text-primary-foreground shadow-md",
                  selectedClauseId !== clause.id && "hover:bg-primary/10"
                )}
                onClick={() => onClauseSelect(clause.id)}
                disabled={isLoading}
                aria-pressed={selectedClauseId === clause.id}
              >
                <span className="font-medium mr-2">Clause {clause.originalIndex + 1}:</span>
                <span className="truncate">{clause.text.substring(0, 100)}{clause.text.length > 100 ? '...' : ''}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

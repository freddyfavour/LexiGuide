"use client";

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
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <ClauseListIcon />
            Contract Clauses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Process a contract to see the list of clauses here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ClauseListIcon />
          Contract Clauses ({clauses.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-300px)] md:h-[calc(100vh-260px)] rounded-md border p-2 bg-muted/20">
          <div className="space-y-1">
            {clauses.map((clause, index) => (
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

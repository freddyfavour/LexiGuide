
"use client";

// This component is now DEPRECATED.
// The AI Legal Advisor chat functionality has been removed as per new requirements.
// The application now focuses on a single-shot contract analysis.

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdvisorIcon } from './icons';

export function AILegalAdvisor() {
  return (
    <Card className="shadow-lg h-full flex flex-col opacity-50 pointer-events-none"> {/* Visually indicate deprecation */}
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <AdvisorIcon className="w-6 h-6 text-primary" />
          AI Legal Advisor (Deprecated Component)
        </CardTitle>
        <CardDescription>
          This chat functionality has been removed. The app now provides a one-time contract analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-4">
        <div className="text-center text-muted-foreground p-4">
          AI Chat has been disabled.
        </div>
      </CardContent>
    </Card>
  );
}

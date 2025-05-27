
"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { Clause, ProcessedClause, OverallContractAnalysisOutput, RiskLevel } from '@/types';
import { summarizeClause } from '@/ai/flows/clause-summarization';
import { assessRisk } from '@/ai/flows/risk-assessment';
import { analyzeOverallContract } from '@/ai/flows/overall-contract-analysis';
import { useToast } from '@/hooks/use-toast';
import { ResetIcon, InfoIcon, LoadingIcon } from './icons';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ContractInputForm } from './ContractInputForm';
import { ClauseWithSummaryAccordion } from './ClauseWithSummaryAccordion';
import { OverallAnalysisDisplay } from './OverallAnalysisDisplay';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';


export function LexiGuidePageContent() {
  const [contractText, setContractText] = useState<string>('');
  const [processedClauses, setProcessedClauses] = useState<ProcessedClause[]>([]);
  const [overallAnalysis, setOverallAnalysis] = useState<OverallContractAnalysisOutput | null>(null);

  const [showInputForm, setShowInputForm] = useState(true);
  const [isLoadingContractProcessing, setIsLoadingContractProcessing] = useState(false);
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);
  const [isLoadingRisks, setIsLoadingRisks] = useState(false);
  const [isLoadingOverallAnalysis, setIsLoadingOverallAnalysis] = useState(false);
  const [overallAnalysisError, setOverallAnalysisError] = useState<string | null>(null);

  const { toast } = useToast();
  const resultsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showInputForm && (processedClauses.length > 0 || overallAnalysis)) {
      // resultsEndRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [processedClauses, overallAnalysis, showInputForm]);


  const handleProcessContract = async (text: string) => {
    if (!text.trim()) {
      toast({
        title: "Empty Contract",
        description: "Please provide some contract text.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingContractProcessing(true);
    setShowInputForm(false);
    setContractText(text);
    setProcessedClauses([]);
    setOverallAnalysis(null);
    setOverallAnalysisError(null);

    const rawClauses = text
      .split(/\n\s*\n+/)
      .map((t, i) => ({ id: `clause-${Date.now()}-${i}`, text: t.trim(), originalIndex: i }))
      .filter(c => c.text.length > 0);

    if (rawClauses.length === 0) {
      toast({
        title: "No Clauses Found",
        description: "Could not identify distinct clauses. Ensure your contract text uses paragraph breaks (empty lines) between clauses.",
        variant: "default",
      });
      setIsLoadingContractProcessing(false);
      setShowInputForm(true);
      return;
    }

    toast({
      title: "Processing Contract...",
      description: `Identified ${rawClauses.length} clauses. Generating summaries, risk assessments, and overall analysis. This may take some time.`,
    });

    setIsLoadingContractProcessing(false);

    let initialProcessedClauses: ProcessedClause[] = rawClauses.map(clause => ({
      clause,
      isLoadingSummary: true,
      isLoadingRisk: true,
    }));
    setProcessedClauses(initialProcessedClauses);

    // Fetch summaries sequentially
    setIsLoadingSummaries(true);
    let clausesWithSummaries: ProcessedClause[] = [...initialProcessedClauses];
    for (let i = 0; i < clausesWithSummaries.length; i++) {
      const pc = clausesWithSummaries[i];
      try {
        const summaryRes = await summarizeClause({ clauseText: pc.clause.text });
        clausesWithSummaries[i] = { ...pc, summary: summaryRes.summary, isLoadingSummary: false };
        setProcessedClauses([...clausesWithSummaries]); // Update state incrementally
      } catch (e: any) {
        console.error(`Error summarizing clause ${pc.clause.id}:`, e);
        const errorMsg = e.message || "Failed to get summary.";
        clausesWithSummaries[i] = { ...pc, summaryError: errorMsg, isLoadingSummary: false };
        setProcessedClauses([...clausesWithSummaries]); // Update state incrementally
      }
    }
    setIsLoadingSummaries(false);
    if (clausesWithSummaries.some(pc => pc.summary && !pc.summaryError && !pc.isLoadingSummary)) {
      toast({
        title: "Clause Summaries Complete",
        description: "All clause summaries have been generated.",
      });
    }


    // Fetch risk assessments sequentially
    setIsLoadingRisks(true);
    let clausesWithRisks: ProcessedClause[] = [...clausesWithSummaries]; // Start with summaries loaded
    for (let i = 0; i < clausesWithRisks.length; i++) {
      const pc = clausesWithRisks[i];
      try {
        const riskRes = await assessRisk({ clauseText: pc.clause.text });
        clausesWithRisks[i] = { ...pc, risk: riskRes, isLoadingRisk: false };
        setProcessedClauses([...clausesWithRisks]); // Update state incrementally
      } catch (e: any) {
        console.error(`Error assessing risk for clause ${pc.clause.id}:`, e);
        const errorMsg = e.message || "Failed to assess risk.";
        clausesWithRisks[i] = { ...pc, riskError: errorMsg, isLoadingRisk: false };
        setProcessedClauses([...clausesWithRisks]); // Update state incrementally
      }
    }
    setIsLoadingRisks(false);
    if (clausesWithRisks.some(pc => pc.risk && !pc.riskError && !pc.isLoadingRisk)) {
      toast({
        title: "Risk Assessments Complete",
        description: "Risk levels for clauses have been determined.",
      });
    }

    // Fetch overall analysis
    setIsLoadingOverallAnalysis(true);
    try {
      const overallRes = await analyzeOverallContract({ contractText: text });
      setOverallAnalysis(overallRes);
      if (overallRes) {
        toast({
          title: "Overall Analysis Complete",
          description: "Holistic contract insights are now available.",
        });
      }
    } catch (e: any) {
      console.error("Error fetching overall contract analysis:", e);
      const errorMsg = e.message || "Failed to generate overall contract analysis.";
      setOverallAnalysisError(errorMsg);
      toast({
        title: "Overall Analysis Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
    setIsLoadingOverallAnalysis(false);
  };

  const handleReset = () => {
    setContractText('');
    setProcessedClauses([]);
    setOverallAnalysis(null);
    setOverallAnalysisError(null);

    setShowInputForm(true);
    setIsLoadingContractProcessing(false);
    setIsLoadingSummaries(false);
    setIsLoadingRisks(false);
    setIsLoadingOverallAnalysis(false);

    toast({ title: "Application Reset", description: "All contract data has been cleared." });
  };

  const isProcessing = isLoadingContractProcessing || isLoadingSummaries || isLoadingRisks || isLoadingOverallAnalysis;

  return (
    <div className="flex flex-col h-full">
      {showInputForm ? (
        <ContractInputForm
          onProcessContract={handleProcessContract}
          isLoading={isProcessing}
        />
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 sm:mb-6 px-1 pt-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-primary">Contract Analysis Report</h2>
            <Button variant="outline" onClick={handleReset} disabled={isProcessing}>
              <ResetIcon className="mr-2 h-4 w-4" /> Reset & Analyze New Contract
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-4 sm:space-y-6 px-1 pb-6">
              <Card className="shadow-lg">
                <CardContent className="p-4 md:p-6 divide-y divide-border">
                  {(isLoadingSummaries || isLoadingRisks) && processedClauses.every(pc => pc.isLoadingSummary || pc.isLoadingRisk) && (
                     <div className="flex items-center justify-center p-6 text-muted-foreground">
                        <LoadingIcon className="w-6 h-6 mr-3"/>
                        <p>Loading clause summaries & risk assessments...</p>
                    </div>
                  )}
                  {processedClauses.length > 0 ? (
                    processedClauses.map((pc) => (
                      <ClauseWithSummaryAccordion key={pc.clause.id} processedClause={pc} />
                    ))
                  ) : (
                     !isProcessing && (
                        <div className="flex items-center justify-center p-6 text-muted-foreground">
                            <InfoIcon className="w-6 h-6 mr-3"/>
                            <p>No clauses to display or an issue occurred during processing.</p>
                        </div>
                     )
                  )}
                </CardContent>
              </Card>

              <OverallAnalysisDisplay
                analysis={overallAnalysis}
                isLoading={isLoadingOverallAnalysis}
                error={overallAnalysisError}
              />
              <div ref={resultsEndRef} />
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

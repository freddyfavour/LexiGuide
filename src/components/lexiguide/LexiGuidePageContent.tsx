
"use client";

import React, { useState, useEffect } from 'react';
import { ContractInput } from './ContractInput';
import { AILegalAdvisor } from './AILegalAdvisor';
import type { Clause, ProcessedClause, AdvisorMessage, ClauseAnalysisData, RiskAssessmentOutput, NegotiationSuggestionsOutput } from '@/types';
import { summarizeClause } from '@/ai/flows/clause-summarization';
import { assessRisk } from '@/ai/flows/risk-assessment';
import { negotiationSuggestions } from '@/ai/flows/negotiation-suggestions';
import { aiLegalAdvisor } from '@/ai/flows/ai-legal-advisor';
import { useToast } from '@/hooks/use-toast';
import { ResetIcon, InfoIcon, LoadingIcon } from './icons';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProcessedContractView } from './ProcessedContractView';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { RiskLevelIndicator } from './icons';

export function LexiGuidePageContent() {
  const [contractText, setContractText] = useState<string>('');
  const [processedClauses, setProcessedClauses] = useState<ProcessedClause[]>([]);
  const [advisorMessages, setAdvisorMessages] = useState<AdvisorMessage[]>([]);
  
  const [isLoadingContractProcessing, setIsLoadingContractProcessing] = useState(false); // For initial text split
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false); // For all summaries
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(false); // For all risk/negotiation
  const [clauseAnalyses, setClauseAnalyses] = useState<Record<string, Partial<Omit<ClauseAnalysisData, 'summary' | 'summaryError'>>>>({});


  const { toast } = useToast();

  const handleProcessContract = async (text: string) => {
    setIsLoadingContractProcessing(true);
    setIsLoadingSummaries(true);
    setContractText(text);
    setProcessedClauses([]);
    setAdvisorMessages([]);
    setClauseAnalyses({});

    const rawClauses = text
      .split(/\n\s*\n+/)
      .map((t, i) => ({ id: `clause-${i}`, text: t.trim(), originalIndex: i }))
      .filter(c => c.text.length > 0);
    
    if (rawClauses.length === 0) {
      toast({
        title: "Contract Processed",
        description: "No clauses identified. Ensure your contract text has paragraph breaks.",
        variant: "destructive",
      });
      setIsLoadingContractProcessing(false);
      setIsLoadingSummaries(false);
      setContractText(''); // Clear contract text if no clauses found
      return;
    }

    toast({
      title: "Processing Contract...",
      description: `Identifying ${rawClauses.length} clauses and generating summaries.`,
    });

    // Initialize clauses with loading state for summaries
    let initialProcessedClauses: ProcessedClause[] = rawClauses.map(clause => ({
      clause,
      isLoadingSummary: true,
    }));
    setProcessedClauses(initialProcessedClauses);
    setIsLoadingContractProcessing(false); // Base clauses identified

    // Fetch summaries sequentially and update state
    for (let i = 0; i < initialProcessedClauses.length; i++) {
      const pc = initialProcessedClauses[i];
      try {
        const summaryRes = await summarizeClause({ clauseText: pc.clause.text });
        initialProcessedClauses[i] = { ...pc, summary: summaryRes.summary, isLoadingSummary: false };
      } catch (e: any) {
        console.error(`Error summarizing clause ${pc.clause.id}:`, e);
        initialProcessedClauses[i] = { ...pc, summaryError: e.message || "Failed to get summary.", isLoadingSummary: false };
      }
      // Update state incrementally to show summaries as they arrive
      setProcessedClauses([...initialProcessedClauses]);
    }
    
    setIsLoadingSummaries(false);
    toast({
      title: "Summaries Complete",
      description: `All ${rawClauses.length} clauses have been summarized.`,
    });

    // Start fetching risk and negotiation analyses
    if (rawClauses.length > 0) {
      fetchAllAnalyses(rawClauses, text, initialProcessedClauses);
    }
  };
  
  const fetchAllAnalyses = async (clausesToAnalyze: Clause[], fullContractText: string, currentProcessedClauses: ProcessedClause[]) => {
    setIsLoadingAnalyses(true);
    toast({
      title: "Analyzing Risks & Negotiations...",
      description: `Fetching detailed analysis for ${clausesToAnalyze.length} clauses.`,
    });

    const newAnalysesUpdate: Record<string, Partial<Omit<ClauseAnalysisData, 'summary' | 'summaryError'>>> = {};

    for (const clause of clausesToAnalyze) {
      let riskData: RiskAssessmentOutput | undefined;
      let riskError: string | undefined;
      let negotiationData: NegotiationSuggestionsOutput | undefined;
      let negotiationError: string | undefined;

      try {
        riskData = await assessRisk({ clauseText: clause.text });
      } catch (e: any) {
        riskError = e.message || "Failed to assess risk.";
      }

      const processedClause = currentProcessedClauses.find(pc => pc.clause.id === clause.id);
      const clauseSummary = processedClause?.summary;

      if (clauseSummary && riskData) {
        try {
          negotiationData = await negotiationSuggestions({
            contractText: fullContractText,
            clauseSummary: clauseSummary,
            riskAssessment: `${riskData.riskLevel}: ${riskData.riskSummary}`,
          });
        } catch (e: any) {
          negotiationError = e.message || "Failed to get negotiation suggestions.";
        }
      } else if (!clauseSummary || !riskData) {
         negotiationError = "Negotiation suggestions depend on summary and risk assessment, one of which was not available.";
      }
      
      newAnalysesUpdate[clause.id] = {
        risk: riskData,
        riskError,
        negotiation: negotiationData,
        negotiationError,
      };
      // Incrementally update clauseAnalyses state
      setClauseAnalyses(prev => ({ ...prev, ...newAnalysesUpdate }));
    }
    
    setIsLoadingAnalyses(false);
    toast({
      title: "Analysis Complete",
      description: `Risk and negotiation analysis finished for all clauses.`,
    });
  };


  const handleReset = () => {
    setContractText('');
    setProcessedClauses([]);
    setAdvisorMessages([]);
    setIsLoadingContractProcessing(false);
    setIsLoadingSummaries(false);
    setIsLoadingAnalyses(false);
    setClauseAnalyses({});
    toast({ title: "Application Reset", description: "All contract data has been cleared."});
  };

  const handleAdvisorSendMessage = async (question: string) => {
    if (!contractText) {
      toast({ title: "Cannot Send Message", description: "Please process a contract first.", variant: "destructive" });
      return;
    }

    const newUserMessage: AdvisorMessage = { id: `user-${Date.now()}`, type: 'user', content: question };
    setAdvisorMessages(prev => [...prev, newUserMessage]);
    // setIsLoadingAdvisor(true); // This state was removed, handle in AILegalAdvisor or re-add if needed

    try {
      const res = await aiLegalAdvisor({ contractText, question });
      const aiResponse: AdvisorMessage = { id: `ai-${Date.now()}`, type: 'ai', content: res.answer };
      setAdvisorMessages(prev => [...prev, aiResponse]);
    } catch (e: any) {
      console.error("Error with AI Advisor:", e);
      const errorResponse: AdvisorMessage = { id: `err-${Date.now()}`, type: 'error', content: e.message || "AI Advisor failed to respond." };
      setAdvisorMessages(prev => [...prev, errorResponse]);
      toast({ title: "AI Advisor Error", description: errorResponse.content, variant: "destructive" });
    }
    // setIsLoadingAdvisor(false);
  };

  const hasProcessedContract = processedClauses.length > 0 && !isLoadingSummaries;
  const hasAnalyses = Object.keys(clauseAnalyses).length > 0;

  return (
    <div className="space-y-4 sm:space-y-6 pb-16"> {/* Added padding-bottom for chat */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-primary">Contract Analysis Dashboard</h2>
        <Button variant="outline" onClick={handleReset} disabled={isLoadingContractProcessing || isLoadingSummaries || isLoadingAnalyses}>
          <ResetIcon className="mr-2 h-4 w-4" /> Reset All
        </Button>
      </div>

      {!contractText && !isLoadingContractProcessing && (
         <Alert className="border-primary/30 bg-primary/5">
          <InfoIcon className="h-5 w-5 text-primary" />
          <AlertTitle className="text-primary font-semibold">Welcome to LexiGuide!</AlertTitle>
          <AlertDescription>
            To get started, paste your contract text into the input area below, or upload a .txt file. 
            LexiGuide will then break it down and explain each clause.
          </AlertDescription>
        </Alert>
      )}

      <ContractInput onProcessContract={handleProcessContract} isLoading={isLoadingContractProcessing || isLoadingSummaries} />

      {(isLoadingContractProcessing || isLoadingSummaries) && contractText && !hasProcessedContract && (
        <div className="flex items-center justify-center p-8 rounded-lg border bg-card shadow-md">
          <LoadingIcon className="w-8 h-8 text-primary mr-3" />
          <p className="text-lg text-muted-foreground">Processing contract and generating summaries...</p>
        </div>
      )}

      {processedClauses.length > 0 && (
        <ProcessedContractView processedClauses={processedClauses} />
      )}
      
      {hasProcessedContract && (
        <>
          <Card className="shadow-xl mt-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Key Risk Highlights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingAnalyses && !hasAnalyses && (
                <div className="flex items-center text-muted-foreground">
                  <LoadingIcon className="w-5 h-5 mr-2" /> Loading risk assessments...
                </div>
              )}
              {!isLoadingAnalyses && !hasAnalyses && contractText && (
                <p className="text-muted-foreground">Risk analysis will appear here once processing is complete.</p>
              )}
              {!isLoadingAnalyses && hasAnalyses && Object.values(clauseAnalyses).every(a => !a.risk && !a.riskError) && (
                 <p className="text-muted-foreground">No specific risks identified or an issue occurred during assessment.</p>
              )}
              {Object.entries(clauseAnalyses).map(([clauseId, analysis]) => {
                const clause = processedClauses.find(pc => pc.clause.id === clauseId)?.clause;
                if (!clause || (!analysis.risk && !analysis.riskError)) return null;
                if (analysis.risk && analysis.risk.riskLevel === 'low' && Object.keys(clauseAnalyses).filter(id => clauseAnalyses[id].risk && clauseAnalyses[id].risk?.riskLevel !== 'low').length > 0) return null;

                return (
                  <div key={clauseId} className="p-3 border rounded-md bg-muted/30">
                    <h4 className="font-semibold mb-1 text-sm">Clause {clause.originalIndex + 1}</h4>
                    {analysis.risk && (
                      <>
                        <Badge
                          variant="outline"
                          className={`text-xs px-2 py-0.5 mb-1.5 flex items-center gap-1.5 whitespace-normal text-left max-w-max
                            ${analysis.risk.riskLevel === 'low' ? 'bg-[hsl(var(--risk-low-background))] text-[hsl(var(--risk-low-foreground))] border-[hsl(var(--risk-low-foreground))]' : ''}
                            ${analysis.risk.riskLevel === 'medium' ? 'bg-[hsl(var(--risk-medium-background))] text-[hsl(var(--risk-medium-foreground))] border-[hsl(var(--risk-medium-foreground))]' : ''}
                            ${analysis.risk.riskLevel === 'high' ? 'bg-[hsl(var(--risk-high-background))] text-[hsl(var(--risk-high-foreground))] border-transparent' : ''}
                          `}
                        >
                          <RiskLevelIndicator level={analysis.risk.riskLevel as 'low' | 'medium' | 'high'} />
                          <span>{analysis.risk.riskLevel.toUpperCase()} Risk: {analysis.risk.riskSummary}</span>
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Suggested Action: </span>{analysis.risk.suggestedActions}
                        </p>
                      </>
                    )}
                    {analysis.riskError && <p className="text-xs text-destructive mt-1">Error assessing risk: {analysis.riskError}</p>}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="shadow-xl mt-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Key Negotiation Points</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingAnalyses && !hasAnalyses && (
                <div className="flex items-center text-muted-foreground">
                  <LoadingIcon className="w-5 h-5 mr-2" /> Loading negotiation suggestions...
                </div>
              )}
              {!isLoadingAnalyses && !hasAnalyses && contractText && (
                 <p className="text-muted-foreground">Negotiation points will appear here once processing is complete.</p>
              )}
               {!isLoadingAnalyses && hasAnalyses && Object.values(clauseAnalyses).every(a => !a.negotiation && !a.negotiationError) && (
                 <p className="text-muted-foreground">No specific negotiation points identified or an issue occurred during assessment.</p>
              )}
              {Object.entries(clauseAnalyses).map(([clauseId, analysis]) => {
                const clause = processedClauses.find(pc => pc.clause.id === clauseId)?.clause;
                if (!clause || (!analysis.negotiation && !analysis.negotiationError)) return null;
                return (
                  <div key={clauseId} className="p-3 border rounded-md bg-muted/30">
                    <h4 className="font-semibold mb-1 text-sm">Regarding Clause {clause.originalIndex + 1}:</h4>
                    {analysis.negotiation && (
                      <>
                        <p className="text-sm mb-1">
                          <span className="font-medium">Consider: </span>
                          <span className="font-mono bg-accent/10 p-1 rounded text-accent-foreground dark:text-accent">{analysis.negotiation.suggestedEdits}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Reasoning: </span>{analysis.negotiation.explanation}
                        </p>
                      </>
                    )}
                    {analysis.negotiationError && <p className="text-xs text-destructive mt-1">Error suggesting negotiations: {analysis.negotiationError}</p>}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}

      {contractText && (
        <div className="mt-8"> 
          <AILegalAdvisor
            messages={advisorMessages}
            onSendMessage={handleAdvisorSendMessage}
            isLoading={false} 
            contractContextAvailable={!!contractText}
          />
        </div>
      )}
    </div>
  );
}

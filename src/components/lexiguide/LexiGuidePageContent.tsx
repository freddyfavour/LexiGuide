
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChatInputBar } from './ChatInputBar';
import type { Clause, ProcessedClause, AdvisorMessage, ClauseAnalysisData, RiskAssessmentOutput, NegotiationSuggestionsOutput, RiskLevel } from '@/types';
import { summarizeClause } from '@/ai/flows/clause-summarization';
import { assessRisk } from '@/ai/flows/risk-assessment';
import { negotiationSuggestions } from '@/ai/flows/negotiation-suggestions';
import { aiLegalAdvisor } from '@/ai/flows/ai-legal-advisor';
import { useToast } from '@/hooks/use-toast';
import { ResetIcon, InfoIcon, LoadingIcon, AdvisorIcon, UserIcon } from './icons';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProcessedContractView } from './ProcessedContractView';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { RiskLevelIndicator } from './icons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';


// This component is now deprecated as its functionality is merged into ChatInputBar and LexiGuidePageContent
// import { ContractInput } from './ContractInput'; 

export function LexiGuidePageContent() {
  const [contractText, setContractText] = useState<string>('');
  const [processedClauses, setProcessedClauses] = useState<ProcessedClause[]>([]);
  const [advisorMessages, setAdvisorMessages] = useState<AdvisorMessage[]>([]);
  const [chatInputValue, setChatInputValue] = useState('');
  
  const [isLoadingContractProcessing, setIsLoadingContractProcessing] = useState(false);
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(false);
  const [isAdvisorResponding, setIsAdvisorResponding] = useState(false);
  
  const [clauseAnalyses, setClauseAnalyses] = useState<Record<string, Partial<Omit<ClauseAnalysisData, 'summary' | 'summaryError'>>>>({});
  const [contractHasBeenProcessed, setContractHasBeenProcessed] = useState(false);

  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [processedClauses, advisorMessages, clauseAnalyses]);


  const processFullContractText = async (text: string) => {
    if (!text.trim()) {
      toast({
        title: "Empty Contract",
        description: "Please provide some contract text.",
        variant: "destructive",
      });
      return;
    }
    setIsLoadingContractProcessing(true);
    setIsLoadingSummaries(true);
    setContractText(text);
    setProcessedClauses([]);
    setAdvisorMessages([]); // Clear previous chat messages
    setClauseAnalyses({});
    setContractHasBeenProcessed(true);
    setChatInputValue(''); // Clear input after submission

    const rawClauses = text
      .split(/\n\s*\n+/)
      .map((t, i) => ({ id: `clause-${i}`, text: t.trim(), originalIndex: i }))
      .filter(c => c.text.length > 0);
    
    if (rawClauses.length === 0) {
      toast({
        title: "No Clauses Found",
        description: "No clauses identified. Ensure your contract text has paragraph breaks.",
        variant: "default",
      });
      setIsLoadingContractProcessing(false);
      setIsLoadingSummaries(false);
      // Don't reset contractHasBeenProcessed, allow user to ask general questions or try again
      return;
    }

    toast({
      title: "Processing Contract...",
      description: `Identifying ${rawClauses.length} clauses and generating summaries. This may take a moment.`,
    });

    let initialProcessedClauses: ProcessedClause[] = rawClauses.map(clause => ({
      clause,
      isLoadingSummary: true,
    }));
    setProcessedClauses(initialProcessedClauses);
    setIsLoadingContractProcessing(false);

    // Capture all summary promises
    const summaryPromises = initialProcessedClauses.map(async (pc, index) => {
      try {
        const summaryRes = await summarizeClause({ clauseText: pc.clause.text });
        // Update immediately for this specific clause
        setProcessedClauses(prevPcs => {
          const newPcs = [...prevPcs];
          newPcs[index] = { ...newPcs[index], summary: summaryRes.summary, isLoadingSummary: false };
          return newPcs;
        });
        return { ...pc, summary: summaryRes.summary, isLoadingSummary: false };
      } catch (e: any) {
        console.error(`Error summarizing clause ${pc.clause.id}:`, e);
        const errorMsg = e.message || "Failed to get summary.";
        setProcessedClauses(prevPcs => {
          const newPcs = [...prevPcs];
          newPcs[index] = { ...newPcs[index], summaryError: errorMsg, isLoadingSummary: false };
          return newPcs;
        });
        return { ...pc, summaryError: errorMsg, isLoadingSummary: false };
      }
    });

    // Wait for all summaries to complete
    const completedProcessedClauses = await Promise.all(summaryPromises);
    // setProcessedClauses(completedProcessedClauses); // Already updated incrementally

    setIsLoadingSummaries(false);
    toast({
      title: "Summaries Complete",
      description: `All ${rawClauses.length} clauses have been summarized. Starting detailed analysis.`,
    });

    if (rawClauses.length > 0) {
      // Pass the version of processedClauses that has all summaries/errors
      fetchAllAnalyses(rawClauses, text, completedProcessedClauses);
    }
  };

  const handleFileUpload = (file: File) => {
    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        processFullContractText(text);
        toast({
          title: "File Loaded & Processing",
          description: `${file.name} has been loaded and processing has started.`,
        });
      };
      reader.onerror = () => {
        toast({
          title: "File Read Error",
          description: `Could not read the file ${file.name}.`,
          variant: "destructive",
        });
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload a plain text (.txt) file.",
        variant: "destructive",
      });
    }
  };
  
  const fetchAllAnalyses = async (clausesToAnalyze: Clause[], fullContractText: string, currentProcessedClauses: ProcessedClause[]) => {
    setIsLoadingAnalyses(true);

    const analysisPromises = clausesToAnalyze.map(async (clause) => {
      let riskData: RiskAssessmentOutput | undefined;
      let riskError: string | undefined;
      let negotiationData: NegotiationSuggestionsOutput | undefined;
      let negotiationError: string | undefined;

      // Assess Risk
      try {
        riskData = await assessRisk({ clauseText: clause.text });
      } catch (e: any) {
        console.error(`Error assessing risk for clause ${clause.id}:`, e);
        riskError = e.message || "Failed to assess risk.";
      }

      // Prepare for Negotiation Suggestions
      const processedClauseForNegotiation = currentProcessedClauses.find(pc => pc.clause.id === clause.id);
      const clauseSummary = processedClauseForNegotiation?.summary;
      const summaryError = processedClauseForNegotiation?.summaryError;

      if (summaryError) {
        negotiationError = `Negotiation suggestions skipped: Clause summary could not be generated. Details: ${summaryError}`;
      } else if (!clauseSummary) {
        negotiationError = "Negotiation suggestions skipped: Clause summary is missing (it may still be loading or failed silently).";
      } else if (riskError) {
        negotiationError = `Negotiation suggestions skipped: Risk assessment failed for this clause. Details: ${riskError}`;
      } else if (!riskData) {
        negotiationError = "Negotiation suggestions skipped: Risk assessment returned no specific data for this clause, or is still pending.";
      } else {
        try {
          negotiationData = await negotiationSuggestions({
            contractText: fullContractText, // Using fullContractText for context as per schema
            clauseSummary: clauseSummary, // This is the individual clause summary
            riskAssessment: `${riskData.riskLevel}: ${riskData.riskSummary}`,
          });
        } catch (e: any) {
          console.error(`Error suggesting negotiation for clause ${clause.id}:`, e);
          negotiationError = e.message || "Failed to get negotiation suggestions.";
        }
      }
      
      return {
        clauseId: clause.id,
        analysis: {
          risk: riskData,
          riskError,
          negotiation: negotiationData,
          negotiationError,
        }
      };
    });

    try {
      const allAnalysesResults = await Promise.all(analysisPromises);
      const newAnalysesBatch: Record<string, Partial<Omit<ClauseAnalysisData, 'summary' | 'summaryError'>>> = {};
      allAnalysesResults.forEach(result => {
        newAnalysesBatch[result.clauseId] = result.analysis;
      });
      setClauseAnalyses(prev => ({ ...prev, ...newAnalysesBatch }));

    } catch (error) {
      // This catch block might not be strictly necessary if individual errors are handled within each promise,
      // but it's good practice for Promise.all if any unhandled rejection could occur.
      // Promise.allSettled would be an alternative if we want to guarantee all complete.
      console.error("An error occurred during one or more analysis tasks:", error);
      toast({
        title: "Analysis Partially Failed",
        description: "Some analyses could not be completed. Check console for details.",
        variant: "destructive",
      });
    }
    
    setIsLoadingAnalyses(false);
    toast({
      title: "Analysis Complete",
      description: `Risk and negotiation analysis finished for all clauses. You can now ask follow-up questions.`,
    });
  };

  const handleReset = () => {
    setContractText('');
    setProcessedClauses([]);
    setAdvisorMessages([]);
    setChatInputValue('');
    setIsLoadingContractProcessing(false);
    setIsLoadingSummaries(false);
    setIsLoadingAnalyses(false);
    setIsAdvisorResponding(false);
    setClauseAnalyses({});
    setContractHasBeenProcessed(false);
    toast({ title: "Application Reset", description: "All contract data has been cleared."});
  };

  const handleAdvisorSendMessage = async () => {
    if (!chatInputValue.trim()) return;
    const question = chatInputValue;

    if (!contractText && !contractHasBeenProcessed) { 
      processFullContractText(question); 
      return;
    }
    
    if (!contractText) { 
        toast({ title: "Cannot Send Message", description: "No contract context available. Please process a contract first.", variant: "destructive" });
        return;
    }


    const newUserMessage: AdvisorMessage = { id: `user-${Date.now()}`, type: 'user', content: question };
    setAdvisorMessages(prev => [...prev, newUserMessage]);
    setIsAdvisorResponding(true);
    setChatInputValue('');

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
    setIsAdvisorResponding(false);
  };

  const hasCompletedFullProcessing = !isLoadingSummaries && !isLoadingAnalyses && contractHasBeenProcessed && processedClauses.length > 0;
  const hasAnyAnalysis = Object.keys(clauseAnalyses).length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0 mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-primary">Contract Analysis Dashboard</h2>
        <Button variant="outline" onClick={handleReset} disabled={isLoadingContractProcessing || isLoadingSummaries || isLoadingAnalyses || isAdvisorResponding}>
          <ResetIcon className="mr-2 h-4 w-4" /> Reset All
        </Button>
      </div>
    
      <ScrollArea className="flex-grow mb-4"> 
        <div className="space-y-4 sm:space-y-6">
          {!contractHasBeenProcessed && !isLoadingContractProcessing && (
            <Alert className="border-primary/30 bg-primary/5">
              <InfoIcon className="h-5 w-5 text-primary" />
              <AlertTitle className="text-primary font-semibold">Welcome to LexiGuide!</AlertTitle>
              <AlertDescription>
                To get started, paste your contract text into the chat bar below and press send, or upload a .txt file using the paperclip icon. 
                LexiGuide will then break it down and explain each clause.
              </AlertDescription>
            </Alert>
          )}

          {(isLoadingContractProcessing || isLoadingSummaries) && !hasCompletedFullProcessing && (
            <div className="flex items-center justify-center p-8 rounded-lg border bg-card shadow-md">
              <LoadingIcon className="w-8 h-8 text-primary mr-3" />
              <p className="text-lg text-muted-foreground">Processing contract and generating summaries...</p>
            </div>
          )}

          {processedClauses.length > 0 && (
            <ProcessedContractView 
              processedClauses={processedClauses} 
              clauseAnalyses={clauseAnalyses}
              isLoadingAnalyses={isLoadingAnalyses}
            />
          )}
          
          {hasCompletedFullProcessing && (
            <>
              <Card className="shadow-xl mt-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Key Risk Highlights (Overall)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoadingAnalyses && !hasAnyAnalysis && ( 
                    <div className="flex items-center text-muted-foreground">
                      <LoadingIcon className="w-5 h-5 mr-2" /> Loading overall risk assessments...
                    </div>
                  )}
                  {!isLoadingAnalyses && !hasAnyAnalysis && contractText && !processedClauses.some(pc => pc.isLoadingSummary) && (
                    <p className="text-muted-foreground">Overall risk analysis will appear here once all individual clause analyses are complete.</p>
                  )}
                  {Object.entries(clauseAnalyses).map(([clauseId, analysis]) => {
                    const clauseData = processedClauses.find(pc => pc.clause.id === clauseId)?.clause;
                    if (!clauseData) return null; // Clause data might not be in processedClauses yet if summaries are still loading

                    return (
                      <div key={`${clauseId}-overall-risk`} className="p-3 border rounded-md bg-muted/30">
                        <h4 className="font-semibold mb-1 text-sm">Clause {clauseData.originalIndex + 1}</h4>
                        {analysis.risk ? (
                          <>
                            <Badge
                              variant="outline"
                              className={`text-xs px-2 py-0.5 mb-1.5 flex items-center gap-1.5 whitespace-normal text-left max-w-max
                                ${analysis.risk.riskLevel === 'low' ? 'bg-[hsl(var(--risk-low-background))] text-[hsl(var(--risk-low-foreground))] border-[hsl(var(--risk-low-foreground))]' : ''}
                                ${analysis.risk.riskLevel === 'medium' ? 'bg-[hsl(var(--risk-medium-background))] text-[hsl(var(--risk-medium-foreground))] border-[hsl(var(--risk-medium-foreground))]' : ''}
                                ${analysis.risk.riskLevel === 'high' ? 'bg-[hsl(var(--risk-high-background))] text-[hsl(var(--risk-high-foreground))] border-transparent' : ''}
                              `}
                            >
                              <RiskLevelIndicator level={analysis.risk.riskLevel as RiskLevel} />
                              <span>{analysis.risk.riskLevel.toUpperCase()} Risk: {analysis.risk.riskSummary || "No specific summary provided."}</span>
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Suggested Action: </span>
                              {analysis.risk.suggestedActions || "None specific."}
                            </p>
                          </>
                        ) : analysis.riskError ? (
                          <p className="text-xs text-destructive mt-1">Error assessing risk: {analysis.riskError}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">No specific risk information identified, assessment is pending, or an error occurred preventing display.</p>
                        )}
                      </div>
                    );
                  })}
                   {!isLoadingAnalyses && hasAnyAnalysis && Object.values(clauseAnalyses).every(a => !a.risk && !a.riskError) && (
                     <p className="text-muted-foreground">No clauses had notable risks or risk assessment errors, or assessments are still pending for all.</p>
                   )}
                   {!isLoadingAnalyses && !hasAnyAnalysis && contractText && (
                    <p className="text-muted-foreground">No risk data to display. Analysis might still be running or encountered issues.</p>
                   )}
                </CardContent>
              </Card>

              <Card className="shadow-xl mt-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Key Negotiation Points (Overall)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                   {isLoadingAnalyses && !hasAnyAnalysis && ( 
                    <div className="flex items-center text-muted-foreground">
                      <LoadingIcon className="w-5 h-5 mr-2" /> Loading overall negotiation suggestions...
                    </div>
                  )}
                  {!isLoadingAnalyses && !hasAnyAnalysis && contractText && !processedClauses.some(pc => pc.isLoadingSummary) && (
                    <p className="text-muted-foreground">Overall negotiation points will appear here once all individual clause analyses are complete.</p>
                  )}
                  {Object.entries(clauseAnalyses).map(([clauseId, analysis]) => {
                    const clauseData = processedClauses.find(pc => pc.clause.id === clauseId)?.clause;
                    if (!clauseData) return null;
                    
                    return (
                      <div key={`${clauseId}-overall-negotiation`} className="p-3 border rounded-md bg-muted/30">
                        <h4 className="font-semibold mb-1 text-sm">Regarding Clause {clauseData.originalIndex + 1}:</h4>
                        {analysis.negotiation ? (
                          <>
                            <p className="text-sm mb-1">
                              <span className="font-medium">Consider: </span>
                              <span className="font-mono bg-accent/10 p-1 rounded text-accent-foreground dark:text-accent">
                                {analysis.negotiation.suggestedEdits || "No specific edits suggested."}
                              </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Reasoning: </span>
                              {analysis.negotiation.explanation || "No specific explanation provided."}
                            </p>
                          </>
                        ) : analysis.negotiationError ? (
                          <p className="text-xs text-destructive mt-1">Error suggesting negotiations: {analysis.negotiationError}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">No specific negotiation points identified, analysis is pending, or an error occurred preventing display.</p>
                        )}
                      </div>
                    );
                  })}
                  {!isLoadingAnalyses && hasAnyAnalysis && Object.values(clauseAnalyses).every(a => !a.negotiation && !a.negotiationError) && (
                    <p className="text-muted-foreground">No clauses had notable negotiation points or related errors, or analyses are still pending for all.</p>
                  )}
                  {!isLoadingAnalyses && !hasAnyAnalysis && contractText && (
                    <p className="text-muted-foreground">No negotiation data to display. Analysis might still be running or encountered issues.</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
          
          {advisorMessages.length > 0 && (
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2"><AdvisorIcon /> AI Legal Advisor Chat</h3>
              {advisorMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex items-end gap-2 group w-full',
                    msg.type === 'user' ? 'justify-end pl-10 sm:pl-16' : 'justify-start pr-10 sm:pr-16'
                  )}
                >
                  {msg.type !== 'user' && (
                    <Avatar className="h-8 w-8 self-start shadow-sm">
                      <AvatarFallback className="bg-primary text-primary-foreground"><AdvisorIcon className="w-4 h-4"/></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[75%] rounded-lg px-3 py-2 text-sm shadow',
                       msg.type === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted text-foreground rounded-bl-none',
                       msg.type === 'error' && 'bg-destructive text-destructive-foreground'
                    )}
                  >
                    {msg.content.split('\n').map((line, i) => <p key={i} className="whitespace-pre-wrap">{line}</p>)}
                  </div>
                  {msg.type === 'user' && (
                    <Avatar className="h-8 w-8 self-start shadow-sm">
                      <AvatarFallback><UserIcon className="w-4 h-4"/></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isAdvisorResponding && (
                <div className="flex items-end gap-2 justify-start pr-10 sm:pr-16">
                  <Avatar className="h-8 w-8 self-start shadow-sm">
                      <AvatarFallback className="bg-primary text-primary-foreground"><AdvisorIcon className="w-4 h-4"/></AvatarFallback>
                  </Avatar>
                  <div className="bg-muted text-foreground rounded-lg px-3 py-2 text-sm shadow rounded-bl-none">
                    <LoadingIcon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} /> 
        </div>
      </ScrollArea>

      <ChatInputBar
        inputValue={chatInputValue}
        onInputChange={setChatInputValue}
        onSend={handleAdvisorSendMessage}
        onFileUpload={handleFileUpload}
        placeholder={
          contractHasBeenProcessed || contractText 
            ? "Ask a question about your contract..."
            : "Paste contract here or upload a .txt file to start..."
        }
        isSending={isLoadingContractProcessing || isLoadingSummaries || isAdvisorResponding || isLoadingAnalyses}
        contractLoaded={contractHasBeenProcessed || !!contractText}
      />
    </div>
  );
}

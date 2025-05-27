"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ContractInput } from './ContractInput';
import { ClauseList } from './ClauseList';
import { ClauseDetails } from './ClauseDetails';
import { AILegalAdvisor } from './AILegalAdvisor';
import type { Clause, ClauseAnalysisData, AdvisorMessage } from '@/types';
import { summarizeClause } from '@/ai/flows/clause-summarization';
import { assessRisk } from '@/ai/flows/risk-assessment';
import { negotiationSuggestions } from '@/ai/flows/negotiation-suggestions';
import { aiLegalAdvisor } from '@/ai/flows/ai-legal-advisor';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { SummaryIcon, RiskAssessmentIcon, NegotiationIcon, AdvisorIcon, ResetIcon, InfoIcon } from './icons';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function LexiGuidePageContent() {
  const [contractText, setContractText] = useState<string>('');
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [selectedClauseId, setSelectedClauseId] = useState<string | null>(null);
  const [analysisCache, setAnalysisCache] = useState<Record<string, ClauseAnalysisData>>({});
  const [advisorMessages, setAdvisorMessages] = useState<AdvisorMessage[]>([]);
  
  const [isLoadingContractProcessing, setIsLoadingContractProcessing] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingAdvisor, setIsLoadingAdvisor] = useState(false);

  const { toast } = useToast();

  const handleProcessContract = (text: string) => {
    setIsLoadingContractProcessing(true);
    setContractText(text);
    // Simple paragraph splitting for clauses. Two or more newlines.
    const newClauses = text
      .split(/\n\s*\n+/)
      .map((t, i) => ({ id: `clause-${i}`, text: t.trim(), originalIndex: i }))
      .filter(c => c.text.length > 0); // Ensure non-empty clauses
    
    setClauses(newClauses);
    setSelectedClauseId(null);
    setAnalysisCache({});
    setAdvisorMessages([]); // Reset advisor messages
    setIsLoadingContractProcessing(false);

    if (newClauses.length > 0) {
      toast({
        title: "Contract Processed",
        description: `${newClauses.length} clauses identified. Select a clause to analyze.`,
      });
    } else {
      toast({
        title: "Contract Processed",
        description: "No clauses identified. Ensure your contract text has paragraph breaks.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setContractText('');
    setClauses([]);
    setSelectedClauseId(null);
    setAnalysisCache({});
    setAdvisorMessages([]);
    toast({ title: "Application Reset", description: "All contract data has been cleared."});
  };

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!selectedClauseId) return;
      const clause = clauses.find(c => c.id === selectedClauseId);
      if (!clause || analysisCache[selectedClauseId]) return;

      setIsLoadingAnalysis(true);
      let currentAnalysisData: ClauseAnalysisData = {};

      try {
        const summaryRes = await summarizeClause({ clauseText: clause.text });
        currentAnalysisData.summary = summaryRes.summary;
      } catch (e: any) {
        console.error("Error summarizing clause:", e);
        currentAnalysisData.summaryError = e.message || "Failed to get summary.";
        toast({ title: "Summarization Error", description: currentAnalysisData.summaryError, variant: "destructive" });
      }
      setAnalysisCache(prev => ({ ...prev, [selectedClauseId]: { ...prev[selectedClauseId], ...currentAnalysisData } }));

      try {
        const riskRes = await assessRisk({ clauseText: clause.text });
        currentAnalysisData.risk = riskRes;
      } catch (e: any) {
        console.error("Error assessing risk:", e);
        currentAnalysisData.riskError = e.message || "Failed to assess risk.";
        toast({ title: "Risk Assessment Error", description: currentAnalysisData.riskError, variant: "destructive" });
      }
      setAnalysisCache(prev => ({ ...prev, [selectedClauseId]: { ...prev[selectedClauseId], ...currentAnalysisData } }));
      
      if (currentAnalysisData.summary && currentAnalysisData.risk) {
        try {
          const negotiationRes = await negotiationSuggestions({
            contractText: contractText, // Full contract for context
            clauseSummary: currentAnalysisData.summary,
            riskAssessment: `${currentAnalysisData.risk.riskLevel}: ${currentAnalysisData.risk.riskSummary}`,
          });
          currentAnalysisData.negotiation = negotiationRes;
        } catch (e: any)  {
          console.error("Error getting negotiation suggestions:", e);
          currentAnalysisData.negotiationError = e.message || "Failed to get negotiation suggestions.";
          toast({ title: "Negotiation Suggestion Error", description: currentAnalysisData.negotiationError, variant: "destructive" });
        }
        setAnalysisCache(prev => ({ ...prev, [selectedClauseId]: { ...prev[selectedClauseId], ...currentAnalysisData } }));
      }
      
      setIsLoadingAnalysis(false);
    };

    fetchAnalysis();
  }, [selectedClauseId, clauses, contractText, toast]); // analysisCache removed to allow re-fetch if needed or errors occurred

  const handleAdvisorSendMessage = async (question: string) => {
    if (!contractText) {
      toast({ title: "Cannot Send Message", description: "Please process a contract first.", variant: "destructive" });
      return;
    }

    const newUserMessage: AdvisorMessage = { id: `user-${Date.now()}`, type: 'user', content: question };
    setAdvisorMessages(prev => [...prev, newUserMessage]);
    setIsLoadingAdvisor(true);

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
    setIsLoadingAdvisor(false);
  };

  const selectedClauseData = useMemo(() => clauses.find(c => c.id === selectedClauseId), [clauses, selectedClauseId]);
  const currentClauseAnalysis = useMemo(() => selectedClauseId ? analysisCache[selectedClauseId] : null, [selectedClauseId, analysisCache]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-primary">Contract Analysis Dashboard</h2>
        <Button variant="outline" onClick={handleReset} disabled={isLoadingContractProcessing || isLoadingAnalysis || isLoadingAdvisor}>
          <ResetIcon className="mr-2 h-4 w-4" /> Reset All
        </Button>
      </div>

      {!contractText && (
         <Alert className="border-primary/30 bg-primary/5">
          <InfoIcon className="h-5 w-5 text-primary" />
          <AlertTitle className="text-primary font-semibold">Welcome to LexiGuide!</AlertTitle>
          <AlertDescription>
            To get started, paste your contract text into the input area below and click "Process Contract". 
            LexiGuide will then break it down into clauses for analysis.
          </AlertDescription>
        </Alert>
      )}

      <ContractInput onProcessContract={handleProcessContract} isLoading={isLoadingContractProcessing} />

      {clauses.length > 0 && (
        <ResizablePanelGroup direction="horizontal" className="rounded-lg border shadow-xl min-h-[600px] bg-card">
          <ResizablePanel defaultSize={30} minSize={20}>
            <ClauseList
              clauses={clauses}
              selectedClauseId={selectedClauseId}
              onClauseSelect={setSelectedClauseId}
              isLoading={isLoadingAnalysis || isLoadingContractProcessing}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70} minSize={30}>
            <Tabs defaultValue="details" className="h-full flex flex-col">
              <TabsList className="m-2">
                <TabsTrigger value="details" className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm" disabled={!selectedClauseId}>
                  <RiskAssessmentIcon className="w-4 h-4" /> Clause Analysis
                </TabsTrigger>
                <TabsTrigger value="advisor" className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm">
                  <AdvisorIcon className="w-4 h-4" /> AI Legal Advisor
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="flex-grow overflow-auto p-0 m-0 mt-0">
                <ClauseDetails
                  clause={selectedClauseData || null}
                  analysis={currentClauseAnalysis}
                  isLoadingAnalysis={isLoadingAnalysis && selectedClauseId !== null && (!analysisCache[selectedClauseId!] || Object.keys(analysisCache[selectedClauseId!]).length < 3)}
                />
              </TabsContent>
              <TabsContent value="advisor" className="flex-grow overflow-auto p-0 m-0 mt-0">
                <AILegalAdvisor
                  messages={advisorMessages}
                  onSendMessage={handleAdvisorSendMessage}
                  isLoading={isLoadingAdvisor}
                  contractContextAvailable={!!contractText}
                />
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
}

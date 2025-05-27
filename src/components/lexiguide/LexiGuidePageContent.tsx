
"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { ComprehensiveContractAnalysisOutput, ComprehensiveContractAnalysisInput, AnalyzedClause } from '@/types';
import { comprehensiveContractAnalysis } from '@/ai/flows/comprehensive-contract-analysis';
import { useToast } from '@/hooks/use-toast';
import { ResetIcon, InfoIcon, LoadingIcon } from './icons';
import { Button } from '../ui/button';
import { ContractInputForm } from './ContractInputForm';
import { ClauseWithSummaryAccordion } from './ClauseWithSummaryAccordion';
import { OverallAnalysisDisplay } from './OverallAnalysisDisplay';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { BookMarked } from 'lucide-react'; // Import BookMarked

export function LexiGuidePageContent() {
  const [analysisResult, setAnalysisResult] = useState<ComprehensiveContractAnalysisOutput | null>(null);
  const [showInputForm, setShowInputForm] = useState(true);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const { toast } = useToast();
  const resultsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showInputForm && (analysisResult || analysisError) && !isLoadingAnalysis) {
      resultsEndRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [analysisResult, analysisError, isLoadingAnalysis, showInputForm]);

  const handleProcessContract = async (contractText: string) => {
    if (!contractText.trim()) {
      toast({
        title: "Empty Contract",
        description: "Please provide some contract text.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingAnalysis(true);
    setShowInputForm(false);
    setAnalysisResult(null);
    setAnalysisError(null);

    toast({
      title: "Processing Contract...",
      description: `Analyzing your contract. This may take a moment.`,
    });

    try {
      const input: ComprehensiveContractAnalysisInput = { contractText };
      const result = await comprehensiveContractAnalysis(input);
      
      if (!result || !result.analyzedClauses || !result.overallRiskAssessment || !result.overallRecommendations) {
        console.error("Incomplete analysis result from AI:", result);
        throw new Error("The AI returned an incomplete analysis. Please try again or check the contract text.");
      }
      setAnalysisResult(result);
      if (result) {
        toast({
          title: "Analysis Complete",
          description: "Contract analysis is ready.",
        });
      }
    } catch (e: any) {
      console.error("Error fetching comprehensive contract analysis:", e);
      const errorMsg = e.message || "Failed to generate contract analysis.";
      setAnalysisError(errorMsg);
      toast({
        title: "Analysis Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
    setIsLoadingAnalysis(false);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setAnalysisError(null);
    setShowInputForm(true);
    setIsLoadingAnalysis(false);
    toast({ title: "Application Reset", description: "Ready for a new contract." });
  };

  return (
    <div className="flex flex-col h-full">
      {showInputForm ? (
        <ContractInputForm
          onProcessContract={handleProcessContract}
          isLoading={isLoadingAnalysis}
        />
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 sm:mb-6 px-1 pt-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-primary">Contract Analysis Report</h2>
            <Button variant="outline" onClick={handleReset} disabled={isLoadingAnalysis}>
              <ResetIcon className="mr-2 h-4 w-4" /> Reset & Analyze New Contract
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-4 sm:space-y-6 px-1 pb-6">
              {isLoadingAnalysis && (
                <Card className="shadow-lg">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-center p-6 text-muted-foreground">
                      <LoadingIcon className="w-8 h-8 mr-3 text-primary"/>
                      <p className="text-lg">Analyzing your contract, please wait...</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {analysisError && !isLoadingAnalysis && (
                <Card className="shadow-lg">
                  <CardContent className="p-4 md:p-6 text-destructive">
                     <div className="flex flex-col items-center justify-center p-6 text-center">
                        <InfoIcon className="w-8 h-8 mb-2"/>
                        <p className="text-lg font-semibold">Analysis Failed</p>
                        <p className="text-sm">{analysisError}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {analysisResult && !isLoadingAnalysis && (
                <>
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                        <BookMarked className="w-5 h-5 text-primary" /> {/* Changed Icon */}
                        Contract Clauses & Summaries
                      </CardTitle>
                      <CardDescription>
                        Each clause from your contract is listed below with its plain-English summary and risk assessment.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0"> {/* Adjusted padding */}
                      <div className="divide-y divide-border"> {/* Added wrapper for divide */}
                        {analysisResult.analyzedClauses && analysisResult.analyzedClauses.length > 0 ? (
                          analysisResult.analyzedClauses
                            .filter((item): item is AnalyzedClause => !!item) // Filter out null/undefined items
                            .map((item, index) => (
                            <ClauseWithSummaryAccordion
                              key={`clause-${index}-${item.originalClauseText.slice(0,10)}`} // More robust key
                              clauseData={item}
                              clauseOriginalIndex={index}
                            />
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center p-6 text-muted-foreground text-center">
                            <InfoIcon className="w-6 h-6 mb-2"/>
                            <p className="font-semibold">No Clauses Identified</p>
                            <p className="text-sm">The AI could not identify distinct clauses in the provided text, or no summary was generated.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <OverallAnalysisDisplay
                    analysis={analysisResult}
                    isLoading={false}
                    error={null}
                  />
                </>
              )}
              <div ref={resultsEndRef} />
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

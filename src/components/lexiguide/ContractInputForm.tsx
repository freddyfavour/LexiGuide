
"use client";

import React, { useState, ChangeEvent, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UploadIcon, PasteIcon, LoadingIcon, ContractIcon, PaperclipIcon } from './icons';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';

interface ContractInputFormProps {
  onProcessContract: (text: string) => void;
  isLoading: boolean;
}

export function ContractInputForm({ onProcessContract, isLoading }: ContractInputFormProps) {
  const [contractText, setContractText] = useState('');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcess = () => {
    if (contractText.trim()) {
      onProcessContract(contractText);
    } else {
      toast({
        title: "Empty Contract Text",
        description: "Please paste your contract text or upload a file.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setContractText(text); // Set text for potential direct processing if needed, or just display
          onProcessContract(text); // Immediately process after file read
          toast({
            title: "File Loaded & Processing",
            description: `${file.name} has been loaded. Processing started.`,
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
      if (event.target) {
        event.target.value = ''; // Reset file input
      }
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="shadow-xl max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
          <ContractIcon className="w-6 h-6 sm:w-7 sm:w-7" />
          Analyze Your Contract
        </CardTitle>
        <CardDescription>
          Paste your contract text below or upload a .txt file to get an AI-powered analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contract-text-input" className="flex items-center gap-1.5 text-sm font-medium">
            <PasteIcon className="w-4 h-4" /> Paste Contract Text
          </Label>
          <Textarea
            id="contract-text-input"
            value={contractText}
            onChange={(e) => setContractText(e.target.value)}
            placeholder="Paste the full text of your contract here..."
            rows={10}
            className="min-h-[200px] sm:min-h-[250px] text-sm leading-relaxed font-mono rounded-md shadow-inner bg-background focus-visible:ring-primary"
            disabled={isLoading}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button onClick={handleProcess} disabled={isLoading || !contractText.trim()} className="w-full sm:w-auto transition-all duration-150 ease-in-out">
            {isLoading ? <LoadingIcon className="mr-2 h-4 w-4" /> : null}
            Process Pasted Text
          </Button>
          <div className="text-sm text-muted-foreground text-center sm:text-left">or</div>
           <Button variant="outline" onClick={handleUploadClick} disabled={isLoading} className="w-full sm:w-auto">
            <PaperclipIcon className="mr-2 h-4 w-4" /> Upload .txt File
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt"
            className="hidden"
            disabled={isLoading}
          />
        </div>
         <p className="text-xs text-muted-foreground text-center pt-2">
            LexiGuide will break down your contract into clauses, provide plain-English summaries for each, and offer an overall risk assessment and advice.
        </p>
      </CardContent>
    </Card>
  );
}

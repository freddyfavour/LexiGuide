
"use client";

import React, { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UploadIcon, PasteIcon, LoadingIcon, ContractIcon } from './icons';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';

interface ContractInputProps {
  onProcessContract: (text: string) => void;
  isLoading: boolean;
}

export function ContractInput({ onProcessContract, isLoading }: ContractInputProps) {
  const [contractText, setContractText] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (contractText.trim()) {
      onProcessContract(contractText);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setContractText(text); 
          onProcessContract(text); 
          toast({
            title: "File Loaded",
            description: `${file.name} has been loaded and processed.`,
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
          description: "Please upload a plain text (.txt) file. PDF/DOCX support is coming soon.",
          variant: "destructive",
        });
      }
      event.target.value = ''; 
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ContractIcon />
          Load Your Contract
        </CardTitle>
        <CardDescription>
          Paste your contract text below or upload a .txt file.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contract-text" className="flex items-center gap-1">
            <PasteIcon className="w-4 h-4" /> Paste Contract Text
          </Label>
          <Textarea
            id="contract-text"
            value={contractText}
            onChange={(e) => setContractText(e.target.value)}
            placeholder="Paste the full text of your contract here..."
            rows={8} // Adjusted default rows
            className="min-h-[150px] sm:min-h-[180px] md:min-h-[200px] text-sm leading-relaxed font-mono rounded-md shadow-inner bg-background"
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contract-file" className="flex items-center gap-1">
            <UploadIcon className="w-4 h-4" /> Upload Contract File (.txt)
          </Label>
          <Input 
            id="contract-file" 
            type="file" 
            accept=".txt"
            onChange={handleFileChange}
            disabled={isLoading} 
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground">Supported format: .txt. PDF/DOCX support is coming soon.</p>
        </div>

        <Button onClick={handleSubmit} disabled={isLoading || !contractText.trim()} className="w-full transition-all duration-150 ease-in-out">
          {isLoading ? <LoadingIcon className="mr-2 h-4 w-4" /> : null}
          Process Pasted Text
        </Button>
      </CardContent>
    </Card>
  );
}

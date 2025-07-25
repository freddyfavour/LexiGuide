
"use client";

// This component is now DEPRECATED.
// Its functionality for text input and file upload has been
// integrated into the new ChatInputBar.tsx component and
// managed by LexiGuidePageContent.tsx for a conversational UI.

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

  const handleSubmitPastedText = () => {
    if (contractText.trim()) {
      onProcessContract(contractText);
    } else {
      toast({
        title: "Empty Text",
        description: "Please paste some contract text to process.",
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
          setContractText(text); 
          onProcessContract(text); 
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
          description: "Please upload a plain text (.txt) file. PDF/DOCX support is coming soon.",
          variant: "destructive",
        });
      }
      event.target.value = ''; 
    }
  };

  return (
    <Card className="shadow-lg opacity-50 pointer-events-none"> {/* Visually indicate deprecation */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ContractIcon />
          Load Your Contract (Deprecated Component)
        </CardTitle>
        <CardDescription>
          This input method is no longer active. Please use the chat bar at the bottom.
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
            placeholder="Pasting text here is disabled..."
            rows={8}
            className="min-h-[150px] sm:min-h-[180px] md:min-h-[200px] text-sm leading-relaxed font-mono rounded-md shadow-inner bg-background"
            disabled={true} 
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
            disabled={true} 
            className="text-sm file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
          <p className="text-xs text-muted-foreground">File upload here is disabled.</p>
        </div>

        <Button onClick={handleSubmitPastedText} disabled={true} className="w-full transition-all duration-150 ease-in-out">
          {isLoading ? <LoadingIcon className="mr-2 h-4 w-4" /> : null}
          Process Pasted Text (Disabled)
        </Button>
      </CardContent>
    </Card>
  );
}

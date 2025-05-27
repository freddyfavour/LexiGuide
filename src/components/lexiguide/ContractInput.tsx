"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UploadIcon, PasteIcon, LoadingIcon } from './icons';
import { Input } from '../ui/input';

interface ContractInputProps {
  onProcessContract: (text: string) => void;
  isLoading: boolean;
}

export function ContractInput({ onProcessContract, isLoading }: ContractInputProps) {
  const [contractText, setContractText] = useState('');

  const handleSubmit = () => {
    if (contractText.trim()) {
      onProcessContract(contractText);
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
          Paste your contract text below or use the (coming soon) file upload option.
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
            rows={10}
            className="min-h-[200px] text-sm leading-relaxed font-mono bg-white dark:bg-slate-900 rounded-md shadow-inner"
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2 opacity-50 cursor-not-allowed">
          <Label htmlFor="contract-file" className="flex items-center gap-1">
            <UploadIcon className="w-4 h-4" /> Upload Contract File (Coming Soon)
          </Label>
          <Input id="contract-file" type="file" disabled className="cursor-not-allowed" />
          <p className="text-xs text-muted-foreground">Supported formats: PDF, DOCX (feature in development)</p>
        </div>

        <Button onClick={handleSubmit} disabled={isLoading || !contractText.trim()} className="w-full transition-all duration-150 ease-in-out">
          {isLoading ? <LoadingIcon className="mr-2 h-4 w-4" /> : null}
          Process Contract
        </Button>
      </CardContent>
    </Card>
  );
}

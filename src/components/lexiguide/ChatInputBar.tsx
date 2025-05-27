
"use client";

// This component is now DEPRECATED.
// Its functionality has been replaced by ContractInputForm.tsx
// for the initial contract submission.
// The continuous chat functionality has been removed as per new requirements.

import React, { useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaperclipIcon, SendIcon, LoadingIcon } from './icons';

interface ChatInputBarProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onFileUpload: (file: File) => void;
  placeholder: string;
  isSending: boolean;
  contractLoaded: boolean; 
}

export function ChatInputBar({
  inputValue,
  onInputChange,
  onSend,
  onFileUpload,
  placeholder,
  isSending,
  contractLoaded,
}: ChatInputBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
      event.target.value = ''; 
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSending && inputValue.trim()) {
      onSend();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg p-3 sm:p-4 z-50 opacity-50 pointer-events-none"> {/* Visually indicate deprecation */}
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUploadClick}
            disabled={true}
            aria-label="Upload contract file"
            className="text-primary hover:bg-primary/10"
          >
            <PaperclipIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt" 
            className="hidden"
            disabled={true}
          />
          <Input
            type="text"
            placeholder={"Chat input disabled..."}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={true}
            className="flex-grow h-10 sm:h-12 text-sm sm:text-base rounded-full px-4 focus-visible:ring-primary"
            aria-label={placeholder}
          />
          <Button
            variant="default"
            size="icon"
            onClick={onSend}
            disabled={true}
            aria-label="Send button disabled"
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground w-10 h-10 sm:w-12 sm:h-12"
          >
            {isSending ? <LoadingIcon className="h-5 w-5" /> : <SendIcon className="h-5 w-5" />}
          </Button>
        </div>
         <p className="text-center text-xs text-muted-foreground pt-2">This chat input is no longer active. Use the main contract input form if available.</p>
      </div>
    </div>
  );
}


"use client";

import React, { useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaperclipIcon, SendIcon, LoadingIcon } from './icons';
import { Label } from '@/components/ui/label';

interface ChatInputBarProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onFileUpload: (file: File) => void;
  placeholder: string;
  isSending: boolean;
  contractLoaded: boolean; // To conditionally show/hide upload icon, or change its behavior
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
      event.target.value = ''; // Reset file input
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
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg p-3 sm:p-4 z-50">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center space-x-2 sm:space-x-3">
          {!contractLoaded && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUploadClick}
                disabled={isSending}
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
                disabled={isSending}
              />
            </>
          )}
          <Input
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            className="flex-grow h-10 sm:h-12 text-sm sm:text-base rounded-full px-4 focus-visible:ring-primary"
            aria-label={placeholder}
          />
          <Button
            variant="default"
            size="icon"
            onClick={onSend}
            disabled={isSending || !inputValue.trim()}
            aria-label={contractLoaded ? "Send message" : "Send contract text"}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground w-10 h-10 sm:w-12 sm:h-12"
          >
            {isSending ? <LoadingIcon className="h-5 w-5" /> : <SendIcon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

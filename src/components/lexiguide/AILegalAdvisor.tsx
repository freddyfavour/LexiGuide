
"use client";

import React, { useState, useRef, useEffect } from 'react';
import type { AdvisorMessage } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { AdvisorIcon, LoadingIcon } from './icons';

export function AILegalAdvisor({
  messages,
  onSendMessage,
  isLoading,
  contractContextAvailable,
}: {
  messages: AdvisorMessage[];
  onSendMessage: (question: string) => void;
  isLoading: boolean;
  contractContextAvailable: boolean;
}) {
  const [question, setQuestion] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (question.trim() && contractContextAvailable) {
      onSendMessage(question);
      setQuestion('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  };

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <AdvisorIcon className="w-6 h-6 text-primary" />
          AI Legal Advisor
        </CardTitle>
        <CardDescription>
          Ask questions about the loaded contract. The AI will use the contract text as context.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef} viewportRef={viewportRef}>
          <div className="space-y-4">
            {!contractContextAvailable && messages.length === 0 && (
               <div className="text-center text-muted-foreground p-4">
                Process a contract first to enable the AI Legal Advisor.
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex items-end gap-2 group',
                  msg.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.type !== 'user' && (
                  <Avatar className="h-8 w-8 self-start">
                    <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-sm',
                    msg.type === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted text-foreground rounded-bl-none',
                    msg.type === 'error' && 'bg-destructive text-destructive-foreground'
                  )}
                >
                  {msg.content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                </div>
                 {msg.type === 'user' && (
                  <Avatar className="h-8 w-8 self-start">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && messages.length > 0 && messages[messages.length -1].type === 'user' && (
              <div className="flex items-end gap-2 justify-start">
                 <Avatar className="h-8 w-8 self-start">
                    <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                  </Avatar>
                <div className="bg-muted text-foreground rounded-lg px-3 py-2 text-sm shadow-sm rounded-bl-none">
                  <LoadingIcon className="w-5 h-5 text-primary" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder={contractContextAvailable ? "Ask a question about the contract..." : "Process a contract to ask questions"}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || !contractContextAvailable}
            className="flex-grow"
          />
          <Button onClick={handleSend} disabled={isLoading || !question.trim() || !contractContextAvailable}>
            Send
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

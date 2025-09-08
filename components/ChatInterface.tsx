import React, { useState, useRef, useEffect } from 'react';
import { Message, Role } from '../types';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { ScrollArea } from './ui/ScrollArea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Send, Loader, Flag, ClipboardList, Settings } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onEndConversation: () => void;
  isLoading: boolean;
  isFeedbackLoading: boolean;
  isConversationStarted: boolean;
  showFeedbackButton: boolean;
  onRestart: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onEndConversation,
  isLoading,
  isFeedbackLoading,
  isConversationStarted,
  showFeedbackButton,
  onRestart
}) => {
  const [input, setInput] = useState('');
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !isLoading && !isFeedbackLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-card">
      <ScrollArea className="flex-grow" ref={scrollViewportRef}>
          <div className="max-w-3xl mx-auto p-6 space-y-4">
            {!isConversationStarted && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-20">
                     <Card className="w-full max-w-md bg-transparent border-border">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-center gap-2 text-foreground">
                            <Settings className="h-6 w-6" />
                            Welcome to the Advocacy Trainer
                          </CardTitle>
                          <CardDescription>
                            Ready to practice your advocacy skills?
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                          <p className="text-sm text-muted-foreground mb-4">
                            Use the sidebar to adjust the difficulty, then start a new conversation to begin.
                          </p>
                          <Button onClick={onRestart} className="w-full">Start New Conversation</Button>
                        </CardContent>
                      </Card>
                </div>
            )}
            {messages.map((msg, index) => {
              const messageKey = `${msg.role}-${index}`;
              if (msg.role === Role.COACH) {
                return (
                  <div key={messageKey} className="flex items-center gap-3 text-sm my-4 mx-auto max-w-[90%] bg-accent text-accent-foreground rounded-lg p-3 border border-border animate-slide-in-from-bottom">
                      <ClipboardList className="h-5 w-5 flex-shrink-0" />
                      <p>{msg.content}</p>
                  </div>
                )
              }
              return (
                <div key={messageKey} className={`flex items-end gap-2 animate-slide-in-from-bottom ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === Role.AI && <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" title="AI" aria-label="AI Persona"></div>}
                  <div className={`max-w-[75%] rounded-lg px-4 py-2 ${msg.role === Role.USER ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                    {msg.content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                  </div>
                </div>
              )
            })}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start animate-pulse">
                <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" aria-label="AI is typing"></div>
                <div className="w-24 max-w-[75%] rounded-lg px-4 py-5 bg-muted"></div>
              </div>
            )}
            {showFeedbackButton && (
              <div className="flex justify-center pt-4">
                <Button onClick={onEndConversation} variant="default" disabled={isLoading || isFeedbackLoading}>
                    {isFeedbackLoading ? (
                        <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Flag className="h-4 w-4 mr-2" />
                            End & Get Feedback
                        </>
                    )}
                </Button>
              </div>
            )}
          </div>
      </ScrollArea>
      <div className="p-4 border-t border-border flex-shrink-0">
        <div className="max-w-3xl mx-auto flex w-full items-end space-x-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={isConversationStarted ? "Type your response..." : "Start a new conversation to begin."}
            className="flex-grow resize-none"
            disabled={isLoading || isFeedbackLoading || !isConversationStarted}
            rows={1}
            style={{ maxHeight: '10rem' }}
            aria-label="Your response"
          />
          <Button onClick={handleSend} disabled={isLoading || isFeedbackLoading || !input.trim() || !isConversationStarted} size="icon" aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

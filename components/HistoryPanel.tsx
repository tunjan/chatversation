import React from 'react';
import { HistoryEntry, Role } from '../types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/Accordion';
import { ScrollArea } from './ui/ScrollArea';

interface HistoryPanelProps {
  history: HistoryEntry[];
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history }) => {
  return (
    <div>
      {history.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No conversations saved yet.</p>
      ) : (
          <Accordion type="single" collapsible className="w-full">
            {history.sort((a,b) => b.date.getTime() - a.date.getTime()).map((entry) => (
              <AccordionItem key={entry.id} value={`item-${entry.id}`}>
                <AccordionTrigger>
                    <div className="flex items-center justify-between w-full pr-4 text-left">
                        <div className="flex flex-col items-start">
                            <span className="font-medium text-foreground">Session Transcript</span>
                            <span className="text-xs text-muted-foreground">{entry.date.toLocaleString()}</span>
                        </div>
                        <span className="font-bold ml-4 text-foreground">
                            Score: {entry.feedback.overallScore}
                        </span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="bg-card p-4 rounded-lg">
                      <h4 className="font-bold mb-2 text-card-foreground">Transcript</h4>
                      <ScrollArea className="h-60 rounded-md border border-border p-2">
                        <div className="space-y-2 text-sm pr-2">
                          {entry.transcript.map((msg, msgIndex) => (
                              <div key={msgIndex} className={`flex ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}>
                                  <p className={`max-w-[80%] px-3 py-1 rounded-lg ${msg.role === Role.USER ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                                      {msg.content}
                                  </p>
                              </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <h4 className="font-bold mt-4 mb-2 text-card-foreground">Feedback Summary</h4>
                      <p className="text-sm text-muted-foreground">{entry.feedback.finalVerdict}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
      )}
    </div>
  );
};

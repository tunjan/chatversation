import React from 'react';
import { Difficulty } from '../types';
import { Button } from './ui/Button';
import { Label } from './ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { Alert, AlertDescription, AlertTitle } from './ui/Alert';
import { Info } from 'lucide-react';

interface SettingsPanelProps {
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
  onRestart: () => void;
  isConversationStarted?: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  difficulty,
  setDifficulty,
  onRestart,
  isConversationStarted
}) => {
  return (
    <div className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
           <Select value={difficulty} onValueChange={(value) => setDifficulty(value as Difficulty)}>
              <SelectTrigger id="difficulty" className="w-full" disabled={isConversationStarted}>
                  <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value={Difficulty.EASY}>Easy</SelectItem>
                  <SelectItem value={Difficulty.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={Difficulty.HARD}>Hard</SelectItem>
              </SelectContent>
          </Select>
        </div>
        
        <Button onClick={onRestart} className="w-full">
           {isConversationStarted ? 'Restart Conversation' : 'Start New Conversation'}
        </Button>
        
        <Alert>
          <Info className="h-4 w-4 text-foreground" />
          <AlertTitle>Core Principle</AlertTitle>
          <AlertDescription>
            Focus on <strong>exploitation</strong>: using someone for your own selfish benefit against their will.
          </AlertDescription>
        </Alert>
    </div>
  );
};
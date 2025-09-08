import React from 'react';
import { SettingsPanel } from './SettingsPanel';
import { HistoryPanel } from './HistoryPanel';
import { Difficulty, HistoryEntry } from '../types';

interface SidebarProps {
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
  onRestart: () => void;
  isConversationStarted: boolean;
  history: HistoryEntry[];
  isSheet?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  difficulty,
  setDifficulty,
  onRestart,
  isConversationStarted,
  history,
  isSheet = false,
}) => {
  return (
    <div className={`flex flex-col h-full ${isSheet ? 'overflow-y-auto' : ''}`}>
      {!isSheet && (
        <div className="p-6 border-b border-border flex-shrink-0">
            <h2 className="text-xl font-bold text-foreground">Trainer Options</h2>
            <p className="text-sm text-muted-foreground">Configure the AI or review past sessions.</p>
        </div>
      )}
      <div className={`flex-grow ${isSheet ? '' : 'overflow-y-auto'}`}>
        <div className="p-6">
            <SettingsPanel
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              onRestart={onRestart}
              isConversationStarted={isConversationStarted}
            />
        </div>
        <div className="px-6 pb-6">
            <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">History</h3>
                <HistoryPanel history={history} />
            </div>
        </div>
      </div>
    </div>
  );
};

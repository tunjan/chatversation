import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

interface FlowchartTrackerProps {
  flowchart: string[];
  currentStep: number;
}

export const FlowchartTracker: React.FC<FlowchartTrackerProps> = ({ flowchart, currentStep }) => {
  return (
    <aside className="bg-white dark:bg-black border-l border-gray-200 dark:border-gray-800 p-6 flex-shrink-0 lg:w-1/4 max-w-sm hidden lg:flex flex-col">
      <h3 className="text-xl font-bold text-black dark:text-white mb-4">Conversation Guide</h3>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">Follow these steps to guide the conversation. The current step is highlighted.</p>
      <div className="space-y-4 overflow-y-auto pr-2">
        {flowchart.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 mt-1">
                {isCompleted ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : isCurrent ? (
                  <ArrowRight className="h-4 w-4 text-black dark:text-white motion-safe:animate-pulse" />
                ) : (
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{index + 1}</span>
                )}
              </div>
              <p className={`
                motion-safe:transition-colors
                ${isCompleted ? 'text-gray-500 dark:text-gray-500 line-through' : ''}
                ${isCurrent ? 'font-bold text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}
              `}>
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
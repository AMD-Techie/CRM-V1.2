import React from 'react';
import { useCopilotStore } from '../../stores/copilotStore';
import { IconSparkles } from '../Icons';

interface ContextualCopilotButtonProps {
  label?: string;
  contextPrompt?: string;
  className?: string;
}

export const ContextualCopilotButton: React.FC<ContextualCopilotButtonProps> = ({
  label = 'Ask AI Copilot',
  contextPrompt,
  className = ''
}) => {
  const { setIsOpen } = useCopilotStore();

  return (
    <button
      onClick={() => {
        setIsOpen(true);
      }}
      className={`px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 ${className}`}
      title={contextPrompt || 'Open Contextual Copilot'}
    >
      <IconSparkles className="w-3.5 h-3.5 animate-pulse" />
      <span>{label}</span>
    </button>
  );
};

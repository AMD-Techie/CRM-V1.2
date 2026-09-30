import React from 'react';
import { useCopilotStore } from '../../stores/copilotStore';
import { CopilotEntityType } from '../../types/ai';
import { IconSparkles } from '../Icons';

export interface ContextualAIButtonProps {
  entityType?: CopilotEntityType;
  entityId?: string;
  entityName?: string;
  entityStage?: string;
  entityScore?: number;
  entityOwner?: string;
  selectedEntityIds?: string[];
  selectedEntityNames?: string[];
  label?: string;
  initialPrompt?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'chip';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const ContextualAIButton: React.FC<ContextualAIButtonProps> = ({
  entityType = 'general',
  entityId,
  entityName,
  entityStage,
  entityScore,
  entityOwner,
  selectedEntityIds,
  selectedEntityNames,
  label = 'Ask AI',
  initialPrompt,
  variant = 'secondary',
  size = 'sm',
  className = ''
}) => {
  const { openWithContext } = useCopilotStore();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openWithContext(
      {
        route: window.location.pathname,
        viewName: entityType ? entityType.toUpperCase() : 'GENERAL',
        entityType: entityType as CopilotEntityType,
        entityId,
        entityName,
        entityStage,
        entityScore,
        entityOwner,
        selectedEntityIds,
        selectedEntityNames,
        userName: 'Alex Chen',
        userRole: 'Sales Manager'
      },
      initialPrompt
    );
  };

  const getStyle = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white shadow-xs border border-white/20';
      case 'chip':
        return 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/50';
      case 'ghost':
        return 'bg-transparent text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30';
      case 'secondary':
      default:
        return 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-2xs';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'xs':
        return 'px-2 py-0.5 text-[10px] gap-1 rounded-lg';
      case 'md':
        return 'px-3.5 py-2 text-xs font-bold gap-2 rounded-xl';
      case 'sm':
      default:
        return 'px-2.5 py-1.5 text-xs font-semibold gap-1.5 rounded-xl';
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center transition-all cursor-pointer font-sans select-none group ${getStyle()} ${getSize()} ${className}`}
      title={`Open AI Copilot for ${entityName || entityType}`}
    >
      <IconSparkles className="w-3.5 h-3.5 text-primary-500 group-hover:scale-110 transition-transform" />
      <span>{label}</span>
    </button>
  );
};

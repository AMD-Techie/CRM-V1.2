import React from 'react';
import { IconSparkles, IconZap, IconMail, IconCheckSquare, IconCalendar, IconAlertTriangle, IconSend } from '../Icons';

export interface SuggestedChip {
  id: string;
  label: string;
  prompt: string;
  iconType?: 'sparkles' | 'mail' | 'task' | 'calendar' | 'risk' | 'zap' | 'send';
  badge?: string;
  category?: string;
}

interface SuggestedActionChipsProps {
  chips: SuggestedChip[];
  onSelect: (chip: SuggestedChip) => void;
  className?: string;
  maxDisplay?: number;
}

export const SuggestedActionChips: React.FC<SuggestedActionChipsProps> = ({
  chips,
  onSelect,
  className = '',
  maxDisplay
}) => {
  if (!chips || chips.length === 0) return null;

  const displayChips = maxDisplay ? chips.slice(0, maxDisplay) : chips;

  const renderIcon = (type?: SuggestedChip['iconType']) => {
    switch (type) {
      case 'mail':
        return <IconMail className="w-3 h-3 text-blue-500 shrink-0" />;
      case 'task':
        return <IconCheckSquare className="w-3 h-3 text-emerald-500 shrink-0" />;
      case 'calendar':
        return <IconCalendar className="w-3 h-3 text-amber-500 shrink-0" />;
      case 'risk':
        return <IconAlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />;
      case 'zap':
        return <IconZap className="w-3 h-3 text-amber-500 shrink-0" />;
      case 'send':
        return <IconSend className="w-3 h-3 text-indigo-500 shrink-0" />;
      case 'sparkles':
      default:
        return <IconSparkles className="w-3 h-3 text-primary-500 shrink-0" />;
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {displayChips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onSelect(chip)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-800/80 hover:bg-primary-50 dark:hover:bg-primary-950/40 border border-slate-200/90 dark:border-slate-700/80 hover:border-primary-300 dark:hover:border-primary-700 shadow-2xs hover:shadow-xs transition-all text-left group"
        >
          {renderIcon(chip.iconType)}
          <span className="truncate max-w-[240px] group-hover:text-primary-600 dark:group-hover:text-primary-400 font-medium">
            {chip.label}
          </span>
          {chip.badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">
              {chip.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

import React from 'react';
import { IconUsers, IconKanban, IconBuilding, IconCalendar, IconCheckSquare, IconX } from '../Icons';

export interface ContextPillItem {
  id: string;
  type: 'lead' | 'deal' | 'contact' | 'account' | 'meeting' | 'task' | 'general';
  label: string;
  value: string;
  onRemove?: () => void;
  onClick?: () => void;
}

interface ContextPillGroupProps {
  items: ContextPillItem[];
  title?: string;
  onClearAll?: () => void;
  className?: string;
}

export const ContextPillGroup: React.FC<ContextPillGroupProps> = ({
  items,
  title,
  onClearAll,
  className = ''
}) => {
  if (!items || items.length === 0) return null;

  const getIcon = (type: ContextPillItem['type']) => {
    switch (type) {
      case 'lead':
      case 'contact':
        return <IconUsers className="w-3 h-3 text-blue-500 shrink-0" />;
      case 'deal':
        return <IconKanban className="w-3 h-3 text-purple-500 shrink-0" />;
      case 'account':
        return <IconBuilding className="w-3 h-3 text-amber-500 shrink-0" />;
      case 'meeting':
        return <IconCalendar className="w-3 h-3 text-emerald-500 shrink-0" />;
      case 'task':
        return <IconCheckSquare className="w-3 h-3 text-rose-500 shrink-0" />;
      default:
        return <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />;
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {(title || onClearAll) && (
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
          {title && <span>{title}</span>}
          {onClearAll && (
            <button
              onClick={onClearAll}
              className="text-primary-600 dark:text-primary-400 hover:underline capitalize font-medium text-[10px]"
            >
              Clear
            </button>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={item.onClick}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 transition-all ${
              item.onClick ? 'cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 hover:bg-white dark:hover:bg-slate-800' : ''
            }`}
          >
            {getIcon(item.type)}
            <span className="text-slate-400 text-[10px] font-semibold">{item.label}:</span>
            <span className="font-bold text-[11px] truncate max-w-[140px]">{item.value}</span>
            {item.onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  item.onRemove?.();
                }}
                className="ml-0.5 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <IconX className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

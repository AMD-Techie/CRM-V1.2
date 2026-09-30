import React from 'react';
import { AgentExecutionStep, ExecutionStepType } from '../../types/ai';
import { 
  IconSparkles, 
  IconCheckCircle, 
  IconClock, 
  IconAlertTriangle, 
  IconDatabase, 
  IconSearch, 
  IconKey, 
  IconZap, 
  IconCheckSquare 
} from '../Icons';

interface AIExecutionTimelineProps {
  steps: AgentExecutionStep[];
  className?: string;
}

export const AIExecutionTimeline: React.FC<AIExecutionTimelineProps> = ({ steps, className = '' }) => {
  const getStepIcon = (type: ExecutionStepType, status: string) => {
    if (status === 'waiting_approval') return <IconClock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />;
    if (status === 'failed') return <IconAlertTriangle className="w-3.5 h-3.5 text-rose-500" />;
    
    switch (type) {
      case 'trigger':
        return <IconZap className="w-3.5 h-3.5 text-blue-500" />;
      case 'context_retrieval':
        return <IconDatabase className="w-3.5 h-3.5 text-indigo-500" />;
      case 'knowledge_lookup':
        return <IconSearch className="w-3.5 h-3.5 text-purple-500" />;
      case 'analysis':
        return <IconSparkles className="w-3.5 h-3.5 text-amber-500" />;
      case 'tool_call':
        return <IconKey className="w-3.5 h-3.5 text-cyan-500" />;
      case 'recommendation':
      case 'execution':
        return <IconCheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <IconCheckSquare className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;

        return (
          <div key={step.stepNumber || idx} className="relative flex items-start gap-3 group">
            {/* Step Node & Line */}
            <div className="flex flex-col items-center shrink-0 mt-0.5">
              <div className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all shadow-2xs ${
                step.status === 'waiting_approval'
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 ring-2 ring-amber-400/30'
                  : step.status === 'success'
                    ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    : 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700'
              }`}>
                {getStepIcon(step.type, step.status)}
              </div>
              {!isLast && (
                <div className="w-0.5 h-full min-h-[24px] bg-slate-200 dark:bg-slate-800 my-1"></div>
              )}
            </div>

            {/* Step Body */}
            <div className="flex-1 min-w-0 pb-2">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {step.label}
                </span>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {step.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {step.summary}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

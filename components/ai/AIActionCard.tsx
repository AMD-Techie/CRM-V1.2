import React from 'react';
import { AIAction, AIActionStatus } from '../../types/ai';
import { 
  IconSparkles, 
  IconCheckCircle, 
  IconAlertCircle, 
  IconClock, 
  IconX, 
  IconArrowRight, 
  IconMail, 
  IconPhone, 
  IconSend, 
  IconCheckSquare 
} from '../Icons';

interface AIActionCardProps {
  action: AIAction;
  onApprove?: (actionId: string) => void;
  onReject?: (actionId: string) => void;
  onExecute?: (actionId: string) => void;
  onViewEntity?: (entityType: string, entityId: string) => void;
}

export const AIActionCard: React.FC<AIActionCardProps> = ({
  action,
  onApprove,
  onReject,
  onExecute,
  onViewEntity
}) => {
  const getStatusBadge = (status: AIActionStatus) => {
    switch (status) {
      case 'informational':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300',
          label: 'AI Information',
          icon: IconAlertCircle
        };
      case 'recommended':
        return {
          bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-800 text-purple-700 dark:text-purple-300',
          label: 'AI Recommendation',
          icon: IconSparkles
        };
      case 'prepared':
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300',
          label: 'Prepared AI Action',
          icon: IconCheckSquare
        };
      case 'approval_required':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800 text-amber-800 dark:text-amber-300',
          label: 'Human Approval Required',
          icon: IconClock
        };
      case 'executed':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
          label: 'Action Executed',
          icon: IconCheckCircle
        };
      case 'rejected':
        return {
          bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400',
          label: 'Action Dismissed',
          icon: IconX
        };
    }
  };

  const badge = getStatusBadge(action.status);
  const BadgeIcon = badge.icon;

  return (
    <div className={`p-4 md:p-5 rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900/90 shadow-xs hover:shadow-md ${
      action.status === 'approval_required' 
        ? 'border-amber-300 dark:border-amber-800/80 ring-1 ring-amber-400/20' 
        : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${badge.bg}`}>
            <BadgeIcon className="w-3.5 h-3.5" />
            <span>{badge.label}</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">via {action.agentName}</span>
        </div>

        {onViewEntity && (
          <button 
            onClick={() => onViewEntity(action.entityType, action.entityId)}
            className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            <span>{action.entityTitle}</span>
            <IconArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Headline & Rationale */}
      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
        {action.headline}
      </h4>
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
        {action.rationale}
      </p>

      {/* Payload Preview if present */}
      {action.payload.content && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs font-mono text-slate-700 dark:text-slate-300 mb-3 whitespace-pre-wrap leading-relaxed">
          {action.payload.content}
        </div>
      )}

      {/* Action Footers & Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
        <span>Created {action.createdAt}</span>

        <div className="flex items-center gap-2">
          {action.status === 'approval_required' && (
            <>
              {onReject && (
                <button
                  onClick={() => onReject(action.id)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors"
                >
                  Reject
                </button>
              )}
              {onApprove && (
                <button
                  onClick={() => onApprove(action.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs transition-colors flex items-center gap-1"
                >
                  <IconCheckCircle className="w-3.5 h-3.5" /> Approve & Dispatch
                </button>
              )}
            </>
          )}

          {action.status === 'recommended' && onExecute && (
            <button
              onClick={() => onExecute(action.id)}
              className="px-3.5 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-bold shadow-xs transition-colors flex items-center gap-1"
            >
              <IconSparkles className="w-3.5 h-3.5" /> Prepare Action
            </button>
          )}

          {action.status === 'executed' && (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <IconCheckCircle className="w-3.5 h-3.5" /> Dispatched Successfully
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

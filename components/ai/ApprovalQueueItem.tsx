import React, { useState } from 'react';
import { ApprovalItem } from '../../types/ai';
import { 
  IconCheckCircle, 
  IconX, 
  IconClock, 
  IconSparkles, 
  IconMessageSquare, 
  IconMail, 
  IconKanban, 
  IconCheckSquare,
  IconChevronDown,
  IconChevronUp
} from '../Icons';

interface ApprovalQueueItemProps {
  item: ApprovalItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewEntity?: (type: string, id: string) => void;
}

export const ApprovalQueueItem: React.FC<ApprovalQueueItemProps> = ({
  item,
  onApprove,
  onReject,
  onViewEntity
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'whatsapp_dispatch':
        return <IconMessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
      case 'email_outreach':
        return <IconMail className="w-3.5 h-3.5 text-indigo-500" />;
      case 'stage_transition':
        return <IconKanban className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <IconCheckSquare className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  return (
    <div className={`p-4 md:p-5 rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md ${
      item.status === 'pending' 
        ? 'border-amber-200 dark:border-amber-900/60 ring-1 ring-amber-400/20' 
        : item.status === 'approved'
          ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/10'
          : 'border-slate-200 dark:border-slate-800 opacity-70'
    }`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {getCategoryIcon(item.category)}
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {item.agentName}
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="text-[11px] text-slate-400">
            {item.createdAt}
          </span>
          {item.urgency === 'high' && (
            <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-extrabold text-[10px]">
              High Urgency
            </span>
          )}
        </div>

        {/* Target Entity Tag */}
        {onViewEntity && (
          <button
            onClick={() => onViewEntity(item.targetEntity.type, item.targetEntity.id)}
            className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline text-left sm:text-right truncate"
          >
            Target: {item.targetEntity.name}
          </button>
        )}
      </div>

      {/* Title & Description */}
      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
        {item.title}
      </h4>
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
        {item.description}
      </p>

      {/* Target Entity Context */}
      {item.targetEntity.contextSummary && (
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
          <span>Context: <strong>{item.targetEntity.contextSummary}</strong></span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-600 dark:text-primary-400 font-bold hover:underline flex items-center gap-1"
          >
            <span>{isExpanded ? 'Hide Payload' : 'View Message / Diff'}</span>
            {isExpanded ? <IconChevronUp className="w-3 h-3" /> : <IconChevronDown className="w-3 h-3" />}
          </button>
        </div>
      )}

      {/* Proposed Payload Inspector */}
      {isExpanded && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono border border-slate-800 mb-3.5 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-bold">
            <span>Payload Type: {item.proposedPayload.type}</span>
            {item.proposedPayload.subject && <span>Subject: {item.proposedPayload.subject}</span>}
          </div>
          {item.proposedPayload.body && (
            <p className="whitespace-pre-wrap leading-relaxed text-slate-200 text-xs">
              {item.proposedPayload.body}
            </p>
          )}
          {item.proposedPayload.diff && (
            <div className="space-y-1.5 pt-1">
              {item.proposedPayload.diff.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{d.field}:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 line-through">{String(d.from)}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-emerald-400 font-bold">{String(d.to)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Decision Footer */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="text-[11px] text-slate-400">
          {item.status === 'approved' && (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <IconCheckCircle className="w-3.5 h-3.5" /> Approved ({item.reviewedAt})
            </span>
          )}
          {item.status === 'rejected' && (
            <span className="text-slate-500 font-bold flex items-center gap-1">
              <IconX className="w-3.5 h-3.5" /> Rejected ({item.reviewedAt})
            </span>
          )}
          {item.status === 'pending' && (
            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
              <IconClock className="w-3.5 h-3.5" /> Pending Human Decision
            </span>
          )}
        </div>

        {item.status === 'pending' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onReject(item.id)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
            >
              Reject
            </button>
            <button
              onClick={() => onApprove(item.id)}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <IconCheckCircle className="w-3.5 h-3.5" /> Approve & Execute
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { AgentCapability } from '../../types/ai';
import { IconCheckCircle, IconX } from '../Icons';

export const CAPABILITY_METADATA: Record<AgentCapability, { label: string; description: string; risk: 'low' | 'medium' | 'high' }> = {
  search_leads: { label: 'Search & Query Leads', description: 'Query CRM lead records and firmographic metrics', risk: 'low' },
  read_customer: { label: 'Read Customer History', description: 'Access past calls, meetings, notes, and activity timeline', risk: 'low' },
  analyze_opportunity: { label: 'Analyze Opportunity & Velocity', description: 'Calculate deal velocity, stage drop-off, and win probability', risk: 'low' },
  create_task: { label: 'Create Follow-up Tasks', description: 'Automatically add actionable tasks to rep agendas', risk: 'medium' },
  draft_email: { label: 'Draft Client Emails', description: 'Prepare hyper-personalized email drafts based on playbooks', risk: 'medium' },
  draft_whatsapp: { label: 'Draft WhatsApp Messages', description: 'Prepare instant mobile messages for approval dispatch', risk: 'medium' },
  schedule_meeting: { label: 'Schedule Calendar Syncs', description: 'Propose meeting calendar slots to clients', risk: 'medium' },
  enrich_company_data: { label: 'Enrich Tech Stack Signals', description: 'Pull public web signals, employee counts, and revenue', risk: 'low' },
  calculate_deal_risk: { label: 'Calculate Churn & Stagnation Risk', description: 'Flag inactive deals and revenue anomalies', risk: 'low' },
  generate_executive_brief: { label: 'Compile Executive Dossiers', description: 'Generate pre-meeting briefings for leadership', risk: 'low' }
};

export const CapabilityPermissionGrid: React.FC<{
  activeCapabilities: AgentCapability[];
  onToggle?: (cap: AgentCapability) => void;
  readOnly?: boolean;
}> = ({ activeCapabilities, onToggle, readOnly = false }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {(Object.keys(CAPABILITY_METADATA) as AgentCapability[]).map(cap => {
        const isEnabled = activeCapabilities.includes(cap);
        const meta = CAPABILITY_METADATA[cap];

        return (
          <div
            key={cap}
            onClick={() => !readOnly && onToggle && onToggle(cap)}
            className={`p-3 rounded-xl border transition-all text-xs ${
              isEnabled 
                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-800/60' 
                : 'bg-slate-50/40 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 opacity-60'
            } ${!readOnly ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700' : ''}`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={`font-bold ${isEnabled ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                {meta.label}
              </span>
              {isEnabled ? (
                <IconCheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <IconX className="w-4 h-4 text-slate-400 shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              {meta.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export const AgentVersionBadge: React.FC<{
  version: string;
  status?: 'published' | 'draft' | 'archived';
}> = ({ version, status = 'published' }) => {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
      status === 'published'
        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800'
        : status === 'draft'
          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
    }`}>
      <span>{version}</span>
      <span className="capitalize text-[9px] font-sans opacity-80">({status})</span>
    </span>
  );
};

export const AgentRunStatusDot: React.FC<{
  status: 'running' | 'completed' | 'pending_approval' | 'failed';
}> = ({ status }) => {
  switch (status) {
    case 'running':
      return (
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
      );
    case 'pending_approval':
      return <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>;
    case 'failed':
      return <span className="w-2 h-2 rounded-full bg-rose-500"></span>;
    case 'completed':
    default:
      return <span className="w-2 h-2 rounded-full bg-emerald-500"></span>;
  }
};

import React, { useState } from 'react';
import { useActionsQuery, useExecuteActionMutation, useDismissActionMutation } from '../../../hooks';
import { AIAction, AIActionStatus } from '../../../types/ai';
import { AIActionCard } from '../../../components/ai/AIActionCard';
import { 
  IconSparkles, 
  IconZap, 
  IconClock, 
  IconCheckCircle, 
  IconAlertCircle, 
  IconFilter, 
  IconSearch, 
  IconArrowRight 
} from '../../../components/Icons';

interface AIActionsViewProps {
  onNavigate?: (view: string, id?: string) => void;
}

export const AIActionsView: React.FC<AIActionsViewProps> = ({ onNavigate }) => {
  const { data: actions = [], isLoading } = useActionsQuery();
  const executeMutation = useExecuteActionMutation();
  const dismissMutation = useDismissActionMutation();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredActions = actions.filter(action => {
    const matchesStatus = statusFilter === 'all' || action.status === statusFilter;
    const matchesSearch = 
      action.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.entityTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.agentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const STATUS_TABS: { id: string; label: string; count: number }[] = [
    { id: 'all', label: 'All Actions', count: actions.length },
    { id: 'approval_required', label: 'Requires Approval', count: actions.filter(a => a.status === 'approval_required').length },
    { id: 'prepared', label: 'Prepared', count: actions.filter(a => a.status === 'prepared').length },
    { id: 'recommended', label: 'Recommended', count: actions.filter(a => a.status === 'recommended').length },
    { id: 'executed', label: 'Executed', count: actions.filter(a => a.status === 'executed').length },
    { id: 'rejected', label: 'Dismissed', count: actions.filter(a => a.status === 'rejected').length },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 mb-1 uppercase tracking-wider">
            <IconSparkles className="w-4 h-4" />
            <span>Autonomous & Staged Actions Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            AI Operations & Action Queue
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
            Review, stage, trigger, or dismiss intelligent actions proposed across CRM records by autonomous agents.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onNavigate && (
            <button
              onClick={() => onNavigate('ai_approvals')}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition-all flex items-center gap-2"
            >
              <IconClock className="w-3.5 h-3.5" />
              <span>Approvals Console</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                statusFilter === tab.id
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <IconSearch className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredActions.map((action) => (
          <AIActionCard
            key={action.id}
            action={action}
            onExecute={(id) => executeMutation.mutate(id)}
            onApprove={(id) => {
              if (onNavigate) onNavigate('ai_approvals');
            }}
            onReject={(id) => dismissMutation.mutate({ actionId: id })}
            onViewEntity={(type, id) => {
              if (onNavigate) {
                if (type === 'lead') onNavigate('leads', id);
                else if (type === 'deal') onNavigate('pipeline', id);
                else if (type === 'contact') onNavigate('contacts', id);
                else if (type === 'meeting') onNavigate('meetings', id);
                else onNavigate('tasks', id);
              }
            }}
          />
        ))}

        {filteredActions.length === 0 && (
          <div className="col-span-full p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
            No actions match the selected filter criteria.
          </div>
        )}
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { useApprovalsQuery, useApproveActionMutation, useRejectActionMutation } from '../../../hooks';
import { ApprovalItem } from '../../../types/ai';
import { ApprovalQueueItem } from '../../../components/ai/ApprovalQueueItem';
import { 
  IconClock, 
  IconCheckCircle, 
  IconX, 
  IconAlertTriangle, 
  IconShield, 
  IconEdit, 
  IconCheck, 
  IconArrowRight,
  IconSparkles
} from '../../../components/Icons';

interface AIApprovalsViewProps {
  onNavigate?: (view: string, id?: string) => void;
}

export const AIApprovalsView: React.FC<AIApprovalsViewProps> = ({ onNavigate }) => {
  const { data: approvals = [], isLoading } = useApprovalsQuery();
  const approveMutation = useApproveActionMutation();
  const rejectMutation = useRejectActionMutation();

  const [activeTab, setActiveTab] = useState<'pending' | 'reviewed'>('pending');
  const [editingItem, setEditingItem] = useState<ApprovalItem | null>(null);
  const [editedPayloadBody, setEditedPayloadBody] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const reviewedApprovals = approvals.filter(a => a.status !== 'pending');
  const displayItems = activeTab === 'pending' ? pendingApprovals : reviewedApprovals;

  const handleOpenEdit = (item: ApprovalItem) => {
    setEditingItem(item);
    setEditedPayloadBody(item.proposedPayload.body || item.proposedPayload.subject || '');
  };

  const handleSaveAndApprove = () => {
    if (!editingItem) return;
    approveMutation.mutate(editingItem.id);
    setEditingItem(null);
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkApprove = () => {
    selectedIds.forEach(id => approveMutation.mutate(id));
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 mb-1 uppercase tracking-wider">
            <IconClock className="w-4 h-4" />
            <span>Human-in-the-Loop Governance Gate</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            AI Approval Center
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
            Review, inspect diffs, edit content, and authorize high-impact autonomous actions before they are executed in production.
          </p>
        </div>

        {/* Bulk Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {activeTab === 'pending' && pendingApprovals.length > 0 && (
            <button
              onClick={handleBulkApprove}
              disabled={selectedIds.length === 0}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white shadow-xs transition-all flex items-center gap-2"
            >
              <IconCheckCircle className="w-4 h-4" />
              <span>Bulk Authorize ({selectedIds.length})</span>
            </button>
          )}

          {onNavigate && (
            <button
              onClick={() => onNavigate('ai_command_center')}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all"
            >
              Command Center
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span>Pending Decisions</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
            {pendingApprovals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reviewed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'reviewed'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span>Audit History</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
            {reviewedApprovals.length}
          </span>
        </button>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {displayItems.map((item) => (
          <div key={item.id} className="relative">
            {activeTab === 'pending' && (
              <div className="absolute left-3 top-5 z-10 hidden sm:block">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="rounded-md border-slate-300 text-primary-600 focus:ring-primary-500"
                />
              </div>
            )}
            
            <div className={activeTab === 'pending' ? 'sm:pl-8' : ''}>
              <ApprovalQueueItem
                item={item}
                onApprove={(id) => approveMutation.mutate(id)}
                onReject={(id) => rejectMutation.mutate(id)}
                onViewEntity={(type, id) => {
                  if (onNavigate) onNavigate(type === 'deal' ? 'pipeline' : 'leads', id);
                }}
              />
            </div>
          </div>
        ))}

        {displayItems.length === 0 && (
          <div className="p-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <IconCheckCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {activeTab === 'pending' ? 'All Queues Cleared' : 'No Audit Records'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {activeTab === 'pending'
                ? 'There are currently zero pending approvals awaiting review.'
                : 'No historical approvals found in this session.'}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

import React from 'react';
import { AgentRun } from '../../../types/ai';
import { 
  IconCheckCircle, 
  IconAlertTriangle, 
  IconClock, 
  IconLock, 
  IconUsers,
  IconArrowRight,
  IconZap
} from '../../../components/Icons';

interface ParentChildRunTreeProps {
  currentRun: AgentRun;
  allRuns: AgentRun[];
  onSelectRun: (runId: string) => void;
}

export const ParentChildRunTree: React.FC<ParentChildRunTreeProps> = ({
  currentRun,
  allRuns,
  onSelectRun
}) => {
  const parentRun = currentRun.parentRunId ? allRuns.find(r => r.id === currentRun.parentRunId) : null;
  const childRuns = allRuns.filter(r => r.parentRunId === currentRun.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">Completed</span>;
      case 'approval_required':
      case 'pending_approval':
        return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/15 text-amber-800 dark:text-amber-300">Approval Required</span>;
      case 'failed':
        return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-red-500/15 text-red-800 dark:text-red-300">Failed</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-200 dark:bg-slate-700 text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-1">
          Multi-Agent Delegation & Parent-Child Hierarchy
        </h4>
        <p className="text-[11px] text-slate-500">
          Tracks delegated execution handoffs, child task status propagation, and cascade failures.
        </p>
      </div>

      {/* Parent Run Section */}
      {parentRun ? (
        <div className="p-4 rounded-2xl border border-primary-500/30 bg-primary-50/20 dark:bg-primary-950/20 space-y-2">
          <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            Parent Orchestration Run
          </span>
          <div 
            onClick={() => onSelectRun(parentRun.id)}
            className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-primary-500 transition-colors"
          >
            <div>
              <strong className="text-xs text-slate-900 dark:text-white">{parentRun.agentName}</strong>
              <div className="text-[10px] text-slate-400">ID: {parentRun.id} · Target: {parentRun.targetEntityName}</div>
            </div>
            {getStatusBadge(parentRun.status)}
          </div>
        </div>
      ) : (
        <div className="p-3 text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-200/60 dark:border-slate-800">
          This is a root orchestration run (no parent delegator).
        </div>
      )}

      {/* Current Active Run */}
      <div className="p-4 rounded-2xl border-2 border-primary-500 bg-primary-50/40 dark:bg-primary-950/30 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            Current Selected Run (Active Node)
          </span>
          {getStatusBadge(currentRun.status)}
        </div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white">{currentRun.agentName}</h3>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Target: {currentRun.targetEntityName} ({currentRun.targetEntityType}) · Trigger: {currentRun.triggerEvent}
        </p>
      </div>

      {/* Child Runs Section */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Delegated Child Runs ({childRuns.length})
        </span>

        {childRuns.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-200/60 dark:border-slate-800">
            No child agent executions have been spawned by this run.
          </div>
        ) : (
          <div className="space-y-2">
            {childRuns.map(child => (
              <div
                key={child.id}
                onClick={() => onSelectRun(child.id)}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-primary-500 transition-colors text-xs"
              >
                <div className="flex items-center gap-2">
                  <IconArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">{child.agentName}</strong>
                    <p className="text-[10px] text-slate-400">ID: {child.id} · {child.targetEntityName}</p>
                  </div>
                </div>
                {getStatusBadge(child.status)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

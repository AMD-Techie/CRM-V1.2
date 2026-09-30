import React, { useState } from 'react';
import { useAgentsQuery, useAgentRunsQuery, useApprovalsQuery, useApproveActionMutation, useRejectActionMutation } from '../../../hooks';
import { AIExecutionTimeline } from '../../../components/ai/AIExecutionTimeline';
import { ApprovalQueueItem } from '../../../components/ai/ApprovalQueueItem';
import { AgentVersionBadge, AgentRunStatusDot } from '../../../components/ai/CapabilityPermissionGrid';
import { 
  IconSparkles, 
  IconZap, 
  IconCheckCircle, 
  IconClock, 
  IconAlertTriangle, 
  IconShield, 
  IconArrowRight, 
  IconUsers, 
  IconPlay, 
  IconRefreshCw,
  IconCheckSquare
} from '../../../components/Icons';

interface AICommandCenterProps {
  onNavigate?: (view: string, id?: string) => void;
}

export const AICommandCenter: React.FC<AICommandCenterProps> = ({ onNavigate }) => {
  const { data: agents = [], isLoading: agentsLoading } = useAgentsQuery();
  const { data: runs = [], isLoading: runsLoading } = useAgentRunsQuery();
  const { data: approvals = [], isLoading: approvalsLoading } = useApprovalsQuery();

  const approveMutation = useApproveActionMutation();
  const rejectMutation = useRejectActionMutation();

  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const activeAgents = agents.filter(a => a.status === 'active');
  const recentRuns = runs.slice(0, 6);
  const activeRun = runs.find(r => r.id === selectedRunId) || runs[0];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* 1. Command Center Executive Hero */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 mb-1.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              <span className="uppercase tracking-wider">Operational AI Control Engine</span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-slate-500 font-normal">Fleet Health: Optimal</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              AI Command Center
            </h1>

            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              Centralized operational oversight of autonomous agents, execution pipelines, Human-in-the-Loop approval gates, and CRM event telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onNavigate && (
              <>
                <button
                  onClick={() => onNavigate('ai_approvals')}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition-all flex items-center gap-2"
                >
                  <IconClock className="w-3.5 h-3.5" />
                  <span>Approvals Queue ({pendingApprovals.length})</span>
                </button>
                <button
                  onClick={() => onNavigate('ai_agents')}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-500 text-white shadow-xs transition-all flex items-center gap-2"
                >
                  <IconSparkles className="w-3.5 h-3.5" />
                  <span>Manage Agents</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Top Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Agents Fleet</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{activeAgents.length}</span>
              <span className="text-xs text-emerald-600 font-semibold">online</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pending Human Decisions</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{pendingApprovals.length}</span>
              <span className="text-xs text-slate-400 font-medium">actions staged</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Fleet Success Rate</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">98.4%</span>
              <span className="text-xs text-slate-400 font-medium">last 1,000 runs</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Autonomous Throughput</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">1,264</span>
              <span className="text-xs text-slate-400 font-medium">events / week</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Pending Approvals & Autonomous Agents Fleet (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section A: Pending Human Approvals */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <IconClock className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Human-in-the-Loop Approvals ({pendingApprovals.length})
                </h3>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('ai_approvals')}
                  className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  View All <IconArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="space-y-3.5">
              {pendingApprovals.slice(0, 2).map((item) => (
                <ApprovalQueueItem
                  key={item.id}
                  item={item}
                  onApprove={(id) => approveMutation.mutate(id)}
                  onReject={(id) => rejectMutation.mutate(id)}
                  onViewEntity={(type, id) => onNavigate && onNavigate(type === 'deal' ? 'pipeline' : 'leads', id)}
                />
              ))}

              {pendingApprovals.length === 0 && (
                <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                  Zero pending approvals. All autonomous actions are reviewed!
                </div>
              )}
            </div>
          </div>

          {/* Section B: Active Agents Fleet */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <IconUsers className="w-4 h-4 text-primary-500" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Active Agent Fleet
                </h3>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('ai_agents')}
                  className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  Configure Fleet <IconArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <AgentVersionBadge version={agent.activeVersion} status="published" />
                      <span className="text-[10px] font-mono text-slate-400">{agent.successRate}% win rate</span>
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mb-1">
                      {agent.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
                      {agent.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{agent.totalExecutions} runs</span>
                    <span>Last: {agent.lastRunAt || 'Recent'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Real-Time Execution Trace & Run Inspector (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <IconZap className="w-4 h-4 text-primary-500" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Live Execution Trace
                </h3>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('ai_runs')}
                  className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  All Runs <IconArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Run Selector Tabs */}
            <div className="space-y-2 mb-4">
              {recentRuns.slice(0, 3).map((r) => {
                const isSelected = (activeRun?.id === r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRunId(r.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'bg-primary-50/50 dark:bg-primary-950/40 border-primary-300 dark:border-primary-700/80 ring-1 ring-primary-500/20' 
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                        <AgentRunStatusDot status={r.status} />
                        {r.agentName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">{r.startedAt}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 truncate block">
                      Target: {r.targetEntityName}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Execution Trace Steps */}
            {activeRun && (
              <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Step Trace: {activeRun.id}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {activeRun.durationMs}ms duration
                  </span>
                </div>
                <AIExecutionTimeline steps={activeRun.steps} />
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AICommandCenter;

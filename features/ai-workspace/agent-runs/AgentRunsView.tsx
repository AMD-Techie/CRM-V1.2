import React, { useState, useMemo, useEffect } from 'react';
import { 
  useAgentRunsQuery, 
  useAgentsQuery, 
  useStartAgentRunMutation, 
  useCancelAgentRunMutation, 
  useRetryAgentRunMutation,
  usePauseAgentRunMutation,
  useResumeAgentRunMutation,
  useRuntimeEventsQuery,
  useExecutionGraphQuery,
  useCheckpointsQuery,
  useRuntimeDiagnosticsQuery,
  useCapabilitiesQuery,
  useSkillsQuery
} from '../../../hooks';
import { useRuntimeUIStore, RuntimeConsoleTab } from '../../../stores/runtimeUIStore';
import { 
  AgentRun, 
  AgentRunStatus, 
  ExecutionStepType, 
  FailureCategory,
  AIAgent
} from '../../../types/ai';
import { ExecutionGraphVisualizer } from './ExecutionGraphVisualizer';
import { RuntimeEventLog } from './RuntimeEventLog';
import { RuntimeReplayController } from './RuntimeReplayController';
import { RuntimeDiagnosticsPanel } from './RuntimeDiagnosticsPanel';
import { ParentChildRunTree } from './ParentChildRunTree';
import { 
  IconSparkles, 
  IconPlay, 
  IconPause,
  IconCheckCircle, 
  IconAlertTriangle, 
  IconClock, 
  IconFilter, 
  IconRefreshCw, 
  IconChevronRight, 
  IconZap,
  IconArrowRight,
  IconShield,
  IconLock,
  IconX,
  IconDatabase,
  IconUsers,
  IconEye,
  IconBox,
  IconShare2,
  IconActivity,
  IconBook
} from '../../../components/Icons';

interface AgentRunsViewProps {
  onNavigate?: (view: string, id?: string) => void;
  initialRunId?: string;
}

export const AgentRunsView: React.FC<AgentRunsViewProps> = ({ onNavigate, initialRunId }) => {
  const [pollActive, setPollActive] = useState(false);
  const { 
    selectedRunId, 
    setSelectedRunId, 
    selectedEventId, 
    setSelectedEventId,
    selectedNodeId,
    setSelectedNodeId,
    activeTab, 
    setActiveTab,
    replayStep,
    setReplayStep,
    isPlayingReplay,
    setIsPlayingReplay,
    statusFilter,
    setStatusFilter,
    agentFilter,
    setAgentFilter
  } = useRuntimeUIStore();

  const { data: runs = [], isLoading, refetch } = useAgentRunsQuery(undefined, {
    refetchInterval: pollActive ? 3000 : undefined
  });
  const { data: agents = [] } = useAgentsQuery();
  const { data: capabilities = [] } = useCapabilitiesQuery();
  const { data: skills = [] } = useSkillsQuery();
  const { data: diagnostics = [] } = useRuntimeDiagnosticsQuery();

  const startRunMutation = useStartAgentRunMutation();
  const cancelRunMutation = useCancelAgentRunMutation();
  const retryRunMutation = useRetryAgentRunMutation();
  const pauseRunMutation = usePauseAgentRunMutation();
  const resumeRunMutation = useResumeAgentRunMutation();

  // Manual Trigger Modal State
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [launchAgentId, setLaunchAgentId] = useState<string>('');
  const [launchEntityType, setLaunchEntityType] = useState<'lead' | 'deal' | 'contact' | 'account'>('lead');
  const [launchEntityId, setLaunchEntityId] = useState('1');
  const [launchEntityName, setLaunchEntityName] = useState('Acme Corp');
  const [launchTriggerEvent, setLaunchTriggerEvent] = useState('Manual Operator Invocation');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize initial run selection
  useEffect(() => {
    if (initialRunId && runs.some(r => r.id === initialRunId)) {
      setSelectedRunId(initialRunId);
    } else if (!selectedRunId && runs.length > 0) {
      setSelectedRunId(runs[0].id);
    }
  }, [initialRunId, runs, selectedRunId, setSelectedRunId]);

  const filteredRuns = useMemo(() => {
    return runs.filter(run => {
      const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
      const matchesAgent = agentFilter === 'all' || run.agentId === agentFilter;
      return matchesStatus && matchesAgent;
    });
  }, [runs, statusFilter, agentFilter]);

  const activeRun = useMemo(() => {
    if (selectedRunId) {
      return runs.find(r => r.id === selectedRunId) || filteredRuns[0] || runs[0];
    }
    return filteredRuns[0] || runs[0];
  }, [runs, selectedRunId, filteredRuns]);

  // Queries for active run artifacts
  const { data: events = [] } = useRuntimeEventsQuery(activeRun?.id || null);
  const { data: executionGraph } = useExecutionGraphQuery(activeRun?.executionGraphId || activeRun?.agentId || 'graph_lq_v2');
  const { data: checkpoints = [] } = useCheckpointsQuery(activeRun?.id || null);

  // Replay playback timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlayingReplay && events.length > 0) {
      interval = setInterval(() => {
        const current = useRuntimeUIStore.getState().replayStep;
        if (current >= events.length - 1) {
          setIsPlayingReplay(false);
        } else {
          setReplayStep(current + 1);
        }
      }, 1200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingReplay, events.length, setReplayStep, setIsPlayingReplay]);

  // Telemetry Aggregates
  const stats = useMemo(() => {
    const total = runs.length;
    const completed = runs.filter(r => r.status === 'completed').length;
    const approvalReq = runs.filter(r => r.status === 'approval_required' || r.status === 'waiting_for_approval' || r.status === 'pending_approval').length;
    const failed = runs.filter(r => r.status === 'failed').length;
    const cancelled = runs.filter(r => r.status === 'cancelled').length;
    return { total, completed, approvalReq, failed, cancelled };
  }, [runs]);

  // Handlers
  const handleCancelRun = async (runId: string) => {
    await cancelRunMutation.mutateAsync({ runId, reason: 'Operator requested execution cancellation' });
    setToastMessage(`Execution ${runId} marked as Cancelled.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePauseRun = async (runId: string) => {
    await pauseRunMutation.mutateAsync({ runId, reason: 'Operator paused execution' });
    setToastMessage(`Execution ${runId} paused.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResumeRun = async (runId: string) => {
    await resumeRunMutation.mutateAsync(runId);
    setToastMessage(`Execution ${runId} resumed.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRetryRun = async (runId: string) => {
    const newRun = await retryRunMutation.mutateAsync(runId);
    setSelectedRunId(newRun.id);
    setToastMessage(`Retried execution. New run ID: ${newRun.id}.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLaunchExecution = async (e: React.FormEvent) => {
    e.preventDefault();
    const agent = agents.find(a => a.id === launchAgentId) || agents[0];
    if (!agent) return;

    const idempotencyKey = `idemp_manual_${Date.now()}`;
    const newRun = await startRunMutation.mutateAsync({
      idempotencyKey,
      agentId: agent.id,
      agentVersion: agent.activeVersion,
      workflowId: 'wf_inbound_lead_triage',
      executionGraphId: 'graph_lq_v2',
      trigger: 'manual',
      triggerEvent: launchTriggerEvent || 'Manual 1-Click Studio Run',
      context: {
        tenantId: 'tenant_nova_enterprise',
        targetEntityType: launchEntityType,
        targetEntityId: launchEntityId,
        targetEntityName: launchEntityName,
        userRole: 'Sales Ops Lead'
      }
    });

    setIsLaunchModalOpen(false);
    setSelectedRunId(newRun.id);
    setActiveTab('overview');
    setToastMessage(`Dispatched run for ${agent.name} (ID: ${newRun.id}).`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 text-white flex items-center justify-between shadow-xl animate-fade-in fixed bottom-6 right-6 z-50 max-w-md">
          <div className="flex items-center gap-3">
            <IconCheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white p-1">
            <IconX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 mb-1 uppercase tracking-wider">
            <IconZap className="w-4 h-4" />
            <span>AI Agent Runtime & Orchestration Console</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Execution Orchestration Console
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
            Inspect observable execution traces, workflow graphs, procedural skills, capability isolation boundaries, backend policy gates, and time-travel replays.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setPollActive(!pollActive)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
              pollActive 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-300' 
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
            title="Toggle Live Polling (3s)"
          >
            <span className={`w-2 h-2 rounded-full ${pollActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{pollActive ? 'Live Polling Active' : 'Enable Polling'}</span>
          </button>

          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Refresh Execution Logs"
          >
            <IconRefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (agents.length > 0) setLaunchAgentId(agents[0].id);
              setIsLaunchModalOpen(true);
            }}
            disabled={startRunMutation.isPending}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <IconPlay className="w-3.5 h-3.5" />
            <span>{startRunMutation.isPending ? 'Starting...' : 'Trigger Agent Run'}</span>
          </button>
        </div>
      </div>

      {/* Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Runs</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.completed}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approval Required</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.approvalReq}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Policy / Failures</span>
          <div className="text-xl font-black text-red-600 dark:text-red-400 mt-1">{stats.failed}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cancelled</span>
          <div className="text-xl font-black text-slate-600 dark:text-slate-400 mt-1">{stats.cancelled}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
          {['all', 'completed', 'approval_required', 'failed', 'cancelled', 'paused'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Agent:</span>
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">All Agents ({agents.length})</option>
            {agents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2-Column Split: Execution Run Queue & Deep Inspector Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Execution Run Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Execution Logs ({filteredRuns.length})
            </h3>

            {filteredRuns.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No execution logs match the selected filter criteria.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
                {filteredRuns.map((run) => {
                  const isSelected = activeRun?.id === run.id;
                  return (
                    <div
                      key={run.id}
                      onClick={() => setSelectedRunId(run.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/30 ring-2 ring-primary-500/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              run.status === 'completed' ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300' :
                              run.status === 'approval_required' || run.status === 'waiting_for_approval' || run.status === 'pending_approval' ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300' :
                              run.status === 'failed' ? 'bg-red-500/15 text-red-800 dark:text-red-300' :
                              run.status === 'paused' ? 'bg-purple-500/15 text-purple-800 dark:text-purple-300' :
                              'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}>
                              {run.status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {run.agentVersion || 'v1.0'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {run.id}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {run.agentName}
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-xs">
                            {run.targetEntityName || `Target #${run.targetEntityId}`} · {run.triggerEvent}
                          </p>
                        </div>

                        <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">
                          {new Date(run.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Operational Execution Console & Multi-Tab Inspector (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activeRun ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              
              {/* Header Info & Lifecycle State Machine */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                      Execution Run Console
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {activeRun.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Tenant: {activeRun.tenantId || 'tenant_nova_enterprise'}
                    </span>
                    {activeRun.workflowName && (
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                        Workflow: {activeRun.workflowName}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {activeRun.agentName}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Target: <strong className="text-slate-900 dark:text-white">{activeRun.targetEntityName}</strong> ({activeRun.targetEntityType}) · Trigger: {activeRun.triggerEvent}
                  </p>
                </div>

                {/* Status Badge & Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    activeRun.status === 'completed' ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30' :
                    activeRun.status === 'approval_required' || activeRun.status === 'waiting_for_approval' || activeRun.status === 'pending_approval' ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30' :
                    activeRun.status === 'failed' ? 'bg-red-500/15 text-red-800 dark:text-red-300 border border-red-500/30' :
                    activeRun.status === 'paused' ? 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-500/30' :
                    'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {activeRun.status.replace(/_/g, ' ')}
                  </span>

                  {activeRun.status === 'approval_required' && onNavigate && (
                    <button
                      onClick={() => onNavigate('ai_approvals')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <IconShield className="w-3.5 h-3.5" />
                      <span>Review in Approval Center</span>
                    </button>
                  )}

                  {activeRun.status === 'paused' ? (
                    <button
                      onClick={() => handleResumeRun(activeRun.id)}
                      disabled={resumeRunMutation.isPending}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <IconPlay className="w-3.5 h-3.5" />
                      <span>Resume</span>
                    </button>
                  ) : activeRun.status === 'executing' || activeRun.status === 'running' ? (
                    <button
                      onClick={() => handlePauseRun(activeRun.id)}
                      disabled={pauseRunMutation.isPending}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <IconPause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </button>
                  ) : null}

                  {activeRun.isRetryable && (
                    <button
                      onClick={() => handleRetryRun(activeRun.id)}
                      disabled={retryRunMutation.isPending}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <IconRefreshCw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  )}

                  {(activeRun.status === 'approval_required' || activeRun.status === 'waiting_for_approval' || activeRun.status === 'initializing' || activeRun.status === 'paused') && (
                    <button
                      onClick={() => handleCancelRun(activeRun.id)}
                      disabled={cancelRunMutation.isPending}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors"
                    >
                      Cancel Run
                    </button>
                  )}
                </div>
              </div>

              {/* Console Navigation Tabs */}
              <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Execution Trace', icon: IconClock },
                  { id: 'workflow', label: 'Workflow Graph', icon: IconShare2 },
                  { id: 'events', label: `Typed Events (${events.length})`, icon: IconActivity },
                  { id: 'skills', label: 'Skills & Capabilities', icon: IconSparkles },
                  { id: 'policy', label: 'Policy Gate', icon: IconShield },
                  { id: 'replay', label: 'Observable Replay', icon: IconPlay },
                  { id: 'diagnostics', label: 'Diagnostics', icon: IconZap }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as RuntimeConsoleTab)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: OVERVIEW / EXECUTION TRACE */}
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  {/* Progression Strip */}
                  <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Runtime State Machine Progression (PraisonAI State Machine Model)
                    </span>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] font-bold">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                        1. Context Resolved
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                        2. Knowledge Queried
                      </div>
                      <div className={`p-2 rounded-xl border ${
                        activeRun.policyDecision?.allowed 
                          ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-800 dark:text-red-300 border-red-500/20'
                      }`}>
                        3. Policy Check ({activeRun.policyDecision?.policy || 'evaluated'})
                      </div>
                      <div className={`p-2 rounded-xl border ${
                        activeRun.status === 'completed' ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20' :
                        activeRun.status === 'approval_required' || activeRun.status === 'waiting_for_approval' ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20' :
                        activeRun.status === 'failed' ? 'bg-red-500/10 text-red-800 dark:text-red-300 border-red-500/20' :
                        'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}>
                        4. {activeRun.status === 'approval_required' || activeRun.status === 'waiting_for_approval' ? 'Approval Gate' : activeRun.status === 'completed' ? 'Completed' : 'Terminated'}
                      </div>
                    </div>
                  </div>

                  {/* Outcome Summary */}
                  {activeRun.outputSummary && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Execution Outcome</span>
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {activeRun.outputSummary}
                      </p>
                    </div>
                  )}

                  {/* Failure / Error Notice */}
                  {activeRun.error && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-900 dark:text-red-200 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <IconAlertTriangle className="w-4 h-4 text-red-500" />
                        <span>Failure Classification ({activeRun.failureCategory || 'execution_failed'})</span>
                      </div>
                      <p className="text-xs leading-relaxed text-red-700 dark:text-red-300">
                        {activeRun.error}
                      </p>
                    </div>
                  )}

                  {/* Observable Execution Steps Timeline */}
                  <div className="space-y-3">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      Observable Step Timeline ({activeRun.steps.length} Steps)
                    </span>

                    <div className="space-y-2">
                      {activeRun.steps.map((step, idx) => (
                        <div 
                          key={idx} 
                          className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 flex items-start gap-3 text-xs"
                        >
                          <div className="mt-0.5">
                            {step.status === 'success' ? (
                              <IconCheckCircle className="w-4 h-4 text-emerald-500" />
                            ) : step.status === 'waiting_approval' ? (
                              <IconLock className="w-4 h-4 text-amber-500" />
                            ) : (
                              <IconAlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                          </div>

                          <div className="space-y-0.5 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-slate-900 dark:text-white">
                                {step.label}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {step.timestamp}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                              {step.summary}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Parent / Child Run Section */}
                  <ParentChildRunTree
                    currentRun={activeRun}
                    allRuns={runs}
                    onSelectRun={(rId) => setSelectedRunId(rId)}
                  />
                </div>
              )}

              {/* TAB 2: EXECUTION GRAPH (PraisonAI) */}
              {activeTab === 'workflow' && (
                <ExecutionGraphVisualizer
                  graph={executionGraph}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                />
              )}

              {/* TAB 3: TYPED EVENT LOG (DeepSeek Harness) */}
              {activeTab === 'events' && (
                <RuntimeEventLog
                  events={events}
                  selectedEventId={selectedEventId}
                  onSelectEvent={(evtId) => setSelectedEventId(evtId)}
                />
              )}

              {/* TAB 4: PROCEDURAL SKILLS & CAPABILITIES (Hermes & DeepSeek) */}
              {activeTab === 'skills' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-1">
                      Procedural Business Skills & Capability Isolation
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Hermes procedural guidelines execute via DeepSeek-style guarded capability interfaces.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      Associated Procedural Skills
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {skills.map(s => (
                        <div key={s.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">{s.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">{s.version}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{s.description}</p>
                          <div className="text-[10px] font-mono text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 p-2 rounded-xl">
                            {s.instructions}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      Guarded Capability Interfaces
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {capabilities.slice(0, 6).map(cap => (
                        <div key={cap.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <strong className="font-bold text-slate-900 dark:text-white">{cap.key}</strong>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              cap.riskLevel === 'high' ? 'bg-red-500/15 text-red-800 dark:text-red-300' :
                              cap.riskLevel === 'medium' ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300' :
                              'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                            }`}>
                              {cap.riskLevel} risk
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{cap.description}</p>
                          <div className="text-[10px] font-mono text-slate-400">
                            Contract: {cap.inputContract}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: POLICY ENGINE GATE */}
              {activeTab === 'policy' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <IconShield className="w-5 h-5 text-primary-400" />
                      <h3 className="text-sm font-extrabold">Authoritative Backend Policy Evaluation Gate</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Frontend configurations are advisory metadata only. All tenant constraints, human approval triggers, and commercial thresholds are authoritatively evaluated by the backend Policy Engine.
                    </p>
                  </div>

                  {activeRun.policyDecision && (
                    <div className={`p-5 rounded-2xl border space-y-3 ${
                      activeRun.policyDecision.allowed 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-900 dark:text-white' 
                        : 'bg-red-500/10 border-red-500/30 text-slate-900 dark:text-white'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconCheckCircle className="w-5 h-5 text-emerald-500" />
                          <strong className="text-xs font-black">Decision: {activeRun.policyDecision.allowed ? 'PERMITTED' : 'DENIED'}</strong>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">Policy: {activeRun.policyDecision.policy}</span>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                        {activeRun.policyDecision.evaluationSummary}
                      </p>
                      <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between">
                        <span>Evaluated by: {activeRun.policyDecision.evaluatedBy}</span>
                        <span>{activeRun.policyDecision.timestamp}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: TIME-TRAVEL REPLAY (PraisonAI Checkpoints) */}
              {activeTab === 'replay' && (
                <RuntimeReplayController
                  run={activeRun}
                  events={events}
                  checkpoints={checkpoints}
                  replayStep={replayStep}
                  isPlaying={isPlayingReplay}
                  onSetReplayStep={(s) => setReplayStep(s)}
                  onTogglePlay={() => setIsPlayingReplay(!isPlayingReplay)}
                />
              )}

              {/* TAB 7: SUBSYSTEM DIAGNOSTICS */}
              {activeTab === 'diagnostics' && (
                <RuntimeDiagnosticsPanel
                  diagnostics={diagnostics}
                />
              )}

            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              Select an execution run on the left to inspect its telemetry and decision timeline.
            </div>
          )}
        </div>
      </div>

      {/* Manual Launch Execution Modal */}
      {isLaunchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <IconPlay className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Trigger Agent Execution
                  </h3>
                  <p className="text-xs text-slate-500">Dispatch an execution request to the Agent Runtime</p>
                </div>
              </div>
              <button onClick={() => setIsLaunchModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLaunchExecution} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Agent *</label>
                <select
                  value={launchAgentId}
                  onChange={(e) => setLaunchAgentId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                >
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.activeVersion})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Entity Type</label>
                  <select
                    value={launchEntityType}
                    onChange={(e) => setLaunchEntityType(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                  >
                    <option value="lead">Lead</option>
                    <option value="deal">Deal / Opportunity</option>
                    <option value="account">Account</option>
                    <option value="contact">Contact</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Entity ID</label>
                  <input
                    type="text"
                    value={launchEntityId}
                    onChange={(e) => setLaunchEntityId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Record Name</label>
                <input
                  type="text"
                  value={launchEntityName}
                  onChange={(e) => setLaunchEntityName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Trigger Reason / Event</label>
                <input
                  type="text"
                  value={launchTriggerEvent}
                  onChange={(e) => setLaunchTriggerEvent(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLaunchModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={startRunMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <IconPlay className="w-3.5 h-3.5" />
                  <span>{startRunMutation.isPending ? 'Launching...' : 'Launch Execution'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

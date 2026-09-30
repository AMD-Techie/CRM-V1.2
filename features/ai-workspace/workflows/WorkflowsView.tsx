import React, { useState } from 'react';
import { useWorkflowsQuery, useCreateWorkflowMutation, useAgentsQuery } from '../../../hooks';
import { Workflow, RuntimeGuardPolicy } from '../../../types/ai';
import { 
  IconShare2, 
  IconPlus, 
  IconCheckCircle, 
  IconClock, 
  IconShield, 
  IconZap, 
  IconX,
  IconArrowRight,
  IconSparkles,
  IconRefreshCw
} from '../../../components/Icons';

interface WorkflowsViewProps {
  onNavigate?: (view: string, id?: string) => void;
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({ onNavigate }) => {
  const { data: workflows = [], isLoading, refetch } = useWorkflowsQuery();
  const { data: agents = [] } = useAgentsQuery();
  const createWorkflowMutation = useCreateWorkflowMutation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  
  // Create Modal State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('v1.0');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeWorkflow = workflows.find(w => w.id === selectedWorkflowId) || workflows[0];

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createWorkflowMutation.mutateAsync({
      name,
      description,
      version,
      status: 'active',
      executionGraphId: 'graph_lq_v2',
      agentIds: selectedAgentIds.length > 0 ? selectedAgentIds : [agents[0]?.id || 'agent_lead_qualification'],
      triggers: [
        {
          id: `trig_${Date.now()}`,
          type: 'manual',
          name: 'Manual 1-Click Execution',
          description: 'Invoked by CRM operators directly from record context',
          enabled: true
        }
      ],
      guardPolicy: {
        maxIterations: 5,
        maxToolCalls: 10,
        maxDurationSeconds: 60,
        maxChildRuns: 3,
        maxActions: 4,
        duplicateActionDetection: true
      }
    });

    setIsCreateModalOpen(false);
    setName('');
    setDescription('');
    setToastMessage(`Workflow "${name}" created successfully.`);
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
            <IconShare2 className="w-4 h-4" />
            <span>Multi-Agent Workflow Orchestration</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Workflow Pipelines & Execution Graphs
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
            Define multi-agent choreography, conditional routing, parallel execution branches, and runtime guardrails (PraisonAI model).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Refresh Workflows"
          >
            <IconRefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <IconPlus className="w-4 h-4" />
            <span>Create Workflow</span>
          </button>
        </div>
      </div>

      {/* 2-Column Split: Workflows List & Deep Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Workflows List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Active Workflows ({workflows.length})
            </h3>

            <div className="space-y-2.5">
              {workflows.map(wf => {
                const isSelected = activeWorkflow?.id === wf.id;
                return (
                  <div
                    key={wf.id}
                    onClick={() => setSelectedWorkflowId(wf.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/30 ring-2 ring-primary-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900 dark:text-white">{wf.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">{wf.version}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
                          {wf.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {wf.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>{wf.agentIds.length} Agents Assigned</span>
                        <span>{wf.successRate}% Success ({wf.totalExecutions} runs)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Workflow Detail Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeWorkflow ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                      Workflow Pipeline Definition
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{activeWorkflow.id}</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {activeWorkflow.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {activeWorkflow.description}
                  </p>
                </div>

                {onNavigate && (
                  <button
                    onClick={() => onNavigate('ai_runs')}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                  >
                    <IconZap className="w-3.5 h-3.5" />
                    <span>View Runs</span>
                  </button>
                )}
              </div>

              {/* Triggers Section */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Configured Triggers ({activeWorkflow.triggers.length})
                </span>
                <div className="space-y-2">
                  {activeWorkflow.triggers.map((trig, idx) => {
                    const trigObj = typeof trig === 'string' ? { id: `trig_${idx}`, name: trig, description: 'Default trigger rule', type: 'manual' as const, enabled: true } : trig;
                    return (
                      <div key={trigObj.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-start gap-3 text-xs">
                        <IconZap className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 dark:text-white">{trigObj.name}</strong>
                          <p className="text-[11px] text-slate-500 mt-0.5">{trigObj.description}</p>
                          {trigObj.eventType && (
                            <span className="text-[9px] font-mono text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded mt-1 inline-block">
                              Event: {trigObj.eventType}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Guardrails Policy Matrix */}
              <div className="space-y-3">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Runtime Guardrails & Execution Limits
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Max Iterations</span>
                    <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                      {activeWorkflow.guardPolicy.maxIterations || 5}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Max Tool Invocations</span>
                    <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                      {activeWorkflow.guardPolicy.maxToolCalls || 10}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Max Duration (Seconds)</span>
                    <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                      {activeWorkflow.guardPolicy.maxDurationSeconds || 60}s
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              Select a workflow to inspect its configuration.
            </div>
          )}
        </div>
      </div>

      {/* Create Workflow Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <IconShare2 className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Create Orchestrated Workflow
                  </h3>
                  <p className="text-xs text-slate-500">Configure multi-agent coordination pipeline</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Workflow Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Inbound Lead Qualification & AE Handoff"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the workflow's objective and handoff criteria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Participating Agents</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {agents.map(a => (
                    <label key={a.id} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={selectedAgentIds.includes(a.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAgentIds([...selectedAgentIds, a.id]);
                          } else {
                            setSelectedAgentIds(selectedAgentIds.filter(id => id !== a.id));
                          }
                        }}
                        className="rounded accent-primary-500"
                      />
                      <span className="font-bold text-slate-900 dark:text-white">{a.name}</span>
                      <span className="text-[10px] text-slate-400">({a.activeVersion})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createWorkflowMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <IconPlus className="w-3.5 h-3.5" />
                  <span>{createWorkflowMutation.isPending ? 'Creating...' : 'Create Workflow'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

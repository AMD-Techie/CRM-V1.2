import React, { useState, useMemo } from 'react';
import { 
  useAgentsQuery, 
  useUpdateAgentMutation, 
  useDeleteAgentMutation,
  useStartAgentRunMutation, 
  useAIModelsQuery, 
  useAIProvidersQuery 
} from '../../../hooks';
import { AIAgent, AgentCategory } from '../../../types/ai';
import { AgentStudio } from './AgentStudio';
import { CreateAgentModal } from './CreateAgentModal';
import { AgentDetailModal } from './AgentDetailModal';
import { 
  IconSparkles, 
  IconZap, 
  IconShield, 
  IconCheckCircle, 
  IconPlay, 
  IconEdit, 
  IconPlus, 
  IconCheck, 
  IconX, 
  IconLock, 
  IconEye, 
  IconClock, 
  IconChevronRight, 
  IconArrowRight,
  IconDatabase,
  IconUsers,
  IconFilter,
  IconRefreshCw,
  IconAlertTriangle,
  IconCalendar
} from '../../../components/Icons';

interface AgentManagementProps {
  onNavigate?: (view: string, id?: string) => void;
}

export const AgentManagement: React.FC<AgentManagementProps> = ({ onNavigate }) => {
  const { data: agents = [], isLoading, refetch } = useAgentsQuery();
  const updateAgentMutation = useUpdateAgentMutation();
  const deleteAgentMutation = useDeleteAgentMutation();
  const startRunMutation = useStartAgentRunMutation();


  // Studio Mode State
  const [studioAgent, setStudioAgent] = useState<AIAgent | null>(null);
  
  // Modals State
  const [detailModalAgent, setDetailModalAgent] = useState<AIAgent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  // Filtered Agents
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        agent.name.toLowerCase().includes(q) || 
        agent.description.toLowerCase().includes(q) ||
        (agent.tagline && agent.tagline.toLowerCase().includes(q)) ||
        (agent.owner && agent.owner.toLowerCase().includes(q));

      const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || agent.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [agents, searchQuery, selectedCategory, selectedStatus]);

  // Fleet Statistics
  const fleetStats = useMemo(() => {
    const total = agents.length;
    const active = agents.filter(a => a.status === 'active').length;
    const paused = agents.filter(a => a.status === 'paused').length;
    const draft = agents.filter(a => a.status === 'draft').length;
    const totalExecs = agents.reduce((sum, a) => sum + (a.totalExecutions || 0), 0);
    const avgSuccess = total > 0 ? (agents.reduce((sum, a) => sum + (a.successRate || 100), 0) / total).toFixed(1) : '100.0';

    return { total, active, paused, draft, totalExecs, avgSuccess };
  }, [agents]);

  // Handler: Toggle Pause/Active
  const handleToggleStatus = async (agent: AIAgent, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = agent.status === 'active' ? 'paused' : 'active';
    await updateAgentMutation.mutateAsync({
      ...agent,
      status: nextStatus,
      updatedAt: new Date().toISOString()
    });
    setActionNotification(`Agent "${agent.name}" set to ${nextStatus}.`);
    setTimeout(() => setActionNotification(null), 3000);
  };

  // Handler: Quick Test Run
  const handleQuickRun = async (agent: AIAgent, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const idempotencyKey = `idemp_quick_${agent.id}_${Date.now()}`;
    await startRunMutation.mutateAsync({
      idempotencyKey,
      agentId: agent.id,
      agentVersion: agent.activeVersion,
      trigger: 'manual',
      triggerEvent: 'Manual 1-Click Studio Run',
      context: {
        targetEntityType: 'lead',
        targetEntityId: '1',
        targetEntityName: 'Acme Corp',
        tenantId: 'tenant_nova_enterprise'
      }
    });
    setActionNotification(`Triggered test execution for "${agent.name}".`);
    setTimeout(() => setActionNotification(null), 3500);
  };


  // Handler: Delete Agent
  const handleDeleteAgent = async (agent: AIAgent, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete agent "${agent.name}"?`)) {
      await deleteAgentMutation.mutateAsync(agent.id);
      setActionNotification(`Agent "${agent.name}" deleted.`);
      setTimeout(() => setActionNotification(null), 3000);
    }
  };

  // If in Studio Mode, render full Agent Studio
  if (studioAgent) {
    const currentAgentData = agents.find(a => a.id === studioAgent.id) || studioAgent;
    return (
      <AgentStudio
        agent={currentAgentData}
        onClose={() => setStudioAgent(null)}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Action Notification Toast */}
      {actionNotification && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 text-white flex items-center justify-between shadow-xl animate-fade-in fixed bottom-6 right-6 z-50 max-w-md">
          <div className="flex items-center gap-3">
            <IconCheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold">{actionNotification}</span>
          </div>
          <button onClick={() => setActionNotification(null)} className="text-slate-400 hover:text-white p-1">
            <IconX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 mb-1 uppercase tracking-wider">
            <IconSparkles className="w-4 h-4" />
            <span>AI Workspace Fleet Architecture</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            AI Agent Management & Studio
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
            Define, configure, version, publish, and monitor autonomous CRM agents with granular capabilities, trigger rules, and approval governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Refresh Fleet"
          >
            <IconRefreshCw className="w-4 h-4" />
          </button>

          {onNavigate && (
            <button
              onClick={() => onNavigate('ai_agent_runs')}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all flex items-center gap-1.5"
            >
              <IconClock className="w-3.5 h-3.5 text-primary-500" />
              <span>Execution Runs</span>
            </button>
          )}

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <IconPlus className="w-3.5 h-3.5" />
            <span>Create AI Agent</span>
          </button>
        </div>
      </div>

      {/* Fleet Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Agents</span>
            <span className="p-1.5 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400">
              <IconUsers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{fleetStats.total}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">
            {fleetStats.active} Active · {fleetStats.paused} Paused · {fleetStats.draft} Draft
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Fleet</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <IconZap className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{fleetStats.active}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Operational & Subscribed</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Executions</span>
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <IconPlay className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{fleetStats.totalExecs.toLocaleString()}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Autonomous + Staged Runs</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fleet Reliability</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <IconShield className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{fleetStats.avgSuccess}%</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Average SLA Compliance</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents by name, mission, owner, or capability..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            <option value="lead_qualification">Lead Qualification</option>
            <option value="deal_acceleration">Deal Acceleration</option>
            <option value="risk_management">Risk Radar</option>
            <option value="account_expansion">Account Expansion</option>
            <option value="customer_support">Customer Support</option>
            <option value="executive_advisory">Executive Advisory</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="paused">Paused Only</option>
            <option value="draft">Draft Only</option>
          </select>
        </div>
      </div>

      {/* Agents Grid */}
      {filteredAgents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <IconUsers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No AI Agents Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No agents match the selected search criteria. Adjust filters or initialize a new agent using the Agent Studio.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedStatus('all');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => {
            const activeVer = agent.versions.find(v => v.version === agent.activeVersion) || agent.versions[0];
            const hasDraft = agent.versions.some(v => v.status === 'draft');

            return (
              <div
                key={agent.id}
                onClick={() => setStudioAgent(agent)}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-primary-500/60 dark:hover:border-primary-500/60 transition-all duration-200 shadow-xs hover:shadow-lg group flex flex-col justify-between cursor-pointer space-y-4"
              >
                {/* Top Strip */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        agent.status === 'active' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' :
                        agent.status === 'paused' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30' :
                        'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30'
                      }`}>
                        {agent.status}
                      </span>

                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {agent.activeVersion}
                      </span>

                      {hasDraft && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          Draft Pending
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleToggleStatus(agent, e)}
                        className={`p-1.5 rounded-lg border text-xs transition-colors ${
                          agent.status === 'active' 
                            ? 'border-amber-500/30 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30' 
                            : 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                        }`}
                        title={agent.status === 'active' ? 'Pause Agent' : 'Activate Agent'}
                      >
                        {agent.status === 'active' ? <IconClock className="w-3.5 h-3.5" /> : <IconZap className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={(e) => handleDeleteAgent(agent, e)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete Agent"
                      >
                        <IconX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                      {agent.tagline || agent.description}
                    </p>
                  </div>

                  {/* Model & Owner */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="font-mono text-primary-600 dark:text-primary-400 font-bold">{activeVer?.model}</span>
                    <span className="truncate max-w-[140px]">{agent.owner || 'Sales Ops'}</span>
                  </div>

                  {/* Capabilities Tags */}
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 3).map(cap => (
                      <span key={cap} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {cap.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400">
                        +{agent.capabilities.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Stats & Quick Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{agent.totalExecutions.toLocaleString()} Runs</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{agent.successRate}% Success</span>
                    <span>{agent.lastRunAt || 'Never'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleQuickRun(agent, e)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-1.5"
                    >
                      <IconPlay className="w-3 h-3 text-emerald-500" />
                      <span>Run Test</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStudioAgent(agent);
                      }}
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <IconEdit className="w-3 h-3" />
                      <span>Open Studio</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Agent Modal */}
      <CreateAgentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAgentCreated={(newAgent) => {
          setStudioAgent(newAgent);
          setActionNotification(`Agent "${newAgent.name}" created. Opened in Studio.`);
          setTimeout(() => setActionNotification(null), 3500);
        }}
      />

      {/* Detail Inspector Modal */}
      {detailModalAgent && (
        <AgentDetailModal
          agent={detailModalAgent}
          isOpen={Boolean(detailModalAgent)}
          onClose={() => setDetailModalAgent(null)}
          onOpenStudio={(ag) => setStudioAgent(ag)}
          onTriggerRun={(ag) => handleQuickRun(ag)}
        />
      )}
    </div>
  );
};

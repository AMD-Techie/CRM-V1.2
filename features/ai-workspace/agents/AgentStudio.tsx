import React, { useState, useMemo } from 'react';
import { 
  AIAgent, 
  AgentVersion, 
  AgentCapability, 
  ApprovalPolicy, 
  AgentCategory,
  AgentPermissions,
  AgentTriggerConfig,
  AgentActionPolicy
} from '../../../types/ai';
import { 
  useAIModelsQuery, 
  useAIProvidersQuery, 
  useKnowledgeDocsQuery,
  usePublishVersionMutation,
  useCreateDraftVersionMutation,
  useArchiveVersionMutation,
  useUpdateAgentMutation
} from '../../../hooks';
import { useCopilotStore } from '../../../stores/copilotStore';
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
  IconAlertTriangle,
  IconCalendar,
  IconMail,
  IconRefreshCw
} from '../../../components/Icons';

export interface AgentStudioProps {
  agent: AIAgent;
  onClose: () => void;
  onNavigate?: (view: string, id?: string) => void;
}

export type StudioTab = 
  | 'overview' 
  | 'instructions' 
  | 'model' 
  | 'capabilities' 
  | 'knowledge' 
  | 'triggers' 
  | 'policies' 
  | 'versions' 
  | 'comparison';

export const ALL_CAPABILITIES_CONFIG: { 
  id: AgentCapability; 
  label: string; 
  desc: string; 
  category: string;
  defaultTier: 'info_only' | 'staged_actions' | 'direct_execution';
}[] = [
  { id: 'search_leads', label: 'Lead Retrieval & Filtering', desc: 'Scan and filter CRM leads by score, geography, and pipeline stage', category: 'CRM Read', defaultTier: 'info_only' },
  { id: 'read_customer', label: 'Customer Dossier & History', desc: 'Read contact timelines, account revenue, and previous meeting notes', category: 'CRM Read', defaultTier: 'info_only' },
  { id: 'analyze_opportunity', label: 'Pipeline Opportunity Analysis', desc: 'Inspect deal milestones, probability scoring, and stage duration', category: 'Analysis', defaultTier: 'info_only' },
  { id: 'calculate_deal_risk', label: 'Deal Risk & Churn Radar', desc: 'Flag stall probability, competitor involvement, and executive silence', category: 'Analysis', defaultTier: 'staged_actions' },
  { id: 'draft_email', label: 'Draft Personalized Emails', desc: 'Generate high-conversion executive emails citing CRM context', category: 'Outreach Staging', defaultTier: 'staged_actions' },
  { id: 'draft_whatsapp', label: 'Draft WhatsApp Check-ins', desc: 'Format brief mobile outreach messages for quick executive responses', category: 'Outreach Staging', defaultTier: 'staged_actions' },
  { id: 'create_task', label: 'CRM Task & Reminder Dispatch', desc: 'Assign actionable follow-up items with due dates to account owners', category: 'Action Execution', defaultTier: 'staged_actions' },
  { id: 'schedule_meeting', label: 'Meeting Scheduling & Agenda', desc: 'Prepare meeting invites and customer briefing dossiers', category: 'Action Execution', defaultTier: 'staged_actions' },
  { id: 'enrich_company_data', label: 'Firmographic & Tech Enrichment', desc: 'Lookup employee size, annual revenue, and technology stack signals', category: 'Data Operations', defaultTier: 'info_only' },
  { id: 'generate_executive_brief', label: 'Executive Brief Synthesis', desc: 'Summarize account context into 1-page pre-call executive memos', category: 'Synthesis', defaultTier: 'info_only' }
];

export const ALL_ACTION_TYPES_CONFIG: { actionType: string; label: string; defaultPolicy: ApprovalPolicy; defaultRisk: 'high' | 'medium' | 'low' }[] = [
  { actionType: 'send_email', label: 'Outbound Email Dispatch', defaultPolicy: 'always_require', defaultRisk: 'high' },
  { actionType: 'send_whatsapp', label: 'Outbound WhatsApp Dispatch', defaultPolicy: 'always_require', defaultRisk: 'high' },
  { actionType: 'update_stage', label: 'CRM Stage Transition', defaultPolicy: 'require_on_external_comms', defaultRisk: 'medium' },
  { actionType: 'create_task', label: 'Create Follow-up Task', defaultPolicy: 'autonomous', defaultRisk: 'low' },
  { actionType: 'flag_risk', label: 'Flag Deal Risk Score', defaultPolicy: 'autonomous', defaultRisk: 'medium' },
  { actionType: 'generate_brief', label: 'Synthesize Executive Briefing', defaultPolicy: 'autonomous', defaultRisk: 'low' },
  { actionType: 'enrich_data', label: 'Enrich Firmographic Data', defaultPolicy: 'autonomous', defaultRisk: 'low' }
];

export const AgentStudio: React.FC<AgentStudioProps> = ({ agent, onClose, onNavigate }) => {
  const { data: models = [] } = useAIModelsQuery();
  const { data: providers = [] } = useAIProvidersQuery();
  const { data: knowledgeDocs = [] } = useKnowledgeDocsQuery();

  const updateAgentMutation = useUpdateAgentMutation();
  const publishVersionMutation = usePublishVersionMutation();
  const createDraftMutation = useCreateDraftVersionMutation();
  const archiveVersionMutation = useArchiveVersionMutation();
  const openWithContext = useCopilotStore(state => state.openWithContext);

  const [activeTab, setActiveTab] = useState<StudioTab>('overview');

  // Selected Working Version (defaults to active or first draft)
  const [workingVersionNumber, setWorkingVersionNumber] = useState<string>(() => {
    const draft = agent.versions.find(v => v.status === 'draft');
    return draft ? draft.version : agent.activeVersion;
  });

  const workingVersion = useMemo(() => {
    return agent.versions.find(v => v.version === workingVersionNumber) || agent.versions[0];
  }, [agent.versions, workingVersionNumber]);

  const isWorkingOnDraft = workingVersion?.status === 'draft';

  // Compare Version Selection
  const [compareSourceVer, setCompareSourceVer] = useState<string>(agent.activeVersion);
  const [compareTargetVer, setCompareTargetVer] = useState<string>(() => {
    const other = agent.versions.find(v => v.version !== agent.activeVersion);
    return other ? other.version : agent.activeVersion;
  });

  // Working Form State
  const [name, setName] = useState(agent.name);
  const [tagline, setTagline] = useState(agent.tagline);
  const [description, setDescription] = useState(agent.description);
  const [purpose, setPurpose] = useState(workingVersion?.purpose || agent.purpose || '');
  const [category, setCategory] = useState<string>(agent.category || 'lead_qualification');
  const [owner, setOwner] = useState(agent.owner || 'Sales Operations');
  const [instructions, setInstructions] = useState(workingVersion?.instructions || '');
  const [selectedModel, setSelectedModel] = useState(workingVersion?.model || 'gemini-2.5-pro');
  const [capabilities, setCapabilities] = useState<AgentCapability[]>(workingVersion?.capabilities || []);
  const [guardrails, setGuardrails] = useState<string[]>(workingVersion?.guardrails || []);
  const [newGuardrail, setNewGuardrail] = useState('');
  const [knowledgeScope, setKnowledgeScope] = useState<string[]>(workingVersion?.knowledgeScope || []);
  const [approvalPolicy, setApprovalPolicy] = useState<ApprovalPolicy>(workingVersion?.approvalPolicy || 'require_on_external_comms');
  
  const [permissions, setPermissions] = useState<AgentPermissions>(workingVersion?.permissions || {
    read: true,
    create: false,
    update: true,
    delete: false,
    send: false,
    approve: false,
    execute: false,
    accessTier: 'staged_actions'
  });

  const [triggers, setTriggers] = useState<AgentTriggerConfig[]>(() => {
    if (workingVersion?.triggers && workingVersion.triggers.length > 0) {
      return workingVersion.triggers.map((t, idx) => {
        if (typeof t === 'string') {
          return {
            id: `tr_${idx}`,
            type: t.toLowerCase().includes('schedule') ? 'schedule' : t.toLowerCase().includes('manual') ? 'manual' : 'event',
            name: t,
            description: `Configured trigger for ${t}`,
            enabled: true
          };
        }
        return t;
      });
    }
    return [
      { id: 'tr_1', type: 'manual', name: 'Manual 1-Click Trigger', description: 'Rep invokes agent on-demand from CRM dossier', enabled: true },
      { id: 'tr_2', type: 'event', name: 'Lead Created Event', description: 'Triggers upon new lead ingestion', eventType: 'lead_created', enabled: true }
    ];
  });

  const [actionPolicies, setActionPolicies] = useState<AgentActionPolicy[]>(() => {
    if (workingVersion?.actionPolicies && workingVersion.actionPolicies.length > 0) {
      return workingVersion.actionPolicies;
    }
    return ALL_ACTION_TYPES_CONFIG.map(cfg => ({
      actionType: cfg.actionType,
      label: cfg.label,
      policy: cfg.defaultPolicy,
      riskLevel: cfg.defaultRisk
    }));
  });

  const [publishChangelog, setPublishChangelog] = useState('');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  // Sync state when working version changes
  const handleSelectWorkingVersion = (verNum: string) => {
    setWorkingVersionNumber(verNum);
    const v = agent.versions.find(item => item.version === verNum);
    if (v) {
      setInstructions(v.instructions);
      setPurpose(v.purpose || agent.purpose || '');
      setSelectedModel(v.model);
      setCapabilities([...v.capabilities]);
      setGuardrails([...v.guardrails]);
      setKnowledgeScope([...v.knowledgeScope]);
      setApprovalPolicy(v.approvalPolicy);
      if (v.permissions) setPermissions({ ...v.permissions });
    }
  };

  // Validation Checks
  const validationResults = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!name.trim()) errors.push('Agent name is required');
    if (!description.trim()) errors.push('Agent description is required');
    if (!instructions.trim()) errors.push('Operational instructions are required');
    if (!selectedModel) errors.push('An AI model must be selected from the registry');
    if (capabilities.length === 0) errors.push('At least one operational capability must be selected');

    if (guardrails.length === 0) warnings.push('No guardrails defined. It is recommended to establish operational boundaries.');
    if (knowledgeScope.length === 0) warnings.push('No knowledge plane sources associated. Agent will operate with generic model priors only.');
    if (!permissions.read && !permissions.create && !permissions.update) warnings.push('Agent has no CRM read or write permissions.');

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(20, 100 - (errors.length * 30) - (warnings.length * 10))
    };
  }, [name, description, instructions, selectedModel, capabilities, guardrails, knowledgeScope, permissions]);

  const handleSaveDraft = async () => {
    const updatedVersions: AgentVersion[] = agent.versions.map(v => {
      if (v.version === workingVersionNumber) {
        return {
          ...v,
          instructions,
          purpose,
          model: selectedModel,
          capabilities,
          guardrails,
          knowledgeScope,
          approvalPolicy,
          permissions,
          triggers,
          actionPolicies
        };
      }
      return v;
    });

    const updatedAgent: AIAgent = {
      ...agent,
      name,
      tagline,
      description,
      purpose,
      category,
      owner,
      versions: updatedVersions,
      updatedAt: new Date().toISOString()
    };

    await updateAgentMutation.mutateAsync(updatedAgent);
    setSaveBanner('Draft configuration saved successfully!');
    setTimeout(() => setSaveBanner(null), 3000);
  };

  const handleCreateNewDraft = async () => {
    await createDraftMutation.mutateAsync({ agentId: agent.id, baseVersion: workingVersionNumber });
    setSaveBanner('Created new draft version for editing.');
    setTimeout(() => setSaveBanner(null), 3000);
  };

  const handleExecutePublish = async () => {
    if (!validationResults.isValid) return;

    // First save changes to version
    const updatedVersions: AgentVersion[] = agent.versions.map(v => {
      if (v.version === workingVersionNumber) {
        return {
          ...v,
          instructions,
          purpose,
          model: selectedModel,
          capabilities,
          guardrails,
          knowledgeScope,
          approvalPolicy,
          permissions,
          triggers,
          actionPolicies
        };
      }
      return v;
    });

    const updatedAgent: AIAgent = {
      ...agent,
      name,
      tagline,
      description,
      purpose,
      category,
      owner,
      versions: updatedVersions
    };

    await updateAgentMutation.mutateAsync(updatedAgent);
    await publishVersionMutation.mutateAsync({
      agentId: agent.id,
      versionNumber: workingVersionNumber,
      changelog: publishChangelog || 'Published updated configuration in Agent Studio'
    });

    setShowPublishModal(false);
    setPublishChangelog('');
    setSaveBanner(`Version ${workingVersionNumber.replace('-draft', '')} successfully published as active!`);
    setTimeout(() => setSaveBanner(null), 4000);
  };

  const handleAskCopilotForAgent = (prompt: string) => {
    openWithContext(
      {
        route: '/ai_agents',
        viewName: 'Agent Studio',
        entityType: 'general',
        entityName: agent.name
      },
      `${prompt} for the "${agent.name}" (${category.replace(/_/g, ' ')}) agent.`
    );
  };

  // Version Comparison Data
  const sourceVerObj = agent.versions.find(v => v.version === compareSourceVer) || agent.versions[0];
  const targetVerObj = agent.versions.find(v => v.version === compareTargetVer) || agent.versions[1] || agent.versions[0];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Save / Notification Banner */}
      {saveBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <IconCheckCircle className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span className="text-sm font-bold">{saveBanner}</span>
          </div>
          <button onClick={() => setSaveBanner(null)} className="text-emerald-400 hover:text-emerald-200">
            <IconX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Lifecycle Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <span>AI Agents Directory</span>
              <IconChevronRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
              Studio Environment
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              workingVersion?.status === 'published' 
                ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                : workingVersion?.status === 'draft'
                ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                : 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30'
            }`}>
              {workingVersion?.version} ({workingVersion?.status})
            </span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            {name || 'Untitled Agent'}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
            {tagline || description || 'Configure agent operational instructions, capabilities, model assignment, and governance policies.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          
          {/* Version Selector Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2">Version:</span>
            <select
              value={workingVersionNumber}
              onChange={(e) => handleSelectWorkingVersion(e.target.value)}
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 border-0 focus:outline-hidden cursor-pointer"
            >
              {agent.versions.map(v => (
                <option key={v.version} value={v.version}>
                  {v.version} {v.status === 'published' ? '(Active)' : `(${v.status})`}
                </option>
              ))}
            </select>
          </div>

          {/* Create Draft Button */}
          {!isWorkingOnDraft && (
            <button
              onClick={handleCreateNewDraft}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5"
            >
              <IconPlus className="w-3.5 h-3.5" />
              <span>New Draft</span>
            </button>
          )}

          {/* Save Draft */}
          {isWorkingOnDraft && (
            <button
              onClick={handleSaveDraft}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all shadow-xs"
            >
              Save Draft
            </button>
          )}

          {/* Publish Button */}
          {isWorkingOnDraft && (
            <button
              onClick={() => setShowPublishModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white transition-all shadow-md shadow-primary-500/20 flex items-center gap-1.5"
            >
              <IconZap className="w-3.5 h-3.5" />
              <span>Publish {workingVersionNumber.replace('-draft', '')}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Studio Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {[
          { id: 'overview', label: 'Identity & Purpose', icon: IconUsers },
          { id: 'instructions', label: 'Instructions & Guardrails', icon: IconShield },
          { id: 'model', label: 'Model & Provider', icon: IconSparkles },
          { id: 'capabilities', label: 'Capabilities & Permissions', icon: IconZap },
          { id: 'knowledge', label: 'Knowledge Plane', icon: IconDatabase },
          { id: 'triggers', label: 'Trigger Config', icon: IconClock },
          { id: 'policies', label: 'Action Policies', icon: IconLock },
          { id: 'versions', label: `Versions (${agent.versions.length})`, icon: IconEye },
          { id: 'comparison', label: 'Version Diff', icon: IconRefreshCw }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StudioTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-primary-600 text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Studio Working Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Configuration Area (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TAB 1: OVERVIEW & IDENTITY */}
          {activeTab === 'overview' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Agent Identity & Business Purpose
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Define the core operational purpose, assigned category, and ownership responsibility for this agent.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Agent Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isWorkingOnDraft}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={!isWorkingOnDraft}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
                  >
                    <option value="lead_qualification">Lead Qualification</option>
                    <option value="deal_acceleration">Deal Acceleration & Follow-up</option>
                    <option value="risk_management">Risk Radar & Churn Sentinel</option>
                    <option value="account_expansion">Account Expansion</option>
                    <option value="customer_support">Customer Support & SLA</option>
                    <option value="executive_advisory">Executive Advisory & Briefing</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tagline / Mission</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  disabled={!isWorkingOnDraft}
                  placeholder="e.g. Autonomous Inbound Enrichment & Scoring"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!isWorkingOnDraft}
                  placeholder="Detailed description of when and why this agent should run."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Operational Purpose Statement</label>
                <textarea
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  disabled={!isWorkingOnDraft}
                  placeholder="e.g. Automatically enrich, score, and prioritize inbound leads within 60 seconds."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Designated Owner / Team</label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  disabled={!isWorkingOnDraft}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
                />
              </div>
            </div>
          )}

          {/* TAB 2: INSTRUCTIONS & GUARDRAILS */}
          {activeTab === 'instructions' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Instructions & Operational Guardrails
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Define the system persona, reasoning framework, boundary rules, and forbidden behaviors.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">System Persona & Prompt Instructions *</label>
                  <button
                    onClick={() => handleAskCopilotForAgent('Optimize system prompt instructions')}
                    className="text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                  >
                    <IconSparkles className="w-3 h-3" />
                    <span>Copilot Prompt Optimization</span>
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  disabled={!isWorkingOnDraft}
                  placeholder="You are the Lead Qualification Agent. Evaluate company size, ARR tier, technology readiness, and produce concise structured briefs..."
                  className="w-full p-4 font-mono text-xs leading-relaxed rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
                />
              </div>

              {/* Guardrails List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Operational Guardrails & Boundaries ({guardrails.length})</label>
                  <button
                    onClick={() => handleAskCopilotForAgent('Recommend strict guardrails')}
                    className="text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                  >
                    <IconShield className="w-3 h-3" />
                    <span>Suggest Guardrails</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {guardrails.map((gr, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 font-medium">
                      <div className="flex items-center gap-2">
                        <IconShield className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{gr}</span>
                      </div>
                      {isWorkingOnDraft && (
                        <button
                          onClick={() => setGuardrails(guardrails.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        >
                          <IconX className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {isWorkingOnDraft && (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newGuardrail}
                      onChange={(e) => setNewGuardrail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newGuardrail.trim()) {
                            setGuardrails([...guardrails, newGuardrail.trim()]);
                            setNewGuardrail('');
                          }
                        }
                      }}
                      placeholder="e.g. Never update lead status to Disqualified without SDR confirmation"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newGuardrail.trim()) {
                          setGuardrails([...guardrails, newGuardrail.trim()]);
                          setNewGuardrail('');
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      Add Guardrail
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MODEL & PROVIDER REGISTRY */}
          {activeTab === 'model' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Model & Provider Assignment
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Select an AI model definition sourced from the registered model catalog. No provider SDKs are imported into the UI.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {models.map((mod) => {
                  const isSelected = selectedModel === mod.id;
                  const provider = providers.find(p => p.id === mod.providerId);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => isWorkingOnDraft && setSelectedModel(mod.id)}
                      className={`p-4 rounded-2xl border transition-all ${
                        isSelected 
                          ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/30 ring-2 ring-primary-500/20 shadow-xs' 
                          : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/40 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600'
                      } ${isWorkingOnDraft ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{mod.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {provider?.name || mod.providerId}
                          </span>
                        </div>
                        {isSelected && <IconCheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">{mod.tagline || 'High-performance CRM intelligence model'}</p>

                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                          {((mod.contextWindow || 1000000) / 1000).toLocaleString()}k ctx
                        </span>
                        {mod.supportsTools && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
                            Tool Calling
                          </span>
                        )}
                        {mod.supportsStreaming && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-800 dark:text-indigo-300">
                            Streaming
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CAPABILITIES & PERMISSIONS */}
          {activeTab === 'capabilities' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Business Capabilities & CRM Permissions
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Assign business-level functional capabilities and grant operational CRM access boundaries.
                </p>
              </div>

              {/* Business Capabilities */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Operational Capabilities ({capabilities.length} Selected)
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ALL_CAPABILITIES_CONFIG.map((cap) => {
                    const isChecked = capabilities.includes(cap.id);
                    return (
                      <div
                        key={cap.id}
                        onClick={() => {
                          if (!isWorkingOnDraft) return;
                          if (isChecked) {
                            setCapabilities(capabilities.filter(c => c !== cap.id));
                          } else {
                            setCapabilities([...capabilities, cap.id]);
                          }
                        }}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isChecked 
                            ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-950/20' 
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                        } ${isWorkingOnDraft ? 'cursor-pointer' : 'opacity-80'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">{cap.label}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {cap.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{cap.desc}</p>
                          </div>

                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            disabled={!isWorkingOnDraft}
                            className="mt-1 rounded-sm text-primary-600 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Granular Permission Matrix */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Access Tier & CRUD Boundary Configuration
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: 'read', label: 'Read CRM Data', desc: 'Query leads, accounts, deals' },
                    { key: 'create', label: 'Create Records', desc: 'Create tasks, notes, meetings' },
                    { key: 'update', label: 'Update Records', desc: 'Update lead/deal stage' },
                    { key: 'send', label: 'Send Outbound', desc: 'Dispatch emails / WhatsApp' }
                  ].map((perm) => (
                    <div
                      key={perm.key}
                      onClick={() => {
                        if (!isWorkingOnDraft) return;
                        setPermissions({ ...permissions, [perm.key]: !permissions[perm.key as keyof AgentPermissions] });
                      }}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        permissions[perm.key as keyof AgentPermissions]
                          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 text-slate-500'
                      } ${isWorkingOnDraft ? 'cursor-pointer' : 'opacity-80'}`}
                    >
                      <div className="text-xs font-extrabold">{perm.label}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{perm.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: KNOWLEDGE PLANE */}
          {activeTab === 'knowledge' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Knowledge Plane Sources
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Associate existing Knowledge Plane documents (playbooks, pricing matrices, FAQs) with this agent.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {knowledgeDocs.map((doc) => {
                  const isLinked = knowledgeScope.includes(doc.id) || knowledgeScope.includes(doc.category);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => {
                        if (!isWorkingOnDraft) return;
                        const key = doc.category || doc.id;
                        if (isLinked) {
                          setKnowledgeScope(knowledgeScope.filter(k => k !== key && k !== doc.id && k !== doc.category));
                        } else {
                          setKnowledgeScope([...knowledgeScope, key]);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isLinked
                          ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                      } ${isWorkingOnDraft ? 'cursor-pointer' : 'opacity-80'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <IconDatabase className="w-3.5 h-3.5 text-primary-500" />
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{doc.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{doc.description || doc.category}</p>
                        </div>

                        <input
                          type="checkbox"
                          checked={isLinked}
                          onChange={() => {}}
                          disabled={!isWorkingOnDraft}
                          className="mt-1 rounded-sm text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: TRIGGERS */}
          {activeTab === 'triggers' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Trigger Mechanisms & Event Subscriptions
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Configure when and how this agent is triggered (Manual, CRM event, Cron schedule, or Copilot invocation).
                </p>
              </div>

              <div className="space-y-3">
                {triggers.map((tr, idx) => (
                  <div key={tr.id || idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/40 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                          tr.type === 'event' ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' :
                          tr.type === 'schedule' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' :
                          tr.type === 'copilot' ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400' :
                          'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {tr.type}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{tr.name}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{tr.description}</p>
                    </div>

                    <button
                      onClick={() => {
                        if (!isWorkingOnDraft) return;
                        setTriggers(triggers.map((item, i) => i === idx ? { ...item, enabled: !item.enabled } : item));
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        tr.enabled 
                          ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {tr.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: ACTION POLICIES */}
          {activeTab === 'policies' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Action Governance & Approval Policies
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Configure Human-in-the-Loop approval requirements per generated action type.
                </p>
              </div>

              <div className="space-y-3">
                {actionPolicies.map((pol, idx) => (
                  <div key={pol.actionType || idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/40 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{pol.label}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                          pol.riskLevel === 'high' ? 'bg-red-500/15 text-red-700 dark:text-red-400' :
                          pol.riskLevel === 'medium' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400' :
                          'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        }`}>
                          {pol.riskLevel} Risk
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-300">{pol.actionType}</span>
                    </div>

                    <select
                      value={pol.policy}
                      onChange={(e) => {
                        if (!isWorkingOnDraft) return;
                        setActionPolicies(actionPolicies.map((p, i) => i === idx ? { ...p, policy: e.target.value as ApprovalPolicy } : p));
                      }}
                      disabled={!isWorkingOnDraft}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    >
                      <option value="always_require">Always Require Approval (Approval Center)</option>
                      <option value="require_on_external_comms">Require for External Comms</option>
                      <option value="autonomous">Autonomous (Direct Execution)</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: VERSION HISTORY */}
          {activeTab === 'versions' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Agent Version History ({agent.versions.length})
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Explicit versions ensure repeatable behavior. Published versions cannot be silently modified.
                  </p>
                </div>

                {!isWorkingOnDraft && (
                  <button
                    onClick={handleCreateNewDraft}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <IconPlus className="w-3.5 h-3.5" />
                    <span>Create Draft Version</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {agent.versions.map((ver) => {
                  const isActive = ver.version === agent.activeVersion;
                  return (
                    <div
                      key={ver.version}
                      className={`p-4 rounded-2xl border transition-all ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                          : ver.status === 'draft'
                          ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900 dark:text-white">{ver.version}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            ver.status === 'published' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' :
                            ver.status === 'draft' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' :
                            'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}>
                            {ver.status}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">Model: {ver.model}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSelectWorkingVersion(ver.version)}
                            className="px-3 py-1 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            {ver.version === workingVersionNumber ? 'Currently Editing' : 'Load in Studio'}
                          </button>
                        </div>
                      </div>

                      {ver.changelog && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic mb-2">
                          "{ver.changelog}"
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-[11px] text-slate-400">
                        <span>Created: {new Date(ver.createdAt).toLocaleDateString()}</span>
                        {ver.publishedAt && <span>Published: {new Date(ver.publishedAt).toLocaleDateString()}</span>}
                        <span>{ver.capabilities.length} Capabilities</span>
                        <span>{ver.guardrails.length} Guardrails</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 9: VERSION DIFF / COMPARATOR */}
          {activeTab === 'comparison' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Version Difference Comparator
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Inspect business-relevant differences between two distinct versions of this agent.
                </p>
              </div>

              {/* Version Selector Dual Bar */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Source Version (A):</label>
                  <select
                    value={compareSourceVer}
                    onChange={(e) => setCompareSourceVer(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                  >
                    {agent.versions.map(v => <option key={v.version} value={v.version}>{v.version} ({v.status})</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Target Version (B):</label>
                  <select
                    value={compareTargetVer}
                    onChange={(e) => setCompareTargetVer(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                  >
                    {agent.versions.map(v => <option key={v.version} value={v.version}>{v.version} ({v.status})</option>)}
                  </select>
                </div>
              </div>

              {/* Diff Cards Table */}
              <div className="space-y-4">
                {[
                  {
                    field: 'AI Model',
                    source: sourceVerObj?.model,
                    target: targetVerObj?.model,
                    isDiff: sourceVerObj?.model !== targetVerObj?.model
                  },
                  {
                    field: 'Approval Policy',
                    source: sourceVerObj?.approvalPolicy,
                    target: targetVerObj?.approvalPolicy,
                    isDiff: sourceVerObj?.approvalPolicy !== targetVerObj?.approvalPolicy
                  },
                  {
                    field: 'Capabilities',
                    source: sourceVerObj?.capabilities.join(', '),
                    target: targetVerObj?.capabilities.join(', '),
                    isDiff: sourceVerObj?.capabilities.join(',') !== targetVerObj?.capabilities.join(',')
                  },
                  {
                    field: 'Guardrails Count',
                    source: `${sourceVerObj?.guardrails.length} guardrails`,
                    target: `${targetVerObj?.guardrails.length} guardrails`,
                    isDiff: sourceVerObj?.guardrails.length !== targetVerObj?.guardrails.length
                  },
                  {
                    field: 'Knowledge Scope',
                    source: sourceVerObj?.knowledgeScope.join(', ') || 'None',
                    target: targetVerObj?.knowledgeScope.join(', ') || 'None',
                    isDiff: sourceVerObj?.knowledgeScope.join(',') !== targetVerObj?.knowledgeScope.join(',')
                  }
                ].map((diff, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-2xl border ${
                      diff.isDiff 
                        ? 'border-amber-500/50 bg-amber-50/20 dark:bg-amber-950/10' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-800/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">{diff.field}</span>
                      {diff.isDiff && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400">
                          Modified in {compareTargetVer}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 truncate">
                        {diff.source}
                      </div>
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 truncate">
                        {diff.target}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Pre-Publish Validation Checklist & Copilot Assistant (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Validation Checklist Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconShield className="w-4 h-4 text-primary-500" />
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Readiness Checklist
                </h4>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                validationResults.isValid ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-red-500/15 text-red-700 dark:text-red-400'
              }`}>
                {validationResults.score}% Ready
              </span>
            </div>

            <div className="space-y-2.5">
              {[
                { label: 'Identity & Purpose Defined', pass: Boolean(name.trim() && description.trim()) },
                { label: 'Model Registered', pass: Boolean(selectedModel) },
                { label: 'Instructions Configured', pass: Boolean(instructions.trim()) },
                { label: 'Capabilities Selected', pass: capabilities.length > 0 },
                { label: 'Guardrails Formulated', pass: guardrails.length > 0 },
                { label: 'Knowledge Sources Linked', pass: knowledgeScope.length > 0 },
                { label: 'Triggers Activated', pass: triggers.some(t => t.enabled) }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                  {item.pass ? (
                    <IconCheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <IconAlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                </div>
              ))}
            </div>

            {validationResults.errors.length > 0 && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-700 dark:text-red-300 space-y-1">
                {validationResults.errors.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}

            {isWorkingOnDraft && (
              <button
                onClick={() => setShowPublishModal(true)}
                disabled={!validationResults.isValid}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <IconZap className="w-3.5 h-3.5" />
                <span>Publish as Active Version</span>
              </button>
            )}
          </div>

          {/* Copilot Assistant Quick Trigger Card */}
          <div className="p-6 rounded-3xl bg-linear-to-br from-primary-950/30 to-indigo-950/30 border border-primary-500/20 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <IconSparkles className="w-4 h-4 text-primary-400" />
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Copilot Studio Assistant
              </h4>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Use Nova CRM's Universal Copilot to analyze, critique, or generate instructions for this agent.
            </p>

            <div className="space-y-2">
              {[
                'Review agent instructions for ambiguities',
                'Suggest high-priority operational guardrails',
                'Recommend optimal model & capability mix'
              ].map((promptText, i) => (
                <button
                  key={i}
                  onClick={() => handleAskCopilotForAgent(promptText)}
                  className="w-full p-2.5 rounded-xl border border-primary-500/20 bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 text-left text-xs font-medium text-slate-800 dark:text-slate-200 transition-all flex items-center justify-between group"
                >
                  <span>{promptText}</span>
                  <IconArrowRight className="w-3.5 h-3.5 text-primary-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <IconZap className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Publish Agent Version
                </h3>
              </div>
              <button onClick={() => setShowPublishModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Publishing will promote version <strong className="text-slate-900 dark:text-white">{workingVersionNumber}</strong> to <strong className="text-primary-600 dark:text-primary-400">{workingVersionNumber.replace('-draft', '')}</strong> and set it as the active version across all CRM views and triggers.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Version Changelog / Release Note</label>
              <textarea
                rows={3}
                value={publishChangelog}
                onChange={(e) => setPublishChangelog(e.target.value)}
                placeholder="e.g. Added multi-region compliance checks and updated prompt guardrails."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleExecutePublish}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20"
              >
                Confirm & Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

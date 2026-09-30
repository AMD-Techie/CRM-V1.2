import { AIAgent, AgentRun, AgentVersion } from '../types/ai';
import { apiClient } from './client';

export const INITIAL_AGENTS: AIAgent[] = [
  {
    id: 'agent_lead_qual',
    name: 'Lead Qualification Agent',
    tagline: 'Autonomous Inbound Enrichment & Scoring',
    description: 'Analyzes inbound submissions against ideal customer profiles, checks tech stack signals, scores budget-authority-need-timeline, and generates qualification briefs.',
    purpose: 'Automatically enrich, score, and prioritize inbound leads within 60 seconds of submission to maximize conversion velocity.',
    role: 'Lead Intelligence Specialist',
    category: 'lead_qualification',
    owner: 'Alex Chen (Sales Ops)',
    status: 'active',
    activeVersion: 'v2.1',
    versions: [
      {
        version: 'v2.1',
        status: 'published',
        instructions: 'Analyze inbound company revenue, employee count, and website technologies. Grade Fit, Engagement, and Budget on a 100-point scale.',
        purpose: 'Analyze inbound company revenue, employee count, and website technologies.',
        model: 'gemini-2.5-pro',
        capabilities: ['search_leads', 'read_customer', 'enrich_company_data'],
        guardrails: ['Never disqualify leads with annual revenue > $5M without human confirmation', 'Respect GDPR contact preferences'],
        knowledgeScope: ['sales_playbook', 'pricing_matrix'],
        approvalPolicy: 'require_on_external_comms',
        permissions: {
          read: true,
          create: false,
          update: true,
          delete: false,
          send: false,
          approve: false,
          execute: false,
          accessTier: 'staged_actions'
        },
        actionPolicies: [
          { actionType: 'update_stage', label: 'Update Lead Score / Stage', policy: 'autonomous', riskLevel: 'low' },
          { actionType: 'enrich_data', label: 'Enrich Firmographic Data', policy: 'autonomous', riskLevel: 'low' }
        ],
        triggers: [
          { id: 'tr_lead_created', type: 'event', name: 'Lead Created', description: 'Triggers on new CRM lead ingestion', eventType: 'lead_created', enabled: true },
          { id: 'tr_manual_lq', type: 'manual', name: '1-Click Qualify', description: 'Manual invocation from lead dossier', enabled: true }
        ],
        createdAt: '2026-09-01T00:00:00Z',
        publishedAt: '2026-09-10T12:00:00Z',
        changelog: 'Added strict ARR thresholds and competitor detection'
      },
      {
        version: 'v2.2-draft',
        status: 'draft',
        instructions: 'Enhanced multi-region compliance and instant WhatsApp qualification prompt staging.',
        purpose: 'Evaluate multi-region regulatory compliance alongside tech fit.',
        model: 'gemini-3.7-flash',
        capabilities: ['search_leads', 'read_customer', 'draft_whatsapp', 'enrich_company_data'],
        guardrails: ['Never send WhatsApp without explicit user opt-in verified', 'Route international numbers to region lead'],
        knowledgeScope: ['sales_playbook', 'pricing_matrix', 'faq_database'],
        approvalPolicy: 'require_on_external_comms',
        permissions: {
          read: true,
          create: true,
          update: true,
          delete: false,
          send: true,
          approve: false,
          execute: false,
          accessTier: 'staged_actions'
        },
        actionPolicies: [
          { actionType: 'draft_whatsapp', label: 'Stage WhatsApp Qualification', policy: 'always_require', riskLevel: 'high' },
          { actionType: 'update_stage', label: 'Update Lead Stage', policy: 'require_on_external_comms', riskLevel: 'medium' }
        ],
        triggers: [
          { id: 'tr_lead_created', type: 'event', name: 'Lead Created', description: 'Triggers on new CRM lead ingestion', eventType: 'lead_created', enabled: true },
          { id: 'tr_manual_lq', type: 'manual', name: '1-Click Qualify', description: 'Manual invocation from lead dossier', enabled: true }
        ],
        createdAt: '2026-09-25T14:30:00Z'
      }
    ],
    capabilities: ['search_leads', 'read_customer', 'enrich_company_data'],
    triggers: [
      { id: 'tr_lead_created', type: 'event', name: 'Lead Created', description: 'Triggers on new CRM lead ingestion', eventType: 'lead_created', enabled: true },
      { id: 'tr_manual_lq', type: 'manual', name: '1-Click Qualify', description: 'Manual invocation from lead dossier', enabled: true }
    ],
    guardrails: ['Never disqualify leads with annual revenue > $5M without human confirmation', 'Respect GDPR contact preferences'],
    knowledgeScope: ['sales_playbook', 'pricing_matrix'],
    approvalPolicy: 'require_on_external_comms',
    permissions: {
      read: true,
      create: false,
      update: true,
      delete: false,
      send: false,
      approve: false,
      execute: false,
      accessTier: 'staged_actions'
    },
    actionPolicies: [
      { actionType: 'update_stage', label: 'Update Lead Score / Stage', policy: 'autonomous', riskLevel: 'low' },
      { actionType: 'enrich_data', label: 'Enrich Firmographic Data', policy: 'autonomous', riskLevel: 'low' }
    ],
    totalExecutions: 342,
    successRate: 98.2,
    lastRunAt: '12 minutes ago',
    createdAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-09-28T16:00:00Z'
  },
  {
    id: 'agent_sales_followup',
    name: 'Sales Follow-up Agent',
    tagline: 'Stale Lead Recovery & Outreach Staging',
    description: 'Monitors qualified opportunities with > 7 days of inactivity. Drafts hyper-personalized WhatsApp and email outreach citing recent pain points.',
    purpose: 'Identify stalled accounts and stage contextual multi-channel outreach drafts to re-activate deal velocity.',
    role: 'Autonomous Pipeline Copilot',
    category: 'deal_acceleration',
    owner: 'Sarah Connor (Revenue Lead)',
    status: 'active',
    activeVersion: 'v1.4',
    versions: [
      {
        version: 'v1.4',
        status: 'published',
        instructions: 'Identify leads with no recorded calls or meetings in the last 7 calendar days. Synthesize conversation history and prepare structured follow-up drafts.',
        purpose: 'Synthesize conversation history and stage high-touch follow-up outreach.',
        model: 'gemini-2.5-flash',
        capabilities: ['read_customer', 'draft_email', 'draft_whatsapp', 'create_task'],
        guardrails: ['Always route drafted messages to Approval Center before dispatch', 'Limit follow-up frequency to maximum 1 per 5 business days'],
        knowledgeScope: ['sales_playbook', 'product_catalog', 'pricing_matrix'],
        approvalPolicy: 'always_require',
        permissions: {
          read: true,
          create: true,
          update: false,
          delete: false,
          send: true,
          approve: false,
          execute: false,
          accessTier: 'staged_actions'
        },
        actionPolicies: [
          { actionType: 'send_email', label: 'Draft Executive Email', policy: 'always_require', riskLevel: 'high' },
          { actionType: 'send_whatsapp', label: 'Draft WhatsApp Outreach', policy: 'always_require', riskLevel: 'high' },
          { actionType: 'create_task', label: 'Create Follow-up Reminder', policy: 'autonomous', riskLevel: 'low' }
        ],
        triggers: [
          { id: 'tr_inactivity_7d', type: 'event', name: 'Lead Inactive > 7D', description: 'Triggers when opportunity has no touches in 7 days', eventType: 'inactivity_threshold', enabled: true },
          { id: 'tr_sched_morning', type: 'schedule', name: 'Daily Pipeline Scan', description: 'Runs daily at 08:00 AM UTC', scheduleCron: '0 8 * * 1-5', enabled: true }
        ],
        createdAt: '2026-08-20T00:00:00Z',
        publishedAt: '2026-08-22T10:00:00Z'
      }
    ],
    capabilities: ['read_customer', 'draft_email', 'draft_whatsapp', 'create_task'],
    triggers: [
      { id: 'tr_inactivity_7d', type: 'event', name: 'Lead Inactive > 7D', description: 'Triggers when opportunity has no touches in 7 days', eventType: 'inactivity_threshold', enabled: true },
      { id: 'tr_sched_morning', type: 'schedule', name: 'Daily Pipeline Scan', description: 'Runs daily at 08:00 AM UTC', scheduleCron: '0 8 * * 1-5', enabled: true }
    ],
    guardrails: ['Always route drafted messages to Approval Center before dispatch', 'Limit follow-up frequency to maximum 1 per 5 business days'],
    knowledgeScope: ['sales_playbook', 'product_catalog', 'pricing_matrix'],
    approvalPolicy: 'always_require',
    permissions: {
      read: true,
      create: true,
      update: false,
      delete: false,
      send: true,
      approve: false,
      execute: false,
      accessTier: 'staged_actions'
    },
    actionPolicies: [
      { actionType: 'send_email', label: 'Draft Executive Email', policy: 'always_require', riskLevel: 'high' },
      { actionType: 'send_whatsapp', label: 'Draft WhatsApp Outreach', policy: 'always_require', riskLevel: 'high' },
      { actionType: 'create_task', label: 'Create Follow-up Reminder', policy: 'autonomous', riskLevel: 'low' }
    ],
    totalExecutions: 518,
    successRate: 96.5,
    lastRunAt: '24 minutes ago',
    createdAt: '2026-08-20T00:00:00Z',
    updatedAt: '2026-09-29T08:30:00Z'
  },
  {
    id: 'agent_deal_risk',
    name: 'Opportunity Risk Radar',
    tagline: 'Continuous Pipeline Anomaly & Churn Detection',
    description: 'Scans high-value pipeline deals ($50k+) for warning signs: decision maker silence, delayed security reviews, and competitor evaluation.',
    purpose: 'Continuously audit deal milestones, compute churn probability, and stage risk alerts for account leadership.',
    role: 'Revenue Assurance Sentinel',
    category: 'risk_management',
    owner: 'Marcus Vance (VP Sales)',
    status: 'active',
    activeVersion: 'v1.0',
    versions: [
      {
        version: 'v1.0',
        status: 'published',
        instructions: 'Calculate deal risk velocity score based on days in stage, interaction recency, and competitor mentions.',
        purpose: 'Calculate deal risk velocity score based on days in stage and buyer silence.',
        model: 'gemini-2.5-pro',
        capabilities: ['analyze_opportunity', 'calculate_deal_risk', 'create_task'],
        guardrails: ['Do not auto-downgrade probability below 20% without account owner review'],
        knowledgeScope: ['sales_playbook', 'compliance_policy'],
        approvalPolicy: 'autonomous',
        permissions: {
          read: true,
          create: true,
          update: true,
          delete: false,
          send: false,
          approve: false,
          execute: false,
          accessTier: 'staged_actions'
        },
        actionPolicies: [
          { actionType: 'flag_risk', label: 'Flag Deal Risk Score', policy: 'autonomous', riskLevel: 'medium' },
          { actionType: 'create_task', label: 'Assign Mitigation Task', policy: 'autonomous', riskLevel: 'low' }
        ],
        triggers: [
          { id: 'tr_high_deal', type: 'event', name: 'Deal Value > $50k', description: 'Monitors deals above $50k threshold', eventType: 'high_value_detected', enabled: true },
          { id: 'tr_weekly_risk', type: 'schedule', name: 'Weekly Risk Audit', description: 'Runs every Monday at 07:00 AM UTC', scheduleCron: '0 7 * * 1', enabled: true }
        ],
        createdAt: '2026-09-01T00:00:00Z',
        publishedAt: '2026-09-05T08:00:00Z'
      }
    ],
    capabilities: ['analyze_opportunity', 'calculate_deal_risk', 'create_task'],
    triggers: [
      { id: 'tr_high_deal', type: 'event', name: 'Deal Value > $50k', description: 'Monitors deals above $50k threshold', eventType: 'high_value_detected', enabled: true },
      { id: 'tr_weekly_risk', type: 'schedule', name: 'Weekly Risk Audit', description: 'Runs every Monday at 07:00 AM UTC', scheduleCron: '0 7 * * 1', enabled: true }
    ],
    guardrails: ['Do not auto-downgrade probability below 20% without account owner review'],
    knowledgeScope: ['sales_playbook', 'compliance_policy'],
    approvalPolicy: 'autonomous',
    permissions: {
      read: true,
      create: true,
      update: true,
      delete: false,
      send: false,
      approve: false,
      execute: false,
      accessTier: 'staged_actions'
    },
    actionPolicies: [
      { actionType: 'flag_risk', label: 'Flag Deal Risk Score', policy: 'autonomous', riskLevel: 'medium' },
      { actionType: 'create_task', label: 'Assign Mitigation Task', policy: 'autonomous', riskLevel: 'low' }
    ],
    totalExecutions: 215,
    successRate: 99.1,
    lastRunAt: '1 hour ago',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-29T04:15:00Z'
  },
  {
    id: 'agent_meeting_prep',
    name: 'Executive Meeting Preparation Agent',
    tagline: '1-Click Briefings & Stakeholder Intelligence',
    description: 'Compiles comprehensive pre-meeting dossiers 30 minutes before client sessions: attendee LinkedIn profiles, past ticket history, active opportunities, and strategic talking points.',
    purpose: 'Synthesize account CRM history, contact titles, open support tickets, and pricing proposals into a 1-page executive briefing.',
    role: 'Executive Briefing Specialist',
    category: 'executive_advisory',
    owner: 'Elena Rostova (Executive Enablement)',
    status: 'active',
    activeVersion: 'v2.0',
    versions: [
      {
        version: 'v2.0',
        status: 'published',
        instructions: 'Synthesize account CRM history, contact titles, open support tickets, and pricing proposals into a 1-page executive briefing.',
        purpose: 'Assemble compact executive briefing dossiers for upcoming client sessions.',
        model: 'gemini-3.7-flash',
        capabilities: ['read_customer', 'analyze_opportunity', 'generate_executive_brief'],
        guardrails: ['Keep briefing strictly under 400 words for rapid scanning'],
        knowledgeScope: ['product_catalog', 'faq_database'],
        approvalPolicy: 'autonomous',
        permissions: {
          read: true,
          create: false,
          update: false,
          delete: false,
          send: false,
          approve: false,
          execute: false,
          accessTier: 'info_only'
        },
        actionPolicies: [
          { actionType: 'generate_brief', label: 'Synthesize Executive Briefing', policy: 'autonomous', riskLevel: 'low' }
        ],
        triggers: [
          { id: 'tr_meeting_t30', type: 'event', name: 'Meeting T-30m', description: 'Triggers 30 mins before scheduled meetings', eventType: 'meeting_completed', enabled: true },
          { id: 'tr_copilot_call', type: 'copilot', name: 'Universal Copilot Call', description: 'Invoked on-demand by rep in Copilot dock', enabled: true }
        ],
        createdAt: '2026-09-12T00:00:00Z',
        publishedAt: '2026-09-15T09:00:00Z'
      }
    ],
    capabilities: ['read_customer', 'analyze_opportunity', 'generate_executive_brief'],
    triggers: [
      { id: 'tr_meeting_t30', type: 'event', name: 'Meeting T-30m', description: 'Triggers 30 mins before scheduled meetings', eventType: 'meeting_completed', enabled: true },
      { id: 'tr_copilot_call', type: 'copilot', name: 'Universal Copilot Call', description: 'Invoked on-demand by rep in Copilot dock', enabled: true }
    ],
    guardrails: ['Keep briefing strictly under 400 words for rapid scanning'],
    knowledgeScope: ['product_catalog', 'faq_database'],
    approvalPolicy: 'autonomous',
    permissions: {
      read: true,
      create: false,
      update: false,
      delete: false,
      send: false,
      approve: false,
      execute: false,
      accessTier: 'info_only'
    },
    actionPolicies: [
      { actionType: 'generate_brief', label: 'Synthesize Executive Briefing', policy: 'autonomous', riskLevel: 'low' }
    ],
    totalExecutions: 189,
    successRate: 100.0,
    lastRunAt: '3 hours ago',
    createdAt: '2026-09-12T00:00:00Z',
    updatedAt: '2026-09-28T19:00:00Z'
  }
];

export const INITIAL_AGENT_RUNS: AgentRun[] = [
  {
    id: 'run_8819',
    agentId: 'agent_sales_followup',
    agentName: 'Sales Follow-up Agent',
    status: 'pending_approval',
    triggerEvent: 'Lead Inactivity > 7 Days',
    targetEntityType: 'lead',
    targetEntityId: '1',
    targetEntityName: 'SkyNet Systems (Sarah Connor)',
    startedAt: '10:42 AM · Today',
    durationMs: 3450,
    steps: [
      {
        stepNumber: 1,
        timestamp: '10:42:01 AM',
        type: 'trigger',
        label: 'Inactivity SLA Trigger Fired',
        summary: 'Detected 9 days since last recorded contact on qualified lead #1 (SkyNet Systems).',
        status: 'success'
      },
      {
        stepNumber: 2,
        timestamp: '10:42:02 AM',
        type: 'context_retrieval',
        label: 'Retrieved CRM Account & Lead Profile',
        summary: 'Ingested Lead fit score (85/100), previous call notes, and deal potential ($50,000 ARR).',
        status: 'success'
      },
      {
        stepNumber: 3,
        timestamp: '10:42:03 AM',
        type: 'knowledge_lookup',
        label: 'Consulted Enterprise Sales Playbook',
        summary: 'Matched objection playbook: "AI Security & Procurement Verification".',
        status: 'success'
      },
      {
        stepNumber: 4,
        timestamp: '10:42:03 AM',
        type: 'analysis',
        label: 'Evaluated Next Best Action',
        summary: 'Recommendation: Dispatch executive check-in message referencing security whitepaper.',
        status: 'success'
      },
      {
        stepNumber: 5,
        timestamp: '10:42:04 AM',
        type: 'tool_call',
        label: 'Synthesized Personalized Message Payload',
        summary: 'Generated customized follow-up draft targeted to CTO Sarah Connor.',
        status: 'success'
      },
      {
        stepNumber: 6,
        timestamp: '10:42:04 AM',
        type: 'approval_request',
        label: 'Human-in-the-Loop Gate Enforced',
        summary: 'Action routed to AI Approval Center. Awaiting human confirmation before dispatch.',
        status: 'waiting_approval'
      }
    ],
    outputSummary: 'Drafted high-priority follow-up communication. Pending manager/rep approval.',
    actionId: 'act_followup_skynet'
  },
  {
    id: 'run_8818',
    agentId: 'agent_lead_qual',
    agentName: 'Lead Qualification Agent',
    status: 'completed',
    triggerEvent: 'Inbound Webhook · Acme Corp',
    targetEntityType: 'lead',
    targetEntityId: '2',
    targetEntityName: 'Acme Corp (John Smith)',
    startedAt: '09:15 AM · Today',
    completedAt: '09:15 AM · Today',
    durationMs: 1820,
    steps: [
      {
        stepNumber: 1,
        timestamp: '09:15:00 AM',
        type: 'trigger',
        label: 'New Lead Ingestion',
        summary: 'Webhook received for Manufacturing lead with 250 employees.',
        status: 'success'
      },
      {
        stepNumber: 2,
        timestamp: '09:15:01 AM',
        type: 'analysis',
        label: 'Calculated ICP Fit Score',
        summary: 'Scored 60/100: High company stability, medium technology readiness.',
        status: 'success'
      },
      {
        stepNumber: 3,
        timestamp: '09:15:01 AM',
        type: 'execution',
        label: 'Updated Lead Record',
        summary: 'Assigned Priority: Medium (Score 60). Assigned account owner Alex Chen.',
        status: 'success'
      }
    ],
    outputSummary: 'Lead enriched and tagged. Priority assigned to Medium.'
  },
  {
    id: 'run_8817',
    agentId: 'agent_deal_risk',
    agentName: 'Opportunity Risk Radar',
    status: 'completed',
    triggerEvent: 'Weekly Risk Audit',
    targetEntityType: 'deal',
    targetEntityId: 'd3',
    targetEntityName: 'Cloud Migration ($200,000)',
    startedAt: '08:00 AM · Today',
    completedAt: '08:00 AM · Today',
    durationMs: 2400,
    steps: [
      {
        stepNumber: 1,
        timestamp: '08:00:00 AM',
        type: 'trigger',
        label: 'High-Value Opportunity Audit',
        summary: 'Evaluated Soylent Corp ($200k) currently in Value Proposition stage.',
        status: 'success'
      },
      {
        stepNumber: 2,
        timestamp: '08:00:01 AM',
        type: 'analysis',
        label: 'Calculated Risk Factor: Stagnation',
        summary: 'Detected 45 days in current stage with zero logged customer calls this month.',
        status: 'success'
      },
      {
        stepNumber: 3,
        timestamp: '08:00:02 AM',
        type: 'execution',
        label: 'Created Deal Alert & Mitigation Task',
        summary: 'Generated high-priority task: "Executive Sponsor Touchpoint - Soylent Corp".',
        status: 'success'
      }
    ],
    outputSummary: 'Flagged deal as High Risk. Created mitigation task for account team.'
  }
];

export const agentsApi = {
  async getAgents(): Promise<AIAgent[]> {
    const saved = localStorage.getItem('nova_ai_agents');
    const local = saved ? JSON.parse(saved) : INITIAL_AGENTS;
    return apiClient.get<AIAgent[]>('/ai/agents', local);
  },

  async getAgentById(id: string): Promise<AIAgent | undefined> {
    const agents = await agentsApi.getAgents();
    return agents.find(a => a.id === id);
  },

  async createAgent(newAgentData: Omit<AIAgent, 'id' | 'totalExecutions' | 'successRate' | 'createdAt' | 'updatedAt'>): Promise<AIAgent> {
    const agents = await agentsApi.getAgents();
    const newId = `agent_${Date.now()}`;
    const now = new Date().toISOString();

    const createdAgent: AIAgent = {
      ...newAgentData,
      id: newId,
      totalExecutions: 0,
      successRate: 100,
      createdAt: now,
      updatedAt: now
    };

    const updated = [createdAgent, ...agents];
    localStorage.setItem('nova_ai_agents', JSON.stringify(updated));
    return apiClient.post<AIAgent>('/ai/agents', createdAgent, createdAgent);
  },

  async updateAgent(agent: AIAgent): Promise<AIAgent> {
    const agents = await agentsApi.getAgents();
    const updated = agents.map(a => a.id === agent.id ? { ...agent, updatedAt: new Date().toISOString() } : a);
    localStorage.setItem('nova_ai_agents', JSON.stringify(updated));
    return apiClient.put<AIAgent>(`/ai/agents/${agent.id}`, agent, agent);
  },

  async deleteAgent(id: string): Promise<boolean> {
    const agents = await agentsApi.getAgents();
    const updated = agents.filter(a => a.id !== id);
    localStorage.setItem('nova_ai_agents', JSON.stringify(updated));
    await apiClient.delete<boolean>(`/ai/agents/${id}`, true);
    return true;
  },

  async createDraftVersion(agentId: string, baseVersionNumber?: string): Promise<AIAgent> {
    const agent = await agentsApi.getAgentById(agentId);
    if (!agent) throw new Error('Agent not found');

    const baseVer = agent.versions.find(v => v.version === (baseVersionNumber || agent.activeVersion)) || agent.versions[0];
    
    // Compute next version number (e.g., v2.2-draft)
    const existingDraft = agent.versions.find(v => v.status === 'draft');
    if (existingDraft) {
      return agent; // Return existing draft
    }

    const versionNumParts = (baseVer?.version || 'v1.0').replace('v', '').split('.');
    const major = parseInt(versionNumParts[0] || '1', 10);
    const minor = parseInt(versionNumParts[1] || '0', 10) + 1;
    const nextDraftVersionName = `v${major}.${minor}-draft`;

    const newDraft: AgentVersion = {
      ...baseVer,
      version: nextDraftVersionName,
      status: 'draft',
      createdAt: new Date().toISOString(),
      publishedAt: undefined,
      changelog: undefined
    };

    const updatedAgent: AIAgent = {
      ...agent,
      versions: [...agent.versions, newDraft],
      updatedAt: new Date().toISOString()
    };

    return agentsApi.updateAgent(updatedAgent);
  },

  async publishVersion(agentId: string, versionNumber: string, changelog?: string): Promise<AIAgent> {
    const agent = await agentsApi.getAgentById(agentId);
    if (!agent) throw new Error('Agent not found');

    const targetVersion = agent.versions.find(v => v.version === versionNumber);
    if (!targetVersion) throw new Error('Version not found');

    const publishedVersionName = versionNumber.replace('-draft', '');
    const now = new Date().toISOString();

    const updatedVersions: AgentVersion[] = agent.versions.map(v => {
      if (v.version === versionNumber) {
        return {
          ...v,
          version: publishedVersionName,
          status: 'published' as const,
          publishedAt: now,
          changelog: changelog || v.changelog || 'Published updated agent version'
        };
      }
      if (v.status === 'published') {
        return {
          ...v,
          status: 'archived' as const
        };
      }
      return v;
    });

    const updatedAgent: AIAgent = {
      ...agent,
      activeVersion: publishedVersionName,
      status: 'active',
      capabilities: targetVersion.capabilities,
      guardrails: targetVersion.guardrails,
      knowledgeScope: targetVersion.knowledgeScope,
      approvalPolicy: targetVersion.approvalPolicy,
      permissions: targetVersion.permissions,
      triggers: targetVersion.triggers || agent.triggers,
      actionPolicies: targetVersion.actionPolicies || agent.actionPolicies,
      versions: updatedVersions,
      updatedAt: now
    };

    return agentsApi.updateAgent(updatedAgent);
  },

  async archiveVersion(agentId: string, versionNumber: string): Promise<AIAgent> {
    const agent = await agentsApi.getAgentById(agentId);
    if (!agent) throw new Error('Agent not found');

    const updatedVersions = agent.versions.map(v => {
      if (v.version === versionNumber) {
        return { ...v, status: 'archived' as const };
      }
      return v;
    });

    const updatedAgent: AIAgent = {
      ...agent,
      versions: updatedVersions,
      updatedAt: new Date().toISOString()
    };

    return agentsApi.updateAgent(updatedAgent);
  },

  async getAgentRuns(): Promise<AgentRun[]> {
    const saved = localStorage.getItem('nova_ai_agent_runs');
    const local = saved ? JSON.parse(saved) : INITIAL_AGENT_RUNS;
    return apiClient.get<AgentRun[]>('/ai/runs', local);
  },

  async triggerAgentRun(agentId: string, entityType: string, entityId: string, triggerEvent?: string): Promise<AgentRun> {
    const agents = await agentsApi.getAgents();
    const targetAgent = agents.find(a => a.id === agentId) || agents[0];
    
    const newRun: AgentRun = {
      id: `run_${Date.now().toString().slice(-4)}`,
      agentId: targetAgent.id,
      agentName: targetAgent.name,
      status: 'completed',
      triggerEvent: triggerEvent || 'Manual 1-Click Trigger',
      targetEntityType: entityType as any,
      targetEntityId: entityId,
      targetEntityName: `Target Record #${entityId}`,
      startedAt: 'Just now',
      completedAt: 'Just now',
      durationMs: 1650,
      steps: [
        {
          stepNumber: 1,
          timestamp: 'Just now',
          type: 'trigger',
          label: 'Execution Trigger Fired',
          summary: `${triggerEvent || 'User triggered'} ${targetAgent.name} on ${entityType} #${entityId}.`,
          status: 'success'
        },
        {
          stepNumber: 2,
          timestamp: 'Just now',
          type: 'context_retrieval',
          label: 'Retrieved Entity Context & History',
          summary: 'Loaded CRM timeline, interaction logs, and customer metadata.',
          status: 'success'
        },
        {
          stepNumber: 3,
          timestamp: 'Just now',
          type: 'knowledge_lookup',
          label: 'Consulted Associated Knowledge Scope',
          summary: `Queried knowledge sources: ${targetAgent.knowledgeScope.join(', ')}.`,
          status: 'success'
        },
        {
          stepNumber: 4,
          timestamp: 'Just now',
          type: 'analysis',
          label: 'Synthesized Intelligence & Strategy',
          summary: 'Evaluated next optimal steps and updated recommendations.',
          status: 'success'
        }
      ],
      outputSummary: 'Execution finished successfully with updated next best actions.'
    };

    const currentRuns = await agentsApi.getAgentRuns();
    const updated = [newRun, ...currentRuns];
    localStorage.setItem('nova_ai_agent_runs', JSON.stringify(updated));
    return newRun;
  }
};


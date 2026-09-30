import { RuntimeEvent } from '../types/ai';
import { apiClient } from './client';

export const INITIAL_RUNTIME_EVENTS: Record<string, RuntimeEvent[]> = {
  'run_lq_9082': [
    {
      id: 'evt_01',
      runId: 'run_lq_9082',
      sequence: 1,
      timestamp: '10:30:00.120',
      type: 'AgentRunCreated',
      agentId: 'agent_lead_qualification',
      agentVersion: 'v2.1',
      trigger: 'crm_event'
    },
    {
      id: 'evt_02',
      runId: 'run_lq_9082',
      sequence: 2,
      timestamp: '10:30:00.450',
      type: 'ContextResolved',
      entityType: 'lead',
      entityId: '1',
      entityName: 'Acme Corp (Sarah Jenkins)',
      sourceCount: 3
    },
    {
      id: 'evt_03',
      runId: 'run_lq_9082',
      sequence: 3,
      timestamp: '10:30:01.020',
      type: 'WorkflowCompiled',
      workflowId: 'wf_inbound_lead_triage',
      graphId: 'graph_lq_v2',
      nodeCount: 6
    },
    {
      id: 'evt_04',
      runId: 'run_lq_9082',
      sequence: 4,
      timestamp: '10:30:01.200',
      nodeId: 'node_context_fetch',
      type: 'NodeStarted',
      nodeName: 'Resolve Lead Dossier',
      nodeType: 'skill'
    },
    {
      id: 'evt_05',
      runId: 'run_lq_9082',
      sequence: 5,
      timestamp: '10:30:01.890',
      type: 'SkillDiscovered',
      skillId: 'skill_lead_qualification',
      skillName: 'Lead Qualification & Scoring Playbook'
    },
    {
      id: 'evt_06',
      runId: 'run_lq_9082',
      sequence: 6,
      timestamp: '10:30:02.110',
      type: 'SkillSelected',
      skillId: 'skill_lead_qualification',
      skillName: 'Lead Qualification & Scoring Playbook',
      reason: 'Matched inbound lead context with B2B SaaS qualification rules'
    },
    {
      id: 'evt_07',
      runId: 'run_lq_9082',
      sequence: 7,
      timestamp: '10:30:02.340',
      type: 'SkillLoaded',
      skillId: 'skill_lead_qualification',
      capabilityCount: 3
    },
    {
      id: 'evt_08',
      runId: 'run_lq_9082',
      sequence: 8,
      timestamp: '10:30:02.600',
      type: 'KnowledgeRetrieved',
      documentCount: 2,
      sourceNames: ['Sales Playbook 2026', 'ICP Qualification Matrix']
    },
    {
      id: 'evt_09',
      runId: 'run_lq_9082',
      sequence: 9,
      timestamp: '10:30:02.950',
      type: 'CapabilityResolved',
      capabilityKey: 'CRM.ReadLead',
      riskLevel: 'low',
      requiresApproval: false
    },
    {
      id: 'evt_10',
      runId: 'run_lq_9082',
      sequence: 10,
      timestamp: '10:30:03.210',
      type: 'ModelSelected',
      modelId: 'gemini-3.7-flash',
      providerId: 'google-vertex',
      temperature: 0.2
    },
    {
      id: 'evt_11',
      runId: 'run_lq_9082',
      sequence: 11,
      timestamp: '10:30:03.680',
      type: 'PolicyEvaluated',
      decision: 'allow',
      policyCode: 'POL_AUTONOMOUS_ENRICHMENT',
      summary: 'Internal stage update and score calculation permitted under autonomous policy'
    },
    {
      id: 'evt_12',
      runId: 'run_lq_9082',
      sequence: 12,
      timestamp: '10:30:04.100',
      type: 'ActionPrepared',
      actionId: 'act_lead_wa_01',
      actionType: 'update_stage',
      headline: 'Advance Acme Corp to Qualified stage (Score: 85/100)'
    },
    {
      id: 'evt_13',
      runId: 'run_lq_9082',
      sequence: 13,
      timestamp: '10:30:04.500',
      nodeId: 'node_context_fetch',
      type: 'NodeCompleted',
      nodeName: 'Resolve Lead Dossier',
      status: 'completed',
      durationMs: 3300
    },
    {
      id: 'evt_14',
      runId: 'run_lq_9082',
      sequence: 14,
      timestamp: '10:30:04.800',
      type: 'CheckpointCreated',
      checkpointId: 'chk_9082_1'
    },
    {
      id: 'evt_15',
      runId: 'run_lq_9082',
      sequence: 15,
      timestamp: '10:30:05.100',
      type: 'ActionExecutionStarted',
      actionId: 'act_lead_wa_01',
      actionType: 'update_stage'
    },
    {
      id: 'evt_16',
      runId: 'run_lq_9082',
      sequence: 16,
      timestamp: '10:30:05.900',
      type: 'ActionExecutionCompleted',
      actionId: 'act_lead_wa_01',
      status: 'executed'
    },
    {
      id: 'evt_17',
      runId: 'run_lq_9082',
      sequence: 17,
      timestamp: '10:30:06.420',
      type: 'AgentRunCompleted',
      durationMs: 6420,
      outputSummary: 'Successfully qualified Acme Corp (Score: 85/100, Tier 1 High Priority). Stage advanced to "Qualified".'
    }
  ],
  'run_fu_9083': [
    {
      id: 'evt_fu_01',
      runId: 'run_fu_9083',
      sequence: 1,
      timestamp: '10:45:00.050',
      type: 'AgentRunCreated',
      agentId: 'agent_sales_followup',
      agentVersion: 'v1.4',
      trigger: 'manual'
    },
    {
      id: 'evt_fu_02',
      runId: 'run_fu_9083',
      sequence: 2,
      timestamp: '10:45:00.320',
      type: 'ContextResolved',
      entityType: 'lead',
      entityId: '2',
      entityName: 'Global Logistics (Michael Chang)',
      sourceCount: 4
    },
    {
      id: 'evt_fu_03',
      runId: 'run_fu_9083',
      sequence: 3,
      timestamp: '10:45:00.700',
      type: 'WorkflowCompiled',
      workflowId: 'wf_deal_acceleration',
      graphId: 'graph_followup_v1',
      nodeCount: 5
    },
    {
      id: 'evt_fu_04',
      runId: 'run_fu_9083',
      sequence: 4,
      timestamp: '10:45:01.100',
      type: 'SkillDiscovered',
      skillId: 'skill_executive_followup',
      skillName: 'Enterprise Follow-Up Cadence'
    },
    {
      id: 'evt_fu_05',
      runId: 'run_fu_9083',
      sequence: 5,
      timestamp: '10:45:01.500',
      type: 'SkillSelected',
      skillId: 'skill_executive_followup',
      skillName: 'Enterprise Follow-Up Cadence',
      reason: 'Lead inactivity duration exceeded 7 business days'
    },
    {
      id: 'evt_fu_06',
      runId: 'run_fu_9083',
      sequence: 6,
      timestamp: '10:45:02.100',
      type: 'CapabilityResolved',
      capabilityKey: 'Email.Draft',
      riskLevel: 'medium',
      requiresApproval: true
    },
    {
      id: 'evt_fu_07',
      runId: 'run_fu_9083',
      sequence: 7,
      timestamp: '10:45:02.800',
      type: 'PolicyEvaluated',
      decision: 'approval_required',
      policyCode: 'POL_HUMAN_IN_THE_LOOP_COMMS',
      summary: 'Outbound customer communications strictly require human authorization before dispatch'
    },
    {
      id: 'evt_fu_08',
      runId: 'run_fu_9083',
      sequence: 8,
      timestamp: '10:45:03.400',
      type: 'ActionPrepared',
      actionId: 'act_lead_wa_02',
      actionType: 'send_email',
      headline: 'Executive follow-up to Michael Chang citing SOC2 compliance brief'
    },
    {
      id: 'evt_fu_09',
      runId: 'run_fu_9083',
      sequence: 9,
      timestamp: '10:45:04.000',
      type: 'ApprovalRequested',
      approvalId: 'appr_01',
      actionId: 'act_lead_wa_02',
      urgency: 'high'
    },
    {
      id: 'evt_fu_10',
      runId: 'run_fu_9083',
      sequence: 10,
      timestamp: '10:45:04.180',
      type: 'CheckpointCreated',
      checkpointId: 'chk_9083_approval_gate'
    }
  ]
};

export const runtimeEventsApi = {
  /**
   * Retrieves all ordered runtime events for a specific execution run
   */
  async getEventsByRunId(runId: string): Promise<RuntimeEvent[]> {
    const saved = localStorage.getItem(`nova_runtime_events_${runId}`);
    if (saved) {
      return apiClient.get<RuntimeEvent[]>(`/ai/runtime/runs/${runId}/events`, JSON.parse(saved));
    }

    const defaultEvents = INITIAL_RUNTIME_EVENTS[runId] || [
      {
        id: `evt_${Date.now()}_1`,
        runId,
        sequence: 1,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'AgentRunCreated',
        agentId: 'agent_generic',
        agentVersion: 'v1.0',
        trigger: 'manual'
      },
      {
        id: `evt_${Date.now()}_2`,
        runId,
        sequence: 2,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'ContextResolved',
        entityType: 'lead',
        entityId: '1',
        entityName: 'Target Entity',
        sourceCount: 2
      },
      {
        id: `evt_${Date.now()}_3`,
        runId,
        sequence: 3,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'PolicyEvaluated',
        decision: 'allow',
        policyCode: 'POL_STANDARD_EXECUTION',
        summary: 'Execution permitted under standard tenant boundary'
      },
      {
        id: `evt_${Date.now()}_4`,
        runId,
        sequence: 4,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'AgentRunCompleted',
        durationMs: 3200,
        outputSummary: 'Execution completed successfully'
      }
    ];

    return apiClient.get<RuntimeEvent[]>(`/ai/runtime/runs/${runId}/events`, defaultEvents);
  },

  /**
   * Appends a new typed runtime event
   */
  async appendEvent(runId: string, event: Record<string, unknown> & { type: string; runId: string; timestamp: string }): Promise<RuntimeEvent> {
    const existing = await runtimeEventsApi.getEventsByRunId(runId);
    const newEvent = {
      ...event,
      id: `evt_${Date.now()}_${existing.length + 1}`,
      sequence: existing.length + 1
    } as RuntimeEvent;

    const updated = [...existing, newEvent];
    localStorage.setItem(`nova_runtime_events_${runId}`, JSON.stringify(updated));
    return apiClient.post<RuntimeEvent>(`/ai/runtime/runs/${runId}/events`, newEvent, newEvent);
  }
};

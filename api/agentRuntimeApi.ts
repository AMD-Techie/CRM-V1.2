import { 
  AgentRun, 
  AgentExecutionRequest, 
  AgentExecutionStep, 
  AgentRunStatus, 
  AIAction, 
  ApprovalItem
} from '../types/ai';
import { apiClient } from './client';
import { agentsApi } from './agentsApi';
import { actionsApi } from './actionsApi';
import { approvalsApi } from './approvalsApi';
import { runtimeEventsApi } from './runtimeEventsApi';
import { checkpointsApi } from './checkpointsApi';

const STORAGE_KEY = 'nova_ai_agent_runs';

export const INITIAL_RUNTIME_RUNS: AgentRun[] = [
  {
    id: 'run_lq_9082',
    idempotencyKey: 'idemp_lead_created_1',
    agentId: 'agent_lead_qualification',
    agentName: 'Lead Qualification Agent',
    agentVersion: 'v2.1',
    agentVersionId: 'agent_lead_qualification_v2.1',
    workflowId: 'wf_inbound_lead_triage',
    workflowName: 'Inbound Lead Qualification & Handoff Pipeline',
    executionGraphId: 'graph_lq_v2',
    tenantId: 'tenant_nova_enterprise',
    status: 'completed',
    trigger: 'crm_event',
    triggerEvent: 'CRM Event: Lead Ingested',
    targetEntityType: 'lead',
    targetEntityId: '1',
    targetEntityName: 'Acme Corp (Sarah Jenkins)',
    startedAt: '2026-09-30T10:30:00Z',
    completedAt: '2026-09-30T10:30:06Z',
    durationMs: 6420,
    steps: [
      {
        stepNumber: 1,
        timestamp: '10:30:00',
        type: 'trigger',
        label: 'Inbound Webhook Trigger Received',
        summary: 'Detected new inbound submission for Acme Corp via Marketing Campaign #4.',
        status: 'success'
      },
      {
        stepNumber: 2,
        timestamp: '10:30:01',
        type: 'context_retrieval',
        label: 'Resolved Lead Dossier Context',
        summary: 'Loaded contact email, job title (VP Engineering), and company domain data.',
        status: 'success'
      },
      {
        stepNumber: 3,
        timestamp: '10:30:02',
        type: 'knowledge_lookup',
        label: 'Knowledge Plane Queried',
        summary: 'Retrieved qualification benchmarks from Sales Playbook and ICP Matrix.',
        status: 'success'
      },
      {
        stepNumber: 4,
        timestamp: '10:30:03',
        type: 'policy_evaluation',
        label: 'Backend Policy Evaluated',
        summary: 'Evaluated tenant permissions and capability boundaries. Status: Allowed (autonomous stage update).',
        status: 'success'
      },
      {
        stepNumber: 5,
        timestamp: '10:30:04',
        type: 'planning',
        label: 'Formulated Lead Score Strategy',
        summary: 'Computed qualification score of 85/100 based on employee count (250+) and ARR match.',
        status: 'success'
      },
      {
        stepNumber: 6,
        timestamp: '10:30:05',
        type: 'action_preparation',
        label: 'Prepared Stage Transition Payload',
        summary: 'Generated stage transition action payload to advance lead to "Qualified".',
        status: 'success'
      },
      {
        stepNumber: 7,
        timestamp: '10:30:06',
        type: 'execution',
        label: 'Execution Confirmed',
        summary: 'Lead qualification dossier saved and assigned to Alex Chen for follow-up.',
        status: 'success'
      }
    ],
    outputSummary: 'Successfully qualified Acme Corp (Score: 85/100, Tier 1 High Priority). Stage advanced to "Qualified".',
    result: {
      summary: 'Successfully qualified Acme Corp (Score: 85/100, Tier 1 High Priority). Stage advanced to "Qualified".',
      actionIds: ['act_lead_wa_01'],
      confidenceScore: 94,
      executedAt: '2026-09-30T10:30:06Z'
    },
    actionId: 'act_lead_wa_01',
    requiresApproval: false,
    policyDecision: {
      allowed: true,
      policy: 'autonomous',
      riskLevel: 'low',
      evaluationSummary: 'Internal stage update permitted under autonomous execution tier.',
      evaluatedBy: 'authoritative_policy_engine',
      timestamp: '2026-09-30T10:30:03Z'
    },
    checkpointIds: ['chk_9082_1', 'chk_9082_2']
  },
  {
    id: 'run_fu_9083',
    idempotencyKey: 'idemp_manual_followup_2',
    agentId: 'agent_sales_followup',
    agentName: 'Sales Follow-up Agent',
    agentVersion: 'v1.4',
    agentVersionId: 'agent_sales_followup_v1.4',
    workflowId: 'wf_deal_acceleration',
    workflowName: 'Enterprise Opportunity Stagnation & Outreach Suite',
    executionGraphId: 'graph_followup_v1',
    tenantId: 'tenant_nova_enterprise',
    status: 'approval_required',
    trigger: 'manual',
    triggerEvent: 'Manual 1-Click Trigger',
    targetEntityType: 'lead',
    targetEntityId: '2',
    targetEntityName: 'Global Logistics (Michael Chang)',
    startedAt: '2026-09-30T10:45:00Z',
    durationMs: 4180,
    steps: [
      {
        stepNumber: 1,
        timestamp: '10:45:00',
        type: 'trigger',
        label: 'Manual Execution Triggered',
        summary: 'Account executive initiated follow-up staging on Global Logistics.',
        status: 'success'
      },
      {
        stepNumber: 2,
        timestamp: '10:45:01',
        type: 'context_retrieval',
        label: 'Retrieved Activity Timeline',
        summary: 'Identified 8 days since last contact following SOC2 compliance discussion.',
        status: 'success'
      },
      {
        stepNumber: 3,
        timestamp: '10:45:02',
        type: 'knowledge_lookup',
        label: 'Consulted Security & Pricing Matrix',
        summary: 'Retrieved SOC2 summary points and enterprise deployment milestones.',
        status: 'success'
      },
      {
        stepNumber: 4,
        timestamp: '10:45:03',
        type: 'policy_evaluation',
        label: 'Backend Policy Evaluated',
        summary: 'Outbound email dispatch requires explicit Human-in-the-Loop review.',
        status: 'success'
      },
      {
        stepNumber: 5,
        timestamp: '10:45:04',
        type: 'approval_request',
        label: 'Routed to Approval Center',
        summary: 'Staged personalized executive outreach awaiting representative sign-off in Approval Center.',
        status: 'waiting_approval'
      }
    ],
    outputSummary: 'Staged executive email and WhatsApp draft citing SOC2 compliance. Awaiting authorization in Approval Center.',
    actionId: 'act_lead_wa_02',
    requiresApproval: true,
    policyDecision: {
      allowed: true,
      policy: 'always_require',
      riskLevel: 'high',
      evaluationSummary: 'Outbound customer communications strictly require human authorization before dispatch.',
      evaluatedBy: 'authoritative_policy_engine',
      timestamp: '2026-09-30T10:45:03Z'
    },
    checkpointIds: ['chk_9083_approval_gate']
  },
  {
    id: 'run_rr_9084',
    idempotencyKey: 'idemp_sched_radar_3',
    agentId: 'agent_risk_radar',
    agentName: 'Opportunity Risk Radar',
    agentVersion: 'v1.0',
    tenantId: 'tenant_nova_enterprise',
    status: 'failed',
    trigger: 'scheduled',
    triggerEvent: 'Scheduled Cron: Weekly Pipeline Audit',
    targetEntityType: 'deal',
    targetEntityId: 'deal_99',
    targetEntityName: 'Apex Cloud Systems ($120,000)',
    startedAt: '2026-09-30T07:00:00Z',
    completedAt: '2026-09-30T07:00:05Z',
    durationMs: 5120,
    steps: [
      {
        stepNumber: 1,
        timestamp: '07:00:00',
        type: 'trigger',
        label: 'Scheduled Execution Triggered',
        summary: 'Cron job invoked high-value deal pipeline audit.',
        status: 'success'
      },
      {
        stepNumber: 2,
        timestamp: '07:00:01',
        type: 'context_retrieval',
        label: 'Context Retrieval',
        summary: 'Loaded opportunity milestones and competitor mentions.',
        status: 'success'
      },
      {
        stepNumber: 3,
        timestamp: '07:00:04',
        type: 'policy_evaluation',
        label: 'Policy Evaluation Blocked',
        summary: 'Policy Engine rejected automated deal value modification without executive role.',
        status: 'failed'
      }
    ],
    outputSummary: 'Execution terminated: Automated deal value modification was blocked by Policy Engine.',
    error: 'Policy Denied: Agent does not possess authorization to modify commercial deal values above $100k threshold.',
    failureCategory: 'policy_denied',
    failure: {
      category: 'policy_denied',
      message: 'Agent does not possess authorization to modify commercial deal values above $100k threshold.',
      isRetryable: false,
      timestamp: '2026-09-30T07:00:04Z'
    },
    isRetryable: false,
    retryCount: 0,
    policyDecision: {
      allowed: false,
      policy: 'always_require',
      riskLevel: 'high',
      evaluationSummary: 'Policy restriction: Commercial terms above $100,000 require VP Sales credential level.',
      evaluatedBy: 'authoritative_policy_engine',
      timestamp: '2026-09-30T07:00:04Z'
    }
  }
];

export const agentRuntimeApi = {
  /**
   * Retrieves all logged agent execution runs
   */
  async listAgentRuns(filters?: { agentId?: string; status?: string; targetEntityType?: string; workflowId?: string }): Promise<AgentRun[]> {
    const saved = localStorage.getItem(STORAGE_KEY);
    let runs: AgentRun[] = saved ? JSON.parse(saved) : INITIAL_RUNTIME_RUNS;

    if (filters) {
      if (filters.agentId && filters.agentId !== 'all') {
        runs = runs.filter(r => r.agentId === filters.agentId);
      }
      if (filters.status && filters.status !== 'all') {
        runs = runs.filter(r => r.status === filters.status);
      }
      if (filters.targetEntityType && filters.targetEntityType !== 'all') {
        runs = runs.filter(r => r.targetEntityType === filters.targetEntityType);
      }
      if (filters.workflowId && filters.workflowId !== 'all') {
        runs = runs.filter(r => r.workflowId === filters.workflowId);
      }
    }

    return apiClient.get<AgentRun[]>('/ai/agent-runtime/runs', runs);
  },

  /**
   * Retrieves a single agent run by ID
   */
  async getAgentRun(runId: string): Promise<AgentRun | undefined> {
    const runs = await agentRuntimeApi.listAgentRuns();
    return runs.find(r => r.id === runId);
  },

  /**
   * Starts a new Agent Execution with Idempotency Protection
   */
  async startAgentRun(request: AgentExecutionRequest): Promise<AgentRun> {
    const existingRuns = await agentRuntimeApi.listAgentRuns();

    // Idempotency check: prevent duplicate submissions
    if (request.idempotencyKey) {
      const existing = existingRuns.find(r => r.idempotencyKey === request.idempotencyKey);
      if (existing) {
        return existing;
      }
    }

    const agents = await agentsApi.getAgents();
    const targetAgent = agents.find(a => a.id === request.agentId) || agents[0];
    const targetVersion = request.agentVersion || targetAgent?.activeVersion || 'v1.0';

    const now = new Date();
    const runId = `run_${Date.now()}`;
    const timestampStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Determine governance policy based on agent configuration
    const approvalPolicy = targetAgent.approvalPolicy || 'require_on_external_comms';
    const isLeadOutreach = targetAgent.capabilities.includes('draft_email') || targetAgent.capabilities.includes('draft_whatsapp');
    const requiresApproval = approvalPolicy === 'always_require' || (approvalPolicy === 'require_on_external_comms' && isLeadOutreach);

    const targetEntityName = request.context.targetEntityName || `Target Record #${request.context.targetEntityId || '1'}`;
    const targetEntityType = request.context.targetEntityType || 'lead';
    const targetEntityId = request.context.targetEntityId || '1';

    const initialSteps: AgentExecutionStep[] = [
      {
        stepNumber: 1,
        timestamp: timestampStr,
        type: 'trigger',
        label: `Execution Trigger Fired (${request.trigger})`,
        summary: `${request.triggerEvent || 'User invocation'} dispatched for ${targetAgent.name} on ${targetEntityType} "${targetEntityName}".`,
        status: 'success'
      },
      {
        stepNumber: 2,
        timestamp: timestampStr,
        type: 'context_retrieval',
        label: 'Resolved Operational CRM Context',
        summary: `Retrieved record details for ${targetEntityType} #${targetEntityId} (${targetEntityName}).`,
        status: 'success'
      },
      {
        stepNumber: 3,
        timestamp: timestampStr,
        type: 'knowledge_lookup',
        label: 'Consulted Associated Knowledge Scope',
        summary: `Retrieved domain guidelines from: ${targetAgent.knowledgeScope.join(', ') || 'CRM Knowledge'}.`,
        status: 'success'
      },
      {
        stepNumber: 4,
        timestamp: timestampStr,
        type: 'policy_evaluation',
        label: 'Authoritative Backend Policy Evaluation',
        summary: `Policy check: ${requiresApproval ? 'Action requires human approval before external dispatch.' : 'Permitted under autonomous execution boundary.'}`,
        status: 'success'
      },
      {
        stepNumber: 5,
        timestamp: timestampStr,
        type: 'planning',
        label: 'Formulated Operational Recommendations',
        summary: `Synthesized intelligence for ${targetEntityName} based on prompt and CRM history.`,
        status: 'success'
      }
    ];

    let finalStatus: AgentRunStatus = 'completed';
    let outputSummary = `Successfully synthesized actionable recommendations for ${targetEntityName}.`;
    let createdActionId: string | undefined;

    if (requiresApproval) {
      finalStatus = 'approval_required';
      outputSummary = `Prepared high-impact action draft for ${targetEntityName}. Awaiting confirmation in the Approval Center.`;
      
      initialSteps.push({
        stepNumber: 6,
        timestamp: timestampStr,
        type: 'approval_request',
        label: 'Routed Action to Approval Center',
        summary: `Action requires human-in-the-loop authorization. Dispatched to Approval Center for review.`,
        status: 'waiting_approval'
      });

      // Create structured AIAction in actionsApi
      const actionPayload: Omit<AIAction, 'id' | 'createdAt'> = {
        agentId: targetAgent.id,
        agentName: targetAgent.name,
        entityType: targetEntityType as any,
        entityId: targetEntityId,
        entityTitle: targetEntityName,
        status: 'approval_required',
        headline: `Follow-up Outreach Draft for ${targetEntityName}`,
        rationale: `Generated by ${targetAgent.name} (${targetVersion}) following trigger: ${request.triggerEvent || request.trigger}.`,
        payload: {
          actionType: isLeadOutreach ? 'send_email' : 'create_task',
          recipientName: targetEntityName,
          content: `Hi ${targetEntityName} team, following up on our recent CRM milestone review...`
        },
        requiresApproval: true
      };

      const createdAction = await actionsApi.createAction(actionPayload);
      createdActionId = createdAction.id;

      // Stage in Approval Center
      await approvalsApi.submitApprovalItem({
        actionId: createdAction.id,
        agentId: targetAgent.id,
        agentName: targetAgent.name,
        category: 'email_outreach',
        title: `Authorize Outreach for ${targetEntityName}`,
        description: `Generated by ${targetAgent.name} (${targetVersion}) under governance policy "${approvalPolicy}".`,
        targetEntity: {
          type: targetEntityType as any,
          id: targetEntityId,
          name: targetEntityName
        },
        proposedPayload: {
          type: 'email_outreach',
          subject: `Follow-up from ${request.context.userRole || 'Sales Rep'}`,
          body: `Hi ${targetEntityName}, hope you are doing well. Reaching out to confirm next steps...`
        },
        status: 'pending',
        urgency: 'high'
      });
    } else {
      initialSteps.push({
        stepNumber: 6,
        timestamp: timestampStr,
        type: 'action_preparation',
        label: 'Autonomous Action Executed',
        summary: `Executed permitted internal record update without approval delay.`,
        status: 'success'
      });
    }

    const newRun: AgentRun = {
      id: runId,
      idempotencyKey: request.idempotencyKey,
      agentId: targetAgent.id,
      agentName: targetAgent.name,
      agentVersion: targetVersion,
      agentVersionId: `${targetAgent.id}_${targetVersion}`,
      workflowId: request.workflowId || 'wf_inbound_lead_triage',
      executionGraphId: request.executionGraphId || 'graph_lq_v2',
      parentRunId: request.parentRunId,
      tenantId: request.context.tenantId || 'tenant_nova_enterprise',
      status: finalStatus,
      trigger: request.trigger,
      triggerEvent: request.triggerEvent || `Triggered via ${request.trigger}`,
      targetEntityType,
      targetEntityId,
      targetEntityName,
      selectedEntityIds: request.context.selectedEntityIds,
      context: request.context,
      startedAt: now.toISOString(),
      completedAt: requiresApproval ? undefined : new Date(now.getTime() + 4500).toISOString(),
      durationMs: 4500,
      steps: initialSteps,
      outputSummary,
      result: {
        summary: outputSummary,
        actionIds: createdActionId ? [createdActionId] : [],
        confidenceScore: 92,
        executedAt: now.toISOString()
      },
      actionId: createdActionId,
      requiresApproval,
      policyDecision: {
        allowed: true,
        policy: approvalPolicy,
        riskLevel: requiresApproval ? 'high' : 'low',
        evaluationSummary: requiresApproval 
          ? 'External outreach requires human approval under organization security baseline.' 
          : 'Internal action permitted under autonomous tier.',
        evaluatedBy: 'authoritative_policy_engine',
        timestamp: now.toISOString()
      },
      input: request.input
    };

    const updated = [newRun, ...existingRuns];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Record initial runtime event
    await runtimeEventsApi.appendEvent(runId, {
      runId,
      sequence: 1,
      timestamp: timestampStr,
      type: 'AgentRunCreated',
      agentId: targetAgent.id,
      agentVersion: targetVersion,
      trigger: request.trigger as string
    });

    // Create durable checkpoint
    await checkpointsApi.createCheckpoint(runId, 'node_context_fetch', 'Resolve Lead Context', 'Context resolved and policy evaluated');

    return apiClient.post<AgentRun>('/ai/agent-runtime/runs', request, newRun);
  },

  /**
   * Pauses an active agent run
   */
  async pauseAgentRun(runId: string, reason?: string): Promise<AgentRun> {
    const runs = await agentRuntimeApi.listAgentRuns();
    const run = runs.find(r => r.id === runId);
    if (!run) throw new Error('Agent run not found');

    const updatedRun: AgentRun = {
      ...run,
      status: 'paused'
    };

    const updated = runs.map(r => r.id === runId ? updatedRun : r);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    await runtimeEventsApi.appendEvent(runId, {
      runId,
      sequence: run.steps.length + 1,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'AgentRunPaused',
      reason
    });

    return apiClient.put<AgentRun>(`/ai/agent-runtime/runs/${runId}/pause`, { reason }, updatedRun);
  },

  /**
   * Resumes a paused agent run
   */
  async resumeAgentRun(runId: string): Promise<AgentRun> {
    const runs = await agentRuntimeApi.listAgentRuns();
    const run = runs.find(r => r.id === runId);
    if (!run) throw new Error('Agent run not found');

    const updatedRun: AgentRun = {
      ...run,
      status: 'executing'
    };

    const updated = runs.map(r => r.id === runId ? updatedRun : r);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    await runtimeEventsApi.appendEvent(runId, {
      runId,
      sequence: run.steps.length + 1,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'AgentRunResumed'
    });

    return apiClient.put<AgentRun>(`/ai/agent-runtime/runs/${runId}/resume`, {}, updatedRun);
  },

  /**
   * Cancels an active or waiting agent execution run
   */
  async cancelAgentRun(runId: string, reason?: string): Promise<AgentRun> {
    const runs = await agentRuntimeApi.listAgentRuns();
    const run = runs.find(r => r.id === runId);
    if (!run) throw new Error('Agent run not found');

    const now = new Date();
    const updatedRun: AgentRun = {
      ...run,
      status: 'cancelled',
      completedAt: now.toISOString(),
      error: reason || 'Execution cancelled by user request.',
      failureCategory: 'cancelled',
      isRetryable: true,
      steps: [
        ...run.steps,
        {
          stepNumber: run.steps.length + 1,
          timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'execution',
          label: 'Execution Cancelled',
          summary: reason || 'Operator issued execution cancellation order.',
          status: 'failed'
        }
      ]
    };

    const updated = runs.map(r => r.id === runId ? updatedRun : r);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    await runtimeEventsApi.appendEvent(runId, {
      runId,
      sequence: updatedRun.steps.length,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'AgentRunCancelled',
      reason
    });

    return apiClient.put<AgentRun>(`/ai/agent-runtime/runs/${runId}/cancel`, { reason }, updatedRun);
  },

  /**
   * Retries a retryable failed or cancelled agent run
   */
  async retryAgentRun(runId: string): Promise<AgentRun> {
    const runs = await agentRuntimeApi.listAgentRuns();
    const run = runs.find(r => r.id === runId);
    if (!run) throw new Error('Agent run not found');

    const request: AgentExecutionRequest = {
      idempotencyKey: `retry_${run.id}_${Date.now()}`,
      agentId: run.agentId,
      agentVersion: run.agentVersion,
      workflowId: run.workflowId,
      executionGraphId: run.executionGraphId,
      trigger: 'manual',
      triggerEvent: `Retry of run ${run.id}`,
      context: {
        targetEntityType: run.targetEntityType,
        targetEntityId: run.targetEntityId,
        targetEntityName: run.targetEntityName,
        tenantId: run.tenantId
      },
      input: run.input
    };

    return agentRuntimeApi.startAgentRun(request);
  },

  /**
   * Retrieves observable execution steps for an agent run
   */
  async getAgentExecutionSteps(runId: string): Promise<AgentExecutionStep[]> {
    const run = await agentRuntimeApi.getAgentRun(runId);
    return run?.steps || [];
  }
};

export const agentRunsApi = agentRuntimeApi;

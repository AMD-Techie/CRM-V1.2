import { ExecutionGraph, ExecutionNode } from '../types/ai';
import { apiClient } from './client';

export const INITIAL_EXECUTION_GRAPHS: ExecutionGraph[] = [
  {
    id: 'graph_lq_v2',
    name: 'Lead Qualification & Ingest Graph',
    description: 'Autonomous enrichment pipeline with conditional score branching and automatic assignment',
    agentVersionId: 'agent_lead_qualification_v2.1',
    workflowId: 'wf_inbound_lead_triage',
    version: 'v2.1',
    entryNodeId: 'node_context_fetch',
    createdAt: '2026-09-15T00:00:00Z',
    updatedAt: '2026-09-30T10:00:00Z',
    nodes: [
      {
        id: 'node_context_fetch',
        type: 'skill',
        name: 'Context Resolution & Dossier Assembly',
        description: 'Pulls contact details, company firmographics, and tech stack signals',
        status: 'completed',
        skillId: 'skill_lead_qualification',
        skillName: 'Lead Qualification & Scoring Playbook',
        capabilityId: 'cap_crm_read_lead',
        nextNodeIds: ['node_knowledge_eval']
      },
      {
        id: 'node_knowledge_eval',
        type: 'skill',
        name: 'Knowledge Plane Benchmark Scoring',
        description: 'Evaluates ICP criteria, company ARR range, and compliance requirements',
        status: 'completed',
        skillId: 'skill_lead_qualification',
        skillName: 'Lead Qualification & Scoring Playbook',
        capabilityId: 'cap_knowledge_search',
        nextNodeIds: ['node_condition_score']
      },
      {
        id: 'node_condition_score',
        type: 'condition',
        name: 'Score Threshold Evaluation (Score >= 75)',
        description: 'Branches based on whether lead meets high-value enterprise qualification bar',
        status: 'completed',
        conditionExpression: 'context.score >= 75',
        nextNodeIds: ['node_parallel_enrichment', 'node_nurture_routing']
      },
      {
        id: 'node_parallel_enrichment',
        type: 'parallel',
        name: 'Parallel High-Priority Orchestration',
        description: 'Simultaneously stages CRM stage transition and notifies account team',
        status: 'completed',
        parallelBranchNodeIds: ['node_action_stage_update', 'node_create_rep_task'],
        nextNodeIds: ['node_handoff_ae']
      },
      {
        id: 'node_action_stage_update',
        type: 'action',
        name: 'Advance Stage to "Qualified"',
        description: 'Dispatches CRM lead status update payload',
        status: 'completed',
        capabilityId: 'cap_crm_update_lead',
        actionType: 'update_stage'
      },
      {
        id: 'node_create_rep_task',
        type: 'action',
        name: 'Create Priority Outreach Task',
        description: 'Assigns follow-up SLA task to designated Sales Rep',
        status: 'completed',
        capabilityId: 'cap_crm_create_task',
        actionType: 'create_task'
      },
      {
        id: 'node_handoff_ae',
        type: 'handoff',
        name: 'Handoff to Sales Follow-up Agent',
        description: 'Delegates qualified record to executive follow-up specialist',
        status: 'completed',
        targetAgentId: 'agent_sales_followup',
        targetAgentName: 'Sales Follow-up Agent'
      },
      {
        id: 'node_nurture_routing',
        type: 'action',
        name: 'Route to Marketing Nurture Campaign',
        description: 'Flags lead for automated content drip sequencing',
        status: 'skipped',
        capabilityId: 'cap_crm_update_lead',
        actionType: 'update_stage'
      }
    ]
  },
  {
    id: 'graph_followup_v1',
    name: 'Executive Follow-Up & Human-in-the-Loop Graph',
    description: 'Generates personalized executive communications and pauses for human approval',
    agentVersionId: 'agent_sales_followup_v1.4',
    workflowId: 'wf_deal_acceleration',
    version: 'v1.4',
    entryNodeId: 'node_inactivity_audit',
    createdAt: '2026-09-18T00:00:00Z',
    updatedAt: '2026-09-30T10:00:00Z',
    nodes: [
      {
        id: 'node_inactivity_audit',
        type: 'skill',
        name: 'Inactivity & Engagement Audit',
        description: 'Checks days since last contact and open deal milestones',
        status: 'completed',
        skillId: 'skill_executive_followup',
        skillName: 'Enterprise Follow-Up Cadence',
        capabilityId: 'cap_crm_read_lead',
        nextNodeIds: ['node_draft_outreach']
      },
      {
        id: 'node_draft_outreach',
        type: 'skill',
        name: 'Synthesize Tailored Outreach Draft',
        description: 'Generates personalized email citing security and architecture collateral',
        status: 'completed',
        skillId: 'skill_executive_followup',
        capabilityId: 'cap_email_draft',
        nextNodeIds: ['node_human_approval_gate']
      },
      {
        id: 'node_human_approval_gate',
        type: 'approval',
        name: 'Human-in-the-Loop Signoff Gate',
        description: 'Pauses execution until Sales Rep confirms or modifies the communication draft',
        status: 'waiting_for_approval',
        capabilityId: 'cap_email_send',
        actionType: 'send_email',
        nextNodeIds: ['node_dispatch_comms']
      },
      {
        id: 'node_dispatch_comms',
        type: 'action',
        name: 'Dispatch Approved Communication',
        description: 'Sends authorized email via corporate communication provider',
        status: 'pending',
        capabilityId: 'cap_email_send',
        actionType: 'send_email'
      }
    ]
  }
];

export const executionGraphsApi = {
  async getExecutionGraphs(): Promise<ExecutionGraph[]> {
    const saved = localStorage.getItem('nova_execution_graphs');
    const local = saved ? JSON.parse(saved) : INITIAL_EXECUTION_GRAPHS;
    return apiClient.get<ExecutionGraph[]>('/ai/runtime/execution-graphs', local);
  },

  async getExecutionGraphById(id: string): Promise<ExecutionGraph | null> {
    const graphs = await executionGraphsApi.getExecutionGraphs();
    const found = graphs.find(g => 
      g.id === id || 
      g.agentVersionId === id || 
      g.workflowId === id ||
      g.id.includes(id) ||
      (id.includes('qual') && g.id.includes('lq')) ||
      (id.includes('lead') && g.id.includes('lq')) ||
      (id.includes('follow') && g.id.includes('followup'))
    );
    const result = found || graphs[0] || null;
    const res = await apiClient.get<ExecutionGraph | null>(`/ai/runtime/execution-graphs/${id}`, result);
    return res ?? result ?? null;
  }
};

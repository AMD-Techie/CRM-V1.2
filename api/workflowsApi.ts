import { Workflow } from '../types/ai';
import { apiClient } from './client';

export const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: 'wf_inbound_lead_triage',
    name: 'Inbound Lead Qualification & Handoff Pipeline',
    description: 'Autonomous enrichment and ICP verification pipeline with automatic routing and AE handoff',
    version: 'v2.1',
    status: 'active',
    executionGraphId: 'graph_lq_v2',
    agentIds: ['agent_lead_qualification', 'agent_sales_followup'],
    triggers: [
      {
        id: 'trig_inbound_lead',
        type: 'event',
        name: 'New Lead Webhook Ingestion',
        description: 'Triggers instantly whenever a new lead is created via API or Marketing Form',
        eventType: 'lead_created',
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
    },
    totalExecutions: 142,
    successRate: 97.2,
    lastRunAt: '10:30 AM · Today',
    createdAt: '2026-09-15T00:00:00Z',
    updatedAt: '2026-09-30T10:00:00Z'
  },
  {
    id: 'wf_deal_acceleration',
    name: 'Enterprise Opportunity Stagnation & Outreach Suite',
    description: 'Monitors deals for stall risk, prepares executive check-in briefs, and gates outbound comms through Approval Center',
    version: 'v1.4',
    status: 'active',
    executionGraphId: 'graph_followup_v1',
    agentIds: ['agent_risk_radar', 'agent_sales_followup'],
    triggers: [
      {
        id: 'trig_stagnation',
        type: 'schedule',
        name: 'Weekly Pipeline Velocity Scan',
        description: 'Runs weekly at 07:00 AM on Monday to audit deal milestone stagnation',
        scheduleCron: '0 7 * * 1',
        enabled: true
      }
    ],
    guardPolicy: {
      maxIterations: 3,
      maxToolCalls: 8,
      maxDurationSeconds: 120,
      maxChildRuns: 2,
      maxActions: 3,
      duplicateActionDetection: true
    },
    totalExecutions: 89,
    successRate: 94.4,
    lastRunAt: '10:45 AM · Today',
    createdAt: '2026-09-18T00:00:00Z',
    updatedAt: '2026-09-30T10:00:00Z'
  }
];

export const workflowsApi = {
  async getWorkflows(): Promise<Workflow[]> {
    const saved = localStorage.getItem('nova_workflows');
    const local = saved ? JSON.parse(saved) : INITIAL_WORKFLOWS;
    return apiClient.get<Workflow[]>('/ai/runtime/workflows', local);
  },

  async getWorkflowById(id: string): Promise<Workflow | undefined> {
    const workflows = await workflowsApi.getWorkflows();
    return workflows.find(w => w.id === id);
  },

  async createWorkflow(payload: Omit<Workflow, 'id' | 'totalExecutions' | 'successRate' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
    const workflows = await workflowsApi.getWorkflows();
    const newWorkflow: Workflow = {
      ...payload,
      id: `wf_${Date.now()}`,
      totalExecutions: 0,
      successRate: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newWorkflow, ...workflows];
    localStorage.setItem('nova_workflows', JSON.stringify(updated));
    return apiClient.post<Workflow>('/ai/runtime/workflows', payload, newWorkflow);
  },

  async updateWorkflow(workflow: Workflow): Promise<Workflow> {
    const workflows = await workflowsApi.getWorkflows();
    const updated = workflows.map(w => w.id === workflow.id ? { ...workflow, updatedAt: new Date().toISOString() } : w);
    localStorage.setItem('nova_workflows', JSON.stringify(updated));
    return apiClient.put<Workflow>(`/ai/runtime/workflows/${workflow.id}`, workflow, workflow);
  }
};

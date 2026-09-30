import { WorkflowRule, WorkflowExecutionLog } from '../types/automation';
import { apiClient } from './client';

export const INITIAL_WORKFLOWS: WorkflowRule[] = [
  {
    id: 'wf_01',
    name: 'Stale Lead Re-engagement SLA Rule',
    description: 'Trigger Sales Follow-up Agent when a qualified lead has no calls or meetings for 7 days. Stages message in Approval Center.',
    status: 'active',
    trigger: {
      id: 'trg_01',
      eventType: 'lead_inactive_days',
      label: 'Lead Inactive > 7 Days',
      conditions: [{ field: 'daysSinceLastContact', operator: 'greater_than', value: 7 }]
    },
    agentSteps: [
      {
        id: 'stp_01',
        order: 1,
        agentId: 'agent_sales_followup',
        agentName: 'Sales Follow-up Agent',
        actionInstruction: 'Synthesize pain points and stage follow-up message draft.',
        requiresHumanApproval: true
      }
    ],
    totalRuns: 142,
    lastExecutedAt: '24 minutes ago',
    createdAt: '2026-08-15',
    updatedAt: '2026-09-20'
  },
  {
    id: 'wf_02',
    name: 'High-Value Opportunity Sentinel',
    description: 'When a deal exceeds $50,000 or stays in stage > 14 days, run Opportunity Risk Radar to calculate deal velocity anomalies.',
    status: 'active',
    trigger: {
      id: 'trg_02',
      eventType: 'deal_value_high',
      label: 'Deal Value > $50,000',
      conditions: [{ field: 'value', operator: 'greater_than', value: 50000 }]
    },
    agentSteps: [
      {
        id: 'stp_02',
        order: 1,
        agentId: 'agent_deal_risk',
        agentName: 'Opportunity Risk Radar',
        actionInstruction: 'Analyze deal stagnation and schedule mitigation tasks if needed.',
        requiresHumanApproval: false
      }
    ],
    totalRuns: 98,
    lastExecutedAt: '1 hour ago',
    createdAt: '2026-09-01',
    updatedAt: '2026-09-25'
  }
];

export const automationApi = {
  async getWorkflows(): Promise<WorkflowRule[]> {
    const saved = localStorage.getItem('nova_automation_workflows');
    const local = saved ? JSON.parse(saved) : INITIAL_WORKFLOWS;
    return apiClient.get<WorkflowRule[]>('/automation/workflows', local);
  },

  async toggleWorkflowStatus(id: string): Promise<WorkflowRule> {
    const workflows = await automationApi.getWorkflows();
    const updated = workflows.map(wf => {
      if (wf.id === id) {
        return {
          ...wf,
          status: (wf.status === 'active' ? 'paused' : 'active') as 'active' | 'paused'
        };
      }
      return wf;
    });
    localStorage.setItem('nova_automation_workflows', JSON.stringify(updated));
    return updated.find(w => w.id === id)!;
  }
};

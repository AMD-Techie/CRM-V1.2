export type TriggerEventType = 
  | 'lead_created'
  | 'lead_status_changed'
  | 'lead_score_threshold'
  | 'lead_inactive_days'
  | 'deal_stage_changed'
  | 'deal_stagnation_alert'
  | 'deal_value_high'
  | 'meeting_completed'
  | 'scheduled_cron';

export interface WorkflowTrigger {
  id: string;
  eventType: TriggerEventType;
  label: string;
  conditions: {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'days_since_greater_than';
    value: any;
  }[];
}

export interface WorkflowActionStep {
  id: string;
  order: number;
  agentId: string;
  agentName: string;
  actionInstruction: string;
  requiresHumanApproval: boolean;
}

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  trigger: WorkflowTrigger;
  agentSteps: WorkflowActionStep[];
  totalRuns: number;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  triggerEvent: string;
  targetEntityId: string;
  targetEntityTitle: string;
  status: 'success' | 'running' | 'failed' | 'waiting_approval';
  startedAt: string;
  completedAt?: string;
  stepResults: {
    stepId: string;
    agentName: string;
    status: 'success' | 'failed' | 'waiting_approval';
    output: string;
  }[];
}

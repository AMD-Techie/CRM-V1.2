import { AIAction, AIInsight } from '../types/ai';
import { apiClient } from './client';

export const INITIAL_AI_ACTIONS: AIAction[] = [
  {
    id: 'act_01',
    agentId: 'agent_sales_followup',
    agentName: 'Sales Follow-up Agent',
    entityType: 'lead',
    entityId: '1',
    entityTitle: 'SkyNet Systems',
    status: 'approval_required',
    headline: 'Send Personalized Enterprise Follow-up on WhatsApp',
    rationale: 'Lead has been inactive for 9 days following initial qualification. High strategic value ($50k).',
    payload: {
      actionType: 'send_whatsapp',
      recipientName: 'Sarah Connor',
      recipientContact: '+1 (555) 901-2233',
      content: 'Hi Sarah, following up on our AI compliance chat. Our enterprise ISO/SOC2 brief is ready. Can we sync this Thursday at 2 PM?'
    },
    requiresApproval: true,
    createdAt: '10:42 AM · Today'
  },
  {
    id: 'act_02',
    agentId: 'agent_deal_risk',
    agentName: 'Opportunity Risk Radar',
    entityType: 'deal',
    entityId: 'd3',
    entityTitle: 'Soylent Corp · Cloud Migration',
    status: 'prepared',
    headline: 'Schedule Executive Sponsor Re-engagement Sync',
    rationale: 'Opportunity has spent 45 days in Value Proposition without decision maker meetings.',
    payload: {
      actionType: 'schedule_meeting',
      recipientName: 'Robert Thorn',
      suggestedDate: 'Tomorrow at 10:00 AM',
      content: 'Agenda: Cloud Migration Architecture Validation & Security Signoff'
    },
    requiresApproval: false,
    createdAt: '08:15 AM · Today'
  },
  {
    id: 'act_03',
    agentId: 'agent_lead_qual',
    agentName: 'Lead Qualification Agent',
    entityType: 'lead',
    entityId: '3',
    entityTitle: 'Edge of Tomorrow Inc',
    status: 'executed',
    headline: 'Auto-Enriched Lead Firmographics and Tech Stack',
    rationale: 'Identified 450 employees, $45M revenue, and active Salesforce CRM migration intent.',
    payload: {
      actionType: 'update_stage',
      dataChanges: {
        score: 92,
        priority: 'High',
        technologies: ['Salesforce', 'HubSpot', 'AWS']
      }
    },
    requiresApproval: false,
    createdAt: 'Yesterday at 03:20 PM',
    executedAt: 'Yesterday at 03:21 PM'
  },
  {
    id: 'act_04',
    agentId: 'agent_meeting_prep',
    agentName: 'Executive Meeting Preparation Agent',
    entityType: 'meeting',
    entityId: 'm1',
    entityTitle: 'Acme Corp · Product Demo & RFP Review',
    status: 'recommended',
    headline: 'Generate Executive RFP Briefing Dossier',
    rationale: 'High-stakes client meeting in 2 hours with 4 executive stakeholders.',
    payload: {
      actionType: 'create_task',
      content: 'Review 4-page briefing memo with competitor battlecards'
    },
    requiresApproval: false,
    createdAt: '07:30 AM · Today'
  },
  {
    id: 'act_05',
    agentId: 'agent_sales_followup',
    agentName: 'Sales Follow-up Agent',
    entityType: 'lead',
    entityId: '2',
    entityTitle: 'Cyberdyne Systems',
    status: 'informational',
    headline: 'Detected Customer Security Whitepaper Download',
    rationale: 'Lead read 3 pages of Enterprise Security Whitepaper at 09:12 AM.',
    payload: {
      actionType: 'flag_risk',
      content: 'High buying intent signal detected'
    },
    requiresApproval: false,
    createdAt: '09:15 AM · Today'
  }
];

export const INITIAL_AI_INSIGHTS: AIInsight[] = [
  {
    id: 'ins_01',
    entityType: 'deal',
    entityId: 'd3',
    type: 'risk_warning',
    title: 'High Stagnation Risk Detected on $200k Cloud Migration',
    content: 'Deal has stalled in Value Proposition stage for 45 days. Average winning cycle for this tier is 18 days. No champion interactions logged this month.',
    confidenceScore: 94,
    recommendedAction: {
      label: 'Trigger Executive Re-engagement',
      actionType: 'schedule_meeting',
      targetId: 'd3'
    },
    createdAt: 'Today · 08:00 AM'
  },
  {
    id: 'ins_02',
    entityType: 'lead',
    entityId: '3',
    type: 'buying_signal',
    title: 'Strong Inbound Intent: 4 Executives Viewed Security Portal',
    content: 'Multiple stakeholders from Edge of Tomorrow Inc downloaded compliance matrices and requested custom SLA terms within 24 hours.',
    confidenceScore: 89,
    recommendedAction: {
      label: 'Send Priority Proposal Package',
      actionType: 'send_email',
      targetId: '3'
    },
    createdAt: 'Today · 09:30 AM'
  },
  {
    id: 'ins_03',
    entityType: 'pipeline',
    entityId: 'global',
    type: 'velocity_anomaly',
    title: 'Enterprise Pipeline Velocity +24% Above Q3 Benchmark',
    content: 'Lead-to-Opportunity conversion pace is accelerating across Mid-Market tech accounts. Average close velocity reduced from 34 to 26 days.',
    confidenceScore: 96,
    recommendedAction: {
      label: 'View BI Velocity Analysis',
      actionType: 'navigate_reporting',
      targetId: 'reporting'
    },
    createdAt: 'Yesterday · 05:00 PM'
  },
  {
    id: 'ins_04',
    entityType: 'lead',
    entityId: '1',
    type: 'next_best_action',
    title: 'Follow-up Window Expiring: SkyNet Systems',
    content: 'Optimal response window is within the next 4 hours before engagement decay rate triples.',
    confidenceScore: 88,
    recommendedAction: {
      label: 'Approve WhatsApp Outreach',
      actionType: 'approve_action',
      targetId: 'appr_01'
    },
    createdAt: 'Today · 10:45 AM'
  }
];

export const actionsApi = {
  async getActions(): Promise<AIAction[]> {
    const saved = localStorage.getItem('nova_ai_actions');
    const local = saved ? JSON.parse(saved) : INITIAL_AI_ACTIONS;
    return apiClient.get<AIAction[]>('/ai/actions', local);
  },

  async executeAction(actionId: string): Promise<AIAction> {
    const actions = await actionsApi.getActions();
    const updated = actions.map(act => {
      if (act.id === actionId) {
        return {
          ...act,
          status: 'executed' as const,
          executedAt: 'Just now'
        };
      }
      return act;
    });
    localStorage.setItem('nova_ai_actions', JSON.stringify(updated));
    return updated.find(a => a.id === actionId)!;
  },

  async rejectAction(actionId: string, reason?: string): Promise<AIAction> {
    const actions = await actionsApi.getActions();
    const updated = actions.map(act => {
      if (act.id === actionId) {
        return {
          ...act,
          status: 'rejected' as const,
          rejectionReason: reason || 'Dismissed by user'
        };
      }
      return act;
    });
    localStorage.setItem('nova_ai_actions', JSON.stringify(updated));
    return updated.find(a => a.id === actionId)!;
  },

  async createAction(actionPayload: Omit<AIAction, 'id' | 'createdAt'>): Promise<AIAction> {
    const actions = await actionsApi.getActions();
    const newAction: AIAction = {
      ...actionPayload,
      id: `act_${Date.now()}`,
      createdAt: 'Just now'
    };
    const updated = [newAction, ...actions];
    localStorage.setItem('nova_ai_actions', JSON.stringify(updated));
    return apiClient.post<AIAction>('/ai/actions', actionPayload, newAction);
  },

  async getInsights(): Promise<AIInsight[]> {
    const saved = localStorage.getItem('nova_ai_insights');
    const local = saved ? JSON.parse(saved) : INITIAL_AI_INSIGHTS;
    return apiClient.get<AIInsight[]>('/ai/insights', local);
  }
};

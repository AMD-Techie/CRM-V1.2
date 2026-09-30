import { ApprovalItem, AIAction } from '../types/ai';
import { apiClient } from './client';

export const INITIAL_APPROVALS: ApprovalItem[] = [
  {
    id: 'appr_01',
    actionId: 'act_followup_skynet',
    agentId: 'agent_sales_followup',
    agentName: 'Sales Follow-up Agent',
    category: 'whatsapp_dispatch',
    title: 'Executive Check-in WhatsApp to Sarah Connor (CTO)',
    description: 'Lead has been inactive for 9 days following initial discovery. Agent prepared personalized check-in regarding AI security compliance.',
    targetEntity: {
      type: 'lead',
      id: '1',
      name: 'SkyNet Systems',
      contextSummary: 'Score: 85 (High Priority) · $50,000 Potential'
    },
    proposedPayload: {
      type: 'WhatsApp Message',
      body: `Hi Sarah, hope your week is off to a great start! Following up on our discussion regarding AI security and compliance frameworks. Our enterprise team just published our ISO/SOC2 security brief that addresses the server room questions you raised. Would you have 10 minutes this Thursday at 2 PM for a quick sync?`
    },
    status: 'pending',
    urgency: 'high',
    createdAt: '10:42 AM · Today'
  },
  {
    id: 'appr_02',
    actionId: 'act_stage_soylent',
    agentId: 'agent_deal_risk',
    agentName: 'Opportunity Risk Radar',
    category: 'stage_transition',
    title: 'Recalibrate Opportunity Stage & Create Mitigation Task',
    description: 'Deal #d3 (Cloud Migration - $200k) has exceeded 45 days in Value Proposition stage with no decision-maker engagement.',
    targetEntity: {
      type: 'deal',
      id: 'd3',
      name: 'Soylent Corp · Cloud Migration',
      contextSummary: 'Value: $200,000 · Current Stage: Value Proposition'
    },
    proposedPayload: {
      type: 'Stage & Probability Adjustment',
      diff: [
        { field: 'Probability', from: '40%', to: '25%' },
        { field: 'Risk Level', from: 'Normal', to: 'High Risk (Stagnant)' },
        { field: 'Assigned Task', from: 'None', to: 'Schedule Executive Sponsor Call with Green (Soylent)' }
      ]
    },
    status: 'pending',
    urgency: 'medium',
    createdAt: '08:00 AM · Today'
  },
  {
    id: 'appr_03',
    actionId: 'act_email_edge',
    agentId: 'agent_sales_followup',
    agentName: 'Sales Follow-up Agent',
    category: 'email_outreach',
    title: 'Customized Q4 Proposal Package to Emily Blunt',
    description: 'High-score lead (92/100) requested proposal review. Agent prepared tailored commercial terms and implementation roadmap.',
    targetEntity: {
      type: 'lead',
      id: '3',
      name: 'Edge of Tomorrow Inc',
      contextSummary: 'Score: 92 (High Priority) · $120,000 Potential'
    },
    proposedPayload: {
      type: 'Email Proposal',
      subject: 'NovaCRM Enterprise Proposal & Implementation Schedule · Edge of Tomorrow Inc',
      body: `Dear Emily,\n\nFollowing up on our qualification discussion, we have assembled the custom proposal for Edge of Tomorrow Inc, including the 120k ARR tier with dedicated priority support and custom SLA guarantees.\n\nPlease find the breakdown attached in your customer portal. We look forward to reviewing this on our call.`
    },
    status: 'pending',
    urgency: 'high',
    createdAt: 'Yesterday at 04:30 PM'
  }
];

export const approvalsApi = {
  async getApprovals(): Promise<ApprovalItem[]> {
    const saved = localStorage.getItem('nova_ai_approvals');
    const local = saved ? JSON.parse(saved) : INITIAL_APPROVALS;
    return apiClient.get<ApprovalItem[]>('/ai/approvals', local);
  },

  async approveItem(id: string, reviewerName: string = 'Current User'): Promise<ApprovalItem> {
    const items = await approvalsApi.getApprovals();
    const updated = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'approved' as const,
          reviewedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · Today',
          reviewedBy: reviewerName
        };
      }
      return item;
    });
    localStorage.setItem('nova_ai_approvals', JSON.stringify(updated));
    return updated.find(i => i.id === id)!;
  },

  async rejectItem(id: string, reviewerName: string = 'Current User'): Promise<ApprovalItem> {
    const items = await approvalsApi.getApprovals();
    const updated = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'rejected' as const,
          reviewedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · Today',
          reviewedBy: reviewerName
        };
      }
      return item;
    });
    localStorage.setItem('nova_ai_approvals', JSON.stringify(updated));
    return updated.find(i => i.id === id)!;
  },

  async bulkApprove(ids: string[], reviewerName: string = 'Current User'): Promise<void> {
    const items = await approvalsApi.getApprovals();
    const updated = items.map(item => {
      if (ids.includes(item.id)) {
        return {
          ...item,
          status: 'approved' as const,
          reviewedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · Today',
          reviewedBy: reviewerName
        };
      }
      return item;
    });
    localStorage.setItem('nova_ai_approvals', JSON.stringify(updated));
  },

  async submitApprovalItem(itemPayload: Omit<ApprovalItem, 'id' | 'createdAt'>): Promise<ApprovalItem> {
    const items = await approvalsApi.getApprovals();
    const newItem: ApprovalItem = {
      ...itemPayload,
      id: `appr_${Date.now()}`,
      createdAt: 'Just now'
    };
    const updated = [newItem, ...items];
    localStorage.setItem('nova_ai_approvals', JSON.stringify(updated));
    return apiClient.post<ApprovalItem>('/ai/approvals', itemPayload, newItem);
  }
};

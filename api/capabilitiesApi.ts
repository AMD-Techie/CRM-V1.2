import { AgentCapabilityDefinition } from '../types/ai';
import { apiClient } from './client';

export const INITIAL_CAPABILITIES: AgentCapabilityDefinition[] = [
  {
    id: 'cap_crm_read_lead',
    key: 'CRM.ReadLead',
    name: 'Read CRM Lead & Contact Dossier',
    description: 'Retrieves firmographic, contact email, job title, and engagement history for a lead record',
    category: 'crm',
    riskLevel: 'low',
    requiresApproval: false,
    enabled: true,
    inputContract: '{ leadId: string; includeTimeline?: boolean }',
    outputContract: '{ id: string; name: string; title: string; score: number; email: string }',
    totalInvocations: 1240
  },
  {
    id: 'cap_crm_update_lead',
    key: 'CRM.UpdateLead',
    name: 'Update Lead Stage & Enrichment Score',
    description: 'Updates CRM lead qualification stage, priority score, and assigned representative',
    category: 'crm',
    riskLevel: 'medium',
    requiresApproval: false,
    enabled: true,
    inputContract: '{ leadId: string; stage?: string; score?: number; ownerId?: string }',
    outputContract: '{ success: boolean; updatedLeadId: string; timestamp: string }',
    totalInvocations: 850
  },
  {
    id: 'cap_crm_create_task',
    key: 'CRM.CreateTask',
    name: 'Create Operational CRM Follow-up Task',
    description: 'Assigns follow-up task with due date, priority, and context notes to sales rep',
    category: 'crm',
    riskLevel: 'low',
    requiresApproval: false,
    enabled: true,
    inputContract: '{ title: string; dueDate: string; priority: string; assignedTo: string }',
    outputContract: '{ taskId: string; status: string }',
    totalInvocations: 640
  },
  {
    id: 'cap_crm_update_deal',
    key: 'CRM.UpdateOpportunity',
    name: 'Update Deal Stage & Probability',
    description: 'Modifies opportunity stage, close date, or win probability percentage',
    category: 'crm',
    riskLevel: 'high',
    requiresApproval: true,
    enabled: true,
    inputContract: '{ dealId: string; stage: string; probability: number; rationale: string }',
    outputContract: '{ dealId: string; modifiedFields: string[] }',
    totalInvocations: 310
  },
  {
    id: 'cap_email_draft',
    key: 'Email.Draft',
    name: 'Synthesize Executive Email Outreach Draft',
    description: 'Generates structured personalized email draft adhering to communication tone guidelines',
    category: 'communication',
    riskLevel: 'medium',
    requiresApproval: false,
    enabled: true,
    inputContract: '{ recipientEmail: string; subjectIdea: string; contextNotes: string }',
    outputContract: '{ draftSubject: string; draftBody: string; toneScore: number }',
    totalInvocations: 520
  },
  {
    id: 'cap_email_send',
    key: 'Email.Send',
    name: 'Dispatch Outbound Corporate Email',
    description: 'Transmits approved email to external client through secure messaging gateway',
    category: 'communication',
    riskLevel: 'high',
    requiresApproval: true,
    enabled: true,
    inputContract: '{ recipient: string; subject: string; body: string; approvedBy: string }',
    outputContract: '{ messageId: string; sentAt: string; status: string }',
    totalInvocations: 195
  },
  {
    id: 'cap_whatsapp_draft',
    key: 'WhatsApp.Draft',
    name: 'Synthesize Instant Messaging Check-in Draft',
    description: 'Composes concise WhatsApp/SMS message referencing past touchpoints',
    category: 'communication',
    riskLevel: 'medium',
    requiresApproval: false,
    enabled: true,
    inputContract: '{ recipientPhone: string; bulletPoints: string[] }',
    outputContract: '{ messageText: string; characterCount: number }',
    totalInvocations: 240
  },
  {
    id: 'cap_knowledge_search',
    key: 'Knowledge.Search',
    name: 'Query Knowledge Plane Semantic Index',
    description: 'Retrieves relevant SOPs, battlecards, pricing calculators, and security whitepapers',
    category: 'knowledge',
    riskLevel: 'low',
    requiresApproval: false,
    enabled: true,
    inputContract: '{ query: string; category?: string; topK?: number }',
    outputContract: '{ documents: Array<{ id: string; title: string; excerpt: string }> }',
    totalInvocations: 1890
  },
  {
    id: 'cap_calendar_read',
    key: 'Calendar.Read',
    name: 'Inspect Stakeholder Calendar Availability',
    description: 'Checks open meeting slots for sales representatives and prospective champions',
    category: 'calendar',
    riskLevel: 'low',
    requiresApproval: false,
    enabled: true,
    inputContract: '{ userIds: string[]; dateRange: { start: string; end: string } }',
    outputContract: '{ availableSlots: Array<{ start: string; end: string }> }',
    totalInvocations: 430
  },
  {
    id: 'cap_calendar_create',
    key: 'Calendar.CreateMeeting',
    name: 'Schedule Executive Review Meeting',
    description: 'Generates calendar invite with video link and pre-attached briefing agenda',
    category: 'calendar',
    riskLevel: 'medium',
    requiresApproval: true,
    enabled: true,
    inputContract: '{ title: string; participants: string[]; startTime: string; duration: number }',
    outputContract: '{ eventId: string; joinUrl: string }',
    totalInvocations: 160
  },
  {
    id: 'cap_analytics_query',
    key: 'Analytics.QueryPipeline',
    name: 'Query Pipeline Health & Velocity Metrics',
    description: 'Calculates stage conversion velocity, average deal age, and rep quota attainment',
    category: 'analytics',
    riskLevel: 'low',
    requiresApproval: false,
    enabled: true,
    inputContract: '{ metric: string; timeWindow: string; filterBy?: Record<string, unknown> }',
    outputContract: '{ metricValue: number; trend: string; benchmarkDelta: number }',
    totalInvocations: 780
  },
  {
    id: 'cap_integration_enrich',
    key: 'Integration.EnrichCompany',
    name: 'Enrich Firmographic Data via Clearbit/Apollo',
    description: 'Queries external data providers for verified employee count, tech stack, and funding',
    category: 'integration',
    riskLevel: 'low',
    requiresApproval: false,
    enabled: true,
    inputContract: '{ companyDomain: string }',
    outputContract: '{ employees: number; arrEstimate: string; technologies: string[] }',
    totalInvocations: 1120
  }
];

export const capabilitiesApi = {
  async getCapabilities(): Promise<AgentCapabilityDefinition[]> {
    const saved = localStorage.getItem('nova_capabilities');
    const local = saved ? JSON.parse(saved) : INITIAL_CAPABILITIES;
    return apiClient.get<AgentCapabilityDefinition[]>('/ai/runtime/capabilities', local);
  },

  async toggleCapability(id: string): Promise<AgentCapabilityDefinition> {
    const capabilities = await capabilitiesApi.getCapabilities();
    const updated = capabilities.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c);
    localStorage.setItem('nova_capabilities', JSON.stringify(updated));
    const target = updated.find(c => c.id === id)!;
    return apiClient.put<AgentCapabilityDefinition>(`/ai/runtime/capabilities/${id}`, target, target);
  }
};

import { AgentSkill } from '../types/ai';
import { apiClient } from './client';

export const INITIAL_SKILLS: AgentSkill[] = [
  {
    id: 'skill_lead_qualification',
    key: 'sales.lead_qualification',
    name: 'Lead Qualification & Scoring Playbook',
    version: 'v2.1',
    description: 'Evaluates inbound prospect firmographics against ICP matrix, calculates priority score (0-100), and routes tier 1 accounts.',
    category: 'sales_playbook',
    instructions: `1. Retrieve prospect domain and inspect company employee count, industry, and ARR estimate.
2. Cross-reference company profile with ICP matrix benchmarks.
3. Compute baseline qualification score:
   - High Priority (>80): ARR > $10M, 200+ employees, verified decision maker.
   - Standard (50-80): Mid-market account with CRM upgrade intent.
   - Nurture (<50): Below ideal threshold; route to automated drip.
4. Prepare stage transition payload to 'Qualified' or assign follow-up task to Sales Rep.`,
    status: 'published',
    capabilityIds: ['cap_crm_read_lead', 'cap_knowledge_search', 'cap_crm_update_lead', 'cap_crm_create_task', 'cap_integration_enrich'],
    knowledgeSourceIds: ['know_sales_playbook_2026', 'know_icp_matrix'],
    evaluationStatus: 'passed',
    totalExecutions: 428,
    successRate: 98.1,
    createdAt: '2026-09-10T00:00:00Z',
    updatedAt: '2026-09-30T10:00:00Z'
  },
  {
    id: 'skill_executive_followup',
    key: 'sales.executive_followup',
    name: 'Enterprise Follow-Up Cadence & Outreach',
    version: 'v1.4',
    description: 'Synthesizes tailored, multi-touch executive check-in communications based on deal dormancy, technical questions, and past meetings.',
    category: 'relationship_ops',
    instructions: `1. Inspect deal timeline to calculate inactivity duration.
2. If inactivity > 7 business days, query Knowledge Plane for relevant compliance whitepapers, customer case studies, or pricing updates.
3. Compose personalized message draft highlighting key executive value propositions.
4. Submit action payload to Approval Center under Human-in-the-Loop policy.`,
    status: 'published',
    capabilityIds: ['cap_crm_read_lead', 'cap_email_draft', 'cap_email_send', 'cap_whatsapp_draft', 'cap_knowledge_search'],
    knowledgeSourceIds: ['know_security_compliance', 'know_enterprise_pricing'],
    evaluationStatus: 'passed',
    totalExecutions: 295,
    successRate: 95.6,
    createdAt: '2026-09-14T00:00:00Z',
    updatedAt: '2026-09-30T10:00:00Z'
  },
  {
    id: 'skill_deal_risk_radar',
    key: 'governance.deal_risk_radar',
    name: 'Deal Velocity & Milestone Stagnation Audit',
    version: 'v1.0',
    description: 'Identifies stalled opportunities in value proposition and negotiation stages, flagging champion churn and competitor threats.',
    category: 'deal_governance',
    instructions: `1. Query all active opportunities in pipeline with deal value > $50,000.
2. Check stage duration against 30-day velocity benchmark.
3. Detect single-threaded deals lacking multi-stakeholder engagement.
4. Prepare executive risk alert and propose sponsor sync meeting.`,
    status: 'published',
    capabilityIds: ['cap_analytics_query', 'cap_crm_update_deal', 'cap_calendar_create'],
    knowledgeSourceIds: ['know_deal_governance_rules'],
    evaluationStatus: 'passed',
    totalExecutions: 184,
    successRate: 94.0,
    createdAt: '2026-09-18T00:00:00Z',
    updatedAt: '2026-09-30T10:00:00Z'
  },
  {
    id: 'skill_meeting_prep',
    key: 'advisory.executive_meeting_prep',
    name: 'Executive Discovery Briefing Dossier',
    version: 'v1.1',
    description: 'Generates high-impact 1-page briefing memos with attendee LinkedIn profiles, past CRM notes, and competitor battlecards.',
    category: 'sales_playbook',
    instructions: `1. Retrieve calendar event details and list all registered attendees.
2. Lookup CRM history for each participant and past account notes.
3. Fetch competitor battlecards for identified software vendors.
4. Formulate 3 strategic discovery questions for the account executive.`,
    status: 'published',
    capabilityIds: ['cap_calendar_read', 'cap_crm_read_lead', 'cap_knowledge_search'],
    knowledgeSourceIds: ['know_competitor_battlecards'],
    evaluationStatus: 'passed',
    totalExecutions: 312,
    successRate: 99.0,
    createdAt: '2026-09-20T00:00:00Z',
    updatedAt: '2026-09-30T10:00:00Z'
  }
];

export const skillsApi = {
  async getSkills(): Promise<AgentSkill[]> {
    const saved = localStorage.getItem('nova_skills');
    const local = saved ? JSON.parse(saved) : INITIAL_SKILLS;
    return apiClient.get<AgentSkill[]>('/ai/runtime/skills', local);
  },

  async getSkillById(id: string): Promise<AgentSkill | undefined> {
    const skills = await skillsApi.getSkills();
    return skills.find(s => s.id === id || s.key === id);
  },

  async createSkill(payload: Omit<AgentSkill, 'id' | 'totalExecutions' | 'successRate' | 'createdAt' | 'updatedAt'>): Promise<AgentSkill> {
    const skills = await skillsApi.getSkills();
    const newSkill: AgentSkill = {
      ...payload,
      id: `skill_${Date.now()}`,
      totalExecutions: 0,
      successRate: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newSkill, ...skills];
    localStorage.setItem('nova_skills', JSON.stringify(updated));
    return apiClient.post<AgentSkill>('/ai/runtime/skills', payload, newSkill);
  },

  async updateSkill(skill: AgentSkill): Promise<AgentSkill> {
    const skills = await skillsApi.getSkills();
    const updated = skills.map(s => s.id === skill.id ? { ...skill, updatedAt: new Date().toISOString() } : s);
    localStorage.setItem('nova_skills', JSON.stringify(updated));
    return apiClient.put<AgentSkill>(`/ai/runtime/skills/${skill.id}`, skill, skill);
  }
};

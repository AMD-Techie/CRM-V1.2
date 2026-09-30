import { Lead } from '../types/crm';
import { MOCK_LEADS } from '../constants';
import { loadStateFromStorage, saveStateToStorage } from '../services/offlineService';
import { apiClient } from './client';

export const leadsApi = {
  async getLeads(): Promise<Lead[]> {
    const local = loadStateFromStorage('leads', MOCK_LEADS);
    return apiClient.get<Lead[]>('/leads', local);
  },

  async getLeadById(id: string): Promise<Lead | undefined> {
    const leads = await leadsApi.getLeads();
    return leads.find(l => l.id === id);
  },

  async createLead(leadData: Omit<Lead, 'id'>): Promise<Lead> {
    const today = new Date().toISOString().split('T')[0];
    const newLead: Lead = {
      ...leadData,
      id: `L${Date.now()}`,
      score: leadData.score || 50,
      scoreBreakdown: leadData.scoreBreakdown || { fit: 50, engagement: 50, budget: 50 },
      lastContact: today,
      creationDate: today,
      statusUpdatedAt: today,
      activities: [
        { id: `act_${Date.now()}`, type: 'created', description: 'Lead record initialized', timestamp: new Date().toISOString() }
      ]
    };

    const currentLeads = await leadsApi.getLeads();
    const updated = [newLead, ...currentLeads];
    saveStateToStorage('leads', updated);
    return apiClient.post<Lead>('/leads', newLead, newLead);
  },

  async updateLead(lead: Lead): Promise<Lead> {
    const currentLeads = await leadsApi.getLeads();
    const updated = currentLeads.map(l => l.id === lead.id ? lead : l);
    saveStateToStorage('leads', updated);
    return apiClient.put<Lead>(`/leads/${lead.id}`, lead, lead);
  },

  async deleteLead(id: string): Promise<void> {
    const currentLeads = await leadsApi.getLeads();
    const updated = currentLeads.filter(l => l.id !== id);
    saveStateToStorage('leads', updated);
    await apiClient.delete(`/leads/${id}`, undefined);
  }
};

import { Deal, Contact, Account, Task, Meeting, Call } from '../types/crm';
import { MOCK_DEALS, MOCK_CONTACTS, MOCK_ACCOUNTS, MOCK_TASKS, MOCK_MEETINGS, MOCK_CALLS } from '../constants';
import { loadStateFromStorage, saveStateToStorage } from '../services/offlineService';
import { apiClient } from './client';

export const dealsApi = {
  async getDeals(): Promise<Deal[]> {
    const local = loadStateFromStorage('deals', MOCK_DEALS);
    return apiClient.get<Deal[]>('/deals', local);
  },
  async createDeal(deal: Omit<Deal, 'id'>): Promise<Deal> {
    const newDeal: Deal = { ...deal, id: `d_${Date.now()}` };
    const current = await dealsApi.getDeals();
    const updated = [newDeal, ...current];
    saveStateToStorage('deals', updated);
    return apiClient.post<Deal>('/deals', newDeal, newDeal);
  },
  async updateDeal(deal: Deal): Promise<Deal> {
    const current = await dealsApi.getDeals();
    const updated = current.map(d => d.id === deal.id ? deal : d);
    saveStateToStorage('deals', updated);
    return apiClient.put<Deal>(`/deals/${deal.id}`, deal, deal);
  }
};

export const contactsApi = {
  async getContacts(): Promise<Contact[]> {
    const local = loadStateFromStorage('contacts', MOCK_CONTACTS);
    return apiClient.get<Contact[]>('/contacts', local);
  },
  async createContact(contact: Omit<Contact, 'id'>): Promise<Contact> {
    const newContact: Contact = { ...contact, id: `c_${Date.now()}` };
    const current = await contactsApi.getContacts();
    const updated = [newContact, ...current];
    saveStateToStorage('contacts', updated);
    return apiClient.post<Contact>('/contacts', newContact, newContact);
  },
  async updateContact(contact: Contact): Promise<Contact> {
    const current = await contactsApi.getContacts();
    const updated = current.map(c => c.id === contact.id ? contact : c);
    saveStateToStorage('contacts', updated);
    return apiClient.put<Contact>(`/contacts/${contact.id}`, contact, contact);
  }
};

export const accountsApi = {
  async getAccounts(): Promise<Account[]> {
    const local = loadStateFromStorage('accounts', MOCK_ACCOUNTS);
    return apiClient.get<Account[]>('/accounts', local);
  },
  async createAccount(account: Omit<Account, 'id'>): Promise<Account> {
    const newAccount: Account = { ...account, id: `a_${Date.now()}` };
    const current = await accountsApi.getAccounts();
    const updated = [newAccount, ...current];
    saveStateToStorage('accounts', updated);
    return apiClient.post<Account>('/accounts', newAccount, newAccount);
  }
};

export const tasksApi = {
  async getTasks(): Promise<Task[]> {
    const local = loadStateFromStorage('tasks', MOCK_TASKS);
    return apiClient.get<Task[]>('/tasks', local);
  },
  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    const newTask: Task = { ...task, id: `t_${Date.now()}` };
    const current = await tasksApi.getTasks();
    const updated = [newTask, ...current];
    saveStateToStorage('tasks', updated);
    return apiClient.post<Task>('/tasks', newTask, newTask);
  },
  async updateTask(task: Task): Promise<Task> {
    const current = await tasksApi.getTasks();
    const updated = current.map(t => t.id === task.id ? task : t);
    saveStateToStorage('tasks', updated);
    return apiClient.put<Task>(`/tasks/${task.id}`, task, task);
  },
  async deleteTask(id: string): Promise<void> {
    const current = await tasksApi.getTasks();
    const updated = current.filter(t => t.id !== id);
    saveStateToStorage('tasks', updated);
    await apiClient.delete(`/tasks/${id}`, undefined);
  }
};

export const meetingsApi = {
  async getMeetings(): Promise<Meeting[]> {
    const local = loadStateFromStorage('meetings', MOCK_MEETINGS);
    return apiClient.get<Meeting[]>('/meetings', local);
  },
  async createMeeting(meeting: Omit<Meeting, 'id'>): Promise<Meeting> {
    const newMeeting: Meeting = { ...meeting, id: `m_${Date.now()}` };
    const current = await meetingsApi.getMeetings();
    const updated = [newMeeting, ...current];
    saveStateToStorage('meetings', updated);
    return apiClient.post<Meeting>('/meetings', newMeeting, newMeeting);
  },
  async updateMeeting(meeting: Meeting): Promise<Meeting> {
    const current = await meetingsApi.getMeetings();
    const updated = current.map(m => m.id === meeting.id ? meeting : m);
    saveStateToStorage('meetings', updated);
    return apiClient.put<Meeting>(`/meetings/${meeting.id}`, meeting, meeting);
  },
  async deleteMeeting(id: string): Promise<void> {
    const current = await meetingsApi.getMeetings();
    const updated = current.filter(m => m.id !== id);
    saveStateToStorage('meetings', updated);
    await apiClient.delete(`/meetings/${id}`, undefined);
  }
};

export const callsApi = {
  async getCalls(): Promise<Call[]> {
    const local = loadStateFromStorage('calls', MOCK_CALLS);
    return apiClient.get<Call[]>('/calls', local);
  },
  async createCall(call: Omit<Call, 'id'>): Promise<Call> {
    const newCall: Call = { ...call, id: `cl_${Date.now()}` };
    const current = await callsApi.getCalls();
    const updated = [newCall, ...current];
    saveStateToStorage('calls', updated);
    return apiClient.post<Call>('/calls', newCall, newCall);
  }
};

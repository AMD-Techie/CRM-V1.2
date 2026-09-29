
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Leads from './components/Leads';
import Pipeline from './components/Pipeline';
import Tasks from './components/Tasks';
import Meetings from './components/Meetings';
import Contacts from './components/Contacts';
import Accounts from './components/Accounts';
import Calls from './components/Calls';
import Campaigns from './components/Campaigns';
import Settings from './components/Settings';
import Documents from './components/Documents';
import Templates from './components/Templates';
import DocumentEditor from './components/DocumentEditor'; 
import Visits from './components/Visits';
import Projects from './components/Projects';
import Support from './components/Support';
import IAM from './components/IAM';
import Workflows from './components/Workflows';
import CommunicationHub from './components/CommunicationHub';
import AuditLogs from './components/AuditLogs';
import ReportingBI from './components/ReportingBI';
import DataManagement from './components/DataManagement';
import TenantManagement from './components/TenantManagement';
import AIGovernance from './components/AIGovernance';
import APIGateway from './components/APIGateway';

import { CollaborationProvider, useCollaboration } from './components/CollaborationProvider';
import AIChat from './components/AIChat';
import Auth from './components/Auth';
import OfflineIndicator from './components/OfflineIndicator';
import PlaceholderModule from './components/PlaceholderModule';
import { Observability } from './components/Observability';
import { MOCK_LEADS, MOCK_DEALS, MOCK_TASKS, MOCK_MEETINGS, MOCK_CONTACTS, MOCK_ACCOUNTS, MOCK_CALLS, MOCK_CAMPAIGNS, MOCK_DOCUMENTS, MOCK_VISITS, MOCK_PROJECTS, MOCK_TICKETS, MOCK_USERS } from './constants';
import { IconMenu, IconLock, IconClock, IconX, IconArrowRight } from './components/Icons';
import { Lead, Deal, Activity, Task, Meeting, Contact, Account, Call, Campaign, Document, Visit, Project, Ticket, User, RoleDefinition, Permission } from './types';
import Notifications from './components/Notifications';
import { authService } from './services/authService';
import { saveStateToStorage, loadStateFromStorage, addToSyncQueue, syncDataWithBackend, getSyncQueue } from './services/offlineService';

// Modern Hex Palette for Tailwind v4 compatibility
const THEMES: Record<string, Record<number, string>> = {
  indigo: { 50: '#f5f6ff', 100: '#ebedfe', 200: '#d7dbfe', 300: '#b9beff', 400: '#9398ff', 500: '#5145cd', 600: '#3e31ae', 700: '#32268f', 800: '#2a2075', 900: '#1f1857', 950: '#110c34' },
  slate: { 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#52525b', 600: '#3f3f46', 700: '#27272a', 800: '#1b1b1f', 900: '#111113', 950: '#060608' },
  emerald: { 50: '#f4fbf7', 100: '#e3f7ec', 200: '#c5ebd7', 300: '#94dbb6', 400: '#58c48e', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22' },
  purple: { 50: '#fafaff', 100: '#f3f0ff', 200: '#e7e2fe', 300: '#d1c7fe', 400: '#b1a0fd', 500: '#7c3aed', 600: '#6d28d9', 700: '#5b21b6', 800: '#4c1a96', 900: '#35106b', 950: '#1d053f' },
  orange: { 50: '#fffbf7', 100: '#fff2e6', 200: '#ffe0cc', 300: '#ffc299', 400: '#ffa066', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12', 950: '#431407' },
  rose: { 50: '#fff8f8', 100: '#ffeff1', 200: '#ffdbe0', 300: '#ffb3bd', 400: '#ff8093', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519' },
  cyan: { 50: '#f2fcfd', 100: '#e0f7fa', 200: '#bcebf0', 300: '#83dbe6', 400: '#42c3d4', 500: '#00a3c4', 600: '#0084a3', 700: '#006a85', 800: '#03556b', 900: '#054659', 950: '#012834' },
  blue: { 50: '#f5f9ff', 100: '#ebf3ff', 200: '#d6e6ff', 300: '#b3d1ff', 400: '#85b3ff', 500: '#2563eb', 600: '#1d4ed8', 700: '#1e40af', 800: '#1e3a8a', 900: '#172554', 950: '#0c1530' },
};

// Initial RBAC Data
const DEFAULT_ROLES: RoleDefinition[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access and configuration control',
    isSystem: true,
    permissions: ['view_dashboard', 'manage_users', 'manage_settings', 'view_leads', 'edit_leads', 'delete_records', 'export_data', 'view_revenue', 'manage_pipeline', 'use_ai_features']
  },
  {
    id: 'manager',
    name: 'Sales Manager',
    description: 'Can manage teams and view revenue, but cannot change system settings',
    isSystem: true,
    permissions: ['view_dashboard', 'view_leads', 'edit_leads', 'export_data', 'view_revenue', 'manage_pipeline', 'use_ai_features']
  },
  {
    id: 'sales_rep',
    name: 'Sales Representative',
    description: 'Standard access to manage own leads and deals',
    isSystem: false,
    permissions: ['view_dashboard', 'view_leads', 'edit_leads', 'manage_pipeline', 'use_ai_features']
  },
  {
    id: 'support',
    name: 'Support Agent',
    description: 'Access to ticketing and customer view only',
    isSystem: false,
    permissions: ['view_dashboard', 'view_leads']
  }
];

const VIEW_PERMISSIONS: Record<string, Permission> = {
  dashboard: 'view_dashboard',
  leads: 'view_leads',
  contacts: 'view_leads',
  accounts: 'view_leads',
  pipeline: 'manage_pipeline',
  tasks: 'view_leads',
  meetings: 'view_leads',
  calls: 'view_leads',
  campaigns: 'manage_pipeline',
  documents: 'view_leads',
  templates: 'manage_settings',
  visits: 'view_leads',
  projects: 'view_leads',
  support: 'view_leads',
  settings: 'manage_settings',
  'document-editor': 'view_leads',
  reporting: 'view_dashboard',
  iam: 'manage_settings',
  workflows: 'manage_settings',
  communications: 'manage_settings',
  audit_logs: 'manage_settings',
  api_management: 'manage_settings',
  observability: 'manage_settings',
  tenancy: 'manage_settings'
};

function MainApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [previousView, setPreviousView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  // Offline & Sync State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);

  // Theme Settings
  const [primaryColor, setPrimaryColor] = useState('indigo');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [density, setDensity] = useState('Medium');
  const [weekStart, setWeekStart] = useState('Sunday');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeZone, setTimeZone] = useState('UTC');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  const [workingDays, setWorkingDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [fiscalYearStart, setFiscalYearStart] = useState('January');

  // Finance Settings
  const [defaultPaymentTerm, setDefaultPaymentTerm] = useState('Net 30');
  const [defaultTaxRate, setDefaultTaxRate] = useState(0);
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [multiCurrency, setMultiCurrency] = useState(false);

  // RBAC & Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [roles, setRoles] = useState<RoleDefinition[]>(DEFAULT_ROLES);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);

  // State for data (Initialized synchronously with self-healing offline loader to ensure instant dashboard paints)
  const [leads, setLeads] = useState<Lead[]>(() => loadStateFromStorage('leads', MOCK_LEADS));
  const [deals, setDeals] = useState<Deal[]>(() => loadStateFromStorage('deals', MOCK_DEALS));
  const [tasks, setTasks] = useState<Task[]>(() => loadStateFromStorage('tasks', MOCK_TASKS));
  const [meetings, setMeetings] = useState<Meeting[]>(() => loadStateFromStorage('meetings', MOCK_MEETINGS));
  const [contacts, setContacts] = useState<Contact[]>(() => loadStateFromStorage('contacts', MOCK_CONTACTS));
  const [accounts, setAccounts] = useState<Account[]>(() => loadStateFromStorage('accounts', MOCK_ACCOUNTS));
  const [calls, setCalls] = useState<Call[]>(() => loadStateFromStorage('calls', MOCK_CALLS));
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => loadStateFromStorage('campaigns', MOCK_CAMPAIGNS));
  const [documents, setDocuments] = useState<Document[]>(() => loadStateFromStorage('documents', MOCK_DOCUMENTS));
  const [visits, setVisits] = useState<Visit[]>(() => loadStateFromStorage('visits', MOCK_VISITS));
  const [projects, setProjects] = useState<Project[]>(() => loadStateFromStorage('projects', MOCK_PROJECTS));
  const [tickets, setTickets] = useState<Ticket[]>(() => loadStateFromStorage('tickets', MOCK_TICKETS));
  
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

  interface WorkflowAlert {
    id: string;
    leadId: string;
    leadName: string;
    stage: string;
    days: number;
  }
  const [workflowAlerts, setWorkflowAlerts] = useState<WorkflowAlert[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const alertList: WorkflowAlert[] = [];
    const today = new Date();
    leads.forEach(lead => {
      const dateStr = lead.statusUpdatedAt || lead.creationDate;
      if (!dateStr) return;
      const lastUpdate = new Date(dateStr);
      const diffTime = Math.abs(today.getTime() - lastUpdate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 90) {
        alertList.push({
          id: `sl-alert-${lead.id}`,
          leadId: lead.id,
          leadName: lead.name,
          stage: lead.status || 'New',
          days: diffDays
        });
      }
    });
    // Dynamically flag the top 3 stagnant leads for prompt in-app alerting
    setWorkflowAlerts(alertList.slice(0, 3));
  }, [leads, isAuthenticated]);

  const handleNavigateToLeads = (leadId: string) => {
    setActiveLeadId(leadId);
    setCurrentView('leads');
  };

  const [pipelineGoal, setPipelineGoal] = useState<number>(() => {
    const saved = localStorage.getItem('nova_pipeline_goal');
    return saved ? Number(saved) : 5000000;
  });

  const userRole = roles.find(r => r.id === currentUser.roleId) || DEFAULT_ROLES[2];

  const { navigate } = useCollaboration();

  useEffect(() => {
    navigate(currentView);
  }, [currentView, navigate]);

  // --- Network & Sync Listeners ---
  useEffect(() => {
    // Initial check of queue
    setPendingChanges(getSyncQueue().length);

    const handleOnline = async () => {
      setIsOnline(true);
      const queue = getSyncQueue();
      if (queue.length > 0) {
        setIsSyncing(true);
        // Simulate sync
        await syncDataWithBackend();
        setIsSyncing(false);
        setPendingChanges(0);
        // Optional: Show success notification
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- State Persistence Effects ---
  // Save state to local storage whenever it changes to support "offline local memory"
  useEffect(() => { saveStateToStorage('leads', leads); }, [leads]);
  useEffect(() => { saveStateToStorage('deals', deals); }, [deals]);
  useEffect(() => { saveStateToStorage('tasks', tasks); }, [tasks]);
  useEffect(() => { saveStateToStorage('meetings', meetings); }, [meetings]);
  useEffect(() => { saveStateToStorage('contacts', contacts); }, [contacts]);
  useEffect(() => { saveStateToStorage('accounts', accounts); }, [accounts]);
  useEffect(() => { saveStateToStorage('calls', calls); }, [calls]);
  useEffect(() => { saveStateToStorage('campaigns', campaigns); }, [campaigns]);
  useEffect(() => { saveStateToStorage('documents', documents); }, [documents]);
  useEffect(() => { saveStateToStorage('visits', visits); }, [visits]);
  useEffect(() => { saveStateToStorage('projects', projects); }, [projects]);
  useEffect(() => { saveStateToStorage('tickets', tickets); }, [tickets]);

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        const user = authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } else {
        const refreshedToken = await authService.refreshSession();
        if (refreshedToken) {
           const user = authService.getCurrentUser();
           if (user) {
             setCurrentUser(user);
             setIsAuthenticated(true);
           }
        }
      }
      setIsLoadingAuth(false);
    };
    initAuth();
  }, []);

  const handleLogin = async (email: string, password?: string): Promise<boolean> => {
    const response = await authService.login(email, password);
    if (response) {
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  const handleSetPipelineGoal = (goal: number) => {
    setPipelineGoal(goal);
    localStorage.setItem('nova_pipeline_goal', goal.toString());
  };

  const handleNavigateToTasks = () => {
    setCurrentView('tasks');
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const root = document.documentElement;
    const themeColors = THEMES[primaryColor] || THEMES.indigo;

    Object.keys(themeColors).forEach((key) => {
      root.style.setProperty(`--theme-primary-${key}`, themeColors[Number(key)]);
    });

    const fontMap: Record<string, string> = {
      'Inter': "'Inter', sans-serif",
      'JetBrains Mono': "'JetBrains Mono', monospace",
      'Plus Jakarta': "'Plus Jakarta Sans', sans-serif",
      'Plus Jakarta Sans': "'Plus Jakarta Sans', sans-serif",
      'Inter UI': "'Inter', sans-serif",
      'Montserrat': "'Montserrat', sans-serif",
      'Outfit': "'Outfit', sans-serif",
      'Lexend': "'Lexend', sans-serif",
      'Playfair Display': "'Playfair Display', serif",
    };
    root.style.setProperty('--font-family', fontMap[fontFamily] || "'Inter', sans-serif");

    const sizeMap: Record<string, string> = {
      'Small': '14px',
      'Medium': '16px',
      'Large': '17px',
      'XL': '18px'
    };
    root.style.setProperty('--base-font-size', sizeMap[density] || '16px');
    root.style.fontSize = sizeMap[density] || '16px';

  }, [primaryColor, fontFamily, density]);

  const toggleTheme = () => setIsDark(!isDark);
  
  // Data Handlers with Offline Support
  const handleAddLead = (newLeadData: Omit<Lead, 'id'>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const leadToAdd: Lead = {
      ...newLeadData,
      id: `L${Date.now()}`,
      score: 50,
      scoreBreakdown: { fit: 50, engagement: 50, budget: 50 },
      notes: 'Newly created lead.',
      lastContact: todayStr,
      name: `${newLeadData.firstName || ''} ${newLeadData.lastName || ''}`.trim(),
      owner: currentUser.name,
      creationDate: newLeadData.creationDate || todayStr,
      statusUpdatedAt: todayStr,
    };
    setLeads(prevLeads => [leadToAdd, ...prevLeads]);
    if (!navigator.onLine) {
      const count = addToSyncQueue('ADD_LEAD', leadToAdd);
      setPendingChanges(count);
    }
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads(prevLeads => prevLeads.map(lead => {
      if (lead.id === updatedLead.id) {
        const statusChanged = lead.status !== updatedLead.status;
        const statusUpdatedAt = statusChanged 
          ? new Date().toISOString().split('T')[0] 
          : (lead.statusUpdatedAt || lead.creationDate || new Date().toISOString().split('T')[0]);
        return { 
          ...lead, 
          ...updatedLead, 
          name: `${updatedLead.firstName || ''} ${updatedLead.lastName || ''}`.trim(),
          statusUpdatedAt
        };
      }
      return lead;
    }));
    if (!navigator.onLine) {
      const count = addToSyncQueue('UPDATE_LEAD', updatedLead);
      setPendingChanges(count);
    }
  };

  const handleUpdateLeads = (updatedLeadsList: Lead[]) => {
    const updatedMap = new Map(updatedLeadsList.map(l => [l.id, l]));
    setLeads(prevLeads => prevLeads.map(lead => {
      if (updatedMap.has(lead.id)) {
        const updatedLead = updatedMap.get(lead.id)!;
        const statusChanged = lead.status !== updatedLead.status;
        const statusUpdatedAt = statusChanged 
          ? new Date().toISOString().split('T')[0] 
          : (lead.statusUpdatedAt || lead.creationDate || new Date().toISOString().split('T')[0]);
        return { 
          ...lead, 
          ...updatedLead, 
          name: `${updatedLead.firstName || ''} ${updatedLead.lastName || ''}`.trim(),
          statusUpdatedAt
        };
      }
      return lead;
    }));
    if (!navigator.onLine) {
      updatedLeadsList.forEach(l => {
        addToSyncQueue('UPDATE_LEAD', l);
      });
      setPendingChanges(getSyncQueue().length);
    }
  };
  
  const handleDeleteLeads = (leadIdsToDelete: string[]) => {
    setLeads(prevLeads => prevLeads.filter(lead => !leadIdsToDelete.includes(lead.id)));
    if (!navigator.onLine) {
      const count = addToSyncQueue('DELETE_LEAD', leadIdsToDelete);
      setPendingChanges(count);
    }
  };

  const handleAddContact = (contactData: Omit<Contact, 'id' | 'lastActivity'>) => {
    const newContact: Contact = {
      ...contactData,
      id: `C${Date.now()}`,
      lastActivity: 'Just now',
      owner: currentUser.name,
    } as Contact;
    setContacts(prevContacts => [newContact, ...prevContacts]);
    if (!navigator.onLine) {
        setPendingChanges(addToSyncQueue('ADD_CONTACT', newContact));
    }
  };

  const handleUpdateContact = (updatedContact: Contact) => {
    setContacts(prevContacts => prevContacts.map(c => 
      c.id === updatedContact.id ? updatedContact : c
    ));
    if (!navigator.onLine) {
        setPendingChanges(addToSyncQueue('UPDATE_CONTACT', updatedContact));
    }
  };

  const handleAddAccount = (newAccount: Account) => {
    setAccounts(prevAccounts => [...prevAccounts, newAccount]);
    if (!navigator.onLine) {
        setPendingChanges(addToSyncQueue('ADD_ACCOUNT', newAccount));
    }
  };

  const handleUpdateAccount = (updatedAccount: Account) => {
    setAccounts(prevAccounts => prevAccounts.map(a => 
      a.id === updatedAccount.id ? updatedAccount : a
    ));
    if (!navigator.onLine) {
        setPendingChanges(addToSyncQueue('UPDATE_ACCOUNT', updatedAccount));
    }
  };

  const handleDeleteAccount = (accountId: string) => {
    setAccounts(prevAccounts => prevAccounts.filter(a => a.id !== accountId));
  };

  const handleAddCall = (callData: Omit<Call, 'id'>) => {
    const newCall: Call = {
      ...callData,
      id: `CALL-${Date.now()}`,
    };
    setCalls(prevCalls => [newCall, ...prevCalls]);
  };

  const handleAddMeeting = (newMeeting: Meeting) => {
    setMeetings(prev => [...prev, newMeeting]);
  };

  const handleUpdateMeeting = (updatedMeeting: Meeting) => {
    setMeetings(prev => prev.map(m => m.id === updatedMeeting.id ? updatedMeeting : m));
  };

  const handleDeleteMeeting = (meetingId: string) => {
    setMeetings(prev => prev.filter(m => m.id !== meetingId));
  };

  const handleAddDeal = (newDeal: Deal) => {
    const activities = newDeal.activities && newDeal.activities.length > 0 
      ? newDeal.activities 
      : [{
          id: Date.now().toString(),
          type: 'created' as const,
          description: 'Deal created',
          timestamp: new Date().toISOString()
        }];

    const dealWithActivity = {
      ...newDeal,
      activities
    };
    setDeals(prevDeals => [...prevDeals, dealWithActivity]);
    if (!navigator.onLine) {
        setPendingChanges(addToSyncQueue('ADD_DEAL', dealWithActivity));
    }
  };

  const handleUpdateDeal = (updatedDeal: Deal) => {
    setDeals(prevDeals => {
      const oldDeal = prevDeals.find(d => d.id === updatedDeal.id);
      if (!oldDeal) return prevDeals;

      const newActivities: Activity[] = [];
      const timestamp = new Date().toISOString();

      if (oldDeal.stage !== updatedDeal.stage) {
        newActivities.push({ id: Date.now().toString() + 's', type: 'stage_change', description: `Stage updated to ${updatedDeal.stage}`, timestamp });
      }
      if (oldDeal.value !== updatedDeal.value) {
        newActivities.push({ id: Date.now().toString() + 'v', type: 'value_change', description: `Value updated from $${oldDeal.value.toLocaleString()} to $${updatedDeal.value.toLocaleString()}`, timestamp });
      }
      if (oldDeal.probability !== updatedDeal.probability) {
        newActivities.push({ id: Date.now().toString() + 'p', type: 'probability_change', description: `Probability updated from ${oldDeal.probability}% to ${updatedDeal.probability}%`, timestamp });
      }

      const hasManualActivity = updatedDeal.activities && updatedDeal.activities.length > (oldDeal.activities?.length || 0);
      if (newActivities.length === 0 && !hasManualActivity && JSON.stringify(oldDeal) !== JSON.stringify(updatedDeal)) {
         newActivities.push({ id: Date.now().toString() + 'u', type: 'update', description: `Deal details updated`, timestamp });
      }

      const baseActivities = updatedDeal.activities && updatedDeal.activities.length >= (oldDeal.activities?.length || 0) 
        ? updatedDeal.activities 
        : (oldDeal.activities || []);

      const finalDeal = {
        ...updatedDeal,
        activities: [...baseActivities, ...newActivities]
      };

      if (!navigator.onLine) {
          setPendingChanges(addToSyncQueue('UPDATE_DEAL', finalDeal));
      }

      return prevDeals.map(d => d.id === updatedDeal.id ? finalDeal : d);
    });
  };

  const handleAddTask = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    if (!navigator.onLine) {
        setPendingChanges(addToSyncQueue('ADD_TASK', newTask));
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (!navigator.onLine) {
        setPendingChanges(addToSyncQueue('UPDATE_TASK', updatedTask));
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (!navigator.onLine) {
        setPendingChanges(addToSyncQueue('DELETE_TASK', taskId));
    }
  };

  const handleAddCampaign = (newCampaign: Campaign) => {
    setCampaigns(prev => [...prev, newCampaign]);
  };

  const handleUpdateCampaign = (updatedCampaign: Campaign) => {
    setCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
  };

  const handleDeleteCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
  };

  const handleAddDocument = (newDoc: Document) => {
    setDocuments(prev => [newDoc, ...prev]);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const handleUpdateDocument = (updatedDoc: Document) => {
    setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
  };

  const handleAddVisit = (newVisit: Visit) => {
    setVisits(prev => [newVisit, ...prev]);
  };

  const handleUpdateVisit = (updatedVisit: Visit) => {
    setVisits(prev => prev.map(v => v.id === updatedVisit.id ? updatedVisit : v));
  };

  const handleDeleteVisit = (visitId: string) => {
    setVisits(prev => prev.filter(v => v.id !== visitId));
  };

  const handleAddProject = (newProject: Project) => {
    setProjects(prev => [...prev, newProject]);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const handleAddTicket = (newTicket: Ticket) => {
    setTickets(prev => [...prev, newTicket]);
  };

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
  };

  const handleDeleteTicket = (ticketId: string) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId));
  };

  const handleEditDocument = (doc: Document) => {
      setEditingDocument(doc);
      setPreviousView(currentView);
      setCurrentView('document-editor');
  };

  const handleCloseEditor = () => {
      setEditingDocument(null);
      setCurrentView(previousView);
  };

  const renderContent = () => {
    const requiredPerm = VIEW_PERMISSIONS[currentView];
    if (requiredPerm && !userRole.permissions.includes(requiredPerm)) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                    <IconLock className="w-12 h-12 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                    You do not have permission to view this module. Please contact your administrator if you believe this is an error.
                </p>
                <button 
                    onClick={() => setCurrentView('dashboard')}
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
            leads={leads} 
            deals={deals} 
            tasks={tasks} 
            meetings={meetings} 
            calls={calls}
            isDark={isDark} 
            pipelineGoal={pipelineGoal}
            userRole={userRole} 
            defaultCurrency={defaultCurrency}
            multiCurrency={multiCurrency}
            currentUser={currentUser}
            onNavigate={(view: string, leadId?: string) => {
              setCurrentView(view);
              if (leadId && view === 'leads') {
                setActiveLeadId(leadId);
              }
            }}
            onAddLead={handleAddLead}
            onAddDeal={handleAddDeal}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onAddMeeting={handleAddMeeting}
            onAddCall={handleAddCall}
            onSetPipelineGoal={handleSetPipelineGoal}
        />;
      case 'leads':
        return <Leads 
            leads={leads}
            accounts={accounts} 
            contacts={contacts}
            onAddLead={handleAddLead} 
            onUpdateLead={handleUpdateLead} 
            onUpdateLeads={handleUpdateLeads}
            onDeleteLeads={handleDeleteLeads} 
            onAddDeal={handleAddDeal} 
            onViewOpportunities={() => setCurrentView('pipeline')}
            onAddDocument={handleAddDocument}
            documents={documents}
            onUpdateDocument={handleUpdateDocument}
            onDeleteDocument={handleDeleteDocument}
            onEditDocument={handleEditDocument} 
            calls={calls}
            onAddCall={handleAddCall}
            userRole={userRole}
            currentUser={currentUser}
            users={users}
            defaultCurrency={defaultCurrency}
            multiCurrency={multiCurrency}
            initialSelectedLeadId={activeLeadId || undefined}
            onClearSelectedLeadId={() => setActiveLeadId(null)}
        />;
      case 'pipeline':
        return <Pipeline 
            deals={deals}
            accounts={accounts}
            contacts={contacts}
            onAddDeal={handleAddDeal} 
            onUpdateDeal={handleUpdateDeal} 
            pipelineGoal={pipelineGoal} 
            onSetGoal={handleSetPipelineGoal} 
            userRole={userRole}
            defaultCurrency={defaultCurrency}
            multiCurrency={multiCurrency}
        />;
      case 'tasks':
        return <Tasks tasks={tasks} onAddTask={handleAddTask} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />;
      case 'meetings':
        return <Meetings 
          meetings={meetings} 
          contacts={contacts}
          accounts={accounts}
          onAddMeeting={handleAddMeeting} 
          onUpdateMeeting={handleUpdateMeeting} 
          onDeleteMeeting={handleDeleteMeeting}
        />;
      case 'contacts':
        return <Contacts 
          contacts={contacts} 
          accounts={accounts}
          onAddContact={handleAddContact} 
          onUpdateContact={handleUpdateContact} 
          currentUser={currentUser}
        />;
      case 'accounts':
        return <Accounts 
          accounts={accounts} 
          contacts={contacts} 
          deals={deals}
          leads={leads}
          meetings={meetings}
          calls={calls}
          onAddAccount={handleAddAccount} 
          onUpdateAccount={handleUpdateAccount} 
          onDeleteAccount={handleDeleteAccount}
          onAddContact={handleAddContact}
          onAddCall={handleAddCall}
          onAddDocument={handleAddDocument}
          onEditDocument={handleEditDocument}
          userRole={userRole}
          currentUser={currentUser}
          defaultCurrency={defaultCurrency}
          multiCurrency={multiCurrency}
        />;
      case 'calls':
        return <Calls calls={calls} leads={leads} contacts={contacts} accounts={accounts} onAddCall={handleAddCall} />;
      case 'campaigns': 
        return <Campaigns 
          campaigns={campaigns} 
          onAddCampaign={handleAddCampaign} 
          onUpdateCampaign={handleUpdateCampaign} 
          onDeleteCampaign={handleDeleteCampaign} 
          defaultCurrency={defaultCurrency}
          multiCurrency={multiCurrency}
        />;
      case 'documents':
        return <Documents 
          documents={documents}
          onAddDocument={handleAddDocument}
          onUpdateDocument={handleUpdateDocument}
          onDeleteDocument={handleDeleteDocument}
          onEditDocument={handleEditDocument}
        />;
      case 'templates':
        return <Templates />;
      case 'document-editor':
        return editingDocument ? (
            <DocumentEditor 
                document={editingDocument}
                onSave={(updatedDoc) => {
                    handleUpdateDocument(updatedDoc);
                    handleCloseEditor();
                }}
                onClose={handleCloseEditor}
                defaultCurrency={defaultCurrency}
                multiCurrency={multiCurrency}
            />
        ) : <Dashboard leads={leads} deals={deals} tasks={tasks} meetings={meetings} calls={calls} isDark={isDark} pipelineGoal={pipelineGoal} userRole={userRole} />;
      case 'settings':
        return <Settings 
          tasks={tasks}
          meetings={meetings}
          leads={leads}
          isDark={isDark} 
          toggleTheme={toggleTheme} 
          primaryColor={primaryColor} 
          setPrimaryColor={setPrimaryColor} 
          pipelineGoal={pipelineGoal}
          setPipelineGoal={handleSetPipelineGoal}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          density={density}
          setDensity={setDensity}
          weekStart={weekStart}
          setWeekStart={setWeekStart}
          dateFormat={dateFormat}
          setDateFormat={setDateFormat}
          timeZone={timeZone}
          setTimeZone={setTimeZone}
          timeFormat={timeFormat}
          setTimeFormat={setTimeFormat}
          workingDays={workingDays}
          setWorkingDays={setWorkingDays}
          fiscalYearStart={fiscalYearStart}
          setFiscalYearStart={setFiscalYearStart}
          defaultPaymentTerm={defaultPaymentTerm}
          setDefaultPaymentTerm={setDefaultPaymentTerm}
          defaultTaxRate={defaultTaxRate}
          setDefaultTaxRate={setDefaultTaxRate}
          taxEnabled={taxEnabled}
          setTaxEnabled={setTaxEnabled}
          defaultCurrency={defaultCurrency}
          setDefaultCurrency={setDefaultCurrency}
          multiCurrency={multiCurrency}
          setMultiCurrency={setMultiCurrency}
          roles={roles}
          setRoles={setRoles}
          users={users}
          setUsers={setUsers}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
        />;
      case 'visits': 
        return <Visits 
          visits={visits}
          accounts={accounts}
          onAddVisit={handleAddVisit}
          onUpdateVisit={handleUpdateVisit}
          onDeleteVisit={handleDeleteVisit}
        />;
      case 'projects': 
        return <Projects
          projects={projects}
          tasks={tasks} 
          onAddProject={handleAddProject}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
          onAddTask={handleAddTask}
          defaultCurrency={defaultCurrency}
          multiCurrency={multiCurrency}
        />;
      case 'support':
        return <Support 
          tickets={tickets}
          accounts={accounts}
          onAddTicket={handleAddTicket}
          onUpdateTicket={handleUpdateTicket}
          onDeleteTicket={handleDeleteTicket}
        />;
      case 'reporting':
        return <ReportingBI />;
      case 'data_management':
        return <DataManagement
            contacts={contacts} setContacts={setContacts}
            leads={leads} setLeads={setLeads}
            accounts={accounts} setAccounts={setAccounts}
            deals={deals} setDeals={setDeals}
        />;
      case 'ai_governance':
        return <AIGovernance />;
      case 'iam':
        return <IAM />;
      case 'workflows':
        return <Workflows leads={leads} />;
      case 'communications':
        return <CommunicationHub 
          contacts={contacts}
          setContacts={setContacts}
          tasks={tasks}
          setTasks={setTasks}
          leads={leads}
          setLeads={setLeads}
        />;
      case 'audit_logs':
        return <AuditLogs />;
      case 'api_management':
        return <APIGateway />;
      case 'observability':
        return <Observability />;
      case 'tenancy':
        return <TenantManagement />;
      default: return <Dashboard leads={leads} deals={deals} tasks={tasks} meetings={meetings} calls={calls} isDark={isDark} pipelineGoal={pipelineGoal} userRole={userRole} />;
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="flex relative h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 font-sans selection:bg-primary-500/30 transition-colors duration-300">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-grid-pattern opacity-50 dark:opacity-20 mix-blend-multiply dark:mix-blend-overlay pointer-events-none transition-opacity duration-300" />
      
      <OfflineIndicator isOnline={isOnline} isSyncing={isSyncing} pendingChanges={pendingChanges} />
      
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-all duration-300" onClick={() => setSidebarOpen(false)} />
      )}
      
      {currentView !== 'document-editor' && (
          <Sidebar 
            currentView={currentView} 
            setView={(view) => { setCurrentView(view); setSidebarOpen(false); }} 
            isOpen={sidebarOpen}
            isDark={isDark}
            toggleTheme={toggleTheme}
            userRole={userRole}
            onLogout={handleLogout}
          />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {currentView !== 'document-editor' && (
            <header className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300 z-20 sticky top-0">
               <div className="flex items-center gap-4 flex-1">
                 <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white">
                    <IconMenu className="w-6 h-6" />
                 </button>
                 <span className="md:hidden font-bold text-slate-900 dark:text-white mr-4">NovaCRM</span>
               </div>
               
               <div className="flex items-center gap-4">
                 <Notifications 
                   tasks={tasks} 
                   leads={leads}
                   onNavigateToTasks={handleNavigateToTasks} 
                   onNavigateToLeads={handleNavigateToLeads}
                 />
               </div>
            </header>
        )}
        
        <main className={`flex-1 overflow-x-hidden overflow-y-auto bg-transparent relative z-10 ${currentView === 'document-editor' ? '' : 'p-4 md:p-8 pt-4 md:pt-6 custom-scrollbar'}`}>
          {renderContent()}
        </main>
        
        {currentView !== 'document-editor' && <AIChat leads={leads} deals={deals} />}
      </div>

      {/* Workflow Floating Toast Alerts */}
      {workflowAlerts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
          {workflowAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className="p-4 bg-slate-900 border border-slate-700/60 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col gap-3 pointer-events-auto animate-fade-in-up transition-all hover:scale-[1.02] duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                  <IconClock className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Workflow SLA Trigger</span>
                    <button 
                      onClick={() => setWorkflowAlerts(prev => prev.filter(a => a.id !== alert.id))}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <IconX className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-sm text-slate-100 mt-1">Lead Stagnation Alert</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Opportunity <strong className="text-white">{alert.leadName}</strong> has remained in stage <strong className="text-amber-400 font-semibold">"{alert.stage}"</strong> for <strong>{alert.days} days</strong> (&gt; 3 months).
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2.5 border-t border-slate-800">
                <button 
                  onClick={() => setWorkflowAlerts(prev => prev.filter(a => a.id !== alert.id))}
                  className="px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                >
                  Dismiss
                </button>
                <button 
                  onClick={() => {
                    handleNavigateToLeads(alert.leadId);
                    setWorkflowAlerts(prev => prev.filter(a => a.id !== alert.id));
                  }}
                  className="px-3 py-1.5 text-[11px] font-bold bg-primary-600 text-white hover:bg-primary-500 rounded-lg shadow-md shadow-primary-600/20 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Review Lead</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function App() {
  return (
    <CollaborationProvider currentUser={{ name: 'Demo User', email: 'user@example.com' }}>
      <MainApp />
    </CollaborationProvider>
  );
}

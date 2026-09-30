
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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

import { AICommandCenter } from './features/ai-workspace/command-center/AICommandCenter';
import { AgentManagement } from './features/ai-workspace/agents/AgentManagement';
import { AgentRunsView } from './features/ai-workspace/agent-runs/AgentRunsView';
import { WorkflowsView } from './features/ai-workspace/workflows/WorkflowsView';
import { SkillsView } from './features/ai-workspace/skills/SkillsView';
import { SkillEvaluationsView } from './features/ai-workspace/evaluations/SkillEvaluationsView';
import { CapabilitiesMatrixView } from './features/ai-workspace/capabilities/CapabilitiesMatrixView';
import { AIActionsView } from './features/ai-workspace/actions/AIActionsView';
import { AIApprovalsView } from './features/ai-workspace/approvals/AIApprovalsView';
import { AIInsightsView } from './features/ai-workspace/insights/AIInsightsView';
import { AICopilotDock } from './features/ai-workspace/copilot/AICopilotDock';
import { KnowledgeBaseView } from './features/knowledge/KnowledgeBaseView';

import { 
  useLeadsQuery, 
  useCreateLeadMutation, 
  useUpdateLeadMutation, 
  useDeleteLeadMutation,
  useDealsQuery, 
  useCreateDealMutation, 
  useUpdateDealMutation,
  useContactsQuery, 
  useCreateContactMutation, 
  useUpdateContactMutation,
  useAccountsQuery, 
  useCreateAccountMutation,
  useTasksQuery, 
  useCreateTaskMutation, 
  useUpdateTaskMutation, 
  useDeleteTaskMutation,
  useMeetingsQuery, 
  useCallsQuery
} from './hooks';

import { CollaborationProvider, useCollaboration } from './components/CollaborationProvider';
import AIChat from './components/AIChat';
import Auth from './components/Auth';
import OfflineIndicator from './components/OfflineIndicator';
import PlaceholderModule from './components/PlaceholderModule';
import { Observability } from './components/Observability';
import { MOCK_LEADS, MOCK_DEALS, MOCK_TASKS, MOCK_MEETINGS, MOCK_CONTACTS, MOCK_ACCOUNTS, MOCK_CALLS, MOCK_CAMPAIGNS, MOCK_DOCUMENTS, MOCK_VISITS, MOCK_PROJECTS, MOCK_TICKETS, MOCK_USERS } from './constants';
import { IconMenu, IconLock, IconClock, IconX, IconArrowRight, IconSun, IconMoon, IconSparkles, IconCheck, IconPlus, IconChevronRight, IconSettings, IconZap } from './components/Icons';
import { Lead, Deal, Activity, Task, Meeting, Contact, Account, Call, Campaign, Document, Visit, Project, Ticket, User, RoleDefinition, Permission } from './types';
import Notifications from './components/Notifications';
import { authService } from './services/authService';
import { saveStateToStorage, loadStateFromStorage, addToSyncQueue, syncDataWithBackend, getSyncQueue } from './services/offlineService';

// Modern Hex Palette for Tailwind v4 compatibility
const THEMES: Record<string, Record<number, string>> = {
  indigo: { 50: '#f5f6ff', 100: '#ebedfe', 200: '#d7dbfe', 300: '#b9beff', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b' },
  slate: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' },
  emerald: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22' },
  purple: { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764' },
  blue: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554' },
  rose: { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519' },
  amber: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03' },
  teal: { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a', 950: '#042f2e' },
  cyan: { 50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63', 950: '#083344' },
  orange: { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12', 950: '#431407' },
};

const PALETTE_OPTIONS = [
  { id: 'indigo', name: 'Hyper Indigo', hex: '#6366f1' },
  { id: 'slate', name: 'Obsidian Slate', hex: '#0f172a' },
  { id: 'emerald', name: 'Emerald Pine', hex: '#10b981' },
  { id: 'purple', name: 'Royal Amethyst', hex: '#a855f7' },
  { id: 'blue', name: 'Cobalt Sapphire', hex: '#3b82f6' },
  { id: 'rose', name: 'Crimson Ruby', hex: '#f43f5e' },
  { id: 'amber', name: 'Sunrise Amber', hex: '#f59e0b' },
  { id: 'teal', name: 'Nordic Teal', hex: '#14b8a6' },
  { id: 'cyan', name: 'Quantum Cyan', hex: '#06b6d4' },
  { id: 'orange', name: 'Sunset Copper', hex: '#f97316' },
];

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
  tenancy: 'manage_settings',
  ai_command_center: 'use_ai_features',
  ai_agents: 'use_ai_features',
  ai_agent_runs: 'use_ai_features',
  ai_actions: 'use_ai_features',
  ai_approvals: 'use_ai_features',
  ai_insights: 'use_ai_features',
  knowledge_base: 'view_leads'
};

const VIEW_LABELS: Record<string, { title: string; category: string }> = {
  dashboard: { title: 'Executive Command Center', category: 'Dashboard' },
  leads: { title: 'Lead Intelligence & Pipeline', category: 'CRM' },
  contacts: { title: 'Contact Directory', category: 'CRM' },
  accounts: { title: 'Client Organizations', category: 'CRM' },
  pipeline: { title: 'Opportunity Pipeline', category: 'Sales' },
  tasks: { title: 'Task & Action Radar', category: 'Workspace' },
  meetings: { title: 'Customer Meeting Schedule', category: 'Workspace' },
  calls: { title: 'Outreach & Call Center', category: 'Workspace' },
  campaigns: { title: 'Marketing Campaigns', category: 'Growth' },
  documents: { title: 'Contracts & Proposals', category: 'Workspace' },
  templates: { title: 'Document & Quote Templates', category: 'Workspace' },
  visits: { title: 'Field Visit Logistics', category: 'Operations' },
  projects: { title: 'Client Engagements', category: 'Operations' },
  support: { title: 'Support & Resolution Hub', category: 'Operations' },
  settings: { title: 'Workspace & Appearance Settings', category: 'System' },
  reporting: { title: 'Executive BI & Analytics', category: 'Analytics' },
  data_management: { title: 'Data Import & Exports', category: 'Enterprise' },
  ai_governance: { title: 'AI Governance & Policy', category: 'Enterprise' },
  iam: { title: 'Identity & Access Management', category: 'Enterprise' },
  workflows: { title: 'Automation Workflows', category: 'Enterprise' },
  communications: { title: 'Omnichannel Communication Hub', category: 'Enterprise' },
  audit_logs: { title: 'Audit Trail & Compliance', category: 'Enterprise' },
  tenancy: { title: 'Multi-Tenant Partitioning', category: 'Enterprise' },
  api_management: { title: 'API Gateway & Webhooks', category: 'Enterprise' },
  observability: { title: 'System Telemetry & Health', category: 'Enterprise' },
  'document-editor': { title: 'Document Studio', category: 'Workspace' },
  ai_command_center: { title: 'AI Command Center', category: 'AI Workspace' },
  ai_agents: { title: 'AI Agents Fleet', category: 'AI Workspace' },
  ai_agent_runs: { title: 'Agent Execution Runs', category: 'AI Workspace' },
  ai_actions: { title: 'AI Operations & Action Queue', category: 'AI Workspace' },
  ai_approvals: { title: 'AI Approval Center', category: 'AI Workspace' },
  ai_insights: { title: 'AI Insights & Revenue Signals', category: 'AI Workspace' },
  knowledge_base: { title: 'Knowledge Base & Playbooks', category: 'Knowledge' }
};

function MainApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [previousView, setPreviousView] = useState('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('nova_theme_dark');
    return saved !== null ? saved === 'true' : false;
  });
  
  // Quick Palette Switcher dropdown state
  const [isPalettePickerOpen, setIsPalettePickerOpen] = useState(false);
  const palettePickerRef = useRef<HTMLDivElement>(null);
  
  // Offline & Sync State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);

  // Theme Settings with localStorage Memory
  const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('nova_theme_color') || 'indigo');
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('nova_theme_font') || 'Plus Jakarta');
  const [density, setDensity] = useState(() => localStorage.getItem('nova_theme_density') || 'Medium');
  const [weekStart, setWeekStart] = useState('Sunday');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeZone, setTimeZone] = useState('UTC');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  const [workingDays, setWorkingDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [fiscalYearStart, setFiscalYearStart] = useState('January');

  // Close palette dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (palettePickerRef.current && !palettePickerRef.current.contains(e.target as Node)) {
        setIsPalettePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Persist Theme settings
  useEffect(() => {
    localStorage.setItem('nova_theme_color', primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    localStorage.setItem('nova_theme_font', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem('nova_theme_density', density);
  }, [density]);

  useEffect(() => {
    localStorage.setItem('nova_theme_dark', String(isDark));
  }, [isDark]);

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

  // CRM Entity Collections sourced from TanStack Query (Single Source of Server State Truth)
  const { data: leads = [] } = useLeadsQuery();
  const { data: deals = [] } = useDealsQuery();
  const { data: tasks = [] } = useTasksQuery();
  const { data: meetings = [] } = useMeetingsQuery();
  const { data: contacts = [] } = useContactsQuery();
  const { data: accounts = [] } = useAccountsQuery();
  const { data: calls = [] } = useCallsQuery();

  const createLeadMutation = useCreateLeadMutation();
  const updateLeadMutation = useUpdateLeadMutation();
  const deleteLeadMutation = useDeleteLeadMutation();
  const createDealMutation = useCreateDealMutation();
  const updateDealMutation = useUpdateDealMutation();
  const createContactMutation = useCreateContactMutation();
  const updateContactMutation = useUpdateContactMutation();
  const createAccountMutation = useCreateAccountMutation();
  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();

  const queryClient = useQueryClient();

  const handleBulkSetLeads = (val: React.SetStateAction<Lead[]>) => {
    const nextVal = typeof val === 'function' ? val(leads) : val;
    saveStateToStorage('leads', nextVal);
    queryClient.invalidateQueries({ queryKey: ['leads'] });
  };

  const handleBulkSetDeals = (val: React.SetStateAction<Deal[]>) => {
    const nextVal = typeof val === 'function' ? val(deals) : val;
    saveStateToStorage('deals', nextVal);
    queryClient.invalidateQueries({ queryKey: ['deals'] });
  };

  const handleBulkSetContacts = (val: React.SetStateAction<Contact[]>) => {
    const nextVal = typeof val === 'function' ? val(contacts) : val;
    saveStateToStorage('contacts', nextVal);
    queryClient.invalidateQueries({ queryKey: ['contacts'] });
  };

  const handleBulkSetAccounts = (val: React.SetStateAction<Account[]>) => {
    const nextVal = typeof val === 'function' ? val(accounts) : val;
    saveStateToStorage('accounts', nextVal);
    queryClient.invalidateQueries({ queryKey: ['accounts'] });
  };

  const handleBulkSetTasks = (val: React.SetStateAction<Task[]>) => {
    const nextVal = typeof val === 'function' ? val(tasks) : val;
    saveStateToStorage('tasks', nextVal);
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

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
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  const workflowAlerts = useMemo(() => {
    if (!isAuthenticated) return [];
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
    return alertList.filter(a => !dismissedAlertIds.includes(a.id)).slice(0, 3);
  }, [leads, isAuthenticated, dismissedAlertIds]);

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
  useEffect(() => { if (leads?.length) saveStateToStorage('leads', leads); }, [leads]);
  useEffect(() => { if (deals?.length) saveStateToStorage('deals', deals); }, [deals]);
  useEffect(() => { if (tasks?.length) saveStateToStorage('tasks', tasks); }, [tasks]);
  useEffect(() => { if (meetings?.length) saveStateToStorage('meetings', meetings); }, [meetings]);
  useEffect(() => { if (contacts?.length) saveStateToStorage('contacts', contacts); }, [contacts]);
  useEffect(() => { if (accounts?.length) saveStateToStorage('accounts', accounts); }, [accounts]);
  useEffect(() => { if (calls?.length) saveStateToStorage('calls', calls); }, [calls]);
  useEffect(() => { if (campaigns?.length) saveStateToStorage('campaigns', campaigns); }, [campaigns]);
  useEffect(() => { if (documents?.length) saveStateToStorage('documents', documents); }, [documents]);
  useEffect(() => { if (visits?.length) saveStateToStorage('visits', visits); }, [visits]);
  useEffect(() => { if (projects?.length) saveStateToStorage('projects', projects); }, [projects]);
  useEffect(() => { if (tickets?.length) saveStateToStorage('tickets', tickets); }, [tickets]);

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
  
  // Data Handlers with Unified TanStack Query + Offline Sync Support
  const handleAddLead = (newLeadData: Omit<Lead, 'id'>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const leadToAdd = {
      ...newLeadData,
      score: newLeadData.score || 50,
      scoreBreakdown: newLeadData.scoreBreakdown || { fit: 50, engagement: 50, budget: 50 },
      notes: newLeadData.notes || 'Newly created lead.',
      lastContact: todayStr,
      name: `${newLeadData.firstName || ''} ${newLeadData.lastName || ''}`.trim(),
      owner: currentUser.name,
      creationDate: newLeadData.creationDate || todayStr,
      statusUpdatedAt: todayStr,
    };
    createLeadMutation.mutate(leadToAdd);
    if (!navigator.onLine) {
      const count = addToSyncQueue('ADD_LEAD', leadToAdd as Lead);
      setPendingChanges(count);
    }
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    const oldLead = leads.find(l => l.id === updatedLead.id);
    const statusChanged = oldLead ? oldLead.status !== updatedLead.status : false;
    const statusUpdatedAt = statusChanged 
      ? new Date().toISOString().split('T')[0] 
      : (updatedLead.statusUpdatedAt || updatedLead.creationDate || new Date().toISOString().split('T')[0]);
    const finalLead: Lead = {
      ...updatedLead,
      name: `${updatedLead.firstName || ''} ${updatedLead.lastName || ''}`.trim(),
      statusUpdatedAt
    };
    updateLeadMutation.mutate(finalLead);
    if (!navigator.onLine) {
      const count = addToSyncQueue('UPDATE_LEAD', finalLead);
      setPendingChanges(count);
    }
  };

  const handleUpdateLeads = (updatedLeadsList: Lead[]) => {
    updatedLeadsList.forEach(lead => {
      updateLeadMutation.mutate(lead);
      if (!navigator.onLine) {
        addToSyncQueue('UPDATE_LEAD', lead);
      }
    });
    if (!navigator.onLine) {
      setPendingChanges(getSyncQueue().length);
    }
  };
  
  const handleDeleteLeads = (leadIdsToDelete: string[]) => {
    leadIdsToDelete.forEach(id => deleteLeadMutation.mutate(id));
    if (!navigator.onLine) {
      const count = addToSyncQueue('DELETE_LEAD', leadIdsToDelete);
      setPendingChanges(count);
    }
  };

  const handleAddContact = (contactData: Omit<Contact, 'id' | 'lastActivity'>) => {
    const newContact = {
      ...contactData,
      lastActivity: 'Just now',
      owner: currentUser.name,
    };
    createContactMutation.mutate(newContact);
    if (!navigator.onLine) {
      setPendingChanges(addToSyncQueue('ADD_CONTACT', newContact as Contact));
    }
  };

  const handleUpdateContact = (updatedContact: Contact) => {
    updateContactMutation.mutate(updatedContact);
    if (!navigator.onLine) {
      setPendingChanges(addToSyncQueue('UPDATE_CONTACT', updatedContact));
    }
  };

  const handleAddAccount = (newAccount: Account) => {
    createAccountMutation.mutate(newAccount);
    if (!navigator.onLine) {
      setPendingChanges(addToSyncQueue('ADD_ACCOUNT', newAccount));
    }
  };

  const handleUpdateAccount = (updatedAccount: Account) => {
    saveStateToStorage('accounts', accounts.map(a => a.id === updatedAccount.id ? updatedAccount : a));
    if (!navigator.onLine) {
      setPendingChanges(addToSyncQueue('UPDATE_ACCOUNT', updatedAccount));
    }
  };

  const handleDeleteAccount = (accountId: string) => {
    saveStateToStorage('accounts', accounts.filter(a => a.id !== accountId));
  };

  const handleAddCall = (callData: Omit<Call, 'id'>) => {
    const newCall: Call = {
      ...callData,
      id: `CALL-${Date.now()}`,
    };
    const updated = [newCall, ...calls];
    saveStateToStorage('calls', updated);
  };

  const handleAddMeeting = (newMeeting: Meeting) => {
    const updated = [...meetings, newMeeting];
    saveStateToStorage('meetings', updated);
  };

  const handleUpdateMeeting = (updatedMeeting: Meeting) => {
    const updated = meetings.map(m => m.id === updatedMeeting.id ? updatedMeeting : m);
    saveStateToStorage('meetings', updated);
  };

  const handleDeleteMeeting = (meetingId: string) => {
    const updated = meetings.filter(m => m.id !== meetingId);
    saveStateToStorage('meetings', updated);
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
    createDealMutation.mutate(dealWithActivity);
    if (!navigator.onLine) {
      setPendingChanges(addToSyncQueue('ADD_DEAL', dealWithActivity));
    }
  };

  const handleUpdateDeal = (updatedDeal: Deal) => {
    const oldDeal = deals.find(d => d.id === updatedDeal.id);
    const newActivities: Activity[] = [];
    const timestamp = new Date().toISOString();

    if (oldDeal) {
      if (oldDeal.stage !== updatedDeal.stage) {
        newActivities.push({ id: Date.now().toString() + 's', type: 'stage_change', description: `Stage updated to ${updatedDeal.stage}`, timestamp });
      }
      if (oldDeal.value !== updatedDeal.value) {
        newActivities.push({ id: Date.now().toString() + 'v', type: 'value_change', description: `Value updated from $${oldDeal.value.toLocaleString()} to $${updatedDeal.value.toLocaleString()}`, timestamp });
      }
      if (oldDeal.probability !== updatedDeal.probability) {
        newActivities.push({ id: Date.now().toString() + 'p', type: 'probability_change', description: `Probability updated from ${oldDeal.probability}% to ${updatedDeal.probability}%`, timestamp });
      }
    }

    const hasManualActivity = oldDeal && updatedDeal.activities && updatedDeal.activities.length > (oldDeal.activities?.length || 0);
    if (newActivities.length === 0 && !hasManualActivity && oldDeal && JSON.stringify(oldDeal) !== JSON.stringify(updatedDeal)) {
      newActivities.push({ id: Date.now().toString() + 'u', type: 'update', description: `Deal details updated`, timestamp });
    }

    const baseActivities = oldDeal && updatedDeal.activities && updatedDeal.activities.length >= (oldDeal.activities?.length || 0) 
      ? updatedDeal.activities 
      : (oldDeal?.activities || []);

    const finalDeal = {
      ...updatedDeal,
      activities: [...baseActivities, ...newActivities]
    };

    updateDealMutation.mutate(finalDeal);
    if (!navigator.onLine) {
      setPendingChanges(addToSyncQueue('UPDATE_DEAL', finalDeal));
    }
  };

  const handleAddTask = (newTask: Task) => {
    createTaskMutation.mutate(newTask);
    if (!navigator.onLine) {
      setPendingChanges(addToSyncQueue('ADD_TASK', newTask));
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    updateTaskMutation.mutate(updatedTask);
    if (!navigator.onLine) {
      setPendingChanges(addToSyncQueue('UPDATE_TASK', updatedTask));
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
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
            contacts={contacts} setContacts={handleBulkSetContacts}
            leads={leads} setLeads={handleBulkSetLeads}
            accounts={accounts} setAccounts={handleBulkSetAccounts}
            deals={deals} setDeals={handleBulkSetDeals}
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
          setContacts={handleBulkSetContacts}
          tasks={tasks}
          setTasks={handleBulkSetTasks}
          leads={leads}
          setLeads={handleBulkSetLeads}
        />;
      case 'audit_logs':
        return <AuditLogs />;
      case 'api_management':
        return <APIGateway />;
      case 'observability':
        return <Observability />;
      case 'tenancy':
        return <TenantManagement />;
      case 'ai_command_center':
        return <AICommandCenter onNavigate={(view, id) => {
          if (view === 'leads' && id) {
            setSelectedLeadId(id);
            setCurrentView('leads');
          } else {
            setCurrentView(view);
          }
        }} />;
      case 'ai_agents':
        return <AgentManagement onNavigate={(view) => setCurrentView(view)} />;
      case 'ai_agent_runs':
      case 'ai_runs':
      case 'ai_runtime':
        return <AgentRunsView onNavigate={(view) => setCurrentView(view)} />;
      case 'ai_workflows':
        return <WorkflowsView onNavigate={(view) => setCurrentView(view)} />;
      case 'ai_skills':
        return <SkillsView onNavigate={(view) => setCurrentView(view)} />;
      case 'ai_evaluations':
        return <SkillEvaluationsView onNavigate={(view) => setCurrentView(view)} />;
      case 'ai_capabilities':
        return <CapabilitiesMatrixView onNavigate={(view) => setCurrentView(view)} />;
      case 'ai_actions':
        return <AIActionsView onNavigate={(view, id) => {
          if (view === 'leads' && id) {
            setSelectedLeadId(id);
            setCurrentView('leads');
          } else {
            setCurrentView(view);
          }
        }} />;
      case 'ai_approvals':
        return <AIApprovalsView onNavigate={(view, id) => {
          if (view === 'leads' && id) {
            setSelectedLeadId(id);
            setCurrentView('leads');
          } else {
            setCurrentView(view);
          }
        }} />;
      case 'ai_insights':
        return <AIInsightsView onNavigate={(view, id) => {
          if (view === 'leads' && id) {
            setSelectedLeadId(id);
            setCurrentView('leads');
          } else {
            setCurrentView(view);
          }
        }} />;
      case 'knowledge_base':
        return <KnowledgeBaseView onNavigate={(view) => setCurrentView(view)} />;
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
            <header className="flex items-center justify-between px-4 md:px-8 py-3 md:py-3.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xs border-b border-slate-200/70 dark:border-slate-800/80 transition-colors duration-300 z-20 sticky top-0">
               {/* Left: Mobile Toggle & Breadcrumb */}
               <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                 <button 
                   onClick={() => setSidebarOpen(true)} 
                   className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                   aria-label="Open Navigation Menu"
                 >
                    <IconMenu className="w-5 h-5" />
                 </button>

                 {/* Breadcrumbs */}
                 <div className="flex items-center gap-2 min-w-0">
                   <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0">
                     {VIEW_LABELS[currentView]?.category || 'Workspace'}
                   </span>
                   <span className="hidden sm:inline-block text-slate-300 dark:text-slate-700 text-xs">/</span>
                   <h1 className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white truncate">
                     {VIEW_LABELS[currentView]?.title || 'Command Center'}
                   </h1>
                 </div>
               </div>
               
               {/* Right: Quick Theme Controls, Status & Notifications */}
               <div className="flex items-center gap-2 md:gap-3 shrink-0">
                 
                 {/* Live Realtime Indicator */}
                 <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                   <span>Synced</span>
                 </div>

                 {/* Quick Palette Picker */}
                 <div className="relative" ref={palettePickerRef}>
                   <button
                     onClick={() => setIsPalettePickerOpen(!isPalettePickerOpen)}
                     className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-all"
                     title="Change Theme Color Palette"
                   >
                     <span 
                       className="w-3.5 h-3.5 rounded-full shadow-xs ring-1 ring-white/20 shrink-0" 
                       style={{ backgroundColor: THEMES[primaryColor]?.[500] || '#6366f1' }}
                     />
                     <span className="hidden sm:inline text-[11px] font-bold capitalize">
                       {primaryColor}
                     </span>
                   </button>

                   {/* Palette Popover Dropdown */}
                   {isPalettePickerOpen && (
                     <div className="absolute right-0 mt-2 w-56 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-scale-in">
                       <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white">
                         <span className="flex items-center gap-1.5">
                           <IconSparkles className="w-3.5 h-3.5 text-primary-500" />
                           Color Palettes
                         </span>
                         <button 
                           onClick={() => { setCurrentView('settings'); setIsPalettePickerOpen(false); }}
                           className="text-[10px] text-primary-600 dark:text-primary-400 hover:underline font-normal"
                         >
                           All themes →
                         </button>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-1.5">
                         {PALETTE_OPTIONS.map((pal) => (
                           <button
                             key={pal.id}
                             onClick={() => {
                               setPrimaryColor(pal.id);
                               setIsPalettePickerOpen(false);
                             }}
                             className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-all text-left ${
                               primaryColor === pal.id 
                                 ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold ring-1 ring-primary-500/30' 
                                 : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                             }`}
                           >
                             <span 
                               className="w-3 h-3 rounded-full shrink-0 shadow-2xs" 
                               style={{ backgroundColor: pal.hex }} 
                             />
                             <span className="truncate text-[11px]">{pal.name.split(' ')[0]}</span>
                           </button>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>

                 {/* Dark / Light Mode Toggle Button */}
                 <button
                   onClick={toggleTheme}
                   className="p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-2xs transition-all"
                   title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                   aria-label="Toggle Theme"
                 >
                   {isDark ? (
                     <IconSun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
                   ) : (
                     <IconMoon className="w-4 h-4 text-slate-600 transition-transform duration-300 hover:-rotate-12" />
                   )}
                 </button>

                 {/* Notifications Hub */}
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
        
        {currentView !== 'document-editor' && (
          <AICopilotDock 
            onNavigate={(view, id) => {
              if (view === 'leads' && id) {
                setSelectedLeadId(id);
                setCurrentView('leads');
              } else {
                setCurrentView(view);
              }
            }}
            currentView={currentView}
            selectedEntity={
              selectedLeadId && currentView === 'leads' ? (() => {
                const l = leads.find(lead => lead.id === selectedLeadId);
                return l ? {
                  type: 'lead' as const,
                  id: l.id,
                  name: l.name,
                  stage: l.status,
                  score: l.score,
                  owner: l.owner
                } : undefined;
              })() : undefined
            }
            userName={currentUser?.name || 'Alex Chen'}
            userRole={userRole?.name || 'Sales Manager'}
          />
        )}
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
                      onClick={() => setDismissedAlertIds(prev => [...prev, alert.id])}
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
                  onClick={() => setDismissedAlertIds(prev => [...prev, alert.id])}
                  className="px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                >
                  Dismiss
                </button>
                <button 
                  onClick={() => {
                    handleNavigateToLeads(alert.leadId);
                    setDismissedAlertIds(prev => [...prev, alert.id]);
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

const DEFAULT_COLLAB_USER = { name: 'Demo User', email: 'user@example.com' };

export function App() {
  return (
    <CollaborationProvider currentUser={DEFAULT_COLLAB_USER}>
      <MainApp />
    </CollaborationProvider>
  );
}

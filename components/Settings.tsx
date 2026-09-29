
import React, { useState, useEffect, useRef } from 'react';
import { 
  IconUser, 
  IconBuilding, 
  IconGlobe, 
  IconSparkles, 
  IconBell, 
  IconShield, 
  IconSave, 
  IconCheckCircle, 
  IconPlus, 
  IconTrash, 
  IconWallet, 
  IconLock, 
  IconUsers, 
  IconKey, 
  IconCopy, 
  IconX, 
  IconSun, 
  IconMoon, 
  IconZap, 
  IconArrowDown,
  IconMail,
  IconClock
} from './Icons';
import { RoleDefinition, User, Permission, Task, Meeting, Lead } from '../types';

interface SettingsProps {
  isDark: boolean;
  toggleTheme: () => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  pipelineGoal: number;
  setPipelineGoal: (goal: number) => void;
  // Theme Props
  fontFamily: string;
  setFontFamily: (font: string) => void;
  density: string;
  setDensity: (density: string) => void;
  // Regional Props
  weekStart: string;
  setWeekStart: (day: string) => void;
  dateFormat: string;
  setDateFormat: (format: string) => void;
  timeZone: string;
  setTimeZone: (tz: string) => void;
  timeFormat: '12h' | '24h';
  setTimeFormat: (format: '12h' | '24h') => void;
  workingDays: string[];
  setWorkingDays: (days: string[]) => void;
  fiscalYearStart: string;
  setFiscalYearStart: (month: string) => void;
  // Finance Props
  defaultPaymentTerm: string;
  setDefaultPaymentTerm: (term: string) => void;
  defaultTaxRate: number;
  setDefaultTaxRate: (rate: number) => void;
  taxEnabled: boolean;
  setTaxEnabled: (enabled: boolean) => void;
  defaultCurrency: string;
  setDefaultCurrency: (currency: string) => void;
  multiCurrency: boolean;
  setMultiCurrency: (enabled: boolean) => void;
  // RBAC Props
  roles: RoleDefinition[];
  setRoles: (roles: RoleDefinition[]) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  // Workspace entities for AI summary compile
  tasks?: Task[];
  meetings?: Meeting[];
  leads?: Lead[];
}

// Permission Toggle Card for Role Editor
const PermissionToggleCard: React.FC<{ label: string, description?: string, checked: boolean, onChange: () => void, disabled?: boolean }> = ({ label, description, checked, onChange, disabled }) => (
    <div 
        onClick={() => !disabled && onChange()}
        className={`flex items-start justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer group ${
            checked 
            ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800/50 shadow-sm' 
            : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <div className="flex-1 pr-4">
            <span className={`text-sm font-medium block ${checked ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300'}`}>
                {label}
            </span>
            {description && (
                <span className={`text-xs mt-0.5 block ${checked ? 'text-primary-600/70 dark:text-primary-400/70' : 'text-slate-500 dark:text-slate-500'}`}>
                    {description}
                </span>
            )}
        </div>
        <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 ease-in-out flex-shrink-0 flex items-center px-0.5 ${checked ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
    </div>
);

// Settings Toggle Card (Reusable)
const SettingsToggleCard: React.FC<{ title: string, description: string, checked: boolean, onChange: () => void }> = ({ title, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
    <div>
      <h4 className="font-bold text-slate-900 dark:text-white text-base">{title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
    </div>
    <button 
      onClick={onChange}
      className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${checked ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  </div>
);

// Alert Toggle Component
const AlertToggleRow: React.FC<{ label: string, checked: boolean, onChange: () => void }> = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between py-1">
        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{label}</span>
        <button 
            onClick={onChange}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${checked ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`}
        >
            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    </div>
);

interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    created: string;
    status: 'Active' | 'Revoked';
}

const Settings: React.FC<SettingsProps> = ({ 
  isDark, 
  toggleTheme, 
  primaryColor, 
  setPrimaryColor,
  pipelineGoal,
  setPipelineGoal,
  fontFamily,
  setFontFamily,
  density,
  setDensity,
  weekStart,
  setWeekStart,
  dateFormat,
  setDateFormat,
  timeZone,
  setTimeZone,
  timeFormat,
  setTimeFormat,
  workingDays,
  setWorkingDays,
  fiscalYearStart,
  setFiscalYearStart,
  defaultPaymentTerm,
  setDefaultPaymentTerm,
  defaultTaxRate,
  setDefaultTaxRate,
  taxEnabled,
  setTaxEnabled,
  defaultCurrency,
  setDefaultCurrency,
  multiCurrency,
  setMultiCurrency,
  roles,
  setRoles,
  users,
  setUsers,
  currentUser,
  setCurrentUser,
  tasks = [],
  meetings = [],
  leads = []
}) => {
  const [activeTab, setActiveTab] = useState('company');
  const [teamView, setTeamView] = useState<'users' | 'roles'>('users');
  const [goalInput, setGoalInput] = useState(pipelineGoal.toString());
  const [isSaved, setIsSaved] = useState(false);

  // Local State with Persistence
  const [companyName, setCompanyName] = useState(() => localStorage.getItem('nova_company_name') || 'TalentSense AI');
  const [companyEmail, setCompanyEmail] = useState(() => localStorage.getItem('nova_company_email') || 'ops@talentsense.ai');
  const [companyWebsite, setCompanyWebsite] = useState(() => localStorage.getItem('nova_company_website') || 'https://talentsense.ai');
  const [logoUrl, setLogoUrl] = useState<string | null>(() => localStorage.getItem('nova_company_logo') || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const [apiKeys, setApiKeys] = useState<ApiKey[]>(() => {
      const saved = localStorage.getItem('nova_api_keys');
      return saved ? JSON.parse(saved) : [
          { id: '1', name: 'Zapier Integration', prefix: 'nova_live_8a...', created: '2023-10-15', status: 'Active' },
          { id: '2', name: 'Slack Bot', prefix: 'nova_live_9b...', created: '2023-11-02', status: 'Active' }
      ];
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  const [aiModel, setAiModel] = useState(() => localStorage.getItem('nova_ai_model') || 'gemini-3-flash-preview');
  const [aiFeatures, setAiFeatures] = useState({
      leadScoring: true,
      autoDraft: true,
      transcription: false,
      insights: true
  });
  const [systemInstruction, setSystemInstruction] = useState('You are Nova, an advanced CRM assistant. Your tone is professional, concise, and action-oriented. Prioritize revenue-generating activities in your recommendations.');

  // Alert Settings with Persistence
  const [alertSettings, setAlertSettings] = useState(() => {
      const saved = localStorage.getItem('nova_alert_settings');
      return saved ? JSON.parse(saved) : {
          hiring: true,
          attendance: false,
          leave: true,
          performance: true
      };
  });
  const [digestFrequency, setDigestFrequency] = useState(() => localStorage.getItem('nova_digest_frequency') || 'daily');

  // Daily AI Email Digest settings state
  const [digestEnabled, setDigestEnabled] = useState(() => {
      const saved = localStorage.getItem('nova_email_digest_enabled');
      return saved !== 'false';
  });
  const [digestTime, setDigestTime] = useState(() => localStorage.getItem('nova_email_digest_time') || '08:00');
  const [includeTasks, setIncludeTasks] = useState(() => {
      const saved = localStorage.getItem('nova_email_digest_tasks');
      return saved !== 'false';
  });
  const [includeMeetings, setIncludeMeetings] = useState(() => {
      const saved = localStorage.getItem('nova_email_digest_meetings');
      return saved !== 'false';
  });
  const [includeLeads, setIncludeLeads] = useState(() => {
      const saved = localStorage.getItem('nova_email_digest_leads');
      return saved !== 'false';
  });
  const [digestHotLeadThreshold, setDigestHotLeadThreshold] = useState(() => {
      const saved = localStorage.getItem('nova_email_digest_score_threshold');
      return saved ? Number(saved) : 80;
  });
  const [synthesizedDigests, setSynthesizedDigests] = useState<any[]>(() => {
      const saved = localStorage.getItem('nova_email_synthesized_digests');
      return saved ? JSON.parse(saved) : [];
  });
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [selectedDigest, setSelectedDigest] = useState<any | null>(null);

  // Persistence Effects for Daily Digest
  useEffect(() => {
      localStorage.setItem('nova_email_digest_enabled', String(digestEnabled));
  }, [digestEnabled]);

  useEffect(() => {
      localStorage.setItem('nova_email_digest_time', digestTime);
  }, [digestTime]);

  useEffect(() => {
      localStorage.setItem('nova_email_digest_tasks', String(includeTasks));
  }, [includeTasks]);

  useEffect(() => {
      localStorage.setItem('nova_email_digest_meetings', String(includeMeetings));
  }, [includeMeetings]);

  useEffect(() => {
      localStorage.setItem('nova_email_digest_leads', String(includeLeads));
  }, [includeLeads]);

  useEffect(() => {
      localStorage.setItem('nova_email_digest_score_threshold', String(digestHotLeadThreshold));
  }, [digestHotLeadThreshold]);

  useEffect(() => {
      localStorage.setItem('nova_email_synthesized_digests', JSON.stringify(synthesizedDigests));
  }, [synthesizedDigests]);

  const handleSynthesizeDigest = async () => {
      if (isSynthesizing) return;
      setIsSynthesizing(true);
      try {
          const response = await fetch('/api/generate-digest', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  user: {
                      name: currentUser?.name || 'User',
                      email: currentUser?.email || 'user@example.com',
                  },
                  tasks: tasks || [],
                  meetings: meetings || [],
                  leads: leads || [],
                  config: {
                      summarizeTasks: includeTasks,
                      summarizeMeetings: includeMeetings,
                      summarizeLeads: includeLeads,
                      hotLeadThreshold: digestHotLeadThreshold
                  }
              })
          });
          const result = await response.json();
          if (result.error) {
              console.error('Failed to generate daily digest:', result.error);
              alert('Error during synthesis: ' + result.error);
          } else {
              const newDigest = {
                  id: 'dg-' + Math.random().toString(36).substring(7),
                  subject: result.subject || `🌅 NovaCRM Daily briefing digest`,
                  executiveSummary: result.executiveSummary || '',
                  tasksSummary: result.tasksSummary || '',
                  meetingsSummary: result.meetingsSummary || '',
                  leadsSummary: result.leadsSummary || '',
                  aiInsights: result.aiInsights || '',
                  htmlContent: result.html || '',
                  markdownContent: result.markdown || '',
                  generatedAt: result.generatedAt || new Date().toISOString(),
                  recipientEmail: currentUser?.email || 'user@example.com',
                  triggerType: 'Manual Test'
              };
              setSynthesizedDigests(prev => [newDigest, ...prev]);
              setSelectedDigest(newDigest);
          }
      } catch (err: any) {
          console.error('Failed synthesizing digest:', err);
          alert('Could not synthesize digest. Please verify key setup and retry.');
      } finally {
          setIsSynthesizing(false);
      }
  };

  // Persistence Effects
  useEffect(() => {
      localStorage.setItem('nova_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
      localStorage.setItem('nova_ai_model', aiModel);
  }, [aiModel]);

  useEffect(() => {
      localStorage.setItem('nova_company_name', companyName);
  }, [companyName]);

  useEffect(() => {
      localStorage.setItem('nova_company_email', companyEmail);
  }, [companyEmail]);

  useEffect(() => {
      localStorage.setItem('nova_company_website', companyWebsite);
  }, [companyWebsite]);

  useEffect(() => {
      if (logoUrl) {
          localStorage.setItem('nova_company_logo', logoUrl);
      } else {
          localStorage.removeItem('nova_company_logo');
      }
  }, [logoUrl]);

  useEffect(() => {
      localStorage.setItem('nova_alert_settings', JSON.stringify(alertSettings));
  }, [alertSettings]);

  useEffect(() => {
      localStorage.setItem('nova_digest_frequency', digestFrequency);
  }, [digestFrequency]);

  // Colors Config - Synced with App.tsx Themes
  const COLORS = [
      { id: 'indigo', name: 'Hyper Indigo', hex: '#6366f1', desc: 'Modern flagship SaaS electric indigo' },
      { id: 'slate', name: 'Obsidian Slate', hex: '#0f172a', desc: 'Executive minimalist titanium & monochrome' },
      { id: 'emerald', name: 'Emerald Pine', hex: '#10b981', desc: 'Fintech & wealth management emerald' },
      { id: 'purple', name: 'Royal Amethyst', hex: '#a855f7', desc: 'AI-forward cosmic violet & lilac' },
      { id: 'blue', name: 'Cobalt Sapphire', hex: '#3b82f6', desc: 'Enterprise security & azure blue' },
      { id: 'rose', name: 'Crimson Ruby', hex: '#f43f5e', desc: 'High-impact ruby rose & blush' },
      { id: 'amber', name: 'Sunrise Amber', hex: '#f59e0b', desc: 'Warm copper & solar gold' },
      { id: 'teal', name: 'Nordic Teal', hex: '#14b8a6', desc: 'Scandinavian pine & deep jade' },
      { id: 'cyan', name: 'Quantum Cyan', hex: '#06b6d4', desc: 'Cloud infrastructure & electric sea' },
      { id: 'orange', name: 'Sunset Copper', hex: '#f97316', desc: 'Vibrant terracotta & sunset orange' },
  ];

  // Fonts Config
  const FONTS = [
      { id: 'Plus Jakarta', name: 'Plus Jakarta Sans', description: 'Executive Modern SaaS · High Clarity', family: "'Plus Jakarta Sans', sans-serif" },
      { id: 'Inter', name: 'Inter UI', description: 'Precision Engineering & Data Tables', family: "'Inter', sans-serif" },
      { id: 'Outfit', name: 'Outfit Geometric', description: 'Contemporary Futuristic & Clean Curves', family: "'Outfit', sans-serif" },
      { id: 'Lexend', name: 'Lexend Readability', description: 'Cognitive Optimization & High Legibility', family: "'Lexend', sans-serif" },
      { id: 'JetBrains Mono', name: 'JetBrains Mono', description: 'Technical Console & Tabular Figures', family: "'JetBrains Mono', monospace" },
      { id: 'Montserrat', name: 'Montserrat Classic', description: 'Bold Brand Architecture', family: "'Montserrat', sans-serif" },
      { id: 'Playfair Display', name: 'Playfair Display', description: 'Editorial Luxury & Private Advisory', family: "'Playfair Display', serif" },
  ];

  useEffect(() => {
    if (!editingRole && roles.length > 0) {
        setEditingRole(roles[0]);
    }
  }, [roles]);

  useEffect(() => {
      if (roles.length > 0 && isInviteModalOpen) {
          if (!inviteRole) {
              setInviteRole(roles[0].id);
          }
      }
  }, [roles, isInviteModalOpen]);

  const handleSave = () => {
    setPipelineGoal(Number(goalInput));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
  };

  const toggleWorkingDay = (day: string) => {
      if (workingDays.includes(day)) {
          setWorkingDays(workingDays.filter(d => d !== day));
      } else {
          setWorkingDays([...workingDays, day]);
      }
  };

  const handleUpdateUserRole = (userId: string, roleId: string) => {
      setUsers(users.map(u => u.id === userId ? { ...u, roleId } : u));
      if (currentUser.id === userId) {
          setCurrentUser({ ...currentUser, roleId });
      }
  };

  const handleTogglePermission = (roleId: string, permission: Permission) => {
      setRoles(roles.map(r => {
          if (r.id !== roleId) return r;
          const hasPermission = r.permissions.includes(permission);
          return {
              ...r,
              permissions: hasPermission 
                  ? r.permissions.filter(p => p !== permission)
                  : [...r.permissions, permission]
          };
      }));
  };

  const handleCreateRole = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newRoleName.trim()) {
          alert('Role name is required');
          return;
      }
      const roleId = newRoleName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      const newRole: RoleDefinition = {
          id: roleId,
          name: newRoleName.trim(),
          description: newRoleDescription || 'Custom Role',
          isSystem: false,
          permissions: ['view_dashboard'] 
      };
      setRoles([...roles, newRole]);
      setIsCreateRoleModalOpen(false);
      setNewRoleName('');
      setNewRoleDescription('');
      setEditingRole(newRole); 
  };

  const handleInviteMember = (e: React.FormEvent) => {
      e.preventDefault();
      if (!inviteEmail || !inviteName) return;
      const selectedRoleId = inviteRole || (roles.length > 0 ? roles[0].id : 'sales_rep');
      const newUser: User = {
          id: `u-${Date.now()}`,
          name: inviteName,
          email: inviteEmail,
          roleId: selectedRoleId,
          status: 'Active',
          lastLogin: 'Never',
          avatar: `https://i.pravatar.cc/150?u=${Date.now()}`
      };
      setUsers([newUser, ...users]);
      setIsInviteModalOpen(false);
      setInviteName('');
      setInviteEmail('');
      alert(`User ${inviteName} added successfully!`);
  };

  const handleDeleteRole = (roleId: string) => {
      if (window.confirm('Delete role?')) {
          setRoles(roles.filter(r => r.id !== roleId));
          if (editingRole?.id === roleId) setEditingRole(roles.find(r => r.id !== roleId) || null);
      }
  };

  const generateSecurePassword = () => {
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
      let retVal = "";
      for (let i = 0, n = charset.length; i < 12; ++i) {
          retVal += charset.charAt(Math.floor(Math.random() * n));
      }
      return retVal;
  };

  const handleGeneratePassword = (user: User) => {
      const newPassword = generateSecurePassword();
      setGeneratedPassword(newPassword);
      setSelectedUserForPassword(user);
      setUsers(users.map(u => u.id === user.id ? { ...u, tempPassword: newPassword } : u));
      setPasswordModalOpen(true);
  };

  const handleOpenKeyModal = () => {
      setNewKeyName('');
      setNewlyGeneratedKey(null);
      setIsKeyModalOpen(true);
  };

  const handleGenerateKey = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newKeyName.trim()) return;
      
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let randomStr = '';
      const randomValues = new Uint32Array(24);
      crypto.getRandomValues(randomValues);
      for(let i=0; i<24; i++) {
          randomStr += chars[randomValues[i] % chars.length];
      }
      
      const fullKey = `nova_live_${randomStr}`;
      setNewlyGeneratedKey(fullKey);
      
      const newKey: ApiKey = {
          id: `k-${Date.now()}`,
          name: newKeyName,
          prefix: `nova_live_${randomStr.substring(0, 4)}...`,
          created: new Date().toISOString().split('T')[0],
          status: 'Active'
      };
      setApiKeys(prev => [...prev, newKey]);
  };

  const handleCloseKeyModal = () => {
      setIsKeyModalOpen(false);
      setNewKeyName('');
      setNewlyGeneratedKey(null);
  };

  const handleRevokeKey = (id: string) => {
      if (window.confirm("Are you sure you want to revoke this key? This action cannot be undone.")) {
          setApiKeys(prev => prev.filter(k => k.id !== id));
      }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const PERMISSION_GROUPS = {
      'System Administration': ['manage_users', 'manage_settings'],
      'Sales Operations': ['view_leads', 'edit_leads', 'manage_pipeline', 'view_revenue'],
      'Data Governance': ['delete_records', 'export_data'],
      'Intelligence': ['use_ai_features', 'view_dashboard']
  };

  const PERMISSION_DETAILS: Record<Permission, { label: string, desc: string }> = {
      'view_dashboard': { label: 'View Dashboard', desc: 'Access to main analytics overview' },
      'manage_users': { label: 'Manage Users', desc: 'Invite team members and assign roles' },
      'manage_settings': { label: 'System Settings', desc: 'Configure global app preferences' },
      'view_leads': { label: 'View Leads', desc: 'Read access to lead database' },
      'edit_leads': { label: 'Edit Leads', desc: 'Create and modify lead records' },
      'delete_records': { label: 'Delete Records', desc: 'Permanent removal of data' },
      'export_data': { label: 'Export Data', desc: 'Download CSV/PDF reports' },
      'view_revenue': { label: 'View Revenue', desc: 'Access financial metrics and deal values' },
      'manage_pipeline': { label: 'Manage Pipeline', desc: 'Move deals through stages' },
      'use_ai_features': { label: 'AI Features', desc: 'Use generative AI tools' }
  };

  const getFormattedDate = (format: string, timeFmt: '12h' | '24h') => {
    const now = new Date();
    // Simplified formatting logic for preview
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    
    let dateStr = '';
    if (format.includes('DD/MM/YYYY')) dateStr = `${day}/${month}/${year}`;
    else if (format.includes('MM/DD/YYYY')) dateStr = `${month}/${day}/${year}`;
    else dateStr = `${year}-${month}-${day}`;

    const timeOptions: Intl.DateTimeFormatOptions = { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: timeFmt === '12h' 
    };
    const timeStr = now.toLocaleTimeString('en-US', timeOptions);
    
    return `${dateStr} ${timeStr}`;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'company':
        return (
            <div className="max-w-4xl space-y-10 animate-fade-in pb-10">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wider">Company Profile</h3>
                </div>
                
                {/* Logo Upload Section */}
                <div className="flex items-center gap-8 py-4">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleLogoUpload} 
                        className="hidden" 
                        accept="image/*"
                    />
                    <div className="relative group">
                        <div 
                            onClick={triggerFileInput}
                            className={`w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all overflow-hidden ${logoUrl ? 'border-primary-500' : ''}`}
                        >
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <IconBuilding className="w-8 h-8 text-slate-400 group-hover:text-primary-500" />
                            )}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Organization Identity</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3">Upload your logo to rebrand the dashboard.</p>
                        <div className="flex gap-4">
                            <button 
                                onClick={triggerFileInput}
                                className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider hover:underline"
                            >
                                {logoUrl ? 'Replace Logo' : 'Upload Logo'}
                            </button>
                            {logoUrl && (
                                <button 
                                    onClick={() => setLogoUrl(null)}
                                    className="text-xs font-bold text-red-500 uppercase tracking-wider hover:underline"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Organization Name</label>
                        <input 
                            type="text" 
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full px-5 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 shadow-sm"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Support Email</label>
                        <input 
                            type="text" 
                            value={companyEmail}
                            onChange={(e) => setCompanyEmail(e.target.value)}
                            className="w-full px-5 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 shadow-sm"
                        />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Website</label>
                    <input 
                        type="text" 
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        className="w-full px-5 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 shadow-sm"
                    />
                </div>
            </div>
        );

      case 'theme':
        return (
            <div className="max-w-5xl space-y-12 animate-fade-in pb-10">
                {/* 1. Accent Palette Configuration */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Enterprise Color Palette</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select the primary brand identity and UI accent scheme applied across the workspace.</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold text-xs capitalize">
                          Active: {primaryColor}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                        {COLORS.map(color => {
                            const isSelected = primaryColor === color.id;
                            return (
                                <button
                                    key={color.id}
                                    onClick={() => setPrimaryColor(color.id)}
                                    className={`group relative flex flex-col items-start p-4 rounded-2xl transition-all duration-200 text-left border ${
                                        isSelected 
                                        ? 'bg-white dark:bg-slate-800/90 ring-2 ring-primary-500 border-primary-500/50 shadow-md scale-[1.02] z-10' 
                                        : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:shadow-xs'
                                    }`}
                                >
                                    <div className="w-full flex items-center justify-between mb-3">
                                        <div 
                                            className={`w-9 h-9 rounded-xl shadow-xs ring-2 ring-white/10 flex items-center justify-center transition-transform group-hover:scale-110`}
                                            style={{ backgroundColor: color.hex }}
                                        >
                                            {isSelected && (
                                                <IconCheckCircle className="w-5 h-5 text-white drop-shadow-md" />
                                            )}
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-400 font-semibold">{color.hex}</span>
                                    </div>
                                    <span className={`text-xs font-bold ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {color.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-tight line-clamp-2">
                                        {color.desc}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Interactive Theme Live Sandbox Preview */}
                <div className="p-6 rounded-3xl bg-slate-50/80 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/60 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <IconSparkles className="w-4 h-4 text-primary-500" />
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                                Live Component Sandbox & Theme Preview
                            </h4>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                            Rendered using --theme-primary tokens
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Sample Card A: Action Buttons */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 space-y-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Button Hierarchy</span>
                            <div className="flex flex-col gap-2">
                                <button className="w-full px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-xl shadow-xs transition-colors">
                                    Primary Brand CTA
                                </button>
                                <button className="w-full px-4 py-2 text-xs font-bold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/50 hover:bg-primary-100 rounded-xl transition-colors">
                                    Subtle Tint Button
                                </button>
                                <button className="w-full px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors">
                                    Outline Neutral Button
                                </button>
                            </div>
                        </div>

                        {/* Sample Card B: Metric KPI & Runway */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 space-y-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pipeline Trajectory</span>
                            <div>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">$1,850,000</span>
                                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400">+24.5%</span>
                                </div>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">Quarterly closed revenue attainment</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700/60 overflow-hidden">
                                <div className="h-full bg-primary-600 rounded-full" style={{ width: '74%' }}></div>
                            </div>
                        </div>

                        {/* Sample Card C: Typography Specimen */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Type Scale ({fontFamily})</span>
                            <h5 className="text-base font-extrabold text-slate-900 dark:text-white">
                                Modern Revenue Intelligence
                            </h5>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Experience precision data legibility with calibrated line heights and tabular figures.
                            </p>
                            <div className="flex items-center gap-1.5 pt-1">
                                <span className="px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 font-bold text-[10px]">
                                    Live Specimen
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Typography Core Selection */}
                <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Typography Engine</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {FONTS.map(font => {
                            const isSelected = fontFamily === font.id;
                            return (
                                <button
                                    key={font.id}
                                    onClick={() => setFontFamily(font.id)}
                                    className={`group relative flex flex-col items-start p-5 rounded-2xl transition-all duration-200 text-left border ${
                                        isSelected
                                        ? 'bg-white dark:bg-slate-800 ring-2 ring-primary-500 border-primary-500/50 shadow-md scale-[1.01] z-10' 
                                        : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                                    }`}
                                >
                                    <div className="w-full flex items-center justify-between mb-2">
                                        <h4 className={`text-xl font-extrabold ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-slate-900 dark:text-white'}`} style={{ fontFamily: font.family }}>
                                            {font.name.split(' ')[0]}
                                        </h4>
                                        {isSelected && (
                                            <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3">{font.description}</p>
                                    <div className="w-full pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 font-normal" style={{ fontFamily: font.family }}>
                                        The quick brown fox jumps over $1,250,000 ARR
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 4. Application Density */}
                <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Interface Density & Scale</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['Small', 'Medium', 'Large', 'XL'].map((size) => {
                            const isSelected = density === size;
                            return (
                                <button
                                    key={size}
                                    onClick={() => setDensity(size)}
                                    className={`group relative flex flex-col items-center justify-center p-5 rounded-2xl transition-all duration-200 border ${
                                        isSelected
                                        ? 'bg-white dark:bg-slate-800 ring-2 ring-primary-500 border-primary-500/50 shadow-md scale-[1.02] z-10' 
                                        : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:shadow-xs'
                                    }`}
                                >
                                    <span className={`font-black text-slate-900 dark:text-white mb-2 ${
                                        size === 'Small' ? 'text-lg' : 
                                        size === 'Medium' ? 'text-2xl' : 
                                        size === 'Large' ? 'text-3xl' : 'text-4xl'
                                    }`}>
                                        Aa
                                    </span>
                                    <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {size} ({size === 'Small' ? '14px' : size === 'Medium' ? '16px' : size === 'Large' ? '17px' : '18px'})
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 5. Interface Mode (Light vs Dark) */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">Interface Mode</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Toggle between crisp 60-30-10 light mode and high-contrast OLED dark mode.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => !isDark || toggleTheme()}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                                !isDark 
                                ? 'bg-white text-slate-900 shadow-sm border-slate-300' 
                                : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
                            }`}
                        >
                            <IconSun className="w-3.5 h-3.5 text-yellow-500" /> Light Mode
                        </button>
                        <button
                            onClick={() => isDark || toggleTheme()}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                                isDark 
                                ? 'bg-slate-800 text-white shadow-sm border-slate-700' 
                                : 'bg-transparent text-slate-600 border-transparent hover:text-slate-900'
                            }`}
                        >
                            <IconMoon className="w-3.5 h-3.5 text-indigo-400" /> Dark Mode
                        </button>
                    </div>
                </div>
            </div>
        );

      case 'regional':
        return (
            <div className="max-w-5xl space-y-10 animate-fade-in pb-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-8">
                        {/* Currency */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Functional Currency</label>
                            <div className="relative">
                                <select 
                                    value={defaultCurrency}
                                    onChange={(e) => setDefaultCurrency(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none font-medium"
                                >
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="SAR">SAR - Saudi Riyal</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                    <option value="JPY">JPY - Japanese Yen</option>
                                    <option value="AUD">AUD - Australian Dollar</option>
                                    <option value="CAD">CAD - Canadian Dollar</option>
                                    <option value="INR">INR - Indian Rupee</option>
                                </select>
                                <IconArrowDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Date Format */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date Presentation Style</label>
                            <div className="relative">
                                <select 
                                    value={dateFormat}
                                    onChange={(e) => setDateFormat(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none font-medium"
                                >
                                    <option value="DD/MM/YYYY">DD/MM/YYYY (Day-Month-Year)</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY (Month-Day-Year)</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD (Year-Month-Day)</option>
                                </select>
                                <IconArrowDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Time Zone */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Time Zone</label>
                            <div className="relative">
                                <select 
                                    value={timeZone}
                                    onChange={(e) => setTimeZone(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none font-medium"
                                >
                                    <option value="UTC">(UTC+00:00) UTC</option>
                                    <option value="EST">(UTC-05:00) Eastern Time</option>
                                    <option value="CST">(UTC-06:00) Central Time</option>
                                    <option value="MST">(UTC-07:00) Mountain Time</option>
                                    <option value="PST">(UTC-08:00) Pacific Time</option>
                                    <option value="GMT">(UTC+00:00) London</option>
                                    <option value="CET">(UTC+01:00) Paris, Berlin</option>
                                    <option value="Riyadh">(GMT+03:00) Riyadh</option>
                                    <option value="IST">(UTC+05:30) India Standard Time</option>
                                    <option value="JST">(UTC+09:00) Tokyo</option>
                                </select>
                                <IconArrowDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Live Preview */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Live Preview</label>
                            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center h-[88px]">
                                <span className="text-2xl font-mono font-bold text-primary-600 dark:text-primary-400 tracking-tight">
                                    {getFormattedDate(dateFormat, timeFormat)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Fiscal Year */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fiscal Calendar Initialization</label>
                            <div className="relative">
                                <select 
                                    value={fiscalYearStart}
                                    onChange={(e) => setFiscalYearStart(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none font-medium"
                                >
                                    <option value="January">January</option>
                                    <option value="April">April</option>
                                    <option value="July">July</option>
                                    <option value="October">October</option>
                                </select>
                                <IconArrowDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Time Format Toggle */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Time Format</label>
                            <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex border border-slate-200 dark:border-slate-700">
                                <button 
                                    onClick={() => setTimeFormat('12h')}
                                    className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl transition-all duration-300 ${timeFormat === '12h' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                >
                                    12-HOUR (AM/PM)
                                </button>
                                <button 
                                    onClick={() => setTimeFormat('24h')}
                                    className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl transition-all duration-300 ${timeFormat === '24h' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                >
                                    24-HOUR
                                </button>
                            </div>
                        </div>

                        {/* First Day of Week Toggle */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">First Day of Week</label>
                            <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex border border-slate-200 dark:border-slate-700">
                                <button 
                                    onClick={() => setWeekStart('Sunday')}
                                    className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl transition-all duration-300 ${weekStart === 'Sunday' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                >
                                    SUNDAY
                                </button>
                                <button 
                                    onClick={() => setWeekStart('Monday')}
                                    className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl transition-all duration-300 ${weekStart === 'Monday' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                >
                                    MONDAY
                                </button>
                            </div>
                        </div>

                        {/* Working Days */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Designated Working Days</label>
                            <div className="flex flex-wrap gap-3">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => {
                                    const isSelected = workingDays.includes(day);
                                    return (
                                        <button
                                            key={day}
                                            onClick={() => toggleWorkingDay(day)}
                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                                                isSelected 
                                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 transform scale-105' 
                                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:border-primary-300 hover:text-primary-500'
                                            }`}
                                        >
                                            {day.toUpperCase()}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
        );

      case 'finance':
        return (
            <div className="max-w-5xl space-y-10 animate-fade-in pb-10">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6">Financial Configuration</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Default Currency */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Default Currency</label>
                            <div className="relative">
                                <select 
                                    value={defaultCurrency}
                                    onChange={(e) => setDefaultCurrency(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none font-bold"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="JPY">JPY (¥)</option>
                                    <option value="AUD">AUD ($)</option>
                                    <option value="CAD">CAD ($)</option>
                                    <option value="INR">INR (₹)</option>
                                </select>
                                <IconArrowDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Default Tax Rate */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Default Tax Rate (%)</label>
                            <input 
                                type="number" 
                                value={defaultTaxRate}
                                onChange={(e) => setDefaultTaxRate(Number(e.target.value))}
                                className="w-full px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <SettingsToggleCard 
                            title="Enable Tax Calculations" 
                            description="Automatically apply taxes to invoices" 
                            checked={taxEnabled} 
                            onChange={() => setTaxEnabled(!taxEnabled)} 
                        />
                        <SettingsToggleCard 
                            title="Multi-Currency Support" 
                            description="Allow transactions in multiple currencies" 
                            checked={multiCurrency} 
                            onChange={() => setMultiCurrency(!multiCurrency)} 
                        />
                    </div>
                </div>
            </div>
        );

      case 'ai':
        return (
            <div className="max-w-6xl space-y-10 animate-fade-in pb-10">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">AI & Intelligence</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Configure generative models and automation agents.</p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Col: Model Selection */}
                        <div className="lg:col-span-2 space-y-6">
                            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Generative Model</h4>
                            <div className="space-y-3">
                                {[
                                    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', desc: 'Optimized for speed and high-frequency tasks.' },
                                    { id: 'gemini-2.5-flash-latest', name: 'Gemini 2.5 Flash', desc: 'Reliable performance for high-volume tasks.' },
                                    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', desc: 'Enhanced reasoning for complex analytics.' }
                                ].map(model => (
                                    <div 
                                        key={model.id}
                                        onClick={() => setAiModel(model.id)}
                                        className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            aiModel === model.id 
                                            ? 'border-primary-600 bg-white dark:bg-slate-800 shadow-md' 
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                                            aiModel === model.id ? 'border-primary-600' : 'border-slate-300'
                                        }`}>
                                            {aiModel === model.id && <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />}
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-bold text-slate-900 dark:text-white text-sm">{model.name}</h5>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{model.desc}</p>
                                        </div>
                                        {aiModel === model.id && (
                                            <IconSparkles className="w-6 h-6 text-primary-500 absolute right-4 top-4 opacity-20" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Col: Usage Stats */}
                        <div className="lg:col-span-1">
                            <div className="bg-[#0f172a] rounded-2xl p-6 text-white h-full flex flex-col justify-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 relative z-10">API Usage (Current Month)</h4>
                                <div className="relative z-10">
                                    <div className="text-4xl font-bold mb-2">142,059 <span className="text-lg font-normal text-slate-400">tokens</span></div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                                        <div className="h-full bg-emerald-500 w-1/4 rounded-full"></div>
                                    </div>
                                    <p className="text-xs text-slate-400">25% of monthly quota used.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Agent Capabilities */}
                <div>
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <IconZap className="w-4 h-4" /> Agent Capabilities
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SettingsToggleCard 
                            title="Predictive Lead Scoring" 
                            description="Automatically score leads based on interactions" 
                            checked={aiFeatures.leadScoring} 
                            onChange={() => setAiFeatures({...aiFeatures, leadScoring: !aiFeatures.leadScoring})} 
                        />
                        <SettingsToggleCard 
                            title="Auto-Draft Email Responses" 
                            description="Suggest email replies using generative AI" 
                            checked={aiFeatures.autoDraft} 
                            onChange={() => setAiFeatures({...aiFeatures, autoDraft: !aiFeatures.autoDraft})} 
                        />
                        <SettingsToggleCard 
                            title="Meeting Transcription & Summary" 
                            description="Transcribe and summarize recorded meetings" 
                            checked={aiFeatures.transcription} 
                            onChange={() => setAiFeatures({...aiFeatures, transcription: !aiFeatures.transcription})} 
                        />
                        <SettingsToggleCard 
                            title="Smart Opportunity Insights" 
                            description="Provide next-best-action recommendations for deals" 
                            checked={aiFeatures.insights} 
                            onChange={() => setAiFeatures({...aiFeatures, insights: !aiFeatures.insights})} 
                        />
                    </div>
                </div>

                {/* System Persona */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">System Persona</h4>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Base System Instruction</label>
                        <textarea 
                            value={systemInstruction}
                            onChange={(e) => setSystemInstruction(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-24 leading-relaxed"
                        />
                    </div>
                </div>
            </div>
        );

      case 'notifications':
        return (
            <div className="max-w-5xl space-y-10 animate-fade-in pb-10">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6">Alerts & Email</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Toggles */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-8">
                            <AlertToggleRow 
                                label="Hiring Updates" 
                                checked={alertSettings.hiring} 
                                onChange={() => setAlertSettings({...alertSettings, hiring: !alertSettings.hiring})} 
                            />
                            <AlertToggleRow 
                                label="Attendance Alerts" 
                                checked={alertSettings.attendance} 
                                onChange={() => setAlertSettings({...alertSettings, attendance: !alertSettings.attendance})} 
                            />
                            <AlertToggleRow 
                                label="Leave Requests" 
                                checked={alertSettings.leave} 
                                onChange={() => setAlertSettings({...alertSettings, leave: !alertSettings.leave})} 
                            />
                            <AlertToggleRow 
                                label="Performance Reviews" 
                                checked={alertSettings.performance} 
                                onChange={() => setAlertSettings({...alertSettings, performance: !alertSettings.performance})} 
                            />
                        </div>

                        {/* Right Column: Digest Frequency */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm h-fit">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block">Digest Frequency</label>
                            <div className="relative mb-4">
                                <select 
                                    value={digestFrequency}
                                    onChange={(e) => setDigestFrequency(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none shadow-sm transition-all"
                                >
                                    <option value="realtime">Real-time Push (WebSocket)</option>
                                    <option value="hourly">Hourly Batch</option>
                                    <option value="daily">Daily Digest (8:00 AM)</option>
                                    <option value="weekly">Weekly Summary</option>
                                </select>
                                <IconArrowDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                Controls the aggregation latency for non-critical organizational alerts.
                            </p>
                        </div>
                    </div>
                </div>

                {/* AI Daily email digest configurations */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-10">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2.5 bg-primary-50 dark:bg-primary-950/30 rounded-xl">
                            <IconMail className="w-5 h-5 text-primary-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI-Powered Daily Email Briefings</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Synthesize tasks, hot leads & scheduling updates into a highly tailored briefing report.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Config Column */}
                        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <h4 className="font-bold text-slate-950 dark:text-white text-base">Enable Digest Delivery</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Send tailored intelligence compilation automatically every morning</p>
                                </div>
                                <button 
                                    onClick={() => setDigestEnabled(!digestEnabled)}
                                    className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${digestEnabled ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${digestEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {digestEnabled && (
                                <div className="space-y-6">
                                    {/* Delivery Time and Content Switches */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Delivery Time (UTC)</label>
                                            <div className="relative">
                                                <input 
                                                    type="time" 
                                                    value={digestTime}
                                                    onChange={(e) => setDigestTime(e.target.value)}
                                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-primary-500 transition-all focus:outline-none"
                                                />
                                                <IconClock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Hot Lead Score Cutoff</label>
                                            <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl">
                                                <input 
                                                    type="range" 
                                                    min="50" 
                                                    max="100" 
                                                    value={digestHotLeadThreshold}
                                                    onChange={(e) => setDigestHotLeadThreshold(Number(e.target.value))}
                                                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                                />
                                                <span className="text-sm font-bold text-slate-800 dark:text-white min-w-[2.5rem] text-right">{digestHotLeadThreshold}+</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Include Sections */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Included Modules</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div 
                                                onClick={() => setIncludeTasks(!includeTasks)}
                                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-24 ${
                                                    includeTasks 
                                                    ? 'bg-primary-50/50 dark:bg-primary-950/20 border-primary-200 dark:border-primary-800/80' 
                                                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                                }`}
                                            >
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">📋 Tasks</span>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">Pending items</span>
                                            </div>

                                            <div 
                                                onClick={() => setIncludeMeetings(!includeMeetings)}
                                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-24 ${
                                                    includeMeetings 
                                                    ? 'bg-primary-50/50 dark:bg-primary-950/20 border-primary-200 dark:border-primary-800/80' 
                                                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                                }`}
                                            >
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">📅 Schedule</span>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">Upcoming meetings</span>
                                            </div>

                                            <div 
                                                onClick={() => setIncludeLeads(!includeLeads)}
                                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-24 ${
                                                    includeLeads 
                                                    ? 'bg-primary-50/50 dark:bg-primary-950/20 border-primary-200 dark:border-primary-800/80' 
                                                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                                }`}
                                            >
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">🔥 Opportunities</span>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">Hot Leads</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action button */}
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/65">
                                        <button 
                                            disabled={isSynthesizing}
                                            onClick={handleSynthesizeDigest}
                                            className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center space-x-2.5 transition-all text-white ${
                                                isSynthesizing 
                                                ? 'bg-primary-400 cursor-not-allowed' 
                                                : 'bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-500/10 active:scale-[0.98]'
                                            }`}
                                        >
                                            <IconSparkles className={`w-4 h-4 ${isSynthesizing ? 'animate-spin' : ''}`} />
                                            <span>{isSynthesizing ? 'Synthesizing with AI and sending email...' : 'Synthesize & Send Test Digest Now'}</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!digestEnabled && (
                                <div className="flex flex-col items-center justify-center py-10 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center px-6">
                                    <span className="text-3xl mb-3">📬</span>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Digest is Currently Deactivated</span>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Enable daily briefings above to configure automated summaries and keep your CRM execution hyper-focused.</p>
                                </div>
                            )}
                        </div>

                        {/* Digest Inbox History Column */}
                        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm flex flex-col h-[480px]">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 flex-shrink-0">
                                <div>
                                    <h4 className="font-bold text-slate-950 dark:text-white text-base">Sent Briefings History</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Simulated corporate inbox</p>
                                </div>
                                <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
                                    {synthesizedDigests.length} Sent
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                                {synthesizedDigests.length > 0 ? (
                                    synthesizedDigests.map((digest) => (
                                        <div 
                                            key={digest.id}
                                            onClick={() => setSelectedDigest(digest)}
                                            className="p-4 bg-slate-50 dark:bg-slate-800/40 hover:bg-primary-50/25 dark:hover:bg-primary-950/10 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer transition-all hover:border-primary-200 dark:hover:border-primary-900/50 group flex flex-col justify-between"
                                        >
                                            <div className="flex items-start justify-between space-x-2">
                                                <span className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                                                    {digest.subject}
                                                </span>
                                                <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest flex-shrink-0 mt-0.5">
                                                    {digest.triggerType}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                                                {digest.executiveSummary || "View details of email report."}
                                            </p>
                                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/40 text-[10px] text-slate-400 font-medium">
                                                <span>To: {digest.recipientEmail}</span>
                                                <span>{new Date(digest.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center px-4 h-full">
                                        <div className="text-4xl mb-4 text-slate-300 dark:text-slate-700">✉️</div>
                                        <h5 className="text-sm font-bold text-slate-800 dark:text-white">Simulated Inbox Empty</h5>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px]">Synthesize a test briefing to populate sent email history archive.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Email Viewer Modal */}
                {selectedDigest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="w-full max-w-3xl bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
                            {/* Modal Header */}
                            <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-extrabold text-primary-500 uppercase tracking-widest block">EMU INBOX BRIEF PREVIEW</span>
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">{selectedDigest.subject}</h4>
                                </div>
                                <button 
                                    onClick={() => setSelectedDigest(null)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                >
                                    <IconX className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Envelope Header Block */}
                            <div className="px-8 py-4 bg-slate-100 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800/60 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                                <div><b className="text-slate-700 dark:text-slate-300">From:</b> <span className="font-mono">NovaCRM Core Intelligence &lt;brief@novacrm.co&gt;</span></div>
                                <div><b className="text-slate-700 dark:text-slate-300">To:</b> <span className="font-mono">{selectedDigest.recipientEmail}</span></div>
                                <div><b className="text-slate-700 dark:text-slate-300">Date:</b> {new Date(selectedDigest.generatedAt).toLocaleString()}</div>
                            </div>

                            {/* Render Container for HTML */}
                            <div className="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-slate-950/20">
                                {selectedDigest.htmlContent ? (
                                    <div 
                                        className="bg-white dark:bg-white text-slate-900 p-1 rounded-2xl shadow-sm max-w-full overflow-x-hidden"
                                        dangerouslySetInnerHTML={{ __html: selectedDigest.htmlContent }}
                                    />
                                ) : (
                                    <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans">
                                        {selectedDigest.markdownContent || selectedDigest.executiveSummary}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-8 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between flex-shrink-0 text-xs">
                                <span className="text-slate-400">Recipient status: <b className="text-[#10b981]">Synthesized & Sent (Simulated)</b></span>
                                <button 
                                    onClick={() => setSelectedDigest(null)}
                                    className="px-5 py-2 bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Done & Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );

      case 'security':
        return (
            <div className="max-w-5xl space-y-8 animate-fade-in pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Access Control */}
                    <div className="bg-rose-50 dark:bg-rose-900/10 rounded-[2rem] p-8 border border-rose-100 dark:border-rose-900/20">
                        <h4 className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-8">Access Control Hardening</h4>
                        
                        {/* MFA Toggle */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 flex items-center justify-between shadow-sm mb-6 border border-rose-100 dark:border-rose-900/20">
                            <div>
                                <h5 className="font-bold text-slate-900 dark:text-white text-base">MFA Protocol</h5>
                                <p className="text-xs text-rose-400 font-medium mt-0.5">Two-Factor Authentication</p>
                            </div>
                            <button 
                                onClick={() => setMfaEnabled(!mfaEnabled)}
                                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${mfaEnabled ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                            >
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${mfaEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {/* Session Timeout */}
                        <div>
                            <label className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 block">Session Timeout (Minutes)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={sessionTimeout}
                                    onChange={(e) => setSessionTimeout(e.target.value)}
                                    className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/20 rounded-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Internal API Access */}
                    <div className="bg-[#0f172a] rounded-[2rem] p-8 border border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 relative z-10">Internal API Access</h4>
                        
                        {/* Gemini Card */}
                        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 mb-6 relative z-10 flex items-center justify-between">
                            <div>
                                <h5 className="font-bold text-white text-lg">Gemini Neural Link</h5>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Disconnected</span>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors uppercase tracking-wide">
                                Connect
                            </button>
                        </div>

                        {/* Verify Button */}
                        <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:scale-[1.02] transition-all relative z-10">
                            Verify Neural Uplink
                        </button>
                    </div>
                </div>

                {/* External API Keys Section */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">External API Keys</h3>
                        <button 
                            onClick={handleOpenKeyModal}
                            className="bg-[#0f172a] dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                        >
                            <IconPlus className="w-4 h-4" /> Synthesize Credential
                        </button>
                    </div>

                    <div className="space-y-4">
                        {apiKeys.map((key) => (
                            <div key={key.id} className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl hover:border-slate-200 dark:hover:border-slate-600 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                                        <IconKey className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{key.name}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <code className="text-xs font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">{key.prefix}</code>
                                            <span className="text-[10px] text-slate-400">Created: {key.created}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                                        Active
                                    </span>
                                    <button 
                                        onClick={() => handleRevokeKey(key.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Revoke Key"
                                    >
                                        <IconTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {apiKeys.length === 0 && (
                            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                                <IconKey className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm font-medium">No API keys generated yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );

      case 'team':
        return (
            <div className="space-y-8 animate-fade-in pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Team & Access Control</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage users, roles, and granular permissions.</p>
                    </div>
                    <div className="flex gap-3">
                         <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex">
                            <button 
                                onClick={() => setTeamView('users')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${teamView === 'users' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
                            >
                                Users
                            </button>
                            <button 
                                onClick={() => setTeamView('roles')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${teamView === 'roles' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
                            >
                                Roles
                            </button>
                         </div>
                         {teamView === 'users' ? (
                             <button 
                              onClick={() => setIsInviteModalOpen(true)}
                              className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                            >
                                <IconPlus className="w-4 h-4" /> Invite Member
                            </button>
                         ) : (
                             <button 
                              onClick={() => setIsCreateRoleModalOpen(true)}
                              className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                            >
                                <IconPlus className="w-4 h-4" /> Create Role
                            </button>
                         )}
                    </div>
                </div>

                {teamView === 'users' ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                           <h4 className="font-bold text-lg text-slate-900 dark:text-white">Active Users ({users.length})</h4>
                        </div>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {users.map(user => (
                                    <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={user.avatar} className="w-10 h-10 rounded-full" alt={user.name} />
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                                                    <div className="text-xs text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select 
                                                value={user.roleId} 
                                                onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                                className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary-500 outline-none"
                                            >
                                                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded text-xs font-bold uppercase">Active</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleGeneratePassword(user)} className="text-sm font-bold text-slate-900 dark:text-white hover:underline uppercase tracking-wide text-xs">Reset Password</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-4">
                            {roles.map(role => (
                                <div 
                                    key={role.id}
                                    onClick={() => setEditingRole(role)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${editingRole?.id === role.id ? 'border-slate-900 dark:border-white ring-1 ring-slate-900 dark:ring-white bg-white dark:bg-slate-800 shadow-md' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-900 dark:text-white">{role.name}</h4>
                                        {role.isSystem && <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">System</span>}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{role.description}</p>
                                </div>
                            ))}
                            <button onClick={() => setIsCreateRoleModalOpen(true)} className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 font-bold text-sm hover:text-primary-600 hover:border-primary-500 transition-colors">
                                + Create Custom Role
                            </button>
                        </div>

                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                            {editingRole ? (
                                <>
                                    <div className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{editingRole.name}</h2>
                                                <p className="text-slate-500 dark:text-slate-400">{editingRole.description}</p>
                                            </div>
                                            {!editingRole.isSystem && (
                                                <button onClick={() => handleDeleteRole(editingRole.id)} className="text-red-500 hover:text-red-600 p-2"><IconTrash className="w-5 h-5"/></button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-8">
                                        {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => (
                                            <div key={group}>
                                                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                                                    {group}
                                                </h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {perms.map(perm => (
                                                        <PermissionToggleCard 
                                                            key={perm}
                                                            label={PERMISSION_DETAILS[perm as Permission].label}
                                                            description={PERMISSION_DETAILS[perm as Permission].desc}
                                                            checked={editingRole.permissions.includes(perm as Permission)}
                                                            onChange={() => handleTogglePermission(editingRole.id, perm as Permission)}
                                                            disabled={editingRole.isSystem && group === 'System Administration'}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <p>Select a role to configure permissions.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );

      default:
        return <div>Select a category</div>;
    }
  };

  const navItemClass = (id: string) => `
    w-full flex items-center px-4 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 mb-1
    ${activeTab === id 
        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 shadow-sm' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
  `;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
        <div className="px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center sticky top-0 z-10 shadow-sm">
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">System Settings</h1>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">Global Configuration & Administration</p>
            </div>
            <button 
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-3 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 ${isSaved ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-slate-900/20'}`}
            >
                {isSaved ? <IconCheckCircle className="w-4 h-4" /> : <IconSave className="w-4 h-4" />}
                {isSaved ? 'Saved Successfully' : 'Save Changes'}
            </button>
        </div>

        <div className="flex flex-1 overflow-hidden p-8 max-w-7xl mx-auto w-full gap-10">
            <div className="w-64 flex-shrink-0">
                <nav className="space-y-1">
                    <button onClick={() => setActiveTab('company')} className={navItemClass('company')}>
                        <IconBuilding className="w-5 h-5 mr-3 opacity-70" />
                        Company Profile
                    </button>
                    <button onClick={() => setActiveTab('theme')} className={navItemClass('theme')}>
                        <IconGlobe className="w-5 h-5 mr-3 opacity-70" />
                        Theme & Brand
                    </button>
                    <button onClick={() => setActiveTab('regional')} className={navItemClass('regional')}>
                        <IconGlobe className="w-5 h-5 mr-3 opacity-70" />
                        Regional & Date
                    </button>
                    <button onClick={() => setActiveTab('security')} className={navItemClass('security')}>
                        <IconShield className="w-5 h-5 mr-3 opacity-70" />
                        Security & Access
                    </button>
                    <div className="my-4 border-t border-slate-200 dark:border-slate-800 mx-4"></div>
                    <button onClick={() => setActiveTab('team')} className={navItemClass('team')}>
                        <IconUsers className="w-5 h-5 mr-3 opacity-70" />
                        Team & Roles
                    </button>
                    <button onClick={() => setActiveTab('finance')} className={navItemClass('finance')}>
                        <IconWallet className="w-5 h-5 mr-3 opacity-70" />
                        Financial Config
                    </button>
                    <button onClick={() => setActiveTab('ai')} className={navItemClass('ai')}>
                        <IconSparkles className="w-5 h-5 mr-3 opacity-70" />
                        AI & Automation
                    </button>
                    <button onClick={() => setActiveTab('notifications')} className={navItemClass('notifications')}>
                        <IconBell className="w-5 h-5 mr-3 opacity-70" />
                        Alerts & Email
                    </button>
                </nav>
            </div>

            <div className="flex-1 bg-transparent overflow-y-auto custom-scrollbar px-4 pt-2">
                {renderContent()}
            </div>
        </div>
        
        {isKeyModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-100 opacity-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{newlyGeneratedKey ? 'Create New API Key' : 'Create API Key'}</h3>
                        <button onClick={handleCloseKeyModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>
                    
                    {!newlyGeneratedKey ? (
                        <form onSubmit={handleGenerateKey}>
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name</label>
                                <input 
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-slate-400 transition-all" 
                                    placeholder="e.g. Zapier Integration" 
                                    value={newKeyName} 
                                    onChange={e => setNewKeyName(e.target.value)} 
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={handleCloseKeyModal} 
                                    className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg shadow-lg shadow-primary-500/30 transition-all"
                                >
                                    Generate
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-col items-center text-center animate-fade-in">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                                <IconCheckCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">API Key Generated!</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Copy this key now. You won't be able to see it again.</p>
                            
                            <div className="w-full flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-2 mb-8 relative group">
                                <code className="flex-1 text-left px-3 text-sm font-mono text-slate-700 dark:text-slate-300 truncate font-bold">{newlyGeneratedKey}</code>
                                <button 
                                    onClick={() => copyToClipboard(newlyGeneratedKey)} 
                                    className="p-2 text-slate-400 hover:text-primary-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors shadow-sm"
                                    title="Copy to clipboard"
                                >
                                    <IconCopy className="w-5 h-5" />
                                </button>
                            </div>

                            <button 
                                onClick={handleCloseKeyModal} 
                                className="w-full py-3 bg-[#0f172a] hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl font-bold transition-all shadow-lg"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}

        {isCreateRoleModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-100 opacity-100 animate-scale-in">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create Custom Role</h3>
                        <button onClick={() => setIsCreateRoleModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleCreateRole}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role Name</label>
                                <input 
                                    type="text" 
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white"
                                    placeholder="e.g. Marketing Manager"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                                <textarea 
                                    value={newRoleDescription}
                                    onChange={(e) => setNewRoleDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white resize-none"
                                    rows={3}
                                    placeholder="Describe the responsibilities..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button 
                                type="button" 
                                onClick={() => setIsCreateRoleModalOpen(false)} 
                                className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="px-6 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-500 shadow-lg shadow-primary-500/25 transition-colors"
                            >
                                Create Role
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {isInviteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-100 opacity-100 animate-scale-in">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Invite Team Member</h3>
                        <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleInviteMember}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                                <input 
                                    type="text" 
                                    value={inviteName}
                                    onChange={(e) => setInviteName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white"
                                    placeholder="e.g. John Doe"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                                <input 
                                    type="email" 
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white"
                                    placeholder="john@company.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
                                <select 
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white appearance-none cursor-pointer"
                                >
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button 
                                type="button" 
                                onClick={() => setIsInviteModalOpen(false)} 
                                className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="px-6 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-500 shadow-lg shadow-primary-500/25 transition-colors"
                            >
                                Send Invite
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {passwordModalOpen && selectedUserForPassword && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-100 opacity-100">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                            <IconLock className="w-8 h-8 text-blue-500" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Password Reset Successful</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                            Temporary password generated for <strong>{selectedUserForPassword.name}</strong>.
                        </p>
                        
                        <div className="w-full flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-3 mb-8 relative group">
                            <code className="flex-1 text-center text-lg font-mono text-slate-900 dark:text-white font-bold tracking-wider">{generatedPassword}</code>
                            <button 
                                onClick={() => copyToClipboard(generatedPassword)} 
                                className="absolute right-2 p-2 text-slate-400 hover:text-primary-500 bg-white dark:bg-slate-700 rounded-lg transition-colors shadow-sm"
                                title="Copy"
                            >
                                <IconCopy className="w-4 h-4" />
                            </button>
                        </div>

                        <button 
                            onClick={() => setPasswordModalOpen(false)} 
                            className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-all shadow-lg"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Settings;

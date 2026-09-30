
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Deal, Activity, Account, Contact, Task, PlaybookResource, RoleDefinition, Currency } from '../types';
import ActivityTimeline, { TimelineActivity } from './ActivityTimeline';
import { IconX, IconMail, IconPhone, IconFilter, IconHistory, IconClock, IconCalendar, IconCheckCircle, IconTarget, IconBuilding, IconUser, IconZap, IconBriefcase, IconSparkles, IconSettings, IconPlus, IconTrash, IconGripVertical, IconBook, IconFileText, IconDownload, IconAlertTriangle, IconTrendingUp, IconList } from './Icons';
import { generateDealNextAction, generateSalesPlaybook } from '../services/geminiService';
import { formatCurrency } from '../lib/utils';
import { validateEmail, validatePhone, validateRequired, validateNumber } from '../lib/validation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from 'recharts';
import { ContextualAIButton } from './ai/ContextualAIButton';

const inputClasses = (error?: string) => `
  w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl transition-all outline-none
  ${error 
    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
    : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'}
  text-slate-900 dark:text-white placeholder:text-slate-400
`;

const ErrorMessage: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5 text-red-500 text-xs font-medium animate-shake">
      <IconAlertTriangle className="w-3.5 h-3.5" />
      {message}
    </div>
  );
};

interface PipelineProps {
  deals: Deal[];
  accounts?: Account[];
  contacts?: Contact[];
  onAddDeal: (deal: Deal) => void;
  onUpdateDeal: (deal: Deal) => void;
  pipelineGoal: number;
  onSetGoal: (goal: number) => void;
  userRole?: RoleDefinition;
  defaultCurrency?: string;
  multiCurrency?: boolean;
}

const DEFAULT_PIPELINES: Record<string, { id: string, label: string, color: string }[]> = {
  'Standard': [
    { id: 'Qualification', label: 'Qualification', color: 'bg-slate-500' },
    { id: 'Needs Analysis', label: 'Needs Analysis', color: 'bg-blue-500' },
    { id: 'Value Proposition', label: 'Value Proposition', color: 'bg-indigo-500' },
    { id: 'Decision Makers', label: 'Decision Makers', color: 'bg-purple-500' },
    { id: 'Proposal/Price Quote', label: 'Proposal/Price Quote', color: 'bg-yellow-500' },
    { id: 'Negotiation/Review', label: 'Negotiation/Review', color: 'bg-orange-500' },
    { id: 'Closed Won', label: 'Closed Won', color: 'bg-emerald-500' },
    { id: 'Closed Lost', label: 'Closed Lost', color: 'bg-red-500' },
  ],
  'Real Estate': [
    { id: 'New Lead', label: 'New Lead', color: 'bg-slate-500' },
    { id: 'Viewing Scheduled', label: 'Viewing Scheduled', color: 'bg-blue-500' },
    { id: 'Viewing Completed', label: 'Viewing Completed', color: 'bg-indigo-500' },
    { id: 'Offer Made', label: 'Offer Made', color: 'bg-yellow-500' },
    { id: 'Contract Sent', label: 'Contract Sent', color: 'bg-orange-500' },
    { id: 'Closed Sale', label: 'Closed Sale', color: 'bg-emerald-500' },
  ],
  'SaaS': [
    { id: 'Discovery', label: 'Discovery', color: 'bg-slate-500' },
    { id: 'Product Demo', label: 'Product Demo', color: 'bg-blue-500' },
    { id: 'Technical POC', label: 'Technical POC', color: 'bg-purple-500' },
    { id: 'Proposal', label: 'Proposal', color: 'bg-yellow-500' },
    { id: 'Security Review', label: 'Security Review', color: 'bg-red-400' },
    { id: 'Negotiation', label: 'Negotiation', color: 'bg-orange-500' },
    { id: 'Closed Won', label: 'Closed Won', color: 'bg-emerald-500' },
  ],
  'Retail': [
    { id: 'Inquiry', label: 'Inquiry', color: 'bg-slate-500' },
    { id: 'Store Visit', label: 'Store Visit', color: 'bg-blue-500' },
    { id: 'Try-on', label: 'Try-on', color: 'bg-purple-500' },
    { id: 'Checkout', label: 'Checkout', color: 'bg-emerald-500' },
    { id: 'Return Window', label: 'Return Window', color: 'bg-yellow-500' },
  ]
};

const AVAILABLE_COLORS = [
    'bg-slate-500', 'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 
    'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 
    'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];

const Pipeline: React.FC<PipelineProps> = ({ deals, accounts = [], contacts = [], onAddDeal, onUpdateDeal, pipelineGoal, onSetGoal, userRole, defaultCurrency = 'USD', multiCurrency = false }) => {
  const [pipelineConfigs, setPipelineConfigs] = useState(DEFAULT_PIPELINES);
  const [currentPipeline, setCurrentPipeline] = useState('Standard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [tempGoal, setTempGoal] = useState(pipelineGoal.toString());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quarterly Forecasting & Projections state
  const [pipelineView, setPipelineView] = useState<'board' | 'projections'>('board');
  const [probBoost, setProbBoost] = useState<number>(0);
  const [slippageDays, setSlippageDays] = useState<number>(0);
  const [selectedQuarterFilter, setSelectedQuarterFilter] = useState<string>('');

  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  
  const selectedDeal = useMemo(() => {
    if (!selectedDealId) return null;
    return deals.find(d => d.id === selectedDealId) || null;
  }, [deals, selectedDealId]);

  // Config Modal State
  const [editingStages, setEditingStages] = useState<{ id: string, label: string, color: string }[]>([]);

  // AI Loading State for deals
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());

  // Playbook State
  const [playbookModalOpen, setPlaybookModalOpen] = useState(false);
  const [currentPlaybookDeal, setCurrentPlaybookDeal] = useState<Deal | null>(null);
  const [isGeneratingPlaybook, setIsGeneratingPlaybook] = useState(false);

  const columns = pipelineConfigs[currentPipeline];

  const canManagePipeline = userRole ? userRole.permissions.includes('manage_pipeline') : true;
  const canEditSettings = userRole ? userRole.permissions.includes('manage_settings') : true;

  const initialFormState = {
    title: '',
    company: '',
    value: '',
    currency: defaultCurrency as Currency,
    closeDate: '',
    stage: columns[0].id,
    email: '',
    phone: '',
    probability: 50,
    contactName: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Autocomplete State
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [showContactSuggestions, setShowContactSuggestions] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const contactWrapperRef = useRef<HTMLDivElement>(null);

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (contactWrapperRef.current && !contactWrapperRef.current.contains(event.target as Node)) {
        setShowContactSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef, contactWrapperRef]);

  // Reset form or populate when modal opens/closes or selection changes
  useEffect(() => {
    if (selectedDeal) {
      setFormData({
        title: selectedDeal.title,
        company: selectedDeal.company,
        value: selectedDeal.value.toString(),
        currency: selectedDeal.currency || 'USD',
        closeDate: selectedDeal.closeDate,
        stage: selectedDeal.stage,
        email: selectedDeal.email || '',
        phone: selectedDeal.phone || '',
        probability: selectedDeal.probability,
        contactName: '' 
      });
    } else {
      setFormData({ ...initialFormState, stage: columns[0].id });
    }
    setErrors({});
  }, [selectedDeal, currentPipeline]);

  const handleOpenNewDeal = () => {
    if (!canManagePipeline) return;
    setSelectedDealId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditDeal = (deal: Deal) => {
    if (!canManagePipeline) return;
    setSelectedDealId(deal.id);
    setIsModalOpen(true);
  };

  const handleLogActivity = (type: 'email_sent' | 'meeting_scheduled' | 'follow_up', description: string) => {
    if (!selectedDeal) return;

    const newActivity: Activity = {
      id: Date.now().toString(),
      type,
      description,
      timestamp: new Date().toISOString()
    };

    const updatedDeal: Deal = {
      ...selectedDeal,
      activities: [...(selectedDeal.activities || []), newActivity]
    };
    
    onUpdateDeal(updatedDeal);
  };

  const handleOpenPlaybook = async (e: React.MouseEvent, deal: Deal) => {
      e.stopPropagation();
      setCurrentPlaybookDeal(deal);
      setPlaybookModalOpen(true);

      if (!deal.aiPlaybook) {
          setIsGeneratingPlaybook(true);
          // Infer industry from account if possible
          const account = accounts.find(a => a.name === deal.company);
          const industry = account?.industry || 'Technology'; // Fallback
          
          const playbook = await generateSalesPlaybook(deal, industry);
          const updatedDeal = { ...deal, aiPlaybook: playbook };
          onUpdateDeal(updatedDeal);
          setCurrentPlaybookDeal(updatedDeal); // Update local state for modal
          setIsGeneratingPlaybook(false);
      }
  };

  // Filter States
  const [filterCompany, setFilterCompany] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Helper to determine Calendar Quarter
  const getQuarterInfo = (dateStr: string) => {
    if (!dateStr) return { quarter: 'Unknown', year: 'Unknown', key: 'Unknown' };
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      const parts = dateStr.split('-');
      if (parts.length >= 2) {
        const year = parts[0];
        const month = parseInt(parts[1], 10);
        if (!isNaN(month) && month >= 1 && month <= 12) {
          const q = Math.ceil(month / 3);
          return { quarter: `Q${q}`, year, key: `${year}-Q${q}` };
        }
      }
      return { quarter: 'Unknown', year: 'Unknown', key: 'Unknown' };
    }
    const year = d.getFullYear().toString();
    const month = d.getMonth() + 1;
    const q = Math.ceil(month / 3);
    return { quarter: `Q${q}`, year, key: `${year}-Q${q}` };
  };

  // Simulated deals applying Win Probability Boost and Close Date Slippage
  const simulatedDeals = useMemo(() => {
    return deals.map(deal => {
      let finalCloseDate = deal.closeDate || '';
      if (finalCloseDate && slippageDays > 0) {
        try {
          const parts = finalCloseDate.split('-');
          if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            const dateObj = new Date(year, month, day);
            dateObj.setDate(dateObj.getDate() + slippageDays);
            
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            finalCloseDate = `${yyyy}-${mm}-${dd}`;
          } else {
            const dateObj = new Date(finalCloseDate);
            if (!isNaN(dateObj.getTime())) {
              dateObj.setDate(dateObj.getDate() + slippageDays);
              finalCloseDate = dateObj.toISOString().split('T')[0];
            }
          }
        } catch (e) {
          // Keep original closeDate
        }
      }
      const simulatedProb = Math.max(0, Math.min(100, deal.probability + probBoost));
      const simulatedWeighted = deal.value * (simulatedProb / 100);
      const qInfo = getQuarterInfo(finalCloseDate);
      
      return {
        ...deal,
        simulatedCloseDate: finalCloseDate,
        simulatedProb,
        simulatedWeighted,
        quarterKey: qInfo.key,
        quarterLabel: qInfo.key !== 'Unknown' ? `${qInfo.quarter} ${qInfo.year}` : 'Unknown Quarter',
        quarterYear: qInfo.year,
        quarterQuarter: qInfo.quarter
      };
    });
  }, [deals, probBoost, slippageDays]);

  // Summarize quarterly forecast metrics and group deals
  const projectionsSummary = useMemo(() => {
    const quartersMap = new Map<string, { key: string; label: string; year: string; quarter: string; weighted: number; unweighted: number; count: number }>();
    
    let totalWeighted = 0;
    let totalUnweighted = 0;
    let highestQuarterKey = '';
    let highestQuarterWeighted = 0;
    
    simulatedDeals.forEach(deal => {
      if (deal.stage === 'Closed Lost') return; // Exclude lost deals from forward forecast
      
      const key = deal.quarterKey;
      if (key === 'Unknown') return;
      
      totalWeighted += deal.simulatedWeighted;
      totalUnweighted += deal.value;
      
      if (!quartersMap.has(key)) {
        quartersMap.set(key, {
          key,
          label: deal.quarterLabel,
          year: deal.quarterYear,
          quarter: deal.quarterQuarter,
          weighted: 0,
          unweighted: 0,
          count: 0
        });
      }
      
      const qData = quartersMap.get(key)!;
      qData.weighted += deal.simulatedWeighted;
      qData.unweighted += deal.value;
      qData.count += 1;
    });
    
    const list = Array.from(quartersMap.values()).sort((a, b) => a.key.localeCompare(b.key));
    
    list.forEach(q => {
      if (q.weighted > highestQuarterWeighted) {
        highestQuarterWeighted = q.weighted;
        highestQuarterKey = q.label;
      }
    });
    
    return {
      quarters: list,
      totalWeighted,
      totalUnweighted,
      topQuarter: highestQuarterKey || 'N/A',
      topQuarterVal: highestQuarterWeighted,
      averageProb: simulatedDeals.length > 0 
        ? Math.round(simulatedDeals.reduce((sum, d) => sum + d.simulatedProb, 0) / simulatedDeals.length) 
        : 0
    };
  }, [simulatedDeals]);

  // Filtered list of simulated deals for the drill-down visualizer
  const filteredSimulatedDeals = useMemo(() => {
    return simulatedDeals.filter(deal => {
      if (selectedQuarterFilter) {
        return deal.quarterKey === selectedQuarterFilter;
      }
      return true;
    }).sort((a, b) => a.simulatedCloseDate.localeCompare(b.simulatedCloseDate));
  }, [simulatedDeals, selectedQuarterFilter]);

  const percentOfGoal = pipelineGoal > 0 ? (projectionsSummary.totalWeighted / pipelineGoal) * 100 : 0;

  // Derived Options for Dropdowns
  const uniqueCompanies = useMemo(() => Array.from(new Set(deals.map(d => d.company))).sort(), [deals]);
  const uniqueDates = useMemo(() => Array.from(new Set(deals.map(d => d.closeDate))).sort(), [deals]);

  // Filter Logic
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      // Basic pipeline filtering - only show deals that match current pipeline stages
      const pipelineStages = columns.map(s => s.id);
      const isInPipeline = pipelineStages.includes(deal.stage);
      
      const matchesCompany = filterCompany ? deal.company === filterCompany : true;
      const matchesDate = filterDate ? deal.closeDate === filterDate : true;
      
      return isInPipeline && matchesCompany && matchesDate;
    });
  }, [deals, currentPipeline, filterCompany, filterDate, columns]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'company') {
        if (value && accounts.length > 0) {
            const matches = accounts.filter(a => a.name.toLowerCase().includes(value.toLowerCase()));
            setFilteredAccounts(matches);
            setShowSuggestions(matches.length > 0);
        } else {
            setShowSuggestions(false);
        }
    }

    if (name === 'contactName') {
        if (value && contacts.length > 0) {
            let availableContacts = contacts;
            if (formData.company) {
                availableContacts = contacts.filter(c => c.company.toLowerCase() === formData.company.toLowerCase());
                if (availableContacts.length === 0) availableContacts = contacts;
            }
            const matches = availableContacts.filter(c => c.name.toLowerCase().includes(value.toLowerCase()));
            setFilteredContacts(matches);
            setShowContactSuggestions(matches.length > 0);
        } else {
            setShowContactSuggestions(false);
        }
    }
  };

  const selectAccount = (account: Account) => {
      setFormData(prev => ({
          ...prev,
          company: account.name,
          phone: account.phone || prev.phone
      }));
      setShowSuggestions(false);
  };

  const selectContact = (contact: Contact) => {
      setFormData(prev => ({
          ...prev,
          contactName: contact.name,
          email: contact.email || prev.email,
          phone: contact.phone || prev.phone,
          company: contact.company || prev.company
      }));
      setShowContactSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManagePipeline) return;
    
    const newErrors: Record<string, string> = {};
    if (!validateRequired(formData.title)) newErrors.title = 'Title is required';
    if (!validateRequired(formData.company)) newErrors.company = 'Company is required';
    if (!validateNumber(formData.value)) newErrors.value = 'Valid value is required';
    if (formData.email && !validateEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (formData.phone && !validatePhone(formData.phone)) newErrors.phone = 'Invalid phone format';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (selectedDeal) {
      const updatedDeal: Deal = {
        ...selectedDeal,
        title: formData.title,
        company: formData.company,
        value: Number(formData.value),
        currency: formData.currency,
        stage: formData.stage,
        closeDate: formData.closeDate,
        probability: Number(formData.probability),
        email: formData.email,
        phone: formData.phone
      };
      onUpdateDeal(updatedDeal);
    } else {
      const newDeal: Deal = {
        id: Date.now().toString(),
        title: formData.title,
        company: formData.company,
        value: Number(formData.value),
        currency: formData.currency,
        stage: formData.stage,
        closeDate: formData.closeDate || new Date().toISOString().split('T')[0],
        probability: Number(formData.probability),
        email: formData.email,
        phone: formData.phone,
        activities: []
      };
      onAddDeal(newDeal);
    }

    setIsModalOpen(false);
    setSelectedDealId(null);
  };

  const handleSaveGoal = () => {
    const goal = parseFloat(tempGoal);
    if (!isNaN(goal) && goal > 0) {
      onSetGoal(goal);
      setIsGoalModalOpen(false);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    if (!canManagePipeline) return;
    setDraggedDealId(dealId);
    e.dataTransfer.setData('dealId', dealId);
    e.dataTransfer.effectAllowed = 'move';
    const target = e.target as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedDealId(null);
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (!canManagePipeline) return;
    const dealId = e.dataTransfer.getData('dealId');
    const deal = deals.find(d => d.id === dealId);
    
    if (deal && deal.stage !== stageId) {
      // Update Deal Stage
      onUpdateDeal({ ...deal, stage: stageId });

      // Automation: Trigger Tasks based on stage movement
      triggerAutomation(stageId, deal);
    }
  };

  const triggerAutomation = (newStage: string, deal: Deal) => {
      // Mock Automation Logic
      let message = '';
      if (newStage.toLowerCase().includes('negotiation') || newStage.toLowerCase().includes('offer')) {
          message = `Automated Task: "Draft Contract" created for ${deal.company}`;
      } else if (newStage.toLowerCase().includes('demo') || newStage.toLowerCase().includes('viewing')) {
          message = `Automated Activity: "Send Calendar Invite" triggered.`;
      } else if (newStage.toLowerCase().includes('won') || newStage.toLowerCase().includes('sale')) {
          message = `🎉 Deal Won! "Onboarding Email" sent automatically.`;
      }

      if (message) {
          setToastMessage(message);
          setTimeout(() => setToastMessage(null), 4000);
      }
  };

  const handleGenerateAction = async (e: React.MouseEvent, deal: Deal) => {
      e.stopPropagation();
      setGeneratingIds(prev => new Set(prev).add(deal.id));
      const action = await generateDealNextAction(deal);
      onUpdateDeal({ ...deal, aiNextStep: action });
      setGeneratingIds(prev => {
          const next = new Set(prev);
          next.delete(deal.id);
          return next;
      });
  };

  // Helper functions for Activity Log styling
  const getActivityTypeStyle = (type: Activity['type']) => {
    switch (type) {
      case 'created':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'stage_change':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
      case 'value_change':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  const formatActivityType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Configuration Handlers
  const handleOpenConfig = () => {
      setEditingStages(JSON.parse(JSON.stringify(columns))); // Deep copy
      setIsConfigModalOpen(true);
  };

  const handleUpdateStage = (index: number, key: string, value: string) => {
      const newStages = [...editingStages];
      // @ts-ignore
      newStages[index][key] = value;
      // If label changes, also update ID to match (simplification for this prototype)
      if (key === 'label') {
          newStages[index].id = value; // In a real app, IDs should be stable
      }
      setEditingStages(newStages);
  };

  const handleAddStage = () => {
      setEditingStages([...editingStages, { id: `Stage ${editingStages.length + 1}`, label: 'New Stage', color: 'bg-slate-500' }]);
  };

  const handleRemoveStage = (index: number) => {
      const newStages = [...editingStages];
      newStages.splice(index, 1);
      setEditingStages(newStages);
  };

  const handleSaveConfig = () => {
      setPipelineConfigs(prev => ({
          ...prev,
          [currentPipeline]: editingStages
      }));
      setIsConfigModalOpen(false);
  };

  const conversionMetrics = useMemo(() => {
    const currentViewDeals = pipelineView === 'board' ? filteredDeals : filteredSimulatedDeals;
    const totalCount = currentViewDeals.length;
    
    const closedWonDeals = currentViewDeals.filter(d => {
      const stageLower = d.stage.toLowerCase();
      return (
        stageLower === 'closed won' ||
        stageLower === 'closed sale' ||
        stageLower === 'checkout' ||
        stageLower === 'closed' ||
        stageLower.includes('won') ||
        stageLower.includes('sale') ||
        stageLower.includes('completed')
      );
    });
    
    const wonCount = closedWonDeals.length;
    const rate = totalCount > 0 ? Math.round((wonCount / totalCount) * 100) : 0;
    
    return {
      totalCount,
      wonCount,
      rate
    };
  }, [pipelineView, filteredDeals, filteredSimulatedDeals]);

  return (
    <div className="h-full flex flex-col relative">
      {/* Toast Notification for Automation */}
      {toastMessage && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
              <div className="bg-slate-900 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 border border-slate-700">
                  <IconZap className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium text-sm">{toastMessage}</span>
              </div>
          </div>
      )}

      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center mb-6 gap-4 md:pr-24">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Opportunity Pipeline</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage deals across different verticals.</p>
            
            {/* View Selector Tabs & Conversion Rate Badge */}
            <div className="flex flex-wrap items-center gap-3 mt-3.5">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 select-none self-start w-fit">
                <button
                  onClick={() => setPipelineView('board')}
                  className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    pipelineView === 'board'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <IconBriefcase className="w-3.5 h-3.5" />
                  Pipeline Board
                </button>
                <button
                  onClick={() => setPipelineView('projections')}
                  className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    pipelineView === 'projections'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <IconTrendingUp className="w-3.5 h-3.5" />
                  Quarterly Forecasting
                </button>
              </div>

              {/* Dynamic Conversion Rate Metric Display */}
              <div 
                id="conversion-rate-display"
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-xs font-bold leading-none select-none transition-colors"
                title={`${conversionMetrics.wonCount} won out of ${conversionMetrics.totalCount} total deals in current view`}
              >
                <IconCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Conversion Rate: <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{conversionMetrics.rate}%</span></span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium font-mono">({conversionMetrics.wonCount}/{conversionMetrics.totalCount})</span>
              </div>
            </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Pipeline Selector */}
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-sm">
              <IconBriefcase className="w-4 h-4 text-slate-500 mr-2" />
              <select 
                  value={currentPipeline}
                  onChange={(e) => setCurrentPipeline(e.target.value)}
                  className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-2"
              >
                  {Object.keys(pipelineConfigs).map(key => (
                      <option key={key} value={key}>{key} Pipeline</option>
                  ))}
              </select>
              {canEditSettings && (
                  <button 
                    onClick={handleOpenConfig} 
                    className="ml-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border-l border-slate-200 dark:border-slate-700 pl-2"
                    title="Configure Stages"
                  >
                      <IconSettings className="w-4 h-4" />
                  </button>
              )}
          </div>

          {/* Contextual AI Copilot Entry Point */}
          <ContextualAIButton
            entityType="deal"
            label="Ask AI"
            variant="primary"
            size="sm"
          />

          <button
            onClick={() => { setTempGoal(pipelineGoal.toString()); setIsGoalModalOpen(true); }}
            className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <IconTarget className="w-4 h-4 mr-2 text-emerald-500" />
            Set Goal
          </button>
          
          {canManagePipeline && (
              <button 
                onClick={handleOpenNewDeal}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all"
              >
                + New Opportunity
              </button>
          )}
        </div>
      </div>

            {pipelineView === 'board' ? (
        <>
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none transition-colors">
            <div className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
              <IconFilter className="w-4 h-4 mr-2" />
              Filter by:
            </div>
            
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors cursor-pointer"
            >
              <option value="">All Companies</option>
              {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors cursor-pointer"
            >
              <option value="">All Dates</option>
              {uniqueDates.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            {(filterCompany || filterDate) && (
              <button
                onClick={() => { setFilterCompany(''); setFilterDate(''); }}
                className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6 overflow-x-auto pb-4 auto-cols-min">
            {columns.map((col) => (
              <div 
                key={col.id} 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex flex-col h-full min-w-[300px] bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl transition-all duration-300 ${draggedDealId ? 'border-dashed border-slate-300 dark:border-slate-700' : ''}`}
              >
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate pr-2">{col.label}</h3>
                  <span className="px-2 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-900 bg-slate-200 dark:bg-slate-200 rounded-full flex-shrink-0">
                    {filteredDeals.filter(d => d.stage === col.id).length}
                  </span>
                </div>
                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                  {filteredDeals.filter(d => d.stage === col.id).map((deal) => (
                    <div 
                      key={deal.id} 
                      draggable={canManagePipeline}
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleOpenEditDeal(deal)}
                      className={`p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-slate-600 transition-all group select-none relative ${canManagePipeline ? 'cursor-move active:cursor-grabbing' : 'cursor-pointer'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{deal.company}</span>
                        <div className="flex items-center gap-2">
                            {/* Playbook Button */}
                            <button 
                                onClick={(e) => handleOpenPlaybook(e, deal)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                title="AI Sales Playbook"
                            >
                                <IconBook className="w-3.5 h-3.5" />
                            </button>
                            <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
                        </div>
                      </div>
                      <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{deal.title}</h4>
                      
                      {/* AI Next Best Action Section */}
                      <div className="mb-3">
                          {deal.aiNextStep ? (
                              <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30 rounded p-2.5 relative group/hint">
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-1">
                                      <IconSparkles className="w-3 h-3" />
                                      Next Best Action
                                  </div>
                                  <p className="text-xs text-purple-900 dark:text-purple-100 font-medium leading-relaxed">
                                      {deal.aiNextStep}
                                  </p>
                                  {/* Refresh Button - hidden until hover */}
                                  <button 
                                    onClick={(e) => handleGenerateAction(e, deal)}
                                    disabled={generatingIds.has(deal.id)}
                                    className="absolute top-2 right-2 p-1 text-purple-400 hover:text-purple-700 dark:hover:text-purple-200 opacity-0 group-hover/hint:opacity-100 transition-opacity"
                                    title="Regenerate"
                                  >
                                      <span className={`block text-[10px] ${generatingIds.has(deal.id) ? 'animate-spin' : ''}`}>⟳</span>
                                  </button>
                              </div>
                          ) : (
                              <button 
                                onClick={(e) => handleGenerateAction(e, deal)}
                                disabled={generatingIds.has(deal.id)}
                                className="w-full flex items-center justify-center gap-1.5 py-1.5 border border-dashed border-slate-300 dark:border-slate-700 rounded text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400hover:border-purple-300 dark:hover:border-purple-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group/btn"
                              >
                                  {generatingIds.has(deal.id) ? (
                                      <span className="animate-spin w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full"></span>
                                  ) : (
                                      <IconSparkles className="w-3 h-3 group-hover/btn:animate-pulse" />
                                  )}
                                  {generatingIds.has(deal.id) ? 'Analyzing...' : 'Get AI Action'}
                              </button>
                          )}
                      </div>

                      {/* Contact Info */}
                      {(deal.email || deal.phone) && (
                        <div className="mb-3 space-y-1">
                          {deal.email && (
                            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                              <IconMail className="w-3 h-3 mr-1.5 opacity-70" />
                              <span className="truncate max-w-[180px]">{deal.email}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-700/50">
                        <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{formatCurrency(deal.value, multiCurrency ? (deal.currency || defaultCurrency) : defaultCurrency)}</span>
                        <div className="flex items-center">
                            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mr-2 overflow-hidden">
                                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${deal.probability}%` }}></div>
                            </div>
                            <span className="text-xs text-slate-500">{deal.probability}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredDeals.filter(d => d.stage === col.id).length === 0 && (
                     <div className="flex items-center justify-center h-24 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-600 text-sm">
                       Drop here
                     </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6 overflow-y-auto pr-1 pb-10 flex-1">
          {/* Controls & Metrics Header row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scenario Parameters / Simulator Card */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Forecasting Simulator</h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Model market and team win-rate dynamics</p>
                  </div>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Probability Boost slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <span>Deal Probabilities</span>
                      <span className={`font-mono text-xs font-black ${probBoost > 0 ? 'text-emerald-500' : probBoost < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                        {probBoost > 0 ? `+${probBoost}` : probBoost}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="5"
                      value={probBoost}
                      onChange={(e) => setProbBoost(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold select-none">
                      <span>-50%</span>
                      <span>Neutral</span>
                      <span>+50%</span>
                    </div>
                  </div>

                  {/* Expected Close Date Slippage */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Expected Close Slippage
                    </label>
                    <select
                      value={slippageDays}
                      onChange={(e) => setSlippageDays(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="0">No delay (Current target schedule)</option>
                      <option value="30">30-Day Slippage Delay</option>
                      <option value="60">60-Day Slippage Delay</option>
                      <option value="90">90-Day Slippage Delay</option>
                    </select>
                  </div>
                </div>
              </div>

              {(probBoost !== 0 || slippageDays !== 0) && (
                <button
                  onClick={() => {
                    setProbBoost(0);
                    setSlippageDays(0);
                  }}
                  className="mt-4 w-full py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/45 text-red-600 text-xs font-bold rounded-xl border border-red-100 dark:border-red-900/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <IconX className="w-3.5 h-3.5" />
                  Reset Scenario Parameters
                </button>
              )}
            </div>

            {/* KPI Metrics Dashboard (takes 2 cols on lg) */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Projected weighted revenue vs Goal */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-bold">Projected Revenue (Weighted)</span>
                    <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                      <IconTrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                    {formatCurrency(projectionsSummary.totalWeighted, defaultCurrency)}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Goal Achievement: <span className="font-bold text-indigo-500">{percentOfGoal.toFixed(1)}%</span> of {formatCurrency(pipelineGoal, defaultCurrency)} target goal
                  </p>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, percentOfGoal)}%` }}
                  ></div>
                </div>
              </div>

              {/* Card 2: Total Unweighted revenue */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-bold">Unweighted Total Pipeline</span>
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
                      <IconBriefcase className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                    {formatCurrency(projectionsSummary.totalUnweighted, defaultCurrency)}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Raw aggregate value of all forward opportunity contracts.
                  </p>
                </div>
                <div className="w-full text-xs text-slate-500 dark:text-slate-400 font-bold font-mono">
                  ACTIVE PIPELINE COUNT: {simulatedDeals.filter(d => d.stage !== 'Closed Lost').length}
                </div>
              </div>

              {/* Card 3: Blended average probability */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-bold">Blended Win Probability</span>
                    <div className="p-1.5 bg-purple-50 dark:bg-purple-950/30 rounded-lg text-purple-600 dark:text-purple-400">
                      <IconZap className="w-4 h-4 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                    {projectionsSummary.averageProb}%
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Weighted conversion projection based on deal parameters.
                  </p>
                </div>
                <div className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wide">
                  {probBoost !== 0 ? `Simulating ${probBoost > 0 ? '+' : ''}${probBoost}% win rate scale` : 'Operating at actual win rate'}
                </div>
              </div>

              {/* Card 4: Best performing Quarter */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-bold">Peak Projected Quarter</span>
                    <div className="p-1.5 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg text-yellow-600 dark:text-yellow-400">
                      <IconSparkles className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2 truncate">
                    {projectionsSummary.topQuarter}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Peak projection: <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{formatCurrency(projectionsSummary.topQuarterVal, defaultCurrency)}</span>
                  </p>
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">
                  Best performing period
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quarterly Revenue Projections</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Weighted projections compared directly to unweighted pipeline. Click on any bar to filter deals.</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedQuarterFilter && (
                  <button
                    onClick={() => setSelectedQuarterFilter('')}
                    className="text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-xl font-extrabold cursor-pointer transition-colors"
                  >
                    Reset Filter
                  </button>
                )}
                <div className="text-xs font-bold text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-801">
                  Interactive: <span className="text-indigo-600 dark:text-indigo-400">Filter on Click</span>
                </div>
              </div>
            </div>

            {projectionsSummary.quarters.length === 0 ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-slate-500 text-sm italic font-medium p-6 bg-slate-50 dark:bg-slate-950/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 animate-pulse">
                <IconCalendar className="w-8 h-8 text-slate-400 mb-2 opacity-50" />
                No forward opportunities found with expected close dates scheduled.
              </div>
            ) : (
              <div className="pt-4 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectionsSummary.quarters}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} fontWeight={700} tickLine={false} />
                    <YAxis 
                      stroke="#94A3B8" 
                      fontSize={10} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} 
                    />
                    <Tooltip 
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 border border-slate-800 shadow-2xl p-3.5 rounded-xl text-xs text-white space-y-1.5 font-bold">
                              <p className="text-slate-450 mb-1">{data.label}</p>
                              <div className="flex items-center gap-1.5 text-indigo-400">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                <span>Projected weighted: {formatCurrency(data.weighted, defaultCurrency)}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-350">
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                <span>Total unweighted: {formatCurrency(data.unweighted, defaultCurrency)}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 italic mt-1 font-medium">{data.count} Opportunities scheduled</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{value}</span>}
                    />
                    <Bar 
                      name="Projected (Weighted)" 
                      dataKey="weighted" 
                      fill="#6366F1" 
                      radius={[4, 4, 0, 0]}
                      onClick={(data) => setSelectedQuarterFilter(data.key === selectedQuarterFilter ? '' : data.key)}
                      cursor="pointer"
                    >
                      {projectionsSummary.quarters.map((entry, index) => (
                        <Cell 
                          key={`cell-w-${index}`} 
                          fill={entry.key === selectedQuarterFilter ? '#4F46E5' : '#6366F1'} 
                          fillOpacity={selectedQuarterFilter && entry.key !== selectedQuarterFilter ? 0.35 : 1}
                        />
                      ))}
                    </Bar>
                    <Bar 
                      name="Total Pipeline (Unweighted)" 
                      dataKey="unweighted" 
                      fill="#94A3B8"
                      radius={[4, 4, 0, 0]}
                      fillOpacity={0.25}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Opportunities Drilldown List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {/* Header with selected quarter filter */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <IconList className="w-5 h-5 text-indigo-500" />
                  Quarterly Opportunity Board: {selectedQuarterFilter ? projectionsSummary.quarters.find(q => q.key === selectedQuarterFilter)?.label || selectedQuarterFilter : 'All Scheduled Quarters'}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Dynamically adjust parameters here to calibrate your revenue projections.
                </p>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-center">
                <span className="text-xs font-bold text-slate-400 uppercase select-none font-bold">Quarter Filter:</span>
                <select
                  value={selectedQuarterFilter}
                  onChange={(e) => setSelectedQuarterFilter(e.target.value)}
                  className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">All Quarters ({simulatedDeals.length} opportunities)</option>
                  {projectionsSummary.quarters.map(q => (
                    <option key={q.key} value={q.key}>{q.label} ({q.count} deals)</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Drilldown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 select-none bg-slate-50/10">
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Opportunity Detail</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Stage</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Expected Close Date</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Win Probability</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Deal Value</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right text-indigo-500 dark:text-indigo-400">Forecast Contribution</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredSimulatedDeals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap italic font-medium">
                        No active opportunities match this quarter selection.
                      </td>
                    </tr>
                  ) : (
                    filteredSimulatedDeals.map(deal => {
                      return (
                        <tr key={deal.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="p-4 whitespace-nowrap">
                            <div className="font-bold text-slate-900 dark:text-white text-sm leading-snug">{deal.title}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 leading-snug font-medium mt-0.5">{deal.company}</div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-105 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                              {deal.stage}
                            </span>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <input
                                type="date"
                                value={deal.closeDate}
                                disabled={!canManagePipeline}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val) {
                                    onUpdateDeal({ ...deal, closeDate: val });
                                  }
                                }}
                                className="px-2 py-1 font-bold text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              {slippageDays > 0 && (
                                <span className="text-[9px] text-amber-500 font-extrabold mt-1 select-none">
                                  Simulated target: {deal.simulatedCloseDate}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={deal.probability}
                                disabled={!canManagePipeline}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val !== '') {
                                    onUpdateDeal({ ...deal, probability: Math.max(0, Math.min(100, Number(val))) });
                                  }
                                }}
                                className="w-14 px-1.5 py-1 text-center font-bold text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-805 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <span className="text-xs text-slate-400 font-mono font-bold">%</span>
                              {probBoost !== 0 && (
                                <span className={`text-[10px] font-extrabold whitespace-nowrap ${probBoost > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                  (Sim: {deal.simulatedProb}%)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap text-sm">
                            {formatCurrency(deal.value, multiCurrency ? (deal.currency || defaultCurrency) : defaultCurrency)}
                          </td>
                          <td className="p-4 text-right font-black text-indigo-650 dark:text-indigo-400 whitespace-nowrap text-sm">
                            {formatCurrency(deal.simulatedWeighted, multiCurrency ? (deal.currency || defaultCurrency) : defaultCurrency)}
                          </td>
                          <td className="p-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleOpenEditDeal(deal)}
                              className="px-2.5 py-1 text-xs font-extrabold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
                            >
                              Edit Full Deal
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Set Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-6 animate-scale-in">
             <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Set Pipeline Goal</h2>
             <div className="mb-4">
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Value ({defaultCurrency})</label>
               <input 
                 type="number"
                 value={tempGoal}
                 onChange={(e) => setTempGoal(e.target.value)}
                 className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                 placeholder="e.g. 1000000"
               />
             </div>
             <div className="flex gap-3">
               <button 
                 onClick={() => setIsGoalModalOpen(false)}
                 className="flex-1 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleSaveGoal}
                 className="flex-1 px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-500 transition-colors"
               >
                 Save Goal
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Pipeline Config Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                 <IconSettings className="w-5 h-5 mr-3 text-primary-500" />
                 Configure Stages: {currentPipeline}
              </h2>
              <button 
                onClick={() => setIsConfigModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <IconX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
                <div className="space-y-3">
                    {editingStages.map((stage, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl group">
                            <IconGripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Stage Name</label>
                                <input 
                                    type="text" 
                                    value={stage.label}
                                    onChange={(e) => handleUpdateStage(idx, 'label', e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Color</label>
                                <div className="flex gap-1.5 flex-wrap w-32">
                                    {AVAILABLE_COLORS.slice(0, 5).map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => handleUpdateStage(idx, 'color', color)}
                                            className={`w-6 h-6 rounded-full border-2 transition-all ${stage.color === color ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent hover:scale-110'}`}
                                            style={{ backgroundColor: color.replace('bg-', 'var(--color-').replace('-500', '-500)') /* Approximation for demo, actually reusing class names is better in React context if possible, but style object needs color values. Since using tailwind classes, render div with class */ }}
                                        >
                                            <div className={`w-full h-full rounded-full ${color}`}></div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button 
                                onClick={() => handleRemoveStage(idx)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-4"
                                title="Remove Stage"
                            >
                                <IconTrash className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                
                <button 
                    onClick={handleAddStage}
                    className="mt-4 w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
                >
                    <IconPlus className="w-4 h-4" /> Add New Stage
                </button>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                <button 
                    onClick={() => setIsConfigModalOpen(false)}
                    className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSaveConfig}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-500 shadow-lg shadow-primary-500/25 transition-colors"
                >
                    Save Configuration
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Sales Playbook Modal */}
      {playbookModalOpen && currentPlaybookDeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-900/10">
                      <div>
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                              <IconBook className="w-5 h-5 mr-3 text-indigo-500" />
                              AI Sales Playbook
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Strategy for: <span className="font-semibold text-slate-700 dark:text-slate-200">{currentPlaybookDeal.title}</span> ({currentPlaybookDeal.stage})
                          </p>
                      </div>
                      <button onClick={() => setPlaybookModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                          <IconX className="w-6 h-6" />
                      </button>
                  </div>

                  <div className="p-6 overflow-y-auto">
                      {isGeneratingPlaybook ? (
                          <div className="flex flex-col items-center justify-center py-12">
                              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                              <p className="text-slate-500 dark:text-slate-400">Analyzing deal context and generating playbook...</p>
                          </div>
                      ) : currentPlaybookDeal.aiPlaybook ? (
                          <div className="space-y-8">
                              {/* Recommended Actions */}
                              <section>
                                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
                                      <IconCheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                                      Recommended Actions
                                  </h3>
                                  <div className="space-y-3">
                                      {currentPlaybookDeal.aiPlaybook.actions.map((action, idx) => (
                                          <div key={idx} className="flex items-start p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                              <input type="checkbox" className="mt-1 mr-3 rounded text-indigo-600 focus:ring-indigo-500" />
                                              <span className="text-sm text-slate-700 dark:text-slate-300">{action}</span>
                                          </div>
                                      ))}
                                  </div>
                              </section>

                              {/* Enablement Resources */}
                              <section>
                                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
                                      <IconFileText className="w-4 h-4 mr-2 text-blue-500" />
                                      Enablement Resources
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {currentPlaybookDeal.aiPlaybook.resources.map((resource, idx) => (
                                          <div key={idx} className="flex items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors cursor-pointer group">
                                              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mr-3 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
                                                  <IconDownload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{resource.title}</p>
                                                  <p className="text-xs text-slate-500 dark:text-slate-400">{resource.type}</p>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </section>
                          </div>
                      ) : (
                          <div className="text-center py-8 text-slate-500">Failed to load playbook. Please try again.</div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* New/Edit Deal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {selectedDeal ? 'Edit Opportunity' : 'Add New Opportunity'}
              </h2>
              <button 
                onClick={() => { setIsModalOpen(false); setSelectedDealId(null); }} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <IconX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-1">Opportunity Title</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Enterprise License"
                      className={inputClasses(errors.title)}
                    />
                    <ErrorMessage message={errors.title} />
                  </div>
                  
                  <div className="relative" ref={wrapperRef}>
                    <label className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-1">Company</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="company"
                        required
                        value={formData.company}
                        onChange={handleInputChange}
                        onFocus={() => { if(formData.company && accounts.length) setShowSuggestions(true); }}
                        placeholder="e.g. Acme Corp"
                        className={inputClasses(errors.company)}
                        autoComplete="off"
                      />
                      <ErrorMessage message={errors.company} />
                      {showSuggestions && (
                          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                              {filteredAccounts.map(account => (
                                  <div 
                                      key={account.id}
                                      onClick={() => selectAccount(account)}
                                      className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors"
                                  >
                                      <div>
                                          <div className="text-sm font-medium text-slate-900 dark:text-white">{account.name}</div>
                                          <div className="text-xs text-slate-500 dark:text-slate-400">{account.industry}</div>
                                      </div>
                                      {account.phone && <IconPhone className="w-3 h-3 text-slate-400" />}
                                  </div>
                              ))}
                          </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative" ref={contactWrapperRef}>
                    <label className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        onFocus={() => { if(contacts.length) setShowContactSuggestions(true); }}
                        placeholder="Select a Contact"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                        autoComplete="off"
                      />
                      <IconUser className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      {showContactSuggestions && (
                          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                              {filteredContacts.map(contact => (
                                  <div 
                                      key={contact.id}
                                      onClick={() => selectContact(contact)}
                                      className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors"
                                  >
                                      <div>
                                          <div className="text-sm font-medium text-slate-900 dark:text-white">{contact.name}</div>
                                          <div className="text-xs text-slate-500 dark:text-slate-400">{contact.company || 'No Company'}</div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 555..."
                      className={inputClasses(errors.phone)}
                    />
                    <ErrorMessage message={errors.phone} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-1">Value</label>
                      <input
                        type="number"
                        name="value"
                        required
                        min="0"
                        value={formData.value}
                        onChange={handleInputChange}
                        placeholder="50000"
                        className={inputClasses(errors.value)}
                      />
                      <ErrorMessage message={errors.value} />
                    </div>
                    <div className="w-24">
                      <label className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-1">Currency</label>
                      <select
                        name="currency"
                        value={multiCurrency ? formData.currency : defaultCurrency}
                        onChange={handleInputChange}
                        disabled={!multiCurrency}
                        className={inputClasses() + (!multiCurrency ? ' opacity-50 cursor-not-allowed' : '')}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="JPY">JPY (¥)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-1">Close Date</label>
                    <input
                      type="date"
                      name="closeDate"
                      required
                      value={formData.closeDate}
                      onChange={handleInputChange}
                      className={inputClasses()}
                    />
                  </div>
                </div>

                <div>
                    <label className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="contact@acme.com"
                      className={inputClasses(errors.email)}
                    />
                    <ErrorMessage message={errors.email} />
                </div>

                <div>
                   <div className="flex justify-between items-center mb-1">
                      <label className="block text-base font-medium text-slate-700 dark:text-slate-300">Probability</label>
                      <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{formData.probability}%</span>
                   </div>
                   <input
                     type="range"
                     name="probability"
                     min="0"
                     max="100"
                     step="5"
                     value={formData.probability}
                     onChange={handleInputChange}
                     className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                   />
                </div>

                <div>
                  <label className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-1">Stage</label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                  >
                    {columns.map(stage => (
                        <option key={stage.id} value={stage.id}>{stage.label}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setSelectedDealId(null); }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-colors"
                  >
                    {selectedDeal ? 'Update Opportunity' : 'Create Opportunity'}
                  </button>
                </div>
              </form>

              {/* Activity Log Section */}
              {selectedDeal && (
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                   {/* Quick Actions for Logging */}
                  <div className="flex gap-2 mb-6">
                    <button 
                      onClick={() => handleLogActivity('email_sent', 'Sent follow-up email')}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                    >
                      <IconMail className="w-3 h-3 mr-1.5" /> Email Sent
                    </button>
                    <button 
                      onClick={() => handleLogActivity('meeting_scheduled', 'Scheduled a meeting')}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400 border border-pink-200 dark:border-pink-500/20 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-500/20 transition-colors"
                    >
                      <IconCalendar className="w-3 h-3 mr-1.5" /> Meeting
                    </button>
                    <button 
                      onClick={() => handleLogActivity('follow_up', 'Completed follow-up task')}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors"
                    >
                      <IconCheckCircle className="w-3 h-3 mr-1.5" /> Follow Up
                    </button>
                  </div>

                  <div className="flex items-center mb-4">
                    <IconHistory className="w-5 h-5 text-slate-400 mr-2" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Activity Log</h3>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                     <ActivityTimeline 
                        activities={
                          selectedDeal.activities?.map(a => ({
                            id: a.id,
                            type: a.type === 'email_sent' ? 'email' : 
                                  a.type === 'meeting_scheduled' ? 'meeting' : 
                                  a.type === 'stage_change' ? 'field_change' : 
                                  a.type === 'created' ? 'field_change' : 'note',
                            title: formatActivityType(a.type),
                            description: a.description,
                            timestamp: a.timestamp
                          })) || []
                        }
                     />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pipeline;


import React, { useState, useMemo } from 'react';
import { Campaign, CampaignStatus, CampaignType, Currency } from '../types';
import { 
  IconMegaphone, IconFilter, IconPlus, IconSearch, IconTarget, 
  IconWallet, IconUsers, IconArrowUp, IconArrowDown, IconEdit, IconTrash, 
  IconX, IconCalendar, IconSparkles, IconFlask, IconActivity, IconPieChart, IconTrendingUp, IconArrowLeft,
  IconAlertTriangle
} from './Icons';
import { generateCampaignContent, generatePredictiveTargeting, generateABTestRecommendations, generateCampaignPerformanceReport } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { validateNumber, validateRequired, ValidationErrors } from '../lib/validation';
import { formatCurrency } from '../lib/utils';

interface CampaignsProps {
  campaigns: Campaign[];
  onAddCampaign: (campaign: Campaign) => void;
  onUpdateCampaign: (campaign: Campaign) => void;
  onDeleteCampaign: (id: string) => void;
  defaultCurrency?: string;
  multiCurrency?: boolean;
}

const CAMPAIGN_TYPES: CampaignType[] = ['Email', 'Webinar', 'Conference', 'Advertisement', 'Banner Ads', 'Telemarketing', 'Public Relations', 'Partner', 'Other'];
const CAMPAIGN_STATUSES: CampaignStatus[] = ['Planning', 'Active', 'Completed', 'Aborted'];

const Campaigns: React.FC<CampaignsProps> = ({ campaigns, onAddCampaign, onUpdateCampaign, onDeleteCampaign, defaultCurrency = 'USD', multiCurrency = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Campaign; direction: 'asc' | 'desc' } | null>({ key: 'endDate', direction: 'desc' });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState<Partial<Campaign>>({});

  // AI Generation State
  const [aiContext, setAiContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Segmentation State
  const [generatedSegments, setGeneratedSegments] = useState<any[]>([]);
  const [isSegmenting, setIsSegmenting] = useState(false);

  // A/B Testing State
  const [abTestSuggestions, setAbTestSuggestions] = useState<any[]>([]);
  const [isGeneratingAB, setIsGeneratingAB] = useState(false);

  // Analytics View State
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('list');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Metrics
  const activeCount = campaigns.filter(c => c.status === 'Active').length;
  const totalLeads = campaigns.reduce((acc, curr) => acc + (curr.leadsGenerated || 0), 0);
  const totalBudget = campaigns.reduce((acc, curr) => acc + (curr.budget || 0), 0);
  const totalRevenue = campaigns.reduce((acc, curr) => acc + (curr.expectedRevenue || 0), 0);
  const roi = totalBudget > 0 ? ((totalRevenue - totalBudget) / totalBudget) * 100 : 0;

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, statusFilter]);

  const sortedCampaigns = useMemo(() => {
    let items = [...filteredCampaigns];
    if (sortConfig) {
      items.sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [filteredCampaigns, sortConfig]);

  const handleSort = (key: keyof Campaign) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Campaign) => {
    if (!sortConfig || sortConfig.key !== key) return <span className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity">↕️</span>;
    if (sortConfig.direction === 'asc') return <IconArrowUp className="w-3 h-3 text-primary-500" />;
    return <IconArrowDown className="w-3 h-3 text-primary-500" />;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleOpenModal = (campaign?: Campaign) => {
    if (campaign) {
      setSelectedCampaign(campaign);
      setFormData(campaign);
    } else {
      setSelectedCampaign(null);
      setFormData({
        status: 'Planning',
        type: 'Email',
        startDate: new Date().toISOString().split('T')[0],
        budget: 0,
        expectedRevenue: 0
      });
    }
    setAiContext('');
    setGeneratedSegments([]);
    setAbTestSuggestions([]);
    setIsModalOpen(true);
  };

  const handleViewAnalytics = async (campaign: Campaign) => {
      setSelectedCampaign(campaign);
      setViewMode('analytics');
      setAnalyticsData(null);
      setIsAnalyzing(true);
      
      const report = await generateCampaignPerformanceReport(
          campaign.name, 
          campaign.type, 
          { leads: campaign.leadsGenerated, revenue: campaign.expectedRevenue }
      );
      
      setAnalyticsData(report);
      setIsAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: ValidationErrors = {};
    if (!validateRequired(formData.name)) newErrors.name = "Campaign name is required";
    
    if (formData.budget !== undefined && !validateNumber(formData.budget, 0)) {
      newErrors.budget = "Budget must be a positive number";
    }
    
    if (formData.expectedRevenue !== undefined && !validateNumber(formData.expectedRevenue, 0)) {
      newErrors.expectedRevenue = "Expected revenue must be a positive number";
    }
    
    if (formData.actualCost !== undefined && !validateNumber(formData.actualCost, 0)) {
      newErrors.actualCost = "Actual cost must be a positive number";
    }
    
    if (formData.leadsGenerated !== undefined && !validateNumber(formData.leadsGenerated, 0)) {
      newErrors.leadsGenerated = "Leads generated must be a positive number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const campaignData: Campaign = {
        id: selectedCampaign ? selectedCampaign.id : `CMP-${Date.now()}`,
        name: formData.name || '',
        type: formData.type as CampaignType || 'Email',
        status: formData.status as CampaignStatus || 'Planning',
        startDate: formData.startDate || '',
        endDate: formData.endDate || '',
        budget: Number(formData.budget) || 0,
        actualCost: Number(formData.actualCost) || 0,
        expectedRevenue: Number(formData.expectedRevenue) || 0,
        currency: formData.currency as Currency || 'USD',
        leadsGenerated: Number(formData.leadsGenerated) || 0,
        description: formData.description || '',
        targetAudience: formData.targetAudience,
        owner: 'Alex Chen' // Hardcoded for demo
    };

    if (selectedCampaign) {
        onUpdateCampaign(campaignData);
    } else {
        onAddCampaign(campaignData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
      if (selectedCampaign && window.confirm("Are you sure you want to delete this campaign?")) {
          onDeleteCampaign(selectedCampaign.id);
          setIsModalOpen(false);
      }
  };

  const handleGenerateContent = async () => {
      if (!formData.name) {
          alert("Please enter a campaign name first.");
          return;
      }
      setIsGenerating(true);
      const content = await generateCampaignContent(
          formData.name, 
          formData.type || 'Email', 
          Number(formData.budget) || 0,
          aiContext
      );
      setFormData(prev => ({ ...prev, description: content }));
      setIsGenerating(false);
  };

  const handlePredictSegments = async () => {
      if (!formData.name) {
          alert("Please enter a campaign name first.");
          return;
      }
      setIsSegmenting(true);
      const segments = await generatePredictiveTargeting(
          formData.name,
          formData.type || 'Email',
          Number(formData.budget) || 0
      );
      setGeneratedSegments(segments);
      setIsSegmenting(false);
  };

  const handleGenerateABTests = async () => {
      if (!formData.name) {
          alert("Please enter a campaign name first.");
          return;
      }
      setIsGeneratingAB(true);
      const tests = await generateABTestRecommendations(
          formData.name,
          formData.type || 'Email',
          aiContext,
          formData.description || ''
      );
      setAbTestSuggestions(tests);
      setIsGeneratingAB(false);
  };

  const selectSegment = (segment: any) => {
      setFormData(prev => ({ 
          ...prev, 
          targetAudience: `${segment.name} - ${segment.conversionProbability} win probability.\nCriteria: ${segment.behavior}` 
      }));
  };

  const MetricCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
    <div className={`p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 flex items-start justify-between group hover:shadow-md transition-all`}>
        <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
            {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClass}`}>
            <Icon className="w-5 h-5 text-white" />
        </div>
    </div>
  );

  const renderAnalytics = () => {
      if (!selectedCampaign) return null;
      
      const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Positive, Neutral, Negative

      return (
          <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">
              {/* Analytics Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
                  <div className="flex items-center gap-4">
                      <button 
                          onClick={() => setViewMode('list')}
                          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                          <IconArrowLeft className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                      </button>
                      <div>
                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedCampaign.name}</h2>
                          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">{selectedCampaign.type}</span>
                              <span>•</span>
                              <span>Performance Dashboard</span>
                          </div>
                      </div>
                  </div>
                  <button 
                      onClick={() => handleViewAnalytics(selectedCampaign)}
                      disabled={isAnalyzing}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors disabled:opacity-50"
                  >
                      {isAnalyzing ? <span className="animate-spin">⟳</span> : <IconSparkles className="w-4 h-4" />}
                      Refresh Insights
                  </button>
              </div>

              {/* Analytics Body */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  {isAnalyzing ? (
                      <div className="flex flex-col items-center justify-center h-full space-y-4">
                          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                          <p className="text-slate-500 dark:text-slate-400 font-medium">Analyzing campaign data with Gemini...</p>
                      </div>
                  ) : analyticsData ? (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Key Metrics Row */}
                          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Engagement</p>
                                  <div className="flex items-end justify-between">
                                      <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                          {(analyticsData.dailyEngagement.reduce((a:any, b:any) => a + b.clicks, 0)).toLocaleString()}
                                      </h3>
                                      <span className="text-sm font-medium text-emerald-500 flex items-center bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                                          <IconTrendingUp className="w-3 h-3 mr-1" /> +12%
                                      </span>
                                  </div>
                              </div>
                              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sentiment Score</p>
                                  <div className="flex items-end justify-between">
                                      <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                          {analyticsData.sentiment.positive}%
                                      </h3>
                                      <span className="text-sm font-medium text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">
                                          Positive
                                      </span>
                                  </div>
                              </div>
                              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ROI</p>
                                  <div className="flex items-end justify-between">
                                      <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                          {selectedCampaign.budget > 0 ? (((selectedCampaign.expectedRevenue - selectedCampaign.budget) / selectedCampaign.budget) * 100).toFixed(0) : 0}%
                                      </h3>
                                      <span className="text-sm text-slate-400">Based on Revenue</span>
                                  </div>
                              </div>
                          </div>

                          {/* Charts Row */}
                          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                                  <IconActivity className="w-5 h-5 mr-2 text-primary-500" />
                                  Engagement Trends
                              </h3>
                              <div className="h-80">
                                  <ResponsiveContainer width="100%" height="100%">
                                      <AreaChart data={analyticsData.dailyEngagement}>
                                          <defs>
                                              <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                              </linearGradient>
                                              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                              </linearGradient>
                                          </defs>
                                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                          <Tooltip 
                                              contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                                          />
                                          <Legend />
                                          <Area type="monotone" dataKey="opens" stroke="#6366f1" fillOpacity={1} fill="url(#colorOpens)" name="Opens/Views" />
                                          <Area type="monotone" dataKey="clicks" stroke="#10b981" fillOpacity={1} fill="url(#colorClicks)" name="Clicks/Actions" />
                                      </AreaChart>
                                  </ResponsiveContainer>
                              </div>
                          </div>

                          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                                  <IconPieChart className="w-5 h-5 mr-2 text-primary-500" />
                                  Sentiment Analysis
                              </h3>
                              <div className="flex-1 min-h-[250px] relative">
                                  <ResponsiveContainer width="100%" height="100%">
                                      <PieChart>
                                          <Pie
                                              data={[
                                                  { name: 'Positive', value: analyticsData.sentiment.positive },
                                                  { name: 'Neutral', value: analyticsData.sentiment.neutral },
                                                  { name: 'Negative', value: analyticsData.sentiment.negative },
                                              ]}
                                              cx="50%"
                                              cy="50%"
                                              innerRadius={60}
                                              outerRadius={80}
                                              paddingAngle={5}
                                              dataKey="value"
                                          >
                                              {/* Positive, Neutral, Negative colors */}
                                              <Cell fill="#10b981" />
                                              <Cell fill="#f59e0b" />
                                              <Cell fill="#ef4444" />
                                          </Pie>
                                          <Tooltip />
                                          <Legend verticalAlign="bottom" height={36}/>
                                      </PieChart>
                                  </ResponsiveContainer>
                                  {/* Center Text */}
                                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                                      <span className="text-3xl font-bold text-slate-900 dark:text-white">{analyticsData.sentiment.positive}%</span>
                                      <span className="text-xs text-slate-500 uppercase tracking-wide">Positive</span>
                                  </div>
                              </div>
                          </div>

                          {/* AI Analysis Row */}
                          <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                                  <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-3 flex items-center">
                                      <IconSparkles className="w-5 h-5 mr-2" /> Performance Summary
                                  </h3>
                                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                                      {analyticsData.summary}
                                  </p>
                              </div>
                              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                      <IconFlask className="w-5 h-5 mr-2 text-orange-500" /> Strategic Recommendations
                                  </h3>
                                  <ul className="space-y-3">
                                      {analyticsData.recommendations.map((rec: string, idx: number) => (
                                          <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs mt-0.5">{idx + 1}</span>
                                              {rec}
                                          </li>
                                      ))}
                                  </ul>
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center py-20">
                          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                              <IconActivity className="w-10 h-10 text-slate-400" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Analytics Data</h3>
                          <p className="text-slate-500 max-w-sm mt-2">Click "Refresh Insights" to generate a comprehensive performance report using AI.</p>
                          <button 
                              onClick={() => handleViewAnalytics(selectedCampaign)}
                              className="mt-6 px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium shadow-lg shadow-primary-500/20 transition-all"
                          >
                              Generate Report
                          </button>
                      </div>
                  )}
              </div>
          </div>
      );
  };

  const inputClasses = (name: string) => `w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border ${errors[name] ? 'border-red-500 dark:border-red-500/50 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:outline-none focus:ring-2 ${errors[name] ? 'focus:ring-red-500/50' : 'focus:ring-primary-500/50'} dark:text-white transition-all`;
  const errorClasses = "text-xs text-red-500 mt-1.5 flex items-center gap-1 animate-fade-in";

  const ErrorMessage = ({ name }: { name: string }) => errors[name] ? (
    <p className={errorClasses}>
      <IconAlertTriangle className="w-3 h-3" />
      {errors[name]}
    </p>
  ) : null;

  if (viewMode === 'analytics' && selectedCampaign) {
      return renderAnalytics();
  }

  return (
    <div className="space-y-6 h-full flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center flex-shrink-0 md:pr-24">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Campaigns</h1>
            <button onClick={() => handleOpenModal()} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all flex items-center">
                <IconPlus className="w-4 h-4 mr-2" /> New Campaign
            </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-shrink-0">
            <MetricCard 
                title="Active Campaigns" 
                value={activeCount} 
                subtext={`${campaigns.length} Total All-Time`} 
                icon={IconMegaphone} 
                colorClass="bg-blue-500 shadow-lg shadow-blue-500/30" 
            />
            <MetricCard 
                title="Total Leads" 
                value={totalLeads} 
                subtext="Generated from Campaigns" 
                icon={IconUsers} 
                colorClass="bg-emerald-500 shadow-lg shadow-emerald-500/30" 
            />
            <MetricCard 
                title="Budget Utilized" 
                value={formatCurrency(totalBudget, defaultCurrency)} 
                subtext={`Expected Rev: ${formatCurrency(totalRevenue, defaultCurrency)}`} 
                icon={IconWallet} 
                colorClass="bg-indigo-500 shadow-lg shadow-indigo-500/30" 
            />
            <MetricCard 
                title="Return on Investment" 
                value={`${roi.toFixed(1)}%`} 
                subtext="Based on expected revenue" 
                icon={IconTarget} 
                colorClass="bg-purple-500 shadow-lg shadow-purple-500/30" 
            />
        </div>

        {/* List View */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="relative flex-1 max-w-md">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search campaigns..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-2">
                        <IconFilter className="w-4 h-4 text-slate-400" />
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                            <option value="All">All Status</option>
                            {CAMPAIGN_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-auto flex-1 custom-scrollbar">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-950/90 backdrop-blur-sm text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary-600" onClick={() => handleSort('name')}>
                                <div className="flex items-center gap-1">Campaign Name {getSortIcon('name')}</div>
                            </th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary-600" onClick={() => handleSort('type')}>
                                <div className="flex items-center gap-1">Type {getSortIcon('type')}</div>
                            </th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary-600" onClick={() => handleSort('status')}>
                                <div className="flex items-center gap-1">Status {getSortIcon('status')}</div>
                            </th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary-600" onClick={() => handleSort('startDate')}>
                                <div className="flex items-center gap-1">Start Date {getSortIcon('startDate')}</div>
                            </th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary-600" onClick={() => handleSort('endDate')}>
                                <div className="flex items-center gap-1">End Date {getSortIcon('endDate')}</div>
                            </th>
                            <th className="px-6 py-4 font-medium text-right cursor-pointer hover:text-primary-600" onClick={() => handleSort('budget')}>
                                <div className="flex items-center justify-end gap-1">Budget {getSortIcon('budget')}</div>
                            </th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {sortedCampaigns.map(campaign => (
                            <tr key={campaign.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                    {campaign.name}
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{campaign.type}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                                        campaign.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                        campaign.status === 'Planning' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                                        campaign.status === 'Aborted' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                    }`}>
                                        {campaign.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{campaign.startDate}</td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{campaign.endDate}</td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-right">{formatCurrency(campaign.budget, multiCurrency ? (campaign.currency || defaultCurrency) : defaultCurrency)}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleViewAnalytics(campaign)}
                                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                            title="View Analytics"
                                        >
                                            <IconActivity className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleOpenModal(campaign)}
                                            className="p-1.5 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                        >
                                            <IconEdit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if(window.confirm('Delete campaign?')) onDeleteCampaign(campaign.id);
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {sortedCampaigns.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <IconMegaphone className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                                        <p className="text-lg font-medium">No campaigns found</p>
                                        <p className="text-sm">Create a new campaign to start tracking.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Create/Edit Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                            <IconMegaphone className="w-5 h-5 mr-3 text-primary-500" />
                            {selectedCampaign ? 'Edit Campaign' : 'Create Campaign'}
                        </h2>
                        <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><IconX className="w-6 h-6" /></button>
                    </div>
                    
                    <div className="overflow-y-auto p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Campaign Name <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={formData.name || ''} 
                                        onChange={handleInputChange} 
                                        className={inputClasses('name')} 
                                        placeholder="e.g. Q4 Marketing Blitz"
                                    />
                                    <ErrorMessage name="name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                                    <select 
                                        name="status"
                                        value={formData.status || 'Planning'} 
                                        onChange={handleInputChange}
                                        className={inputClasses('status')}
                                    >
                                        {CAMPAIGN_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <ErrorMessage name="status" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
                                    <select 
                                        name="type"
                                        value={formData.type || 'Email'} 
                                        onChange={handleInputChange}
                                        className={inputClasses('type')}
                                    >
                                        {CAMPAIGN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <ErrorMessage name="type" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Start Date</label>
                                        <input 
                                            type="date" 
                                            name="startDate"
                                            value={formData.startDate || ''} 
                                            onChange={handleInputChange} 
                                            className={inputClasses('startDate')} 
                                        />
                                        <ErrorMessage name="startDate" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">End Date</label>
                                        <input 
                                            type="date" 
                                            name="endDate"
                                            value={formData.endDate || ''} 
                                            onChange={handleInputChange} 
                                            className={inputClasses('endDate')} 
                                        />
                                        <ErrorMessage name="endDate" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Currency</label>
                                        <select 
                                            name="currency"
                                            value={formData.currency || 'USD'} 
                                            onChange={handleInputChange} 
                                            className={inputClasses('currency')}
                                        >
                                            <option value="USD">USD ($)</option>
                                            <option value="INR">INR (₹)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="JPY">JPY (¥)</option>
                                            <option value="CAD">CAD ($)</option>
                                            <option value="AUD">AUD ($)</option>
                                        </select>
                                        <ErrorMessage name="currency" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Budget</label>
                                        <input 
                                            type="number" 
                                            name="budget"
                                            value={formData.budget || ''} 
                                            onChange={handleInputChange} 
                                            className={inputClasses('budget')} 
                                            min="0"
                                        />
                                        <ErrorMessage name="budget" />
                                    </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Expected Rev</label>
                                    <input 
                                        type="number" 
                                        name="expectedRevenue"
                                        value={formData.expectedRevenue || ''} 
                                        onChange={handleInputChange} 
                                        className={inputClasses('expectedRevenue')} 
                                        min="0"
                                    />
                                    <ErrorMessage name="expectedRevenue" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Actual Cost</label>
                                    <input 
                                        type="number" 
                                        name="actualCost"
                                        value={formData.actualCost || ''} 
                                        onChange={handleInputChange} 
                                        className={inputClasses('actualCost')} 
                                        min="0"
                                    />
                                    <ErrorMessage name="actualCost" />
                                </div>
                            </div>

                            {/* AI Content Generator Section */}
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/50 p-4 rounded-xl border border-purple-100 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-purple-800 dark:text-purple-300 flex items-center">
                                        <IconSparkles className="w-4 h-4 mr-2" /> AI Content Assistant
                                    </h3>
                                    <button 
                                        type="button" 
                                        onClick={handleGenerateContent}
                                        disabled={isGenerating || !formData.name}
                                        className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-1"
                                    >
                                        {isGenerating ? <span className="animate-spin">⟳</span> : <IconSparkles className="w-3 h-3" />}
                                        {formData.type === 'Email' ? 'Draft Email' : 'Generate Strategy'}
                                    </button>
                                </div>
                                <input 
                                    type="text" 
                                    value={aiContext}
                                    onChange={(e) => setAiContext(e.target.value)}
                                    placeholder="Brief goal (e.g. 'Targeting CTOs for new AI tool launch')"
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-purple-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-400"
                                />
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                                    Uses campaign details & budget to generate professional content.
                                </p>
                            </div>

                            {/* Predictive Segmentation Section */}
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/10 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 flex items-center">
                                        <IconTarget className="w-4 h-4 mr-2" /> Predictive Segmentation
                                    </h3>
                                    <button 
                                        type="button" 
                                        onClick={handlePredictSegments}
                                        disabled={isSegmenting || !formData.name}
                                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-1 shadow-sm"
                                    >
                                        {isSegmenting ? <span className="animate-spin">⟳</span> : <IconTarget className="w-3 h-3" />}
                                        Generate Segments
                                    </button>
                                </div>
                                
                                {generatedSegments.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3">
                                        {generatedSegments.map((segment, idx) => (
                                            <div 
                                                key={idx} 
                                                onClick={() => selectSegment(segment)}
                                                className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-100 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer transition-all shadow-sm group"
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{segment.name}</h4>
                                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                                        {segment.conversionProbability} Conv.
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-300 mb-1"><strong>Who:</strong> {segment.demographics}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400"><strong>Behavior:</strong> {segment.behavior}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-indigo-600/70 dark:text-indigo-300/70 italic text-center py-2">
                                        Use AI to identify high-value audiences based on behavior & demographics.
                                    </p>
                                )}
                            </div>

                            {/* A/B Testing Section */}
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/10 p-5 rounded-xl border border-orange-100 dark:border-orange-800/30">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300 flex items-center">
                                        <IconFlask className="w-4 h-4 mr-2" /> A/B Optimization
                                    </h3>
                                    <button 
                                        type="button" 
                                        onClick={handleGenerateABTests}
                                        disabled={isGeneratingAB || !formData.name}
                                        className="text-xs bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-1 shadow-sm"
                                    >
                                        {isGeneratingAB ? <span className="animate-spin">⟳</span> : <IconFlask className="w-3 h-3" />}
                                        Generate Experiments
                                    </button>
                                </div>
                                
                                {abTestSuggestions.length > 0 ? (
                                    <div className="space-y-4">
                                        {abTestSuggestions.map((test, idx) => (
                                            <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-orange-100 dark:border-slate-700 shadow-sm">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Experiment: {test.element}</span>
                                                    <span className="text-xs font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded">Split: {test.split}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-3">
                                                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                                                        <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Variation A (Control)</span>
                                                        <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{test.variationA}</p>
                                                    </div>
                                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded border border-indigo-100 dark:border-indigo-800/30">
                                                        <span className="block text-[10px] font-bold text-indigo-400 uppercase mb-1">Variation B (Challenger)</span>
                                                        <p className="text-sm text-indigo-900 dark:text-indigo-100 font-medium">{test.variationB}</p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 italic border-l-2 border-orange-300 pl-2">
                                                    Hypothesis: {test.hypothesis}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-orange-600/70 dark:text-orange-300/70 italic text-center py-2">
                                        Generate AI-driven A/B tests to optimize performance.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    {formData.type === 'Email' ? 'Email Content & Strategy' : 'Description & Strategy'}
                                </label>
                                <textarea 
                                    value={formData.description || ''} 
                                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                    rows={6}
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white resize-none font-sans" 
                                    placeholder={formData.type === 'Email' ? "Subject: ...\n\nBody: ..." : "Campaign goals and details..."}
                                />
                            </div>

                            {/* Target Audience Field */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Target Audience</label>
                                <textarea 
                                    value={formData.targetAudience || ''} 
                                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})} 
                                    rows={2}
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white resize-none font-sans text-sm" 
                                    placeholder="e.g. CTOs in Fintech companies with >50 employees..."
                                />
                            </div>

                            <div className="pt-4 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-800">
                                {selectedCampaign && (
                                    <button 
                                        type="button"
                                        onClick={handleDelete}
                                        className="mr-auto px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center"
                                    >
                                        <IconTrash className="w-4 h-4 mr-2" /> Delete
                                    </button>
                                )}
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-500 shadow-lg shadow-primary-500/25 transition-colors"
                                >
                                    {selectedCampaign ? 'Save Changes' : 'Create Campaign'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Campaigns;

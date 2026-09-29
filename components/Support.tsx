
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Ticket, TicketStatus, TicketPriority, TicketType, Account } from '../types';
import { 
  IconLifeBuoy, IconPlus, IconSearch, IconFilter, IconCheckCircle, 
  IconAlertCircle, IconClock, IconMessageCircle, IconX, IconSparkles, 
  IconUser, IconCopy, IconCheck, IconBuilding, IconChevronRight, IconZap
} from './Icons';
import { analyzeTicketSentiment, generateSupportResponse, classifySupportTicket } from '../services/geminiService';

interface SupportProps {
  tickets: Ticket[];
  accounts: Account[];
  onAddTicket: (ticket: Ticket) => void;
  onUpdateTicket: (ticket: Ticket) => void;
  onDeleteTicket: (id: string) => void;
}

const TICKET_STATUSES: TicketStatus[] = ['Open', 'In Progress', 'Waiting on Customer', 'Resolved', 'Closed'];
const TICKET_PRIORITIES: TicketPriority[] = ['Low', 'Medium', 'High', 'Urgent'];
const TICKET_TYPES: TicketType[] = ['Problem', 'Question', 'Feature Request', 'Billing'];

const Support: React.FC<SupportProps> = ({ tickets, accounts, onAddTicket, onUpdateTicket, onDeleteTicket }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // AI States
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState(false);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [classificationReason, setClassificationReason] = useState<string | null>(null);

  // Account Selection State
  const [showAccountSuggestions, setShowAccountSuggestions] = useState(false);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const accountWrapperRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Partial<Ticket>>({
    status: 'Open',
    priority: 'Medium',
    type: 'Question',
    assignedTo: 'Alex Chen',
    createdAt: new Date().toISOString().split('T')[0]
  });

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountWrapperRef.current && !accountWrapperRef.current.contains(event.target as Node)) {
        setShowAccountSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [accountWrapperRef]);

  // Metrics
  const openCount = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const urgentCount = tickets.filter(t => t.priority === 'Urgent' && t.status !== 'Closed').length;
  const avgResponseTime = '4.2h'; // Mocked for now

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchQuery, statusFilter]);

  const handleOpenModal = (ticket?: Ticket) => {
    if (ticket) {
      setSelectedTicket(ticket);
      setFormData(ticket);
      setGeneratedResponse('');
    } else {
      setSelectedTicket(null);
      setFormData({
        status: 'Open',
        priority: 'Medium',
        type: 'Question',
        assignedTo: 'Alex Chen',
        createdAt: new Date().toISOString().split('T')[0],
        subject: '',
        description: '',
        customerName: '',
        accountId: ''
      });
      setGeneratedResponse('');
    }
    setFilteredAccounts([]);
    setShowAccountSuggestions(false);
    setClassificationReason(null);
    setIsModalOpen(true);
  };

  const handleCustomerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData(prev => ({ ...prev, customerName: value, accountId: undefined })); // Clear accountId if typing freely unless matched later
      
      if (value && accounts.length > 0) {
          const matches = accounts.filter(a => a.name.toLowerCase().includes(value.toLowerCase()));
          setFilteredAccounts(matches);
          setShowAccountSuggestions(matches.length > 0);
      } else {
          setShowAccountSuggestions(false);
      }
  };

  const selectAccount = (account: Account) => {
      setFormData(prev => ({
          ...prev,
          customerName: account.name,
          accountId: account.id
      }));
      setShowAccountSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.customerName) {
        alert("Subject and Customer Name are required");
        return;
    }

    const ticketData = {
        id: selectedTicket ? selectedTicket.id : `T-${Date.now()}`,
        ...formData
    } as Ticket;

    if (selectedTicket) {
        onUpdateTicket(ticketData);
    } else {
        onAddTicket(ticketData);
    }
    setIsModalOpen(false);
  };

  const handleSentimentAnalysis = async () => {
      if (!formData.description) return;
      setIsAnalyzingSentiment(true);
      const result = await analyzeTicketSentiment(formData.description);
      setFormData(prev => ({ ...prev, sentimentScore: result.score, sentimentMood: result.mood }));
      setIsAnalyzingSentiment(false);
  };

  const handleGenerateResponse = async () => {
      if (!formData.description) return;
      setIsGeneratingResponse(true);
      // We pass formData cast as Ticket (minimal required fields)
      const response = await generateSupportResponse(formData as Ticket);
      setGeneratedResponse(response);
      setIsGeneratingResponse(false);
  };

  const handleAutoClassify = async () => {
      if (!formData.subject || !formData.description) {
          alert("Please enter a subject and description first.");
          return;
      }
      setIsClassifying(true);
      setClassificationReason(null);
      const result = await classifySupportTicket(formData.subject, formData.description);
      
      setFormData(prev => ({
          ...prev,
          type: result.type,
          priority: result.priority,
          // Simple routing simulation logic
          assignedTo: result.type === 'Billing' ? 'Sarah Connor' : result.type === 'Feature Request' ? 'Miles Dyson' : 'Alex Chen'
      }));
      setClassificationReason(result.reasoning);
      setIsClassifying(false);
  };

  const getPriorityColor = (priority: string) => {
      switch(priority) {
          case 'Urgent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/50';
          case 'High': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-900/50';
          case 'Medium': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/50';
          case 'Low': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
          default: return 'bg-slate-100 text-slate-700';
      }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Open': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
          case 'Closed': return 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-500';
          case 'In Progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
          default: return 'bg-slate-100 text-slate-600';
      }
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center flex-shrink-0 md:pr-24">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Support Desk</h1>
            <button 
                onClick={() => handleOpenModal()}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all flex items-center"
            >
                <IconPlus className="w-4 h-4 mr-2" /> New Ticket
            </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-shrink-0">
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Open Tickets</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{openCount}</h3>
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                        <IconLifeBuoy className="w-5 h-5" />
                    </div>
                </div>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Urgent Issues</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{urgentCount}</h3>
                    </div>
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                        <IconAlertCircle className="w-5 h-5" />
                    </div>
                </div>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Response Time</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{avgResponseTime}</h3>
                    </div>
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                        <IconClock className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </div>

        {/* Ticket List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="relative flex-1 max-w-md">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search tickets by ID, subject, customer..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <IconFilter className="w-4 h-4 text-slate-400" />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                        <option value="All">All Status</option>
                        {TICKET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="overflow-auto flex-1 custom-scrollbar">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-950/90 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            <th className="px-6 py-4 font-medium">Ticket ID</th>
                            <th className="px-6 py-4 font-medium">Subject</th>
                            <th className="px-6 py-4 font-medium">Customer</th>
                            <th className="px-6 py-4 font-medium">Priority</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {filteredTickets.map(ticket => (
                            <tr 
                                key={ticket.id} 
                                onClick={() => handleOpenModal(ticket)}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                            >
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">{ticket.id}</td>
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{ticket.subject}</td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                    {ticket.customerName}
                                    {ticket.accountId && <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">Account</span>}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full border ${getPriorityColor(ticket.priority)}`}>
                                        {ticket.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{ticket.createdAt}</td>
                            </tr>
                        ))}
                        {filteredTickets.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <IconLifeBuoy className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                                        <p className="text-lg font-medium">No tickets found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                            <IconLifeBuoy className="w-5 h-5 mr-3 text-primary-500" />
                            {selectedTicket ? `Ticket ${selectedTicket.id}` : 'Create New Ticket'}
                        </h2>
                        <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><IconX className="w-6 h-6" /></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-0 flex flex-col md:flex-row h-full">
                        {/* Left Col: Form */}
                        <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                            <form id="ticket-form" onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subject</label>
                                    <input 
                                        type="text" 
                                        value={formData.subject} 
                                        onChange={(e) => setFormData({...formData, subject: e.target.value})} 
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                                        required 
                                    />
                                </div>
                                
                                {/* Customer Selection (Account Integrated) */}
                                <div className="relative" ref={accountWrapperRef}>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Customer (Account)</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={formData.customerName} 
                                            onChange={handleCustomerInputChange}
                                            onFocus={() => { if(formData.customerName && accounts.length) setShowAccountSuggestions(true); }}
                                            className="w-full px-3 py-2 pl-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                                            required 
                                            autoComplete="off"
                                            placeholder="Search Accounts..."
                                        />
                                        <IconBuilding className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        {showAccountSuggestions && (
                                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
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
                                                        <IconChevronRight className="w-3 h-3 text-slate-400" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {formData.accountId && (
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
                                            <IconCheckCircle className="w-3 h-3 mr-1" /> Linked to Account
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
                                    <select 
                                        value={formData.type} 
                                        onChange={(e) => setFormData({...formData, type: e.target.value as TicketType})}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white cursor-pointer"
                                    >
                                        {TICKET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                                        <select 
                                            value={formData.status} 
                                            onChange={(e) => setFormData({...formData, status: e.target.value as TicketStatus})}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white cursor-pointer"
                                        >
                                            {TICKET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
                                        <select 
                                            value={formData.priority} 
                                            onChange={(e) => setFormData({...formData, priority: e.target.value as TicketPriority})}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white cursor-pointer"
                                        >
                                            {TICKET_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assigned To</label>
                                    <input 
                                        type="text" 
                                        value={formData.assignedTo} 
                                        onChange={(e) => setFormData({...formData, assignedTo: e.target.value})} 
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Right Col: Details & AI */}
                        <div className="w-full md:w-2/3 p-6 flex flex-col h-full overflow-y-auto">
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                                    <button
                                        type="button"
                                        onClick={handleAutoClassify}
                                        disabled={isClassifying || !formData.description}
                                        className="text-xs bg-indigo-600 text-white px-2 py-1 rounded shadow hover:bg-indigo-500 transition-colors flex items-center gap-1 disabled:opacity-50"
                                    >
                                        {isClassifying ? <span className="animate-spin">⟳</span> : <IconZap className="w-3 h-3" />}
                                        Auto-Classify
                                    </button>
                                </div>
                                <textarea 
                                    value={formData.description} 
                                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                    rows={5}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white resize-none"
                                    placeholder="Detailed description of the issue..."
                                />
                                {classificationReason && (
                                    <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded border border-indigo-100 dark:border-indigo-800/30 animate-fade-in">
                                        <span className="font-bold">AI Classification:</span> {classificationReason}
                                    </div>
                                )}
                            </div>

                            {/* AI Section */}
                            <div className="mt-auto space-y-6">
                                {/* Sentiment Analysis */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center">
                                            <IconSparkles className="w-4 h-4 mr-2 text-purple-500" /> 
                                            Customer Sentiment
                                        </h4>
                                        <button 
                                            type="button" 
                                            onClick={handleSentimentAnalysis}
                                            disabled={isAnalyzingSentiment || !formData.description}
                                            className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-3 py-1 rounded-full font-bold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
                                        >
                                            {isAnalyzingSentiment ? 'Analyzing...' : 'Analyze'}
                                        </button>
                                    </div>
                                    
                                    {formData.sentimentScore !== undefined ? (
                                        <div>
                                            <div className="flex justify-between text-xs mb-1 font-medium text-slate-600 dark:text-slate-400">
                                                <span>Mood: {formData.sentimentMood}</span>
                                                <span>{formData.sentimentScore}/100</span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                                <div 
                                                    className={`h-2.5 rounded-full transition-all duration-1000 ${
                                                        formData.sentimentScore < 30 ? 'bg-red-500' : 
                                                        formData.sentimentScore < 60 ? 'bg-amber-500' : 'bg-emerald-500'
                                                    }`} 
                                                    style={{ width: `${formData.sentimentScore}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">Click analyze to gauge customer sentiment.</p>
                                    )}
                                </div>

                                {/* Reply Assistant */}
                                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/50 p-4 rounded-xl border border-indigo-100 dark:border-slate-700">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 flex items-center">
                                            <IconMessageCircle className="w-4 h-4 mr-2" /> 
                                            AI Reply Assistant
                                        </h4>
                                        <button 
                                            type="button" 
                                            onClick={handleGenerateResponse}
                                            disabled={isGeneratingResponse || !formData.description}
                                            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-500 transition-colors disabled:opacity-50 shadow-sm"
                                        >
                                            {isGeneratingResponse ? 'Drafting...' : 'Draft Response'}
                                        </button>
                                    </div>
                                    {generatedResponse ? (
                                        <div className="relative group">
                                            <textarea 
                                                readOnly 
                                                value={generatedResponse}
                                                className="w-full p-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 h-32 resize-none focus:outline-none"
                                            />
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(generatedResponse)}
                                                className="absolute top-2 right-2 p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Copy to Clipboard"
                                            >
                                                <IconCopy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                                            Use AI to generate a professional, context-aware email response instantly.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                        {selectedTicket && (
                            <button 
                                type="button" 
                                onClick={() => { if(window.confirm('Delete ticket?')) { onDeleteTicket(selectedTicket.id); setIsModalOpen(false); } }}
                                className="mr-auto px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                Delete
                            </button>
                        )}
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white">Cancel</button>
                        <button 
                            type="button" 
                            onClick={(e) => {
                                // Trigger form submit programmatically or just call handleSubmit
                                const form = document.getElementById('ticket-form') as HTMLFormElement;
                                if(form.reportValidity()) handleSubmit(e);
                            }} 
                            className="px-6 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 shadow-md"
                        >
                            Save Ticket
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Support;

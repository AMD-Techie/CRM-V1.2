
import React, { useState, useMemo, useEffect } from 'react';
import { Lead, Deal, Account, Contact, Document, Call, RoleDefinition, User } from '../types';
import { 
  IconSearch, IconPlus, IconArrowUp, IconArrowDown, IconTrash, IconUser, IconList, IconKanban, IconX, IconFilter, IconDownload
} from './Icons';
import LeadDetail from './LeadDetail';
import LeadForm from './LeadForm';
import { calculateLeadPriority, getLeadPriorityFromScore, LeadScorePriorityInfo } from '../lib/utils';
import { ContextualAIButton } from './ai/ContextualAIButton';

interface LeadsProps {
  leads: Lead[];
  accounts?: Account[];
  contacts?: Contact[];
  onAddLead: (lead: Omit<Lead, 'id'>) => void;
  onUpdateLead: (lead: Lead) => void;
  onUpdateLeads?: (leads: Lead[]) => void;
  onDeleteLeads: (ids: string[]) => void;
  onAddDeal: (deal: Deal) => void;
  onViewOpportunities?: () => void;
  onAddDocument: (doc: Document) => void;
  documents?: Document[];
  onUpdateDocument?: (doc: Document) => void;
  onDeleteDocument?: (id: string) => void;
  onEditDocument?: (doc: Document) => void;
  calls?: Call[];
  onAddCall?: (call: Omit<Call, 'id'>) => void;
  userRole?: RoleDefinition;
  currentUser?: User;
  users?: User[];
  defaultCurrency?: string;
  multiCurrency?: boolean;
  initialSelectedLeadId?: string;
  onClearSelectedLeadId?: () => void;
}

type ViewMode = 'list' | 'detail' | 'create' | 'edit';
type SortKey = keyof Lead | 'priorityScore' | 'priorityLevel' | 'priority';

const Leads: React.FC<LeadsProps> = ({ 
    leads, 
    accounts = [], 
    contacts = [], 
    onAddLead, 
    onUpdateLead, 
    onUpdateLeads, 
    onDeleteLeads, 
    onAddDeal, 
    onViewOpportunities, 
    onAddDocument,
    documents = [],
    onUpdateDocument,
    onDeleteDocument,
    onEditDocument,
    calls = [],
    onAddCall,
    userRole,
    currentUser,
    users = [],
    defaultCurrency = 'USD',
    multiCurrency = false,
    initialSelectedLeadId,
    onClearSelectedLeadId
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(initialSelectedLeadId || null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>({
    key: 'score',
    direction: 'desc'
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedNewOwner, setSelectedNewOwner] = useState('');
  const [reassignNote, setReassignNote] = useState('');

  const canCreate = userRole ? userRole.permissions.includes('edit_leads') : true;
  const canDelete = userRole ? userRole.permissions.includes('delete_records') : true;
  const isManager = userRole ? (userRole.id === 'manager' || userRole.id === 'admin') : true;
  const canExport = userRole ? (userRole.permissions.includes('export_data') || userRole.id === 'manager' || userRole.id === 'admin') : true;

  const handleExportCSV = () => {
    // If checkboxes are checked, export selected leads, otherwise export all currently filtered/sorted leads
    const datasetToExport = selectedLeadIds.size > 0 
      ? sortedLeads.filter(l => selectedLeadIds.has(l.id))
      : sortedLeads;

    if (datasetToExport.length === 0) {
      alert('No leads available to export in the current filtered dataset.');
      return;
    }

    const headers = [
      'Lead ID',
      'Contact Name',
      'Company',
      'Job Title',
      'Email',
      'Phone',
      'Status',
      'Priority',
      'Score',
      'Deal Potential ($)',
      'Industry',
      'Lead Source',
      'Assigned Owner',
      'Created Date',
      'Last Contact Date'
    ];

    const escapeCSV = (val: any) => {
      if (val === undefined || val === null) return '""';
      const stringVal = String(val);
      return `"${stringVal.replace(/"/g, '""')}"`;
    };

    const rows = datasetToExport.map(lead => [
      escapeCSV(lead.id),
      escapeCSV(lead.name),
      escapeCSV(lead.company),
      escapeCSV(lead.title || ''),
      escapeCSV(lead.email || ''),
      escapeCSV(lead.phone || ''),
      escapeCSV(lead.status || 'New'),
      escapeCSV(lead.priority || 'Low'),
      escapeCSV(lead.score !== undefined ? lead.score : 0),
      escapeCSV(lead.value || 0),
      escapeCSV(lead.industry || ''),
      escapeCSV(lead.leadSource || ''),
      escapeCSV(lead.owner || 'Unassigned'),
      escapeCSV(lead.creationDate || ''),
      escapeCSV(lead.lastContact || '')
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    const isFiltered = priorityFilter !== 'all' || searchQuery.trim().length > 0;
    const filterSuffix = isFiltered ? `_filtered_${priorityFilter.toLowerCase()}` : '';
    link.href = url;
    link.setAttribute('download', `leads_export${filterSuffix}_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isLeadStagnant = (lead: Lead) => {
    const dateStr = lead.statusUpdatedAt || lead.creationDate;
    if (!dateStr) return false;
    const lastUpdate = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastUpdate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 90;
  };

  // Live priority computations based on score (High: 80+, Medium: 50-79, Low: <50)
  const enrichedLeads = useMemo(() => {
    return leads.map(lead => {
      const score = lead.score !== undefined ? lead.score : 0;
      const scorePriority = getLeadPriorityFromScore(score);
      const priorityInfo = calculateLeadPriority(lead);
      return {
        ...lead,
        priority: scorePriority.level, // High (80+), Medium (50-79), Low (<50)
        priorityLevel: scorePriority.level,
        scorePriority,
        priorityScore: score,
        priorityBreakdown: priorityInfo.breakdown,
      };
    });
  }, [leads]);

  const selectedLead = useMemo(() => {
    if (!selectedLeadId) return null;
    return enrichedLeads.find(l => l.id === selectedLeadId) || null;
  }, [selectedLeadId, enrichedLeads]);

  useEffect(() => {
    if (initialSelectedLeadId) {
      setSelectedLeadId(initialSelectedLeadId);
      setViewMode('detail');
    }
  }, [initialSelectedLeadId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, priorityFilter, sortConfig]);

  const filteredLeads = useMemo(() => {
    let result = enrichedLeads;

    // Filter by Priority
    if (priorityFilter !== 'all') {
      result = result.filter(lead => lead.priority === priorityFilter);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const terms = searchQuery.toLowerCase().trim().split(/\s+/);
      result = result.filter(lead => {
        return terms.every(term => 
          (lead.name || '').toLowerCase().includes(term) || 
          (lead.company || '').toLowerCase().includes(term) ||
          (lead.email || '').toLowerCase().includes(term) ||
          (lead.priority || '').toLowerCase().includes(term) ||
          (lead.status || '').toLowerCase().includes(term)
        );
      });
    }

    return result;
  }, [enrichedLeads, searchQuery, priorityFilter]);

  const sortedLeads = useMemo(() => {
    let items = [...filteredLeads];
    if (sortConfig) {
      items.sort((a, b) => {
        if (sortConfig.key === 'priority') {
          const rankMap: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
          const aRank = rankMap[a.priority] || 0;
          const bRank = rankMap[b.priority] || 0;
          if (aRank !== bRank) {
            return sortConfig.direction === 'asc' ? aRank - bRank : bRank - aRank;
          }
          // Secondary sort by exact score
          return sortConfig.direction === 'asc' ? (a.score || 0) - (b.score || 0) : (b.score || 0) - (a.score || 0);
        }

        // @ts-ignore
        const aVal = a[sortConfig.key] || '';
        // @ts-ignore
        const bVal = b[sortConfig.key] || '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [filteredLeads, sortConfig]);

  const totalItems = sortedLeads.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedLeads.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedLeads, currentPage, itemsPerPage]);

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) return <span className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity">↕️</span>;
    if (sortConfig.direction === 'asc') return <IconArrowUp className="w-3 h-3 text-primary-500" />;
    return <IconArrowDown className="w-3 h-3 text-primary-500" />;
  };

  const toggleSelectLead = (id: string) => {
    const newSelected = new Set(selectedLeadIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedLeadIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.size === sortedLeads.length) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(sortedLeads.map(l => l.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedLeadIds.size} leads?`)) {
      onDeleteLeads(Array.from(selectedLeadIds));
      setSelectedLeadIds(new Set());
    }
  };

  const prospectiveOwners = useMemo(() => {
    const list = new Set<string>();
    
    // Add known users
    users.forEach(u => {
      if (u.name) list.add(u.name.trim());
    });

    // Add any unique owners currently found in leads
    leads.forEach(l => {
      if (l.owner && l.owner.trim()) {
        list.add(l.owner.trim());
      }
    });

    return Array.from(list).sort();
  }, [users, leads]);

  const handleBatchReassign = () => {
    if (!selectedNewOwner) {
      alert('Please select a new owner.');
      return;
    }

    const leadsToUpdate: Lead[] = [];

    leads.forEach(lead => {
      if (selectedLeadIds.has(lead.id)) {
        const timestamp = new Date().toISOString();
        const activityId = Math.random().toString(36).substr(2, 9);
        const activityDesc = `Lead owner reassigned to ${selectedNewOwner} by Manager.${reassignNote.trim() ? ` Notes: ${reassignNote.trim()}` : ''}`;
        
        const changeActivity = {
          id: activityId,
          type: 'update' as const,
          description: activityDesc,
          timestamp
        };

        const existingActivities = lead.activities || [];
        leadsToUpdate.push({
          ...lead,
          owner: selectedNewOwner,
          statusUpdatedAt: timestamp.split('T')[0],
          activities: [...existingActivities, changeActivity]
        });
      }
    });

    if (onUpdateLeads) {
      onUpdateLeads(leadsToUpdate);
    } else {
      leadsToUpdate.forEach(l => onUpdateLead(l));
    }

    setSelectedLeadIds(new Set());
    setIsReassignModalOpen(false);
    setSelectedNewOwner('');
    setReassignNote('');
  };

  if (viewMode === 'create' || (viewMode === 'edit' && selectedLead)) {
    return (
      <LeadForm 
        onCancel={() => { setViewMode('list'); setSelectedLeadId(null); }}
        onSave={(lead) => { 
            if (viewMode === 'create') onAddLead(lead);
            else if (selectedLeadId) onUpdateLead({ ...lead, id: selectedLeadId });
            setViewMode('list'); 
            setSelectedLeadId(null);
        }}
        initialData={viewMode === 'edit' ? selectedLead : null}
        accounts={accounts}
        contacts={contacts}
        currentUser={currentUser}
        defaultCurrency={defaultCurrency}
        multiCurrency={multiCurrency}
      />
    );
  }

  if (viewMode === 'detail' && selectedLead) {
    return (
      <LeadDetail 
        lead={selectedLead} 
        onBack={() => { 
          setViewMode('list'); 
          setSelectedLeadId(null); 
          if (onClearSelectedLeadId) onClearSelectedLeadId();
        }}
        onEdit={() => setViewMode('edit')}
        onDelete={() => {
          if (window.confirm('Are you sure you want to delete this lead?')) {
            onDeleteLeads([selectedLead.id]);
            setViewMode('list');
            setSelectedLeadId(null);
          }
        }}
        onNurture={() => {}}
        isNurturing={false}
        leads={leads}
        onComposeEmail={() => {}}
        onAddDeal={onAddDeal}
        onUpdateLead={onUpdateLead}
        onViewOpportunities={onViewOpportunities}
        onAddDocument={onAddDocument}
        documents={documents}
        onUpdateDocument={onUpdateDocument}
        onDeleteDocument={onDeleteDocument}
        onEditDocument={onEditDocument}
        calls={calls}
        onAddCall={onAddCall}
        defaultCurrency={defaultCurrency}
        multiCurrency={multiCurrency}
      />
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center flex-shrink-0 md:pr-24">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leads</h1>
        <div className="flex items-center gap-3">
          {selectedLeadIds.size > 0 && (
            <ContextualAIButton
              entityType="lead"
              selectedEntityIds={Array.from(selectedLeadIds)}
              selectedEntityNames={leads.filter(l => selectedLeadIds.has(l.id)).map(l => l.name)}
              label={`Triage ${selectedLeadIds.size} Selected`}
              variant="primary"
              size="sm"
            />
          )}
          {canExport && (
            <button 
              onClick={handleExportCSV} 
              className="px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all flex items-center shadow-xs"
              title="Export current filtered leads dataset to CSV"
            >
              <IconDownload className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" /> Export to CSV
            </button>
          )}
          {canDelete && selectedLeadIds.size > 0 && (
            <button onClick={handleDeleteSelected} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center">
              <IconTrash className="w-4 h-4 mr-2" /> Delete ({selectedLeadIds.size})
            </button>
          )}
          {isManager && selectedLeadIds.size > 0 && (
            <button 
              onClick={() => setIsReassignModalOpen(true)} 
              className="px-4 py-2 text-sm font-medium text-indigo-650 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center shadow-sm"
            >
              <IconUser className="w-4.5 h-4.5 mr-2 text-indigo-505" /> Reassign ({selectedLeadIds.size})
            </button>
          )}
          {canCreate && (
            <button onClick={() => setViewMode('create')} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all flex items-center">
              <IconPlus className="w-4 h-4 mr-2" /> New Lead
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
           <div className="relative max-w-md w-full">
             <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search by name, company, email, or priority..." 
               value={searchQuery} 
               onChange={(e) => setSearchQuery(e.target.value)} 
               className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" 
             />
           </div>

           {/* Priority Filter Segmented Tabs */}
           <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
             <button
               onClick={() => setPriorityFilter('all')}
               className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                 priorityFilter === 'all'
                   ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                   : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
               }`}
             >
               All ({enrichedLeads.length})
             </button>
             <button
               onClick={() => setPriorityFilter('High')}
               className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                 priorityFilter === 'High'
                   ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                   : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
               }`}
             >
               <span className="w-2 h-2 rounded-full bg-rose-500"></span>
               High ({enrichedLeads.filter(l => l.priority === 'High').length})
             </button>
             <button
               onClick={() => setPriorityFilter('Medium')}
               className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                 priorityFilter === 'Medium'
                   ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                   : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400'
               }`}
             >
               <span className="w-2 h-2 rounded-full bg-amber-500"></span>
               Medium ({enrichedLeads.filter(l => l.priority === 'Medium').length})
             </button>
             <button
               onClick={() => setPriorityFilter('Low')}
               className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                 priorityFilter === 'Low'
                   ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-sm'
                   : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
               }`}
             >
               <span className="w-2 h-2 rounded-full bg-slate-400"></span>
               Low ({enrichedLeads.filter(l => l.priority === 'Low').length})
             </button>
           </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950/90 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input type="checkbox" checked={selectedLeadIds.size === sortedLeads.length && sortedLeads.length > 0} onChange={toggleSelectAll} className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer w-4 h-4" />
                </th>
                <th className="px-6 py-4 cursor-pointer group hover:text-primary-600 transition-colors" onClick={() => handleSort('name')}><div className="flex items-center gap-1 uppercase tracking-wider text-xs">Name {getSortIcon('name')}</div></th>
                <th className="px-6 py-4 cursor-pointer group hover:text-primary-600 transition-colors" onClick={() => handleSort('company')}><div className="flex items-center gap-1 uppercase tracking-wider text-xs">Company {getSortIcon('company')}</div></th>
                <th className="px-6 py-4 cursor-pointer group hover:text-primary-600 transition-colors" onClick={() => handleSort('email')}><div className="flex items-center gap-1 uppercase tracking-wider text-xs">Email {getSortIcon('email')}</div></th>
                <th className="px-6 py-4 cursor-pointer group hover:text-primary-600 transition-colors" onClick={() => handleSort('status')}><div className="flex items-center gap-1 uppercase tracking-wider text-xs">Status {getSortIcon('status')}</div></th>
                <th className="px-6 py-4 cursor-pointer group hover:text-primary-600 transition-colors" onClick={() => handleSort('priority')}><div className="flex items-center gap-1 uppercase tracking-wider text-xs">Priority {getSortIcon('priority')}</div></th>
                <th className="px-6 py-4 cursor-pointer group hover:text-primary-600 transition-colors" onClick={() => handleSort('creationDate')}><div className="flex items-center gap-1 uppercase tracking-wider text-xs">Created {getSortIcon('creationDate')}</div></th>
                <th className="px-6 py-4 cursor-pointer group hover:text-primary-600 transition-colors" onClick={() => handleSort('score')}><div className="flex items-center gap-1 uppercase tracking-wider text-xs">Score {getSortIcon('score')}</div></th>
              </tr>
            </thead>
             <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedLeads.map((lead, index) => (
                <tr 
                    key={lead.id} 
                    className={`group transition-all duration-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-900/40'}`}
                    onClick={() => { setSelectedLeadId(lead.id); setViewMode('detail'); }}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedLeadIds.has(lead.id)} onChange={() => toggleSelectLead(lead.id)} className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer w-4 h-4" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center mr-3 text-sm font-bold border border-slate-200 dark:border-slate-700 shadow-sm">{lead.name.charAt(0)}</div>
                        <div><span className="font-semibold text-slate-900 dark:text-white block">{lead.name}</span><span className="text-xs text-slate-500 dark:text-slate-400 md:hidden">{lead.title}</span></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{lead.company}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{lead.email}</td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${lead.status === 'New' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' : lead.status === 'Contacted' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800' : lead.status === 'Qualified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}>{lead.status}</span>
                        {isLeadStagnant(lead) && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 rounded-full dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60 animate-pulse" title={`Stagnant: No stage change since ${lead.statusUpdatedAt || lead.creationDate}`}>
                            Stagnant
                          </span>
                        )}
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border shadow-2xs transition-colors ${lead.scorePriority.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${lead.scorePriority.dotClass}`}></span>
                          {lead.scorePriority.label}
                        </span>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">
                    {lead.creationDate ? new Date(lead.creationDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${lead.score >= 80 ? 'bg-emerald-500' : lead.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${lead.score}%` }}></div>
                        </div>
                        <span className={`text-sm font-bold ${lead.score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : lead.score >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>{lead.score}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {sortedLeads.length === 0 && (
                  <tr>
                      <td colSpan={8} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                          <div className="flex flex-col items-center justify-center">
                              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full mb-3"><IconUser className="w-8 h-8 text-slate-300 dark:text-slate-600" /></div>
                              <p className="text-lg font-semibold text-slate-900 dark:text-white">No leads found</p>
                              <p className="text-sm mt-1">Try adjusting your search filters or add a new lead.</p>
                          </div>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs select-none">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                <span>Show</span>
                <select 
                   value={itemsPerPage} 
                   onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                   className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs font-bold cursor-pointer text-slate-850 dark:text-white"
                >
                   <option value={10}>10</option>
                   <option value={20}>20</option>
                   <option value={50}>50</option>
                   <option value={100}>100</option>
                   <option value={250}>250</option>
                </select>
                <span>leads per page</span>
             </div>
             <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
             <div>
                Showing <span className="font-extrabold text-slate-800 dark:text-slate-200">{totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-extrabold text-slate-800 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-extrabold text-slate-800 dark:text-slate-200">{totalItems}</span> matching leads
             </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button 
                onClick={() => setCurrentPage(1)} 
                disabled={currentPage === 1}
                className="p-1 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:text-slate-900 dark:hover:text-white"
                title="First Page"
             >
                &laquo; First
             </button>
             <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                disabled={currentPage === 1}
                className="p-1 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:text-slate-900 dark:hover:text-white"
             >
                Previous
             </button>
             <div className="px-2 font-semibold">
                Page <span className="text-slate-800 dark:text-slate-200 font-semibold">{currentPage}</span> of <span className="text-slate-800 dark:text-slate-200 font-semibold">{totalPages}</span>
             </div>
             <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                disabled={currentPage === totalPages}
                className="p-1 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:text-slate-900 dark:hover:text-white"
             >
                Next
             </button>
             <button 
                onClick={() => setCurrentPage(totalPages)} 
                disabled={currentPage === totalPages}
                className="p-1 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg hover:bg-slate-105 dark:hover:bg-slate-700 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:text-slate-905 dark:hover:text-white"
                title="Last Page"
             >
                Last &raquo;
             </button>
          </div>
        </div>
      </div>

      {isReassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <IconUser className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Batch Reassign Leads</h3>
                  <p className="text-xs font-semibold text-slate-400 select-none font-sans">Update lead ownership instantly</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsReassignModalOpen(false);
                  setSelectedNewOwner('');
                  setReassignNote('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              
              {/* Stats Bar */}
              <div className="p-4 bg-amber-50/20 dark:bg-amber-950/20 border border-amber-500/10 rounded-2xl flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 animate-pulse"></div>
                <div className="text-xs">
                  <span className="font-extrabold text-amber-800 dark:text-amber-305">
                    You have selected {selectedLeadIds.size} lead{selectedLeadIds.size > 1 ? 's' : ''} for transfer.
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-relaxed">
                    This modification updates lead owners, logs a management audit trail, and resets the stagnation touchpoint timer for proper pipeline health SLA compliance.
                  </p>
                </div>
              </div>

              {/* Owner Input */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest select-none">
                  Assign To New Representative
                </label>
                <div className="relative">
                  <select
                    value={selectedNewOwner}
                    onChange={(e) => setSelectedNewOwner(e.target.value)}
                    className="w-full pl-3 pr-10 py-3 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer font-semibold"
                  >
                    <option value="" disabled>Select a team member...</option>
                    {prospectiveOwners.map(owner => (
                      <option key={owner} value={owner}>{owner}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom type input if the owner isn't listed */}
              <div className="space-y-2">
                <div className="flex items-center justify-between select-none">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                    Or Enter Other Name
                  </label>
                  <span className="text-[10px] text-slate-400 italic">Overrides selection above</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Marcus Aurelius"
                  value={selectedNewOwner}
                  onChange={(e) => setSelectedNewOwner(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-semibold"
                />
              </div>

              {/* Audit Trail Note */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest select-none">
                  Audit logs reason (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Reassigning dormant accounts to active reps for Q2 outreach refresh..."
                  value={reassignNote}
                  onChange={(e) => setReassignNote(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-medium leading-relaxed resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-5 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800/80 select-none">
              <button
                type="button"
                onClick={() => {
                  setIsReassignModalOpen(false);
                  setSelectedNewOwner('');
                  setReassignNote('');
                }}
                className="px-4.5 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-transparent border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBatchReassign}
                disabled={!selectedNewOwner}
                className={`px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/10 transition-all cursor-pointer flex items-center ${
                  !selectedNewOwner ? 'opacity-50 cursor-not-allowed bg-slate-400 hover:bg-slate-400' : ''
                }`}
              >
                Confirm Reassignment
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;


import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Call, Lead, Contact, Account } from '../types';
import { summarizeCallNotes } from '../services/geminiService';
import { IconPhone, IconFilter, IconArrowUp, IconArrowDown, IconX, IconSparkles, IconSearch } from './Icons';

interface CallsProps {
  calls: Call[];
  leads: Lead[];
  contacts: Contact[];
  accounts: Account[];
  onAddCall: (callData: Omit<Call, 'id'>) => void;
}

const initialFormState: Omit<Call, 'id' | 'date'> = {
  subject: '',
  relatedTo: '',
  relatedToId: '',
  type: 'Outbound',
  outcome: 'Connected',
  notes: '',
  summary: ''
};

const Calls: React.FC<CallsProps> = ({ calls, leads, contacts, accounts, onAddCall }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCallData, setNewCallData] = useState(initialFormState);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Call; direction: 'asc' | 'desc' } | null>(null);

  // Filter State
  const [dateFilter, setDateFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  // Searchable Dropdown State
  const [relatedToSearch, setRelatedToSearch] = useState('');
  const [isRelatedToDropdownOpen, setIsRelatedToDropdownOpen] = useState(false);
  const relatedToDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (relatedToDropdownRef.current && !relatedToDropdownRef.current.contains(event.target as Node)) {
        setIsRelatedToDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredCalls = useMemo(() => {
    let result = [...calls];
    
    if (dateFilter !== 'all') {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        result = result.filter(call => {
            const callDate = new Date(call.date);
            switch (dateFilter) {
                case 'daily':
                    return callDate >= startOfDay;
                case 'weekly':
                    const oneWeekAgo = new Date(now);
                    oneWeekAgo.setDate(now.getDate() - 7);
                    return callDate >= oneWeekAgo;
                case 'monthly':
                    const oneMonthAgo = new Date(now);
                    oneMonthAgo.setMonth(now.getMonth() - 1);
                    return callDate >= oneMonthAgo;
                case 'yearly':
                    const oneYearAgo = new Date(now);
                    oneYearAgo.setFullYear(now.getFullYear() - 1);
                    return callDate >= oneYearAgo;
                case 'custom':
                    // Need to check at end of day for end date to include whole day
                    if (customDateRange.start && customDateRange.end) {
                        const end = new Date(customDateRange.end);
                        end.setHours(23, 59, 59, 999);
                        return callDate >= new Date(customDateRange.start) && callDate <= end;
                    }
                    if (customDateRange.start) {
                        return callDate >= new Date(customDateRange.start);
                    }
                    if (customDateRange.end) {
                        const end = new Date(customDateRange.end);
                        end.setHours(23, 59, 59, 999);
                        return callDate <= end;
                    }
                    return true;
                default:
                    return true;
            }
        });
    }
    
    return result;
  }, [calls, dateFilter, customDateRange]);

  const sortedCalls = useMemo(() => {
    let sortableItems = [...filteredCalls];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredCalls, sortConfig]);

  const totalPages = Math.ceil(sortedCalls.length / ITEMS_PER_PAGE);

  const paginatedCalls = useMemo(() => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      return sortedCalls.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedCalls, currentPage]);

  useEffect(() => {
      setCurrentPage(1);
  }, [dateFilter, customDateRange, sortConfig]);

  const requestSort = (key: keyof Call) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: keyof Call) => {
    if (!sortConfig || sortConfig.key !== key) return <span className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity">↕️</span>;
    if (sortConfig.direction === 'asc') return <IconArrowUp className="w-4 h-4 text-primary-500" />;
    return <IconArrowDown className="w-4 h-4 text-primary-500" />;
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewCallData(initialFormState);
    setRelatedToSearch('');
    setIsSummarizing(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCallData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateSummary = async () => {
    if (!newCallData.notes) return;
    setIsSummarizing(true);
    const summary = await summarizeCallNotes(newCallData.notes);
    setNewCallData(prev => ({ ...prev, summary }));
    setIsSummarizing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCallData.relatedToId) {
        alert("Please select a valid Lead, Contact, or Account for 'Related To'");
        return;
    }
    onAddCall({ ...newCallData, date: new Date().toISOString() });
    handleCloseModal();
  };
  
  const relatedToOptions = useMemo(() => {
    const leadOptions = leads.map(l => ({ id: l.id, name: l.name, type: 'Lead', label: `${l.name} (Lead)` }));
    const contactOptions = contacts.map(c => ({ id: c.id, name: c.name, type: 'Contact', label: `${c.name} (Contact)` }));
    const accountOptions = accounts.map(a => ({ id: a.id, name: a.name, type: 'Account', label: `${a.name} (Account)` }));
    return [...leadOptions, ...contactOptions, ...accountOptions];
  }, [leads, contacts, accounts]);

  const filteredRelatedOptions = useMemo(() => {
    if (!relatedToSearch) return relatedToOptions;
    return relatedToOptions.filter(opt => opt.label.toLowerCase().includes(relatedToSearch.toLowerCase()));
  }, [relatedToOptions, relatedToSearch]);

  const handleSelectRelatedTo = (option: { id: string, name: string, type: string, label: string }) => {
      setNewCallData(prev => ({ ...prev, relatedToId: option.id, relatedTo: option.label }));
      setRelatedToSearch(option.label);
      setIsRelatedToDropdownOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center md:pr-24">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Call Logs</h1>
          <button onClick={handleOpenModal} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all">
            + New Call
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <IconFilter className="w-4 h-4 text-slate-400" />
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-transparent border-none focus:ring-0 cursor-pointer"
              >
                  <option value="all">All Calls</option>
                  <option value="daily">Today (Daily)</option>
                  <option value="weekly">Last 7 Days (Weekly)</option>
                  <option value="monthly">Last 30 Days (Monthly)</option>
                  <option value="yearly">Last Year (Yearly)</option>
                  <option value="custom">Custom Range</option>
              </select>
            </div>
            
            {dateFilter === 'custom' && (
                <div className="flex items-center gap-2">
                    <input 
                        type="date" 
                        value={customDateRange.start}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    />
                    <span className="text-slate-500">to</span>
                    <input 
                        type="date" 
                        value={customDateRange.end}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    />
                </div>
            )}
          </div>
          <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4"><button onClick={() => requestSort('subject')} className="text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap group flex items-center gap-2 hover:text-primary-600 transition-colors">Subject {getSortIcon('subject')}</button></th>
                <th className="px-6 py-4"><button onClick={() => requestSort('relatedTo')} className="text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap group flex items-center gap-2 hover:text-primary-600 transition-colors">Related To {getSortIcon('relatedTo')}</button></th>
                <th className="px-6 py-4"><button onClick={() => requestSort('type')} className="text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap group flex items-center gap-2 hover:text-primary-600 transition-colors">Call Type {getSortIcon('type')}</button></th>
                <th className="px-6 py-4"><button onClick={() => requestSort('outcome')} className="text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap group flex items-center gap-2 hover:text-primary-600 transition-colors">Outcome {getSortIcon('outcome')}</button></th>
                <th className="px-6 py-4"><button onClick={() => requestSort('date')} className="text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap group flex items-center gap-2 hover:text-primary-600 transition-colors">Date {getSortIcon('date')}</button></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedCalls.map((call) => (
                <tr key={call.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-base font-medium text-slate-900 dark:text-white flex items-center"><IconPhone className="w-4 h-4 mr-2 text-slate-400" />{call.subject}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{call.relatedTo}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-sm font-medium rounded-full ${call.type === 'Inbound' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-primary-100 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'}`}>{call.type}</span></td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{call.outcome}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{new Date(call.date).toLocaleDateString()}</td>
                </tr>
              ))}
              {paginatedCalls.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                        No calls found for the selected filter.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
          
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                  Showing <span className="font-medium text-slate-900 dark:text-slate-200">{sortedCalls.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="font-medium text-slate-900 dark:text-slate-200">{Math.min(currentPage * ITEMS_PER_PAGE, sortedCalls.length)}</span> of <span className="font-medium text-slate-900 dark:text-slate-200">{sortedCalls.length}</span> results
              </div>
              <div className="flex gap-2">
                  <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="px-3 py-1.5 text-sm font-medium border border-slate-200 dark:border-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                      Previous
                  </button>
                  <button 
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="px-3 py-1.5 text-sm font-medium border border-slate-200 dark:border-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                      Next
                  </button>
              </div>
          </div>
        </div>
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Log a Call</h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><IconX className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto p-6 space-y-4 flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                    <input type="text" name="subject" required value={newCallData.subject} onChange={handleInputChange} placeholder="e.g., Follow-up on Proposal" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white text-sm" />
                  </div>
                  
                  {/* Searchable Select for Related To */}
                  <div ref={relatedToDropdownRef} className="relative">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Related To</label>
                    <div className="relative">
                      <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                          type="text" 
                          placeholder="Search leads, contacts..." 
                          value={relatedToSearch}
                          onChange={(e) => {
                              setRelatedToSearch(e.target.value);
                              setIsRelatedToDropdownOpen(true);
                          }}
                          onFocus={() => setIsRelatedToDropdownOpen(true)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 text-sm"
                      />
                    </div>
                    {isRelatedToDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                          {filteredRelatedOptions.length > 0 ? (
                              filteredRelatedOptions.map(opt => (
                                  <button
                                      key={`${opt.type}-${opt.id}`}
                                      type="button"
                                      onClick={() => handleSelectRelatedTo(opt)}
                                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                  >
                                      <span className="font-bold">{opt.name}</span>
                                      <span className="ml-2 text-xs font-medium text-slate-500 dark:text-slate-400">{(opt.type).toUpperCase()}</span>
                                  </button>
                              ))
                          ) : (
                              <div className="px-4 py-3 text-sm text-center text-slate-500 dark:text-slate-400">No results found</div>
                          )}
                      </div>
                    )}
                    {/* Hidden input for HTML5 validation if needed, or check on submit */}
                    <input type="hidden" name="relatedToId" value={newCallData.relatedToId} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Call Type</label>
                    <select name="type" value={newCallData.type} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white text-sm">
                      <option>Outbound</option>
                      <option>Inbound</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Outcome</label>
                    <select name="outcome" value={newCallData.outcome} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white text-sm">
                      <option>Connected</option>
                      <option>Left Voicemail</option>
                      <option>No Answer</option>
                      <option>Scheduled Follow-up</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                  <textarea name="notes" value={newCallData.notes} onChange={handleInputChange} rows={4} placeholder="Enter details about the conversation..." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white text-sm custom-scrollbar"></textarea>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">AI Summary</label>
                    <button type="button" onClick={handleGenerateSummary} disabled={isSummarizing || !newCallData.notes} className="flex items-center px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors disabled:opacity-50">
                      <IconSparkles className="w-3.5 h-3.5 mr-1.5" />
                      {isSummarizing ? 'Generating...' : 'Generate Summary'}
                    </button>
                  </div>
                  <textarea name="summary" value={newCallData.summary} readOnly={isSummarizing} onChange={handleInputChange} rows={3} placeholder={isSummarizing ? "AI is generating..." : "Summary will appear here."} className="w-full px-3 py-2 bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-700/50 rounded-lg focus:outline-none text-slate-600 dark:text-slate-400 text-sm italic custom-scrollbar"></textarea>
                </div>
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-sm transition-colors">Save Call</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Calls;

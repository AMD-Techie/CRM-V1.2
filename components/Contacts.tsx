
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Contact, ContactStatus, Account, User } from '../types';
import { 
  IconSearch, IconPlus, IconArrowUp, IconArrowDown, 
  IconEdit, IconTrash, IconX, IconUser, IconList, IconKanban,
  IconBuilding, IconMail, IconPhone, IconAlertTriangle, IconSettings
} from './Icons';
import { validateEmail, validatePhone, validateRequired, ValidationErrors } from '../lib/validation';

interface ContactsProps {
  contacts: Contact[];
  accounts?: Account[];
  onAddContact: (contact: Omit<Contact, 'id' | 'lastActivity'>) => void;
  onUpdateContact: (contact: Contact) => void;
  currentUser?: User;
}

const CONTACT_STATUSES: ContactStatus[] = ['New', 'Active', 'Inactive'];

const Contacts: React.FC<ContactsProps> = ({ contacts, accounts = [], onAddContact, onUpdateContact, currentUser }) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Contact; direction: 'asc' | 'desc' } | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<Partial<Contact>>({});

  const [draggedContactId, setDraggedContactId] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [jumpToPage, setJumpToPage] = useState('');

  // Kanban view safe rendering limits (shows more as user clicks load more)
  const [kanbanLimits, setKanbanLimits] = useState<Record<ContactStatus, number>>({
    'New': 30,
    'Active': 30,
    'Inactive': 30
  });

  // Multiple Search Advanced state
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedSearch, setAdvancedSearch] = useState({
    name: '',
    email: '',
    company: '',
    title: '',
    phone: ''
  });

  // Autocomplete State for Company
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // Reset pagination to page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, advancedSearch, itemsPerPage]);

  const filteredContacts = useMemo(() => {
    const query = searchQuery ? searchQuery.toLowerCase().trim() : '';
    
    const advName = advancedSearch.name ? advancedSearch.name.toLowerCase().trim() : '';
    const advEmail = advancedSearch.email ? advancedSearch.email.toLowerCase().trim() : '';
    const advCompany = advancedSearch.company ? advancedSearch.company.toLowerCase().trim() : '';
    const advTitle = advancedSearch.title ? advancedSearch.title.toLowerCase().trim() : '';
    const advPhone = advancedSearch.phone ? advancedSearch.phone.toLowerCase().trim() : '';

    const hasAdvanced = advName || advEmail || advCompany || advTitle || advPhone;
    const hasStatus = statusFilter !== 'All';

    // Fast-path: If no query, advanced search, or status filter is set, return entire collection instantly!
    if (!query && !hasAdvanced && !hasStatus) {
      return contacts;
    }

    // Single-pass compiled loop with micro-level pre-checks
    return contacts.filter(contact => {
      // 1. Status check (fastest primitive check)
      if (hasStatus && contact.status !== statusFilter) {
        return false;
      }

      // 2. Advanced search checks (lazy property lowercase caching)
      if (advName && !contact.name.toLowerCase().includes(advName)) return false;
      if (advEmail && !contact.email.toLowerCase().includes(advEmail)) return false;
      if (advCompany && !contact.company.toLowerCase().includes(advCompany)) return false;
      if (advTitle && (!contact.title || !contact.title.toLowerCase().includes(advTitle))) return false;
      if (advPhone && (!contact.phone || !contact.phone.toLowerCase().includes(advPhone))) return false;

      // 3. Global text search
      if (query) {
        const nameMatch = contact.name.toLowerCase().includes(query);
        const emailMatch = contact.email.toLowerCase().includes(query);
        const companyMatch = contact.company.toLowerCase().includes(query);
        const titleMatch = contact.title ? contact.title.toLowerCase().includes(query) : false;
        
        return nameMatch || emailMatch || companyMatch || titleMatch;
      }

      return true;
    });
  }, [contacts, searchQuery, advancedSearch, statusFilter]);

  const sortedContacts = useMemo(() => {
    if (!sortConfig) return filteredContacts;

    const { key, direction } = sortConfig;
    const isAsc = direction === 'asc';

    return [...filteredContacts].sort((a, b) => {
      const aVal = a[key] || '';
      const bVal = b[key] || '';
      if (aVal === bVal) return 0;
      const comp = aVal < bVal ? -1 : 1;
      return isAsc ? comp : -comp;
    });
  }, [filteredContacts, sortConfig]);

  const totalItems = sortedContacts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const paginatedContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedContacts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedContacts, currentPage, itemsPerPage]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const handleSort = (key: keyof Contact) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Contact) => {
    if (!sortConfig || sortConfig.key !== key) return <span className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity">↕️</span>;
    if (sortConfig.direction === 'asc') return <IconArrowUp className="w-3 h-3 text-primary-500" />;
    return <IconArrowDown className="w-3 h-3 text-primary-500" />;
  };

  const handleOpenModal = (contact?: Contact) => {
    if (contact) {
      setSelectedContact(contact);
      setFormData(contact);
    } else {
      setSelectedContact(null);
      setFormData({ status: 'New' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: ValidationErrors = {};
    if (!validateRequired(formData.firstName)) newErrors.firstName = "First name is required";
    if (!validateRequired(formData.lastName)) newErrors.lastName = "Last name is required";
    if (!validateRequired(formData.email)) {
        newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
        newErrors.email = "Please enter a valid email address";
    }
    
    if (formData.phone && !validatePhone(formData.phone)) {
        newErrors.phone = "Please enter a valid phone number";
    }

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }
    
    const contactData = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
    } as any;

    if (selectedContact) {
        onUpdateContact({ ...selectedContact, ...contactData });
    } else {
        onAddContact(contactData);
    }
    setIsModalOpen(false);
  };

  const handleInputChange = (key: string, value: string) => {
      setFormData(prev => ({ ...prev, [key]: value }));

      if (errors[key]) {
          setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[key];
              return newErrors;
          });
      }

      if (key === 'company') {
          if (value && accounts.length > 0) {
              const matches = accounts.filter(a => a.name.toLowerCase().includes(value.toLowerCase()));
              setFilteredAccounts(matches);
              setShowSuggestions(matches.length > 0);
          } else {
              setShowSuggestions(false);
          }
      }
  };

  const selectAccount = (account: Account) => {
      setFormData(prev => ({
          ...prev,
          company: account.name,
      }));
      setShowSuggestions(false);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, contactId: string) => {
    setDraggedContactId(contactId);
    e.dataTransfer.setData('contactId', contactId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: ContactStatus) => {
    e.preventDefault();
    const contactId = e.dataTransfer.getData('contactId');
    const contact = contacts.find(c => c.id === contactId);

    if (contact && contact.status !== newStatus) {
        onUpdateContact({ ...contact, status: newStatus });
    }
    setDraggedContactId(null);
  };

  const inputClasses = (name: string) => `w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border ${errors[name] ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-700'} rounded-lg focus:outline-none focus:ring-2 ${errors[name] ? 'focus:ring-red-500/50' : 'focus:ring-primary-500'} dark:text-white transition-all`;
  const errorClasses = "text-xs text-red-500 mt-1 flex items-center gap-1";

  const ErrorMessage = ({ name }: { name: string }) => errors[name] ? (
    <p className={errorClasses}>
      <IconAlertTriangle className="w-3 h-3" />
      {errors[name]}
    </p>
  ) : null;

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex justify-between items-center flex-shrink-0 md:pr-24">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Contacts</h1>
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <button 
                    onClick={() => setViewMode('list')} 
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`} 
                    title="List View"
                >
                    <IconList className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => setViewMode('kanban')} 
                    className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`} 
                    title="Kanban View"
                >
                    <IconKanban className="w-4 h-4" />
                </button>
            </div>
        </div>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all flex items-center">
          <IconPlus className="w-4 h-4 mr-2" /> New Contact
        </button>
      </div>

      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 ${viewMode === 'kanban' ? 'bg-transparent border-none shadow-none overflow-visible' : ''}`}>
        {/* Filter bar */}
        <div className={`p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-4 bg-slate-50/50 dark:bg-slate-900/50 ${viewMode === 'kanban' ? 'hidden' : ''}`}>
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Quick search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white font-sans"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  className={`px-3 py-2 text-sm font-semibold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                    showAdvancedSearch 
                      ? 'bg-primary-50 border-primary-200 text-primary-600 dark:bg-primary-950/20 dark:border-primary-900/40 dark:text-primary-400 font-sans' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 font-sans'
                  }`}
                >
                  <IconSettings className="w-4 h-4" />
                  <span>Advanced Search</span>
                  {(advancedSearch.name || advancedSearch.email || advancedSearch.company || advancedSearch.title || advancedSearch.phone) && (
                    <span className="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400 animate-pulse"></span>
                  )}
                </button>

                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 dark:text-slate-200 font-sans"
                >
                  <option value="All">All Statuses</option>
                  {CONTACT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
           </div>

           {/* Advanced Search Panel */}
           {showAdvancedSearch && (
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl grid grid-cols-2 sm:grid-cols-5 gap-3 animate-slide-down shadow-inner text-left font-sans">
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Contact Name</label>
                    <input 
                       type="text" 
                       placeholder="e.g. John" 
                       value={advancedSearch.name}
                       onChange={(e) => setAdvancedSearch(prev => ({ ...prev, name: e.target.value }))}
                       className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Email Address</label>
                    <input 
                       type="text" 
                       placeholder="e.g. smith@corp.com" 
                       value={advancedSearch.email}
                       onChange={(e) => setAdvancedSearch(prev => ({ ...prev, email: e.target.value }))}
                       className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Company Name</label>
                    <input 
                       type="text" 
                       placeholder="e.g. OmniCorp" 
                       value={advancedSearch.company}
                       onChange={(e) => setAdvancedSearch(prev => ({ ...prev, company: e.target.value }))}
                       className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Professional Title</label>
                    <input 
                       type="text" 
                       placeholder="e.g. Architect" 
                       value={advancedSearch.title}
                       onChange={(e) => setAdvancedSearch(prev => ({ ...prev, title: e.target.value }))}
                       className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    />
                 </div>
                 <div className="space-y-1 flex flex-col justify-end">
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-1">Phone Number</label>
                    <div className="flex gap-2">
                       <input 
                          type="text" 
                          placeholder="e.g. 555" 
                          value={advancedSearch.phone}
                          onChange={(e) => setAdvancedSearch(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                       />
                       {(advancedSearch.name || advancedSearch.email || advancedSearch.company || advancedSearch.title || advancedSearch.phone) && (
                          <button
                             type="button"
                             onClick={() => setAdvancedSearch({ name: '', email: '', company: '', title: '', phone: '' })}
                             className="px-2 py-1.5 border border-slate-205 dark:border-slate-700 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] text-slate-500 font-bold tracking-wider uppercase cursor-pointer"
                             title="Clear Filters"
                          >
                             Reset
                          </button>
                       )}
                    </div>
                 </div>
              </div>
           )}
        </div>
        
        {/* View Content */}
        {viewMode === 'list' ? (
            <div className="overflow-x-auto flex-1 flex flex-col justify-between">
             <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 dark:bg-slate-950/90 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm sticky top-0 font-sans">
                     <tr>
                     <th className="px-6 py-4 font-medium cursor-pointer group hover:text-primary-600 transition-colors" onClick={() => handleSort('name')}>
                         <div className="flex items-center gap-1">Name {getSortIcon('name')}</div>
                     </th>
                     <th className="px-6 py-4 font-medium cursor-pointer group hover:text-primary-600 transition-colors" onClick={() => handleSort('title')}>
                         <div className="flex items-center gap-1">Title {getSortIcon('title')}</div>
                     </th>
                     <th className="px-6 py-4 font-medium cursor-pointer group hover:text-primary-600 transition-colors" onClick={() => handleSort('company')}>
                         <div className="flex items-center gap-1">Company {getSortIcon('company')}</div>
                     </th>
                     <th className="px-6 py-4 font-medium cursor-pointer group hover:text-primary-600 transition-colors" onClick={() => handleSort('email')}>
                         <div className="flex items-center gap-1">Email {getSortIcon('email')}</div>
                     </th>
                     <th className="px-6 py-4 font-medium cursor-pointer group hover:text-primary-600 transition-colors" onClick={() => handleSort('phone')}>
                         <div className="flex items-center gap-1">Phone {getSortIcon('phone')}</div>
                     </th>
                     <th className="px-6 py-4 font-medium">Status</th>
                     <th className="px-6 py-4 font-medium text-right">Actions</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                 {paginatedContacts.map(contact => (
                     <tr key={contact.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                     <td className="px-6 py-4 text-slate-900 dark:text-white font-medium flex items-center">
                         <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-3 text-xs font-bold font-sans">
                         {contact.name.charAt(0)}
                         </div>
                         {contact.name}
                     </td>
                     <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{contact.title}</td>
                     <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{contact.company}</td>
                     <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{contact.email}</td>
                     <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{contact.phone}</td>
                     <td className="px-6 py-4">
                         <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                         contact.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                         contact.status === 'New' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                         'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                         }`}>
                         {contact.status || 'New'}
                         </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                         <button onClick={() => handleOpenModal(contact)} className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 mr-2"><IconEdit className="w-4 h-4" /></button>
                     </td>
                     </tr>
                 ))}
                 {filteredContacts.length === 0 && (
                     <tr>
                         <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                             <div className="flex flex-col items-center justify-center">
                                 <IconUser className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                                 <p className="text-lg font-medium font-sans">No contacts found</p>
                                 <p className="text-sm font-sans">Add a new contact or seed the simulation database to get started.</p>
                             </div>
                         </td>
                     </tr>
                 )}
                 </tbody>
             </table>
             </div>

             {/* Pagination Controls Footer */}
             {filteredContacts.length > 0 && (
                 <div className="p-4 bg-slate-50 dark:bg-slate-950/45 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans mt-auto">
                    <div className="flex items-center gap-3">
                       <span className="text-slate-550 dark:text-slate-400 text-xs">
                          Showing <strong className="font-semibold text-slate-850 dark:text-slate-200">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</strong> to{' '}
                          <strong className="font-semibold text-slate-850 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, totalItems)}</strong> of{' '}
                          <strong className="font-semibold text-slate-850 dark:text-slate-200">{totalItems.toLocaleString()}</strong> contacts
                       </span>
                       
                       <div className="flex items-center gap-1.5 ml-2">
                          <span className="text-slate-400">Per page:</span>
                          <select
                             value={itemsPerPage}
                             onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                             }}
                             className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-200 focus:outline-none text-xs"
                          >
                             {[10, 25, 50, 100, 200, 500].map(size => (
                                <option key={size} value={size}>{size}</option>
                             ))}
                          </select>
                       </div>
                    </div>

                    <div className="flex items-center gap-4">
                       {/* Page list selectors */}
                       <div className="flex items-center gap-1">
                          <button
                             disabled={currentPage === 1}
                             onClick={() => setCurrentPage(1)}
                             className="px-2 py-1 text-slate-400 hover:text-slate-750 dark:hover:text-white disabled:opacity-25 disabled:cursor-not-allowed border border-slate-100 dark:border-slate-800 rounded bg-white dark:bg-slate-900 cursor-pointer text-[10px] font-bold"
                             title="First Page"
                          >
                             «
                          </button>
                          <button
                             disabled={currentPage === 1}
                             onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                             className="px-2 py-1 text-slate-503 dark:text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-850 rounded hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 font-medium cursor-pointer"
                          >
                             Prev
                          </button>
                          
                          {getPageNumbers().map((p, idx) => {
                             if (p === '...') {
                                return <span key={`ell-${idx}`} className="px-2 text-slate-400">...</span>;
                             }
                             const isCurrent = p === currentPage;
                             return (
                                <button
                                   key={`pag-${p}`}
                                   onClick={() => setCurrentPage(Number(p))}
                                   className={`px-3 py-1 rounded font-bold cursor-pointer transition-all ${
                                      isCurrent 
                                         ? 'bg-primary-600 text-white shadow-md shadow-primary-500/10' 
                                         : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                   }`}
                                >
                                   {p}
                                </button>
                             );
                          })}

                          <button
                             disabled={currentPage === totalPages}
                             onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                             className="px-2 py-1 text-slate-503 dark:text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-850 rounded hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 font-medium cursor-pointer"
                          >
                             Next
                          </button>
                          <button
                             disabled={currentPage === totalPages}
                             onClick={() => setCurrentPage(totalPages)}
                             className="px-2 py-1 text-slate-400 hover:text-slate-750 dark:hover:text-white disabled:opacity-25 disabled:cursor-not-allowed border border-slate-100 dark:border-slate-800 rounded bg-white dark:bg-slate-900 cursor-pointer text-[10px] font-bold"
                             title="Last Page"
                          >
                             »
                          </button>
                       </div>

                       {/* Jump Input */}
                       {totalPages > 3 && (
                          <form 
                             onSubmit={(e) => {
                                e.preventDefault();
                                const pageNo = parseInt(jumpToPage);
                                if (pageNo >= 1 && pageNo <= totalPages) {
                                   setCurrentPage(pageNo);
                                }
                                setJumpToPage('');
                             }}
                             className="flex items-center gap-1.5"
                          >
                             <span className="text-slate-400">Go:</span>
                             <input
                                type="number"
                                placeholder={currentPage.toString()}
                                value={jumpToPage}
                                onChange={(e) => setJumpToPage(e.target.value)}
                                min={1}
                                max={totalPages}
                                className="w-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-center focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs text-slate-800 dark:text-slate-100"
                             />
                          </form>
                       )}
                    </div>
                 </div>
             )}
            </div>
        ) : (
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="h-full flex gap-6 min-w-full pb-4">
                    {CONTACT_STATUSES.map(status => (
                        <div
                            key={status}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, status)}
                            className={`flex flex-col w-80 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl flex-shrink-0 transition-colors ${draggedContactId ? 'border-dashed border-slate-300 dark:border-slate-700' : ''}`}
                        >
                            {/* Column Header */}
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-100/50 dark:bg-slate-900/50 rounded-t-xl">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                        status === 'New' ? 'bg-blue-500' : 
                                        status === 'Active' ? 'bg-emerald-500' : 
                                        'bg-slate-400'
                                    }`}></div>
                                    <span className="font-bold text-slate-700 dark:text-slate-200">{status}</span>
                                </div>
                                <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {filteredContacts.filter(c => (c.status || 'New') === status).length}
                                </span>
                            </div>

                            {/* Cards */}
                            <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                                {filteredContacts.filter(c => (c.status || 'New') === status).slice(0, kanbanLimits[status] || 30).map(contact => (
                                    <div
                                        key={contact.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, contact.id)}
                                        onClick={() => handleOpenModal(contact)}
                                        className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md cursor-move group transition-all active:scale-95 active:shadow-lg"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold border border-slate-200 dark:border-slate-600">
                                                    {contact.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{contact.name}</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px]">{contact.title}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-50 dark:border-slate-700/50">
                                            {contact.company && <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2"><IconBuilding className="w-3 h-3 text-slate-400"/> {contact.company}</div>}
                                            {contact.email && <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 truncate" title={contact.email}><IconMail className="w-3 h-3 text-slate-400"/> {contact.email}</div>}
                                            {contact.phone && <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2"><IconPhone className="w-3 h-3 text-slate-400"/> {contact.phone}</div>}
                                        </div>
                                    </div>
                                ))}
                                
                                {(() => {
                                    const totalCount = filteredContacts.filter(c => (c.status || 'New') === status).length;
                                    const currentLim = kanbanLimits[status] || 30;
                                    if (totalCount > currentLim) {
                                        return (
                                            <div className="pt-2 text-center pb-2">
                                                <p className="text-[10px] text-slate-400 mb-1.5 font-sans">Showing {currentLim} of {totalCount} contacts</p>
                                                <button 
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setKanbanLimits(prev => ({ ...prev, [status]: prev[status] + 30 }));
                                                    }}
                                                    className="py-1.5 px-3 w-full bg-slate-100 hover:bg-slate-20c dark:bg-slate-850 dark:hover:bg-slate-800 text-[10px] font-bold rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer font-sans border-0"
                                                >
                                                    Load More (+30)
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setKanbanLimits(prev => ({ ...prev, [status]: totalCount }));
                                                    }}
                                                    className="mt-1.5 text-[9px] text-slate-400 hover:text-primary-500 transition-colors block mx-auto underline cursor-pointer font-sans border-none bg-transparent"
                                                >
                                                    Render All (Warning: Potential Lag)
                                                </button>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                                {filteredContacts.filter(c => (c.status || 'New') === status).length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 dark:text-slate-600 text-xs font-sans">
                                        <span>No contacts</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                    <IconUser className="w-5 h-5 mr-3 text-primary-500" />
                    {selectedContact ? 'Edit Contact' : 'New Contact'}
                 </h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><IconX className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 overflow-y-auto max-h-[80vh]">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                        <input type="text" value={formData.firstName || ''} onChange={(e) => handleInputChange('firstName', e.target.value)} className={inputClasses('firstName')} />
                        <ErrorMessage name="firstName" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
                        <input type="text" value={formData.lastName || ''} onChange={(e) => handleInputChange('lastName', e.target.value)} className={inputClasses('lastName')} />
                        <ErrorMessage name="lastName" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                        <input type="email" value={formData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} className={inputClasses('email')} />
                        <ErrorMessage name="email" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                        <input type="tel" value={formData.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} className={inputClasses('phone')} />
                        <ErrorMessage name="phone" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="relative" ref={wrapperRef}>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={formData.company || ''} 
                                onChange={(e) => handleInputChange('company', e.target.value)} 
                                onFocus={() => { if(formData.company && accounts.length) setShowSuggestions(true); }}
                                className={inputClasses('company')} 
                                autoComplete="off"
                            />
                            {showSuggestions && (
                                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
                                    {filteredAccounts.map(account => (
                                        <div 
                                            key={account.id}
                                            onClick={() => selectAccount(account)}
                                            className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors"
                                        >
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{account.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <ErrorMessage name="company" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                        <input type="text" value={formData.title || ''} onChange={(e) => handleInputChange('title', e.target.value)} className={inputClasses('title')} />
                        <ErrorMessage name="title" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Owner</label>
                        <input type="text" value={formData.owner || currentUser?.name || "Unassigned"} readOnly className={`${inputClasses('owner')} bg-slate-100 dark:bg-slate-800/50 cursor-default font-medium text-slate-700 dark:text-slate-300`} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                        <select value={formData.status || 'New'} onChange={(e) => setFormData({...formData, status: e.target.value as ContactStatus})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white cursor-pointer">
                           {CONTACT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                 </div>
                 <div className="flex justify-end pt-4 gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-500 transition-colors">Save Contact</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;

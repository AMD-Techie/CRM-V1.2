
import React, { useState, useMemo } from 'react';
import { Account, Contact, Deal, Lead, Meeting, Call, Document, RoleDefinition, User } from '../types';
import { IconBuilding, IconFilter, IconPhone, IconX, IconGlobe, IconUser, IconArrowUp, IconArrowDown, IconMapPin, IconSparkles, IconAlertTriangle } from './Icons';
import AccountDetail from './AccountDetail';
import { ContextualAIButton } from './ai/ContextualAIButton';
import { findAccountLocationAndNearby } from '../services/geminiService';
import { validatePhone, validateUrl, validateRequired, ValidationErrors } from '../lib/validation';

interface AccountsProps {
  accounts: Account[];
  contacts?: Contact[];
  deals?: Deal[];
  leads?: Lead[];
  meetings?: Meeting[];
  calls?: Call[];
  onAddAccount: (account: Account) => void;
  onUpdateAccount?: (account: Account) => void;
  onDeleteAccount?: (accountId: string) => void;
  onAddContact: (contact: Omit<Contact, 'id' | 'lastActivity'>) => void;
  onAddCall?: (call: Omit<Call, 'id'>) => void;
  onAddDocument: (doc: Document) => void;
  onEditDocument?: (doc: Document) => void;
  userRole?: RoleDefinition;
  currentUser?: User;
  defaultCurrency?: string;
  multiCurrency?: boolean;
}

type SortKey = keyof Account;

const Accounts: React.FC<AccountsProps> = ({ 
    accounts, 
    contacts = [], 
    deals = [], 
    leads = [],
    meetings = [],
    calls = [],
    onAddAccount,
    onUpdateAccount,
    onDeleteAccount,
    onAddContact,
    onAddCall,
    onAddDocument,
    userRole,
    currentUser,
    defaultCurrency = 'USD',
    multiCurrency = false
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  // Default sort by lastActivity descending
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>({ key: 'lastActivity', direction: 'desc' });
  
  const [formData, setFormData] = useState<Partial<Account>>({
      name: '',
      industry: '',
      website: '',
      phone: '',
      owner: currentUser?.name || 'Unassigned',
      address: ''
  });

  // Location Intelligence State
  const [isLocating, setIsLocating] = useState(false);
  const [nearbyCompetitors, setNearbyCompetitors] = useState<string>('');

  // Industry Management State
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [customIndustry, setCustomIndustry] = useState<string>('');
  const [availableIndustries, setAvailableIndustries] = useState<string[]>([
    "Technology",
    "Retail",
    "Manufacturing",
    "Finance",
    "Healthcare",
    "Defense",
    "Consulting"
  ]);

  const canEdit = userRole ? (userRole.permissions.includes('edit_leads') || userRole.permissions.includes('manage_users')) : true;
  const canDelete = userRole ? userRole.permissions.includes('delete_records') : true;

  // Calculate dynamic last activity for each account
  const enrichedAccounts = useMemo(() => {
    return accounts.map(account => {
        const relatedContacts = contacts.filter(c => c.company === account.name);
        const relatedContactNames = new Set(relatedContacts.map(c => c.name));

        const timestamps: number[] = [];

        // 1. Existing static value as baseline
        if (account.lastActivity) {
            const parsed = new Date(account.lastActivity).getTime();
            if (!isNaN(parsed)) timestamps.push(parsed);
        }

        // 2. Deal Activities (most granular)
        deals.filter(d => d.company === account.name).forEach(d => {
            d.activities?.forEach(a => {
                const t = new Date(a.timestamp).getTime();
                if (!isNaN(t)) timestamps.push(t);
            });
        });

        // 3. Meetings (Direct match or via Contact)
        meetings.filter(m => m.relatedTo === account.name || relatedContactNames.has(m.relatedTo)).forEach(m => {
             const t = new Date(m.date).getTime();
             if (!isNaN(t)) timestamps.push(t);
        });

        // 4. Calls (Direct match or via Contact)
        calls.filter(c => c.relatedTo === account.name || relatedContactNames.has(c.relatedTo)).forEach(c => {
             const t = new Date(c.date).getTime();
             if (!isNaN(t)) timestamps.push(t);
        });

        if (timestamps.length === 0) return account;

        const mostRecent = new Date(Math.max(...timestamps));
        // Format as YYYY-MM-DD for consistency with sort/display
        const formattedDate = mostRecent.toISOString().split('T')[0];

        return { ...account, lastActivity: formattedDate };
    });
  }, [accounts, contacts, deals, meetings, calls]);

  const sortedAccounts = useMemo(() => {
    let sortableItems = [...enrichedAccounts]; // Use enriched accounts here
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [enrichedAccounts, sortConfig]);

  const requestSort = (key: SortKey) => {
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

  const handleOpenDetail = (account: Account) => {
      setSelectedAccount(account);
      setViewMode('detail');
  };

  const handleBackToList = () => {
      setSelectedAccount(null);
      setViewMode('list');
  };

  const handleEditAccount = () => {
      if (selectedAccount && canEdit) {
          setFormData(selectedAccount);
          setNearbyCompetitors(''); // Reset competitors on open
          const inds = selectedAccount.industry ? selectedAccount.industry.split(',').map(s => s.trim()).filter(Boolean) : [];
          setSelectedIndustries(inds);
          setCustomIndustry('');
          setIsModalOpen(true);
      }
  };

  const handleDeleteAccountAction = () => {
      if (selectedAccount && onDeleteAccount && canDelete) {
          if (window.confirm(`Are you sure you want to delete ${selectedAccount.name}?`)) {
              onDeleteAccount(selectedAccount.id);
              handleBackToList();
          }
      }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleSmartLocate = async () => {
      if (!formData.website || !formData.name) {
          alert("Please enter a Company Name and Website first.");
          return;
      }
      
      setIsLocating(true);
      setNearbyCompetitors('');
      
      const result = await findAccountLocationAndNearby(
          formData.name, 
          formData.website, 
          formData.industry || 'Business'
      );
      
      if (result.address) {
          setFormData(prev => ({ ...prev, address: result.address }));
      }
      if (result.competitors) {
          setNearbyCompetitors(result.competitors);
      }
      
      setIsLocating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!canEdit) return;
      
      const newErrors: ValidationErrors = {};
      if (!validateRequired(formData.name)) newErrors.name = "Account name is required";
      
      if (formData.website && !validateUrl(formData.website)) {
          newErrors.website = "Please enter a valid URL (e.g., https://example.com)";
      }
      
      if (formData.phone && !validatePhone(formData.phone)) {
          newErrors.phone = "Please enter a valid phone number";
      }

      if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
      }

      const accountData: Account = {
          id: selectedAccount && viewMode === 'detail' ? selectedAccount.id : `A-${Date.now()}`,
          name: formData.name || '',
          industry: selectedIndustries.join(', ') || 'Technology',
          website: formData.website || '',
          phone: formData.phone || '',
          address: formData.address || '',
          owner: formData.owner || currentUser?.name || 'Unassigned',
          primaryContact: selectedAccount?.primaryContact, // Preserve existing
          lastActivity: selectedAccount?.lastActivity || new Date().toISOString().split('T')[0] // Default to today
      };

      if (selectedAccount && viewMode === 'detail' && onUpdateAccount) {
          onUpdateAccount(accountData);
          setSelectedAccount(accountData); // Update local view
      } else {
          onAddAccount(accountData);
      }

      setFormData({ name: '', industry: '', website: '', phone: '', address: '', owner: currentUser?.name || 'Unassigned' });
      setNearbyCompetitors('');
      setSelectedIndustries([]);
      setCustomIndustry('');
      setIsModalOpen(false);
  };

  const inputClasses = (name: string) => `w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border ${errors[name] ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-700'} rounded-lg focus:outline-none focus:ring-2 ${errors[name] ? 'focus:ring-red-500/50' : 'focus:ring-primary-500'} dark:text-white transition-all`;
  const errorClasses = "text-xs text-red-500 mt-1 flex items-center gap-1";

  const ErrorMessage = ({ name }: { name: string }) => errors[name] ? (
    <p className={errorClasses}>
      <IconAlertTriangle className="w-3 h-3" />
      {errors[name]}
    </p>
  ) : null;

  if (viewMode === 'detail' && selectedAccount) {
      return (
          <AccountDetail 
            account={selectedAccount} 
            onBack={handleBackToList}
            onEdit={handleEditAccount}
            onDelete={handleDeleteAccountAction}
            contacts={contacts}
            deals={deals}
            leads={leads}
            meetings={meetings}
            calls={calls}
            onAddContact={onAddContact}
            onAddCall={onAddCall}
            onAddDocument={onAddDocument}
            onUpdateAccount={(updatedAccount) => {
                if (onUpdateAccount) {
                    onUpdateAccount(updatedAccount);
                    setSelectedAccount(updatedAccount); // Update local state for immediate reflect
                }
            }}
            defaultCurrency={defaultCurrency}
            multiCurrency={multiCurrency}
          />
      );
  }

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex justify-between items-center flex-shrink-0 md:pr-24">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Accounts</h1>
        <div className="flex items-center gap-3">
          <ContextualAIButton
            entityType="account"
            label="Ask AI"
            variant="primary"
            size="sm"
          />
          {canEdit && (
            <button 
                onClick={() => {
                    setSelectedAccount(null);
                    setFormData({ name: '', industry: '', website: '', phone: '', address: '', owner: currentUser?.name || 'Unassigned' });
                    setNearbyCompetitors('');
                    setSelectedIndustries([]);
                    setCustomIndustry('');
                    setIsModalOpen(true);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all transform hover:-translate-y-0.5"
            >
            + New Account
            </button>
        )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none overflow-hidden flex flex-col flex-1">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
           <div className="flex items-center space-x-2">
             <IconFilter className="w-4 h-4 text-slate-400" />
             <select className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer">
               <option>All Accounts</option>
               <option>My Accounts</option>
             </select>
           </div>
        </div>
        <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950/90 backdrop-blur-sm shadow-sm">
                <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-sm font-medium"><button onClick={() => requestSort('name')} className="flex items-center gap-2 hover:text-primary-600 transition-colors">Account Name {getSortIcon('name')}</button></th>
                <th className="px-6 py-4 text-sm font-medium"><button onClick={() => requestSort('industry')} className="flex items-center gap-2 hover:text-primary-600 transition-colors">Industry {getSortIcon('industry')}</button></th>
                <th className="px-6 py-4 text-sm font-medium"><button onClick={() => requestSort('phone')} className="flex items-center gap-2 hover:text-primary-600 transition-colors">Phone {getSortIcon('phone')}</button></th>
                <th className="px-6 py-4 text-sm font-medium"><button onClick={() => requestSort('website')} className="flex items-center gap-2 hover:text-primary-600 transition-colors">Website {getSortIcon('website')}</button></th>
                <th className="px-6 py-4 text-sm font-medium"><button onClick={() => requestSort('primaryContact')} className="flex items-center gap-2 hover:text-primary-600 transition-colors">Primary Contact {getSortIcon('primaryContact')}</button></th>
                <th className="px-6 py-4 text-sm font-medium"><button onClick={() => requestSort('owner')} className="flex items-center gap-2 hover:text-primary-600 transition-colors">Owner {getSortIcon('owner')}</button></th>
                <th className="px-6 py-4 text-sm font-medium"><button onClick={() => requestSort('lastActivity')} className="flex items-center gap-2 hover:text-primary-600 transition-colors">Last Activity {getSortIcon('lastActivity')}</button></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {sortedAccounts.map((account) => (
                <tr 
                    key={account.id} 
                    onClick={() => handleOpenDetail(account)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                >
                    <td className="px-6 py-4 text-base font-medium text-slate-900 dark:text-white flex items-center">
                        <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg mr-3 group-hover:bg-primary-100 dark:group-hover:bg-primary-800/30 transition-colors">
                            <IconBuilding className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{account.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{account.industry}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {account.phone && (
                            <div className="flex items-center">
                                <IconPhone className="w-3 h-3 mr-1.5 opacity-50" />
                                {account.phone}
                            </div>
                        )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                        {account.website && (
                             <span className="text-blue-600 dark:text-blue-400 hover:underline flex items-center truncate max-w-[200px]">
                                 {account.website}
                             </span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {account.primaryContact || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 flex items-center">
                         <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold mr-2 text-slate-600 dark:text-slate-300">
                             {account.owner.charAt(0)}
                         </div>
                        {account.owner}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {account.lastActivity || '-'}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                 <IconBuilding className="w-6 h-6 mr-3 text-primary-600" />
                 {selectedAccount && viewMode === 'detail' ? 'Edit Account' : 'Create New Account'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <IconX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Account Name <span className="text-red-500">*</span></label>
                        <div className="relative">
                             <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleInputChange} 
                                className={inputClasses('name')} 
                                placeholder="e.g. Acme Corp"
                             />
                             <IconBuilding className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>
                        <ErrorMessage name="name" />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Industry</label>
                        
                        <div className="flex gap-2">
                            <select 
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val && !selectedIndustries.includes(val)) {
                                         setSelectedIndustries(prev => [...prev, val]);
                                    }
                                }}
                                value=""
                                className={inputClasses('industry')}
                            >
                                <option value="">- Select Industry -</option>
                                {availableIndustries.map(ind => (
                                     <option key={ind} value={ind}>{ind}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <input 
                                type="text"
                                placeholder="Add custom industry (e.g. Biotech)"
                                value={customIndustry}
                                onChange={(e) => setCustomIndustry(e.target.value)}
                                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const trimmed = customIndustry.trim();
                                    if (trimmed) {
                                         if (!availableIndustries.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
                                              setAvailableIndustries(prev => [...prev, trimmed]);
                                         }
                                         if (!selectedIndustries.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
                                              setSelectedIndustries(prev => [...prev, trimmed]);
                                         }
                                         setCustomIndustry('');
                                    }
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-500 transition-colors cursor-pointer whitespace-nowrap"
                            >
                                + Add Custom
                            </button>
                        </div>

                        {selectedIndustries.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50/50 dark:bg-slate-900/40 rounded-lg border border-slate-200/60 dark:border-slate-800">
                                {selectedIndustries.map(ind => (
                                     <span 
                                         key={ind} 
                                         className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-900/40 rounded-lg"
                                     >
                                         {ind}
                                         <button
                                             type="button"
                                             onClick={() => setSelectedIndustries(prev => prev.filter(i => i !== ind))}
                                             className="text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 focus:outline-none cursor-pointer"
                                         >
                                             <IconX className="w-3 h-3" />
                                         </button>
                                     </span>
                                ))}
                            </div>
                        )}
                        <ErrorMessage name="industry" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
                        <div className="relative">
                            <input 
                                type="tel" 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleInputChange} 
                                className={inputClasses('phone')} 
                                placeholder="(555) 000-0000"
                            />
                            <IconPhone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>
                        <ErrorMessage name="phone" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Website</label>
                        <div className="relative flex items-center">
                            <input 
                                type="text" 
                                name="website" 
                                value={formData.website} 
                                onChange={handleInputChange} 
                                className={inputClasses('website')} 
                                placeholder="www.example.com"
                            />
                            <button 
                                type="button"
                                onClick={handleSmartLocate}
                                disabled={isLocating || !formData.website}
                                className="absolute right-2 p-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors disabled:opacity-50"
                                title="Auto-detect location and competitors"
                            >
                                {isLocating ? <span className="animate-spin text-lg">⟳</span> : <IconSparkles className="w-4 h-4" />}
                            </button>
                        </div>
                        <ErrorMessage name="website" />
                    </div>
                 </div>

                 {/* Address Field with Google Maps Grounding Result */}
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Address</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            name="address" 
                            value={formData.address} 
                            onChange={handleInputChange} 
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white" 
                            placeholder="Full address (Auto-detected via website)"
                        />
                        <IconMapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                 </div>

                 {/* Competitors Insights */}
                 {nearbyCompetitors && (
                     <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30 animate-fade-in">
                         <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 flex items-center mb-2">
                             <IconSparkles className="w-4 h-4 mr-2" />
                             Nearby Similar Companies
                         </h4>
                         <div className="prose prose-sm dark:prose-invert max-w-none text-indigo-800 dark:text-indigo-200 whitespace-pre-wrap font-medium">
                             {nearbyCompetitors}
                         </div>
                     </div>
                 )}
                 
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Owner</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            name="owner" 
                            value={formData.owner} 
                            readOnly
                            className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed" 
                        />
                        <IconUser className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                 </div>

                 <div className="pt-4 flex gap-3 justify-end">
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
                        {selectedAccount && viewMode === 'detail' ? 'Save Changes' : 'Create Account'}
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

export default Accounts;

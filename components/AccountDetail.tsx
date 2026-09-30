
import React, { useState, useEffect } from 'react';
import { Account, Contact, Deal, Lead, Meeting, Call, Document } from '../types';
import { formatCurrency } from '../lib/utils';
import { 
  IconArrowLeft, 
  IconEdit, 
  IconTrash, 
  IconBuilding, 
  IconGlobe, 
  IconPhone, 
  IconUser, 
  IconUsers, 
  IconKanban, 
  IconSparkles, 
  IconMail, 
  IconPlus, 
  IconX, 
  IconTarget, 
  IconCalendar, 
  IconClock, 
  IconActivity,
  IconMapPin,
  IconFileText
} from './Icons';
import ActivityTimeline, { TimelineActivity } from './ActivityTimeline';
import { generateAccountInsights, findAccountLocationAndNearby, generateAccountDocumentContent } from '../services/geminiService';
import PresenceIndicators from './PresenceIndicators';
import RecordLockBadge from './RecordLockBadge';
import SharedComments from './SharedComments';
import { ContextualAIButton } from './ai/ContextualAIButton';

interface AccountDetailProps {
  account: Account;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  contacts: Contact[];
  deals: Deal[];
  leads: Lead[];
  meetings?: Meeting[];
  calls?: Call[];
  onAddContact: (contact: Omit<Contact, 'id' | 'lastActivity'>) => void;
  onAddCall?: (call: Omit<Call, 'id'>) => void;
  onUpdateAccount?: (account: Account) => void;
  onAddDocument: (doc: Document) => void;
  defaultCurrency?: string;
  multiCurrency?: boolean;
}

const DetailRow: React.FC<{ label: string; value?: string | number | null; icon?: React.ElementType; isLink?: boolean }> = ({ label, value, icon: Icon, isLink }) => {
  if (!value) return null;
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
      <p className="text-base font-medium text-slate-900 dark:text-slate-100 flex items-center mt-1">
        {Icon && <Icon className="w-4 h-4 mr-2 text-slate-400" />}
        {isLink ? (
            <a href={value.toString().startsWith('http') ? value.toString() : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                {value}
            </a>
        ) : value}
      </p>
    </div>
  );
};

const AccountDetail: React.FC<AccountDetailProps> = ({ account, onBack, onEdit, onDelete, contacts, deals, leads, meetings = [], calls = [], onAddContact, onAddCall, onUpdateAccount, onAddDocument, defaultCurrency = 'USD', multiCurrency = false }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'leads' | 'deals' | 'meetings' | 'calls'>('overview');
  const [insights, setInsights] = useState<string>('');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  
  // Location Intelligence State
  const [nearbyData, setNearbyData] = useState<{address: string, competitors: string} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [aiTab, setAiTab] = useState<'strategy' | 'location'>('strategy');
  const [websiteInput, setWebsiteInput] = useState(account.website || '');

  // Contact Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({ firstName: '', lastName: '', title: '', email: '', phone: '' });
  const [isAddingPrimary, setIsAddingPrimary] = useState(false);

  // Call Modal State
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [newCall, setNewCall] = useState<{subject: string; relatedToId: string; type: string; outcome: string; notes: string}>({
      subject: '',
      relatedToId: account.id, // Default to account ID if logging against account directly
      type: 'Outbound',
      outcome: 'Connected',
      notes: ''
  });

  // Document Generation State
  const [showDocMenu, setShowDocMenu] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);

  // Update default related ID when account changes
  useEffect(() => {
      setNewCall(prev => ({ ...prev, relatedToId: account.id }));
      setWebsiteInput(account.website || '');
  }, [account.id, account.website]);

  const relatedContacts = contacts.filter(c => c.company === account.name);
  const relatedDeals = deals.filter(d => d.company === account.name);
  const relatedLeads = leads.filter(l => l.company === account.name);
  // Simple matching by name or if the meeting relates to a contact of this account
  const relatedMeetings = meetings.filter(m => 
      m.relatedTo === account.name || 
      relatedContacts.some(c => c.name === m.relatedTo)
  );
  
  const relatedCalls = calls.filter(c => 
      c.relatedTo === account.name ||
      relatedContacts.some(contact => contact.name === c.relatedTo)
  );

  const primaryContactDetails = contacts.find(c => c.name === account.primaryContact);

  const handleGenerateInsights = async () => {
    setIsLoadingInsights(true);
    const result = await generateAccountInsights(account);
    setInsights(result);
    setIsLoadingInsights(false);
  };

  const handleLocate = async () => {
    if (!websiteInput) {
        alert("Please enter a website URL for location intelligence.");
        return;
    }
    setIsLocating(true);
    const result = await findAccountLocationAndNearby(account.name, websiteInput, account.industry);
    setNearbyData(result);
    setIsLocating(false);
    
    // Auto-update address if found and different (optional logic could go here)
  };

  const handleContactSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const contactName = `${newContact.firstName} ${newContact.lastName}`.trim();
      onAddContact({
          name: contactName,
          firstName: newContact.firstName,
          lastName: newContact.lastName,
          title: newContact.title,
          email: newContact.email,
          phone: newContact.phone,
          company: account.name, // Auto-link to this account
          status: 'New'
      });

      if (isAddingPrimary && onUpdateAccount) {
          onUpdateAccount({
              ...account,
              primaryContact: contactName
          });
      }

      setIsContactModalOpen(false);
      setIsAddingPrimary(false);
      setNewContact({ firstName: '', lastName: '', title: '', email: '', phone: '' });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewContact({ ...newContact, [e.target.name]: e.target.value });
  };

  const handleCallSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (onAddCall) {
          // Resolve relatedTo name
          let relatedName = account.name;
          // Check if relatedToId matches a contact
          const contact = relatedContacts.find(c => c.id === newCall.relatedToId);
          if (contact) {
              relatedName = contact.name;
          }

          onAddCall({
              subject: newCall.subject,
              relatedTo: relatedName,
              relatedToId: newCall.relatedToId,
              type: newCall.type as any,
              outcome: newCall.outcome as any,
              notes: newCall.notes,
              date: new Date().toISOString()
          });
      }
      setIsCallModalOpen(false);
      setNewCall({ subject: '', relatedToId: account.id, type: 'Outbound', outcome: 'Connected', notes: '' });
  };

  const openAddContactModal = (asPrimary = false) => {
      setIsAddingPrimary(asPrimary);
      setIsContactModalOpen(true);
  };

  const handleGenerateDocument = async (type: 'NDA' | 'Contract' | 'Proposal' | 'Invoice' | 'Quotation') => {
      setIsGeneratingDoc(true);
      setShowDocMenu(false);

      const content = await generateAccountDocumentContent(account, type) || {};

      const newDoc: Document = {
          id: `DOC-${Date.now()}`,
          name: `${type} for ${account.name}.pdf`,
          type: type as any,
          status: 'Draft',
          relatedTo: account.name,
          size: '1.2 MB', // Mock size
          uploadedBy: account.owner || 'System',
          uploadedAt: new Date().toISOString().split('T')[0],
          archived: false,
          content: content // Store AI-generated structure
      };
      
      onAddDocument(newDoc);
      setIsGeneratingDoc(false);
      alert(`${type} generated successfully! Check the Documents tab.`);
  };

  const getAllActivities = (): TimelineActivity[] => {
    const activities: TimelineActivity[] = [];

    // Meetings
    relatedMeetings.forEach(m => {
      activities.push({
        id: m.id,
        type: 'meeting',
        title: `Meeting: ${m.title}`,
        description: `Scheduled: ${m.type}`,
        timestamp: m.date, 
      });
    });

    // Calls
    relatedCalls.forEach(c => {
        activities.push({
            id: c.id,
            type: 'call',
            title: `${c.type} Call`,
            description: `${c.subject} - ${c.outcome}`,
            timestamp: c.date,
        });
    });

    // Deal Activities
    relatedDeals.forEach(d => {
      d.activities.forEach(a => {
        activities.push({
          id: a.id,
          type: 'workflow',
          title: `Deal Update: ${d.title}`,
          description: a.description,
          timestamp: a.timestamp,
        });
      });
    });

    // Lead Activities
    relatedLeads.forEach(l => {
      if (l.activities) {
        l.activities.forEach(a => {
          activities.push({
            id: a.id,
            type: 'field_change',
            title: `Lead Update: ${l.name}`,
            description: a.description,
            timestamp: a.timestamp,
          });
        });
      }
    });

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
  };

  const accountActivities = getAllActivities();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 rounded-t-xl">
            <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors group">
                <IconArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <IconBuilding className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        {account.name}
                    </h1>
                    <RecordLockBadge entityId={account.id} />
                    <PresenceIndicators view="accounts" targetId={account.id} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{account.industry}</p>
            </div>
            </div>
            <div className="flex items-center gap-3">
                {/* Contextual AI Copilot Button */}
                <ContextualAIButton
                  entityType="account"
                  entityId={account.id}
                  entityName={account.name}
                  entityOwner={account.owner}
                  label="Ask AI"
                  variant="primary"
                  size="md"
                />

                {/* Create Document Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => setShowDocMenu(!showDocMenu)}
                        disabled={isGeneratingDoc}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        {isGeneratingDoc ? (
                            <span className="flex items-center gap-2">
                                <div className="animate-spin h-3 w-3 border-2 border-slate-500 rounded-full border-t-transparent"></div>
                                Creating...
                            </span>
                        ) : (
                            <>
                                <IconFileText className="w-4 h-4" /> Create Doc
                            </>
                        )}
                    </button>
                    {showDocMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden">
                            <button onClick={() => handleGenerateDocument('Proposal')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">Proposal</button>
                            <button onClick={() => handleGenerateDocument('Quotation')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">Quotation</button>
                            <button onClick={() => handleGenerateDocument('NDA')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">NDA</button>
                            <button onClick={() => handleGenerateDocument('Contract')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">Contract</button>
                            <button onClick={() => handleGenerateDocument('Invoice')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">Invoice</button>
                        </div>
                    )}
                </div>

                {onAddCall && (
                    <button 
                        onClick={() => setIsCallModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all"
                    >
                        <IconPhone className="w-4 h-4" /> Log Call
                    </button>
                )}
                <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                    <IconEdit className="w-4 h-4" /> Edit
                </button>
                <button onClick={onDelete} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors shadow-sm">
                    <IconTrash className="w-4 h-4" /> Delete
                </button>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-8 overflow-x-auto">
            {['Overview', 'Contacts', 'Leads', 'Deals', 'Meetings', 'Calls'].map((tab) => {
                const isActive = activeTab === tab.toLowerCase();
                return (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase() as any)}
                        className={`py-4 text-sm font-medium border-b-2 transition-all flex-shrink-0 ${
                            isActive 
                            ? 'border-primary-600 text-primary-600 dark:text-primary-400' 
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        {tab}
                        {tab === 'Contacts' && <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{relatedContacts.length}</span>}
                        {tab === 'Leads' && <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{relatedLeads.length}</span>}
                        {tab === 'Deals' && <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{relatedDeals.length}</span>}
                        {tab === 'Meetings' && <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{relatedMeetings.length}</span>}
                        {tab === 'Calls' && <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{relatedCalls.length}</span>}
                    </button>
                );
            })}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 dark:bg-[#0b1120]/30 custom-scrollbar">
        
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in">
                {/* Main Info Column */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Account Details Card */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2.5"></span>
                            Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <DetailRow label="Account Owner" value={account.owner} icon={IconUser} />
                            <DetailRow label="Phone" value={account.phone} icon={IconPhone} />
                            <DetailRow label="Website" value={account.website} icon={IconGlobe} isLink />
                            <DetailRow label="Industry" value={account.industry} />
                            <DetailRow label="Address" value={account.address} icon={IconMapPin} />
                            
                            {/* Primary Contact Enhanced Display */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Primary Contact</label>
                                {account.primaryContact ? (
                                    <div 
                                        className="mt-2 flex items-center group cursor-pointer p-2 -ml-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        onClick={() => setActiveTab('contacts')}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg mr-3 border border-indigo-200 dark:border-indigo-500/30">
                                            {account.primaryContact.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                                                {account.primaryContact}
                                            </p>
                                            {primaryContactDetails?.title && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{primaryContactDetails.title}</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => openAddContactModal(true)}
                                        className="mt-2 flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors border border-dashed border-indigo-200 dark:border-indigo-500/30 w-full justify-center"
                                    >
                                        <IconPlus className="w-4 h-4" /> Associate Primary Contact
                                    </button>
                                )}
                            </div>

                            <DetailRow label="Last Activity" value={account.lastActivity} />
                        </div>
                    </div>

                    {/* Recent Activity Log */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                                <IconActivity className="w-5 h-5 mr-2.5 text-primary-500" />
                                Recent Activity
                            </h3>
                        </div>
                        <div className="relative border-slate-200 dark:border-slate-800 ml-3">
                            <ActivityTimeline activities={accountActivities} />
                        </div>
                    </div>

                    <SharedComments entityId={account.id} entityType="Account" />
                </div>

                {/* Right Sidebar - AI & Stats */}
                <div className="space-y-8">
                    {/* AI Account Strategy */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-indigo-100 dark:border-slate-700 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 flex items-center">
                                <IconSparkles className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                                AI Account Strategy
                            </h3>
                        </div>

                        {/* Sub-tabs for AI */}
                        <div className="flex space-x-2 mb-4 bg-white/50 dark:bg-slate-800/50 p-1 rounded-lg">
                            <button 
                                onClick={() => setAiTab('strategy')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${aiTab === 'strategy' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700'}`}
                            >
                                Strategy
                            </button>
                            <button 
                                onClick={() => setAiTab('location')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${aiTab === 'location' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700'}`}
                            >
                                Location
                            </button>
                        </div>
                        
                        {aiTab === 'strategy' ? (
                            <>
                                {insights ? (
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                                        <div dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br />') }} />
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Generate AI-powered insights to grow this account.</p>
                                        <button 
                                            onClick={handleGenerateInsights}
                                            disabled={isLoadingInsights}
                                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                                        >
                                            {isLoadingInsights ? (
                                                <span className="flex items-center"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span> Analyzing...</span>
                                            ) : (
                                                "Generate Strategy"
                                            )}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            // Location Tab Content
                            <>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={websiteInput}
                                            onChange={(e) => setWebsiteInput(e.target.value)}
                                            placeholder="Enter company website..."
                                            className="w-full pl-3 pr-10 py-2 text-sm bg-white/60 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                        />
                                        <IconGlobe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>

                                    {!nearbyData && (
                                        <div className="text-center py-2">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                                Enter website to fetch HQ location and nearby companies.
                                            </p>
                                            <button 
                                                onClick={handleLocate}
                                                disabled={isLocating || !websiteInput}
                                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shadow-md transition-all disabled:opacity-70 flex items-center justify-center"
                                            >
                                                {isLocating ? (
                                                    <span className="flex items-center"><span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></span> Locating...</span>
                                                ) : (
                                                    "Identify Location & Competitors"
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {nearbyData && (
                                        <div className="space-y-4 animate-fade-in">
                                            {nearbyData.address && (
                                                <div className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg border border-indigo-100 dark:border-slate-700">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <IconMapPin className="w-3.5 h-3.5 text-indigo-500" />
                                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Headquarters</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{nearbyData.address}</p>
                                                </div>
                                            )}
                                            
                                            <div className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg border border-indigo-100 dark:border-slate-700">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <IconBuilding className="w-3.5 h-3.5 text-indigo-500" />
                                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nearby Opportunities</span>
                                                </div>
                                                <div className="prose prose-xs dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                                                    <div dangerouslySetInnerHTML={{ __html: nearbyData.competitors.replace(/\n/g, '<br />') }} />
                                                </div>
                                            </div>
                                            
                                            <button 
                                                onClick={handleLocate}
                                                disabled={isLocating}
                                                className="w-full py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                                            >
                                                {isLocating ? 'Refreshing...' : 'Refresh Location Data'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Simple Stats */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Account Value</h3>
                        <div className="text-4xl font-bold text-slate-900 dark:text-white mb-1">
                            {formatCurrency(relatedDeals.reduce((acc, deal) => acc + deal.value, 0), defaultCurrency)}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Pipeline Value</p>
                    </div>
                </div>
            </div>
        )}

        {/* ... (Contacts, Leads, Deals, Meetings, Calls sections unchanged) */}
        
        {activeTab === 'contacts' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                        <IconUsers className="w-5 h-5 mr-2.5 text-primary-500" />
                        Contacts
                    </h3>
                    <button 
                        onClick={() => openAddContactModal(false)}
                        className="flex items-center gap-1 text-sm font-bold text-white bg-primary-600 px-4 py-2 rounded-lg hover:bg-primary-500 transition-colors shadow-sm"
                    >
                        <IconPlus className="w-4 h-4" /> Add Contact
                    </button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {relatedContacts.length > 0 ? (
                        relatedContacts.map(contact => (
                            <div key={contact.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold border border-slate-200 dark:border-slate-700 mr-4">
                                        {contact.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">{contact.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{contact.title}</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    {contact.email && <div className="text-sm text-slate-500 flex items-center gap-2"><IconMail className="w-4 h-4" /> {contact.email}</div>}
                                    {contact.phone && <div className="text-sm text-slate-500 flex items-center gap-2"><IconPhone className="w-4 h-4" /> {contact.phone}</div>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
                            <IconUsers className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-600" />
                            <p className="text-lg font-medium">No contacts found</p>
                            <p className="text-sm">Add contacts to this account to track relationships.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'leads' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                        <IconTarget className="w-5 h-5 mr-2.5 text-primary-500" />
                        Leads
                    </h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {relatedLeads.length > 0 ? (
                        relatedLeads.map(lead => (
                            <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold border border-slate-200 dark:border-slate-700 mr-4">
                                        {lead.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">{lead.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                            Status: <span className="font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs">{lead.status}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">Score: {lead.score}</div>
                                    <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className={`h-full ${lead.score > 70 ? 'bg-emerald-500' : 'bg-primary-500'}`} style={{ width: `${lead.score}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
                            <IconTarget className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-600" />
                            <p className="text-lg font-medium">No leads found</p>
                            <p className="text-sm">There are no leads currently associated with this account.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'deals' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                        <IconKanban className="w-5 h-5 mr-2.5 text-primary-500" />
                        Deals
                    </h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {relatedDeals.length > 0 ? (
                        relatedDeals.map(deal => (
                            <div key={deal.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white text-lg">{deal.title}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Stage: <span className="text-slate-700 dark:text-slate-300 font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{deal.stage}</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">${deal.value.toLocaleString()}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Close: {deal.closeDate}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
                            <IconKanban className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-600" />
                            <p className="text-lg font-medium">No deals found</p>
                            <p className="text-sm">Create a new deal to start tracking revenue.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'meetings' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                        <IconCalendar className="w-5 h-5 mr-2.5 text-primary-500" />
                        Meetings
                    </h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {relatedMeetings.length > 0 ? (
                        relatedMeetings.map(meeting => (
                            <div key={meeting.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">{meeting.title}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                        <IconClock className="w-3 h-3" />
                                        {meeting.date} | {meeting.startTime} - {meeting.endTime}
                                    </p>
                                </div>
                                <div>
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                                        meeting.type === 'Online' 
                                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' 
                                            : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
                                        }`}>
                                        {meeting.type}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
                            <IconCalendar className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-600" />
                            <p className="text-lg font-medium">No meetings found</p>
                            <p className="text-sm">Schedule a meeting to discuss business opportunities.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'calls' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                        <IconPhone className="w-5 h-5 mr-2.5 text-primary-500" />
                        Call Logs
                    </h3>
                    <button 
                        onClick={() => setIsCallModalOpen(true)}
                        className="flex items-center gap-1 text-sm font-bold text-white bg-primary-600 px-4 py-2 rounded-lg hover:bg-primary-500 transition-colors shadow-sm"
                    >
                        <IconPlus className="w-4 h-4" /> Log Call
                    </button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {relatedCalls.length > 0 ? (
                        relatedCalls.map(call => (
                            <div key={call.id} className="p-4 flex items-start justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-semibold text-slate-900 dark:text-white text-lg">{call.subject}</p>
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${call.type === 'Inbound' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'}`}>
                                            {call.type}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{call.notes}</p>
                                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                        <span>{new Date(call.date).toLocaleString()}</span>
                                        <span>Outcome: <span className="font-medium text-slate-700 dark:text-slate-300">{call.outcome}</span></span>
                                        <span>Related To: {call.relatedTo}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
                            <IconPhone className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-600" />
                            <p className="text-lg font-medium">No calls logged</p>
                            <p className="text-sm">Log calls to keep track of interactions with this account.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>

      {/* Add Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {isAddingPrimary ? 'Add Primary Contact' : 'Add New Contact'}
                    </h2>
                    <button onClick={() => setIsContactModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><IconX className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                            <input type="text" name="firstName" value={newContact.firstName} onChange={handleContactChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                            <input type="text" name="lastName" value={newContact.lastName} onChange={handleContactChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                        <input type="text" name="title" value={newContact.title} onChange={handleContactChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <input type="email" name="email" value={newContact.email} onChange={handleContactChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                        <input type="tel" name="phone" value={newContact.phone} onChange={handleContactChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account Name</label>
                        <input type="text" value={account.name} readOnly className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 cursor-not-allowed" />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsContactModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-500 transition-colors">
                            {isAddingPrimary ? 'Create & Set Primary' : 'Create Contact'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Add Call Modal */}
      {isCallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                        <IconPhone className="w-5 h-5 mr-3 text-primary-500" />
                        Log a Call
                    </h2>
                    <button onClick={() => setIsCallModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><IconX className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleCallSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                        <input 
                            type="text" 
                            value={newCall.subject} 
                            onChange={(e) => setNewCall({...newCall, subject: e.target.value})} 
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" 
                            placeholder="e.g. Discovery Call"
                            required 
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Call Type</label>
                            <select 
                                value={newCall.type} 
                                onChange={(e) => setNewCall({...newCall, type: e.target.value})}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                            >
                                <option>Outbound</option>
                                <option>Inbound</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Outcome</label>
                            <select 
                                value={newCall.outcome} 
                                onChange={(e) => setNewCall({...newCall, outcome: e.target.value})}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                            >
                                <option>Connected</option>
                                <option>Left Voicemail</option>
                                <option>No Answer</option>
                                <option>Scheduled Follow-up</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Who did you speak with? (Related To)</label>
                        <select 
                            value={newCall.relatedToId}
                            onChange={(e) => setNewCall({...newCall, relatedToId: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                        >
                            <optgroup label="Account">
                                <option value={account.id}>{account.name} (Main Line)</option>
                            </optgroup>
                            <optgroup label="Contacts">
                                {relatedContacts.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} - {c.title}</option>
                                ))}
                            </optgroup>
                        </select>
                        {relatedContacts.length === 0 && (
                            <p className="text-xs text-slate-500 mt-1 italic">
                                * Tip: Add contacts to this account to log calls against specific people.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                        <textarea 
                            value={newCall.notes} 
                            onChange={(e) => setNewCall({...newCall, notes: e.target.value})}
                            rows={3} 
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                            placeholder="Key takeaways..."
                        ></textarea>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsCallModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-500 transition-colors">Log Call</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AccountDetail;

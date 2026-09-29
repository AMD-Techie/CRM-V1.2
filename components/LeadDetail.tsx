
import React, { useState, useEffect, useMemo } from 'react';
import { Lead, Deal, Document, Call, Currency } from '../types';
import { 
  IconArrowLeft, IconEdit, IconTrash, IconMail, IconPhone, IconBuilding, 
  IconSparkles, IconGlobe, IconUser, IconBot, IconMessageSquare, IconCopy, 
  IconKanban, IconChevronRight, IconFileText, IconPlus, IconEye, IconX, IconLayout, IconWallet, IconClock
} from './Icons';
import { generateFollowUpSuggestions, generateProposalContent } from '../services/geminiService';
import { ProposalTemplate, QuotationTemplate, ContractTemplate, TemplateData } from './DocumentTemplates';
import { formatCurrency, calculateLeadPriority, getLeadPriorityFromScore } from '../lib/utils';
import ActivityTimeline, { TimelineActivity } from './ActivityTimeline';
import PresenceIndicators from './PresenceIndicators';
import RecordLockBadge from './RecordLockBadge';
import SharedComments from './SharedComments';
import { useCollaboration } from './CollaborationProvider';

interface LeadDetailProps {
  lead: Lead;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onNurture: () => void;
  isNurturing: boolean;
  leads: Lead[];
  onComposeEmail: (lead: Lead, initialContent: string) => void;
  onAddDeal?: (deal: Deal) => void;
  onUpdateLead: (lead: Lead) => void;
  onSelectLead?: (lead: Lead) => void;
  onViewOpportunities?: () => void;
  onAddDocument: (doc: Document) => void;
  documents?: Document[];
  onUpdateDocument?: (doc: Document) => void;
  onDeleteDocument?: (id: string) => void;
  onEditDocument?: (doc: Document) => void;
  calls?: Call[];
  onAddCall?: (call: Omit<Call, 'id'>) => void;
  defaultCurrency?: string;
  multiCurrency?: boolean;
}

const DetailRow: React.FC<{ label: string; value?: string | number | null; icon?: React.ElementType }> = ({ label, value, icon: Icon }) => {
  if (!value && value !== 0) return null;
  return (
    <div>
      <label className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
      <p className="text-lg text-slate-900 dark:text-slate-100 flex items-center mt-1">
        {Icon && <Icon className="w-4 h-4 mr-2 text-slate-400" />}
        {value}
      </p>
    </div>
  );
};

const LeadDetail: React.FC<LeadDetailProps> = ({ 
    lead, onBack, onEdit, onDelete, onNurture, isNurturing, leads, onComposeEmail, onAddDeal, onUpdateLead, onSelectLead, onViewOpportunities, onAddDocument, documents = [], onUpdateDocument, onDeleteDocument, onEditDocument, calls = [], onAddCall, defaultCurrency = 'USD', multiCurrency = false
}) => {
  const priorityInfo = useMemo(() => {
    return calculateLeadPriority(lead);
  }, [lead]);

  const scorePriority = useMemo(() => {
    return getLeadPriorityFromScore(lead.score || 0);
  }, [lead.score]);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [showDocMenu, setShowDocMenu] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  
  // Call Logging State
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [newCall, setNewCall] = useState<{subject: string; type: string; outcome: string; notes: string}>({
      subject: '',
      type: 'Outbound',
      outcome: 'Connected',
      notes: ''
  });

  const isStagnant = useMemo(() => {
    const lastUpdateStr = lead.statusUpdatedAt || lead.creationDate;
    if (!lastUpdateStr) return false;
    const lastUpdate = new Date(lastUpdateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastUpdate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 90;
  }, [lead.statusUpdatedAt, lead.creationDate]);

  useEffect(() => {
    let isMounted = true;
    const fetchSuggestions = async () => {
      setIsLoadingSuggestions(true);
      const result = await generateFollowUpSuggestions(lead);
      if (isMounted) {
        setSuggestions(result);
        setIsLoadingSuggestions(false);
      }
    };
    fetchSuggestions();
    return () => { isMounted = false; };
  }, [lead]);

  const relatedDocuments = useMemo(() => {
      return documents.filter(d => d.relatedTo === lead.company);
  }, [documents, lead.company]);

  const relatedCalls = useMemo(() => {
      return calls.filter(c => c.relatedToId === lead.id || c.relatedTo === lead.name).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [calls, lead]);

  const handleConvertToOpportunity = () => {
      if (confirm(`Convert ${lead.name} to an Opportunity? This will create a new opportunity and update the lead status to Qualified.`)) {
          if (onAddDeal) {
              const newDeal: Deal = {
                  id: `D-${Date.now()}`,
                  title: `${lead.company || lead.name} - Opportunity`,
                  company: lead.company,
                  value: lead.value || 0,
                  stage: 'Qualification',
                  probability: 20,
                  closeDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
                  email: lead.email,
                  phone: lead.phone,
                  activities: [{
                      id: `DA-${Date.now()}`,
                      type: 'created',
                      description: `Opportunity created from Lead: ${lead.name}`,
                      timestamp: new Date().toISOString()
                  }]
              };
              onAddDeal(newDeal);
              onUpdateLead({ ...lead, status: 'Qualified', rating: 'Active' });
              
              if (onViewOpportunities) {
                  onViewOpportunities();
              } else {
                  alert("Opportunity created successfully!");
              }
          }
      }
  };

  const handleGenerateDocument = async (type: 'Proposal' | 'Quotation') => {
      setIsGeneratingDoc(true);
      setShowDocMenu(false);

      let content = {};
      if (type === 'Proposal') {
          content = await generateProposalContent(lead) || {};
      }

      const newDoc: Document = {
          id: `DOC-${Date.now()}`,
          name: `${type} for ${lead.company}.pdf`,
          type: type,
          status: 'Draft',
          relatedTo: lead.company,
          size: '1.2 MB', // Mock size
          uploadedBy: lead.owner || 'System',
          uploadedAt: new Date().toISOString().split('T')[0],
          archived: false,
          content: content // Store AI-generated structure
      };
      
      onAddDocument(newDoc);
      setIsGeneratingDoc(false);
      
      // Automatically open the preview
      setPreviewDoc(newDoc);
  };

  const handleEditDesign = () => {
      if (previewDoc && onEditDocument) {
          onEditDocument(previewDoc);
          setPreviewDoc(null);
      }
  };

  const handleCallSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (onAddCall) {
          onAddCall({
              subject: newCall.subject,
              relatedTo: lead.name,
              relatedToId: lead.id, // Explicitly link to Lead ID
              type: newCall.type as any,
              outcome: newCall.outcome as any,
              notes: newCall.notes,
              date: new Date().toISOString()
          });
      }
      setIsCallModalOpen(false);
      setNewCall({ subject: '', type: 'Outbound', outcome: 'Connected', notes: '' });
  };

  const renderTemplate = () => {
      if (!previewDoc) return null;
      const templateData: TemplateData = {
          relatedTo: previewDoc.relatedTo,
          date: previewDoc.uploadedAt,
          refNumber: previewDoc.id,
          // Merge dynamic content if available
          ...previewDoc.content
      };

      if (previewDoc.type === 'Proposal') return <ProposalTemplate data={templateData} />;
      if (previewDoc.type === 'Quotation' || previewDoc.type === 'Invoice') return <QuotationTemplate data={templateData} />;
      if (previewDoc.type === 'Contract') return <ContractTemplate data={templateData} />;

      return <div className="text-center p-10">Preview not supported for this type.</div>;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 rounded-t-xl flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <IconArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{lead.name}</h1>
              <RecordLockBadge entityId={lead.id} />
              <PresenceIndicators view="leads" targetId={lead.id} />
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs transition-all ${scorePriority.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${scorePriority.dotClass}`}></span>
                {scorePriority.label} Priority
              </span>
            </div>
            <p className="text-lg text-slate-500 dark:text-slate-400">{lead.company}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Document Generation Dropdown */}
          <div className="relative">
              <button 
                onClick={() => setShowDocMenu(!showDocMenu)}
                disabled={isGeneratingDoc}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                  {isGeneratingDoc ? (
                      <span className="flex items-center gap-2">
                          <div className="animate-spin h-3 w-3 border-2 border-slate-500 rounded-full border-t-transparent"></div>
                          Generating...
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
                  </div>
              )}
          </div>

          {lead.status !== 'Qualified' && lead.status !== 'Closed Won' && lead.status !== 'Closed Lost' && (
              <button 
                onClick={handleConvertToOpportunity}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-colors mr-2"
              >
                <IconKanban className="w-4 h-4" /> 
                Convert
              </button>
          )}
          {onAddCall && (
              <button 
                onClick={() => setIsCallModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-colors mr-2"
              >
                <IconPhone className="w-4 h-4" /> 
                Log Call
              </button>
          )}
          <button 
            onClick={onNurture}
            disabled={isNurturing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <IconBot className="w-4 h-4" /> 
            {isNurturing ? '...' : 'Nurture'}
          </button>
          <button onClick={onEdit} className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <IconEdit className="w-5 h-5" />
          </button>
          <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
            <IconTrash className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {isStagnant && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-start gap-3 shadow-sm text-amber-800 dark:text-amber-300">
            <IconClock className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500 animate-pulse" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Lead Stagnation Warning (3m+)</h4>
              <p className="text-xs mt-1 text-amber-700 dark:text-amber-400">
                This lead has not moved stage for more than 3 months (last status update was on {lead.statusUpdatedAt || lead.creationDate || "creation"}). Please follow up with the customer or advance their pipeline status to resume progress.
              </p>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className={`p-6 rounded-xl border transition-all duration-300 ${
              isStagnant 
                ? 'bg-amber-50/10 dark:bg-amber-950/5 border-amber-300 dark:border-amber-800/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/10' 
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Lead Information</h3>
                {isStagnant && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20 animate-pulse">
                    <IconClock className="w-3.5 h-3.5" />
                    Stagnant Opportunity (3m+)
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailRow label="Lead Owner" value={lead.owner} icon={IconUser} />
                <DetailRow label="Name" value={`${lead.firstName || ''} ${lead.lastName || ''}`} />
                <DetailRow label="Company" value={lead.company} icon={IconBuilding} />
                <DetailRow label="Title" value={lead.title} />
                <DetailRow label="Source" value={lead.leadSource} />
                <DetailRow label="Status" value={lead.status} />
                <DetailRow label="Annual Revenue" value={formatCurrency(lead.annualRevenue, multiCurrency ? (lead.currency || defaultCurrency) : defaultCurrency)} icon={IconWallet} />
                <DetailRow label="Creation Date" value={lead.creationDate ? new Date(lead.creationDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'} icon={IconClock} />
                <DetailRow label="Last Status Move" value={lead.statusUpdatedAt ? new Date(lead.statusUpdatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : (lead.creationDate ? new Date(lead.creationDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A')} icon={IconClock} />
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailRow label="Email" value={lead.email} icon={IconMail} />
                <DetailRow label="Phone" value={lead.phone} icon={IconPhone} />
                <DetailRow label="Website" value={lead.website} icon={IconGlobe} />
                <DetailRow label="Address" value={lead.city} />
              </div>
            </div>

            {/* Activity Timeline Section */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
                    <IconClock className="w-5 h-5 mr-2 text-primary-500" />
                    Activity Timeline
                </h3>
                <ActivityTimeline 
                  activities={[
                    ...relatedCalls.map(c => ({
                      id: c.id,
                      type: 'call' as const,
                      title: `${c.type} Call - ${c.outcome}`,
                      description: c.notes,
                      user: lead.owner,
                      timestamp: c.date
                    })),
                    {
                      id: `mock-1`,
                      type: 'field_change',
                      title: 'Lead Status Changed',
                      description: 'From: Prospect • To: Qualified',
                      user: 'John Doe',
                      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
                      metadata: { Source: 'Manual Update' }
                    },
                    {
                      id: `mock-2`,
                      type: 'workflow',
                      title: 'Assigned via Lead Routing',
                      description: 'High Value Lead Assignment workflow executed.',
                      user: 'System',
                      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
                    },
                    {
                      id: `mock-3`,
                      type: 'ai',
                      title: 'AI Lead Scoring Updated',
                      description: 'Predictive score increased from 65 to 80 based on recent website engagement.',
                      user: 'Nova AI',
                      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
                    }
                  ]}
                />
            </div>

            {/* Related Documents Section */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
                    <IconFileText className="w-5 h-5 mr-2 text-blue-500" />
                    Related Documents
                </h3>
                {relatedDocuments.length > 0 ? (
                    <div className="space-y-3">
                        {relatedDocuments.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg group hover:shadow-sm transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                                        <IconFileText className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white text-sm">{doc.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{doc.type} • {doc.uploadedAt}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => setPreviewDoc(doc)}
                                        className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                        title="Preview"
                                    >
                                        <IconEye className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => onEditDocument && onEditDocument(doc)}
                                        className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                        title="Edit Design"
                                    >
                                        <IconLayout className="w-4 h-4" />
                                    </button>
                                    {onDeleteDocument && (
                                        <button 
                                            onClick={() => { if(window.confirm('Delete document?')) onDeleteDocument(doc.id); }}
                                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic">No documents generated yet.</p>
                )}
            </div>

            {/* AI Follow-up Suggestions */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
                <IconSparkles className="w-5 h-5 mr-2 text-primary-500" />
                AI Suggested Actions
              </h3>
              {isLoadingSuggestions ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-3 group">
                      <IconMessageSquare className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <p className="flex-1 text-base text-slate-700 dark:text-slate-300">
                        {suggestion}
                      </p>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onComposeEmail(lead, suggestion)} className="p-1.5 rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100 dark:text-primary-400 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 transition-colors"><IconMail className="w-4 h-4" /></button>
                        <button onClick={() => navigator.clipboard.writeText(suggestion)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><IconCopy className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Score Column */}
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
               <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                 <IconSparkles className="w-5 h-5 mr-2 text-primary-500" />
                 Predictive Score
               </h3>
               <div className="flex items-center justify-between mb-2">
                 <span className="text-base text-slate-600 dark:text-slate-300">Win Probability</span>
                 <span className="text-5xl font-bold text-primary-600 dark:text-primary-400">{lead.score}%</span>
               </div>
               <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-6">
                  <div className={`h-2.5 rounded-full ${lead.score > 75 ? 'bg-emerald-500' : lead.score > 40 ? 'bg-yellow-500' : 'bg-slate-400'}`} style={{ width: `${lead.score}%` }}></div>
               </div>
               <div className="space-y-4">
                 <div className="flex justify-between items-center text-base">
                   <span className="text-slate-500 dark:text-slate-400">Profile Fit</span>
                   <span className="font-semibold text-emerald-600 dark:text-emerald-400">{lead.scoreBreakdown.fit}%</span>
                 </div>
                  <div className="flex justify-between items-center text-base">
                   <span className="text-slate-500 dark:text-slate-400">Engagement</span>
                   <span className="font-semibold text-primary-600 dark:text-primary-400">{lead.scoreBreakdown.engagement}%</span>
                 </div>
                  <div className="flex justify-between items-center text-base">
                   <span className="text-slate-500 dark:text-slate-400">Budget</span>
                   <span className="font-semibold text-blue-600 dark:text-blue-400">{lead.scoreBreakdown.budget}%</span>
                 </div>
               </div>
            </div>
             <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
            </div>

            {/* CRM Priority Score Card */}
            <div className="p-6 bg-gradient-to-br from-indigo-50/45 to-slate-50 dark:from-slate-800 dark:to-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in">
               <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                 <IconSparkles className="w-5 h-5 mr-2 text-indigo-500" />
                 CRM Priority Score
               </h3>
               <div className="flex items-center justify-between mb-2">
                 <span className="text-base text-slate-600 dark:text-slate-300">Weighted Total</span>
                 <span className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">{priorityInfo.score}%</span>
               </div>
               <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-6">
                  <div className={`h-2.5 rounded-full ${
                    priorityInfo.score >= 75 ? 'bg-rose-500' : priorityInfo.score >= 50 ? 'bg-amber-500' : priorityInfo.score >= 25 ? 'bg-sky-500' : 'bg-slate-400'
                  }`} style={{ width: `${priorityInfo.score}%` }}></div>
               </div>
               
               <div className="space-y-4">
                 <div className="space-y-1.5">
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-600 dark:text-slate-300 font-medium">Recent Interactions</span>
                     <span className="font-semibold text-slate-800 dark:text-slate-200">{priorityInfo.breakdown.interaction}/30</span>
                   </div>
                   <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${(priorityInfo.breakdown.interaction / 30) * 100}%` }}></div>
                   </div>
                 </div>
                 
                 <div className="space-y-1.5">
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-600 dark:text-slate-300 font-medium">Deal Size Impact</span>
                     <span className="font-semibold text-slate-800 dark:text-slate-200">{priorityInfo.breakdown.dealSize}/35</span>
                   </div>
                   <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="h-1.5 bg-emerald-500 rounded-full" style={{ width: `${(priorityInfo.breakdown.dealSize / 35) * 100}%` }}></div>
                   </div>
                 </div>

                 <div className="space-y-1.5">
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-600 dark:text-slate-300 font-medium">Engagement Weight</span>
                     <span className="font-semibold text-slate-800 dark:text-slate-200">{priorityInfo.breakdown.engagement}/35</span>
                   </div>
                   <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="h-1.5 bg-pink-500 rounded-full" style={{ width: `${(priorityInfo.breakdown.engagement / 35) * 100}%` }}></div>
                   </div>
                 </div>
               </div>
            </div>

             <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Notes</h3>
              <p className="text-base text-slate-600 dark:text-slate-300 italic">
                {lead.notes || "No notes available."}
              </p>
            </div>
          </div>

          <SharedComments entityId={lead.id} entityType="Lead" />
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="w-full max-w-5xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col h-[85vh]">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                      <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"><IconFileText className="w-5 h-5" /></div>
                          <div>
                              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{previewDoc.name}</h2>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Uploaded on {previewDoc.uploadedAt}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          {onEditDocument && (
                              <button 
                                onClick={handleEditDesign}
                                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium flex items-center shadow-lg shadow-primary-500/20 transition-all"
                              >
                                  <IconLayout className="w-4 h-4 mr-2" />
                                  Customize in Designer
                              </button>
                          )}
                          <button onClick={() => setPreviewDoc(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"><IconX className="w-6 h-6" /></button>
                      </div>
                  </div>
                  <div className="flex flex-1 overflow-hidden">
                      <div className="flex-1 bg-slate-200 dark:bg-slate-950 flex flex-col items-center justify-center border-r border-slate-200 dark:border-slate-800 relative overflow-hidden">
                          <div className="w-full h-full p-4 overflow-y-auto custom-scrollbar">
                              <div className="max-w-[800px] mx-auto bg-white shadow-lg min-h-[1000px] rounded-sm">
                                  {renderTemplate()}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Log Call Modal */}
      {isCallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                        <IconPhone className="w-5 h-5 mr-3 text-primary-500" />
                        Log Call for {lead.name}
                    </h2>
                    <button onClick={() => setIsCallModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><IconX className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleCallSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                        <input 
                            type="text" 
                            value={newCall.subject} 
                            onChange={(e) => setNewCall({...newCall, subject: e.target.value})} 
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" 
                            placeholder="e.g. Intro Call"
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

export default LeadDetail;

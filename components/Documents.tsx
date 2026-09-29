
import React, { useState, useMemo } from 'react';
import { Document, DocumentType, DocumentStatus } from '../types';
import { 
  IconFileText, IconSearch, IconFilter, IconPlus, IconDownload, IconTrash, 
  IconArrowUp, IconArrowDown, IconX, IconUpload, IconFile, IconArchive, 
  IconRefresh, IconSparkles, IconCheckSquare, IconCalendar, IconEye, IconLayout,
  IconShare2, IconHistory, IconShieldCheck, IconLink, IconSettings, IconDatabase, IconGlobe
} from './Icons';
import { ProposalTemplate, QuotationTemplate, ContractTemplate, TemplateData } from './DocumentTemplates';

interface DocumentsProps {
  documents: Document[];
  onAddDocument: (doc: Document) => void;
  onDeleteDocument: (id: string) => void;
  onUpdateDocument: (doc: Document) => void;
  onEditDocument?: (doc: Document) => void;
}

const DOCUMENT_TYPES: DocumentType[] = ['Contract', 'Proposal', 'Invoice', 'Quotation', 'Brief', 'Report', 'Other'];
const DOCUMENT_STATUSES: DocumentStatus[] = ['Draft', 'Final', 'Signed', 'Pending Review'];
const DATE_FILTERS = ['All Time', 'This Week', 'This Month', 'This Quarter', 'This Year'];

const Documents: React.FC<DocumentsProps> = ({ documents, onAddDocument, onDeleteDocument, onUpdateDocument, onEditDocument }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('All Time');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Document; direction: 'asc' | 'desc' } | null>({ key: 'uploadedAt', direction: 'desc' });
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [mainTab, setMainTab] = useState<'files' | 'shared' | 'settings'>('files');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  const [formData, setFormData] = useState<Partial<Document>>({
    type: 'Contract',
    status: 'Draft',
    relatedTo: ''
  });

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const isArchived = !!doc.archived;
      const showInTab = activeTab === 'archived' ? isArchived : !isArchived;
      if (!showInTab) return false;

      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            doc.relatedTo.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'All' || doc.type === typeFilter;

      let matchesDate = true;
      if (dateFilter !== 'All Time') {
          const docDate = new Date(doc.uploadedAt);
          const now = new Date();
          if (dateFilter === 'This Week') {
              const startOfWeek = new Date(now);
              startOfWeek.setDate(now.getDate() - now.getDay());
              startOfWeek.setHours(0, 0, 0, 0);
              matchesDate = docDate >= startOfWeek;
          } else if (dateFilter === 'This Month') {
              matchesDate = docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
          } else if (dateFilter === 'This Quarter') {
              const currentQuarter = Math.floor(now.getMonth() / 3);
              const docQuarter = Math.floor(docDate.getMonth() / 3);
              matchesDate = currentQuarter === docQuarter && docDate.getFullYear() === now.getFullYear();
          } else if (dateFilter === 'This Year') {
              matchesDate = docDate.getFullYear() === now.getFullYear();
          }
      }

      return matchesSearch && matchesType && matchesDate;
    });
  }, [documents, searchQuery, typeFilter, activeTab, dateFilter]);

  const sortedDocuments = useMemo(() => {
    let items = [...filteredDocuments];
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
  }, [filteredDocuments, sortConfig]);

  const handleSort = (key: keyof Document) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Document) => {
    if (!sortConfig || sortConfig.key !== key) return <span className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity">↕️</span>;
    if (sortConfig.direction === 'asc') return <IconArrowUp className="w-3 h-3 text-primary-500" />;
    return <IconArrowDown className="w-3 h-3 text-primary-500" />;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("File Name is required");
      return;
    }

    const newDoc: Document = {
      id: `DOC-${Date.now()}`,
      name: formData.name,
      type: formData.type as DocumentType,
      status: formData.status as DocumentStatus,
      relatedTo: formData.relatedTo || 'General',
      size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`, 
      uploadedBy: 'Alex Chen',
      uploadedAt: new Date().toISOString().split('T')[0],
      archived: false
    };

    onAddDocument(newDoc);
    setIsModalOpen(false);
    setFormData({ type: 'Contract', status: 'Draft', relatedTo: '', name: '' });
  };

  const handleArchive = (doc: Document) => {
      onUpdateDocument({ ...doc, archived: true });
  };

  const handleRestore = (doc: Document) => {
      onUpdateDocument({ ...doc, archived: false });
  };

  const handleQuickView = (doc: Document) => {
      setSelectedDocument(doc);
      setIsQuickViewOpen(true);
  };

  const renderTemplate = () => {
      if (!selectedDocument) return null;
      const templateData: TemplateData = {
          relatedTo: selectedDocument.relatedTo,
          date: selectedDocument.uploadedAt,
          refNumber: selectedDocument.id,
          // Merge dynamic content if available
          ...selectedDocument.content
      };

      if (selectedDocument.type === 'Proposal') return <ProposalTemplate data={templateData} />;
      if (selectedDocument.type === 'Quotation' || selectedDocument.type === 'Invoice') return <QuotationTemplate data={templateData} />;
      if (selectedDocument.type === 'Contract') return <ContractTemplate data={templateData} />;

      return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="w-32 h-40 bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center mb-6 rounded-lg border border-slate-200 dark:border-slate-700">
                <IconFileText className="w-16 h-16 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Preview not available for this file type.</p>
            <button className="mt-4 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center">
                <IconDownload className="w-4 h-4 mr-2" /> Download File
            </button>
        </div>
      );
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-fade-in max-w-7xl mx-auto w-full">
      <header className="flex-shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[16px] shadow-lg shadow-indigo-500/20 flex items-center justify-center text-white ring-1 ring-white/10">
                 <IconFileText className="w-6 h-6 drop-shadow-sm" />
              </div>
              File & Document Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium tracking-wide text-sm ml-15">Enterprise storage with versioning, preview, secure sharing, and virus scanning.</p>
          </div>
          <div className="flex gap-3">
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="px-5 py-2.5 text-sm font-bold tracking-wide text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all flex items-center"
              >
                <IconUpload className="w-4 h-4 mr-2" /> Upload Document
              </button>
          </div>
        </div>
        
        <div className="flex border-b border-slate-200 dark:border-white/10 overflow-x-auto custom-scrollbar">
          {[
            { id: 'files', label: 'All Files', icon: IconFileText },
            { id: 'shared', label: 'Secure Shared Links', icon: IconShare2 },
            { id: 'settings', label: 'Storage Config', icon: IconSettings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setMainTab(tab.id as any)}
              className={`px-6 py-4 flex items-center gap-2 border-b-[3px] font-bold text-sm tracking-wide transition-colors ${mainTab === tab.id ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {mainTab === 'files' && (
      <div className="bg-white dark:bg-[#0b1120]/60 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-[24px] shadow-sm overflow-hidden flex flex-col flex-1 relative">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center min-h-[72px]">
            <div className="flex bg-slate-100/50 dark:bg-black/20 p-1.5 rounded-xl border border-slate-200/50 dark:border-white/5 mr-4 shadow-inner">
                <button onClick={() => setActiveTab('active')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}>Active</button>
                <button onClick={() => setActiveTab('archived')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'archived' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}>Archived</button>
            </div>
            
            <div className="flex-1 max-w-md relative mx-4">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search documents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm font-medium bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-shadow" />
            </div>
            <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                    <IconCalendar className="w-4 h-4 text-slate-400" />
                    <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer max-w-[110px]">
                        {DATE_FILTERS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
                <div className="flex items-center space-x-2">
                    <IconFilter className="w-4 h-4 text-slate-400" />
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer max-w-[100px]">
                        <option value="All">All Types</option>
                        {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>
        </div>

        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/90 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary-600" onClick={() => handleSort('name')}><div className="flex items-center gap-1">Name {getSortIcon('name')}</div></th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary-600" onClick={() => handleSort('relatedTo')}><div className="flex items-center gap-1">Related To {getSortIcon('relatedTo')}</div></th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary-600" onClick={() => handleSort('type')}><div className="flex items-center gap-1">Type {getSortIcon('type')}</div></th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary-600" onClick={() => handleSort('status')}><div className="flex items-center gap-1">Status {getSortIcon('status')}</div></th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary-600" onClick={() => handleSort('uploadedAt')}><div className="flex items-center gap-1">Date {getSortIcon('uploadedAt')}</div></th>
                <th className="px-6 py-4 font-medium justify-center text-center">Version</th>
                <th className="px-6 py-4 font-medium justify-center text-center">Security</th>
                <th className="px-6 py-4 font-medium text-right cursor-pointer hover:text-primary-600" onClick={() => handleSort('size')}><div className="flex items-center justify-end gap-1">Size {getSortIcon('size')}</div></th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {sortedDocuments.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleQuickView(doc); }}>
                    <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 mr-3"><IconFileText className="w-4 h-4" /></div>
                        <span className="font-medium text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{doc.relatedTo}</td>
                  <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">{doc.type}</span></td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${doc.status === 'Final' || doc.status === 'Signed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : doc.status === 'Pending Review' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>{doc.status}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm">{doc.uploadedAt}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">v{doc.version || '1.0'}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center p-1.5 rounded-full ${(!doc.virusScanStatus || doc.virusScanStatus === 'Clean') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : doc.virusScanStatus === 'Scanning' ? 'animate-pulse bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`} title={doc.virusScanStatus || 'Clean'}>
                        <IconShieldCheck className="w-4 h-4" />
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm text-right">{doc.size}</td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEditDocument && (
                            <button 
                                className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" 
                                onClick={() => onEditDocument(doc)}
                                title="Edit Design"
                            >
                                <IconLayout className="w-4 h-4" />
                            </button>
                        )}
                        <button className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" onClick={() => handleQuickView(doc)}><IconEye className="w-4 h-4" /></button>
                        {activeTab === 'active' ? (
                            <button className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors" onClick={() => handleArchive(doc)}><IconArchive className="w-4 h-4" /></button>
                        ) : (
                            <button className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" onClick={() => handleRestore(doc)}><IconRefresh className="w-4 h-4" /></button>
                        )}
                        <button onClick={() => { if(window.confirm('Delete this document permanently?')) onDeleteDocument(doc.id); }} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"><IconTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {mainTab === 'shared' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 p-8 items-center text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <IconShare2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Secure Shared Links</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">Manage external links shared with clients. You can set expiration dates, require passwords, and track views here.</p>
            <div className="w-full max-w-2xl text-left mt-4 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">Document</th>
                            <th className="px-4 py-3 font-medium">Shared With</th>
                            <th className="px-4 py-3 font-medium">Expires</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr>
                            <td className="px-4 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-2"><IconFileText className="w-4 h-4 text-blue-500"/> Acme Corp SLA</td>
                            <td className="px-4 py-4 text-slate-500">john.doe@acmecorp.com</td>
                            <td className="px-4 py-4 text-amber-600">In 2 days</td>
                            <td className="px-4 py-4 text-right"><button className="text-red-500 hover:underline">Revoke</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {mainTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 max-w-3xl flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Storage & CDN Configuration</h3>
            
            <div className="space-y-6">
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><IconDatabase className="w-4 h-4 text-slate-400" /> Object Storage (S3-compatible)</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Provider</label>
                            <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white"><option>AWS S3</option><option>Cloudflare R2</option><option>MinIO</option></select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Bucket Name</label>
                            <input type="text" value="prod-enterprise-docs" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white" />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><IconGlobe className="w-4 h-4 text-slate-400" /> CDN Configuration</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">CDN Provider</label>
                            <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white"><option>Cloudflare</option><option>AWS CloudFront</option></select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Custom Domain</label>
                            <input type="text" value="cdn.docs.enterprise.com" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white" />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><IconShieldCheck className="w-4 h-4 text-emerald-500" /> Compliance & Security</h4>
                    <div className="space-y-3 mt-4">
                        <label className="flex items-center gap-3">
                            <input type="checkbox" checked className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Enable automatic virus scanning on upload</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input type="checkbox" checked className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Retain file versions indefinitely (Versioning)</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input type="checkbox" checked className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Encrypt files at rest (AES-256)</span>
                        </label>
                    </div>
                    <button className="mt-6 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium">Save Settings</button>
                </div>
            </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
             <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center"><IconUpload className="w-5 h-5 mr-3 text-primary-500" /> Upload Document</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><IconX className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Document Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as DocumentType})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white cursor-pointer">
                      {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Related To</label>
                  <input type="text" value={formData.relatedTo || ''} onChange={(e) => setFormData({...formData, relatedTo: e.target.value})} placeholder="e.g. Acme Corp" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white" />
               </div>
               <div className="pt-4 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl">Upload</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {isQuickViewOpen && selectedDocument && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="w-full max-w-5xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col h-[85vh]">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                      <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"><IconFileText className="w-5 h-5" /></div>
                          <div>
                              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{selectedDocument.name}</h2>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Uploaded on {selectedDocument.uploadedAt}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-2">
                          {onEditDocument && (
                              <button 
                                onClick={() => { onEditDocument(selectedDocument); setIsQuickViewOpen(false); }}
                                className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-xs font-medium flex items-center shadow-sm transition-colors"
                              >
                                  <IconLayout className="w-3.5 h-3.5 mr-1.5" />
                                  Edit Design
                              </button>
                          )}
                          <button onClick={() => setIsQuickViewOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"><IconX className="w-6 h-6" /></button>
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
                      <div className="w-80 bg-white dark:bg-slate-900 overflow-y-auto border-l border-slate-200 dark:border-slate-800 flex flex-col">
                          <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Details</h3>
                              <div className="space-y-4">
                                  <div><label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Type</label><p className="text-sm font-medium text-slate-900 dark:text-white">{selectedDocument.type}</p></div>
                                  <div><label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Related To</label><p className="text-sm font-medium text-slate-900 dark:text-white">{selectedDocument.relatedTo}</p></div>
                                  <div><label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Status</label><p className="text-sm font-medium text-slate-900 dark:text-white">{selectedDocument.status}</p></div>
                                  <div>
                                      <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Security Scan</label>
                                      <div className="flex items-center gap-2">
                                          <IconShieldCheck className="w-4 h-4 text-emerald-500" />
                                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Clean</span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="p-6 pt-4 flex-1">
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 flex justify-between items-center">
                                  Version History
                                  <button className="text-blue-600 hover:underline text-xs capitalize flex items-center"><IconUpload className="w-3 h-3 mr-1" /> New</button>
                              </h3>
                              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                      <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white dark:border-slate-900 bg-blue-500 text-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                          <div className="w-2 h-2 bg-white rounded-full"></div>
                                      </div>
                                      <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] p-3 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-slate-900 dark:text-white text-xs">v1.2 (Current)</span>
                                            <span className="text-[10px] text-slate-500">Today</span>
                                          </div>
                                          <p className="text-xs text-slate-500">Fixed typo in SLA clause.</p>
                                      </div>
                                  </div>
                                  
                                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                      <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 text-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                      </div>
                                      <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] p-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-slate-700 dark:text-slate-300 text-xs hover:text-blue-600 cursor-pointer transition-colors">v1.1</span>
                                            <span className="text-[10px] text-slate-500">Yesterday</span>
                                          </div>
                                          <p className="text-xs text-slate-500">Added signature blocks.</p>
                                      </div>
                                  </div>
                                  
                                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                      <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 text-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                      </div>
                                      <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] p-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-slate-700 dark:text-slate-300 text-xs hover:text-blue-600 cursor-pointer transition-colors">v1.0</span>
                                            <span className="text-[10px] text-slate-500">2 days ago</span>
                                          </div>
                                          <p className="text-xs text-slate-500">Initial draft.</p>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Documents;

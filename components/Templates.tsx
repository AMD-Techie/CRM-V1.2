
import React, { useState, useMemo, useEffect } from 'react';
import { 
    IconLayout, IconFileText, IconCheckSquare, IconShield, IconEye, IconPlus, IconCreditCard, IconLock, IconEdit, IconTrash, IconCopy, IconFilter, IconSettings, IconX, IconDownload
} from './Icons';
import { ProposalTemplate, QuotationTemplate, ContractTemplate, InvoiceTemplate, NDATemplate, TemplateData, DesignConfig } from './DocumentTemplates';

const Templates: React.FC = () => {
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditorMode, setIsEditorMode] = useState(false);
    const [activeSidebarTab, setActiveSidebarTab] = useState<'design' | 'content'>('design');
    
    // Form state for creating new template
    const [newTemplateData, setNewTemplateData] = useState({ 
        name: '', 
        type: 'Proposal', 
        category: 'Sales',
        description: '' 
    });

    // Default Data State - Fully Populated
    const defaultData: TemplateData = {
        relatedTo: 'Acme Corporation',
        date: new Date().toLocaleDateString(),
        refNumber: 'PREVIEW-001',
        title: 'Project Proposal',
        executiveSummary: 'Thank you for the opportunity to present this proposal to Acme Corporation. Based on our recent discussions, we have outlined a comprehensive strategy designed to meet your specific needs and drive significant value.',
        scopeOfWork: [
            'Initial system audit and requirements gathering.',
            'Custom implementation of the Nova Intelligence Suite.',
            'Data migration and integration services.',
            'User training and documentation.'
        ],
        investmentItems: [
            { description: 'Implementation Service', cost: 12500 },
            { description: 'Software Licensing (Annual)', cost: 24000 },
            { description: 'Training Workshop', cost: 3500 }
        ],
        companyName: 'NovaCRM Inc.',
        companyAddress: '100 Innovation Dr.\nSan Francisco, CA 94105',
        currency: 'USD',
        taxRate: 0,
        paymentTerms: 'Payment is due within 30 days of invoice date. Please make checks payable to NovaCRM Inc.',
        signature: '',
        signatureDate: ''
    };

    const [editableData, setEditableData] = useState<TemplateData>(defaultData);

    // Editor Config State
    const [editorConfig, setEditorConfig] = useState<DesignConfig>({
        showLogo: true,
        showDate: true,
        primaryColor: '#6366f1',
        sections: {
            header: true,
            details: true,
            content: true,
            signatures: true
        }
    });

    const INITIAL_TEMPLATES = [
        { id: 'proposal', name: 'Standard Proposal', type: 'Proposal', category: 'Sales', icon: IconCheckSquare, description: 'Comprehensive project proposal with scope, timeline, and investment summary.', component: ProposalTemplate },
        { id: 'quotation', name: 'Enterprise Quotation', type: 'Quotation', category: 'Sales', icon: IconFileText, description: 'Detailed financial breakdown including bill-to, ship-to, and line items.', component: QuotationTemplate },
        { id: 'contract', name: 'Service Agreement', type: 'Contract', category: 'Legal', icon: IconShield, description: 'Formal legal agreement outlining terms, conditions, and signatures.', component: ContractTemplate },
        { id: 'invoice', name: 'Standard Invoice', type: 'Invoice', category: 'Finance', icon: IconCreditCard, description: 'Clean invoice layout with tax calculation and payment details.', component: InvoiceTemplate },
        { id: 'nda', name: 'Mutual NDA', type: 'NDA', category: 'Legal', icon: IconLock, description: 'Standard Non-Disclosure Agreement for new partnerships.', component: NDATemplate },
    ];

    const [templates, setTemplates] = useState(INITIAL_TEMPLATES);

    const filteredTemplates = useMemo(() => {
        if (activeCategory === 'All') return templates;
        return templates.filter(t => t.category === activeCategory);
    }, [activeCategory, templates]);

    const ActiveComponent = selectedTemplate ? templates.find(t => t.id === selectedTemplate)?.component : null;

    // Reset editor state when switching templates, but keep data populated
    useEffect(() => {
        if (selectedTemplate) {
            const template = templates.find(t => t.id === selectedTemplate);
            let defaultTitle = 'Document';
            if (template) {
                if (template.type === 'Proposal') defaultTitle = 'Project Proposal';
                if (template.type === 'Quotation') defaultTitle = 'QUOTATION';
                if (template.type === 'Contract') defaultTitle = 'Service Agreement';
                if (template.type === 'Invoice') defaultTitle = 'INVOICE';
                if (template.type === 'NDA') defaultTitle = 'Non-Disclosure Agreement';
            }

            setEditorConfig({
                showLogo: true,
                showDate: true,
                primaryColor: '#6366f1',
                sections: {
                    header: true,
                    details: true,
                    content: true,
                    signatures: true
                }
            });
            // Re-initialize with default data to ensure fields are populated for editing
            setEditableData({
                ...defaultData,
                title: defaultTitle,
                refNumber: 'PREVIEW-' + Math.floor(Math.random() * 1000)
            });
        }
    }, [selectedTemplate]);

    const getTemplateConfig = (type: string) => {
        switch(type) {
            case 'Proposal': return { icon: IconCheckSquare, component: ProposalTemplate };
            case 'Quotation': return { icon: IconFileText, component: QuotationTemplate };
            case 'Contract': return { icon: IconShield, component: ContractTemplate };
            case 'Invoice': return { icon: IconCreditCard, component: InvoiceTemplate };
            case 'NDA': return { icon: IconLock, component: NDATemplate };
            default: return { icon: IconCheckSquare, component: ProposalTemplate };
        }
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const config = getTemplateConfig(newTemplateData.type);
        
        const newTemplate = {
            id: `tpl-${Date.now()}`,
            name: newTemplateData.name,
            type: newTemplateData.type,
            category: newTemplateData.category,
            description: newTemplateData.description || `Custom ${newTemplateData.type} template`,
            icon: config.icon,
            component: config.component
        };

        setTemplates(prev => [...prev, newTemplate]);
        setSelectedTemplate(newTemplate.id);
        setIsCreateModalOpen(false);
        setNewTemplateData({ name: '', type: 'Proposal', category: 'Sales', description: '' });
    };

    const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this template?')) {
            setTemplates(prev => prev.filter(t => t.id !== id));
            if (selectedTemplate === id) setSelectedTemplate(null);
        }
    };

    const handleDataChange = (key: string, value: any) => {
        setEditableData(prev => ({ ...prev, [key]: value }));
    };

    // List Management Handlers
    const handleScopeChange = (index: number, value: string) => {
        const newScope = [...(editableData.scopeOfWork || [])];
        newScope[index] = value;
        setEditableData(prev => ({ ...prev, scopeOfWork: newScope }));
    };

    const handleAddScope = () => {
        setEditableData(prev => ({ ...prev, scopeOfWork: [...(prev.scopeOfWork || []), 'New item'] }));
    };

    const handleRemoveScope = (index: number) => {
        const newScope = [...(editableData.scopeOfWork || [])];
        newScope.splice(index, 1);
        setEditableData(prev => ({ ...prev, scopeOfWork: newScope }));
    };

    const handleInvestmentChange = (index: number, field: 'description' | 'cost', value: any) => {
        const newItems = [...(editableData.investmentItems || [])];
        // @ts-ignore
        newItems[index][field] = value;
        setEditableData(prev => ({ ...prev, investmentItems: newItems }));
    };

    const handleAddInvestment = () => {
        setEditableData(prev => ({ 
            ...prev, 
            investmentItems: [...(prev.investmentItems || []), { description: 'New Service', cost: 0 }] 
        }));
    };

    const handleRemoveInvestment = (index: number) => {
        const newItems = [...(editableData.investmentItems || [])];
        newItems.splice(index, 1);
        setEditableData(prev => ({ ...prev, investmentItems: newItems }));
    };

    const handleSignDocument = (name: string) => {
        setEditableData(prev => ({
            ...prev,
            signature: name,
            signatureDate: new Date().toLocaleDateString()
        }));
    };

    // Export Functions
    const handleExportPDF = () => {
        // Simple browser print approach - styles will hide sidebar/header
        window.print();
    };

    const handleExportWord = () => {
        // Simplified Word export by creating an HTML Blob with Word-compatible markup
        const content = document.getElementById('document-preview')?.innerHTML;
        if (!content) return;

        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
            "xmlns:w='urn:schemas-microsoft-com:office:word' " +
            "xmlns='http://www.w3.org/TR/REC-html40'>" +
            "<head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + content + footer;

        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = `${editableData.relatedTo.replace(/\s+/g, '_')}_Document.doc`;
        fileDownload.click();
        document.body.removeChild(fileDownload);
    };

    return (
        <div className="h-full flex flex-col animate-fade-in bg-slate-50 dark:bg-slate-950 print:bg-white">
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #document-preview, #document-preview * {
                        visibility: visible;
                    }
                    #document-preview {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        box-shadow: none;
                        border: none;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 no-print">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Document Templates</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and preview standardized document layouts.</p>
                    </div>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium text-sm flex items-center shadow-lg shadow-primary-500/20 transition-all"
                    >
                        <IconPlus className="w-4 h-4 mr-2" /> Create Template
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex">
                {/* Template List & Filters - Hide in Editor Mode to give more space */}
                <div className={`w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col flex-shrink-0 transition-all duration-300 no-print ${isEditorMode ? '-ml-80' : ''}`}>
                    {/* Category Filter */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
                        <div className="flex space-x-2">
                            {['All', 'Sales', 'Legal', 'Finance'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all whitespace-nowrap ${
                                        activeCategory === cat 
                                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-y-auto custom-scrollbar p-4 space-y-3 flex-1">
                        {filteredTemplates.map(template => (
                            <div 
                                key={template.id}
                                onClick={() => { setSelectedTemplate(template.id); setIsEditorMode(false); }}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer group relative ${
                                    selectedTemplate === template.id 
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 dark:border-primary-500' 
                                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className={`p-2 rounded-lg ${selectedTemplate === template.id ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                        <template.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900">
                                        {template.category}
                                    </span>
                                </div>
                                <h3 className={`font-bold text-base mb-1 ${selectedTemplate === template.id ? 'text-primary-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>
                                    {template.name}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
                                    {template.description}
                                </p>
                                
                                {/* Actions */}
                                <div className={`flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${selectedTemplate === template.id ? 'opacity-100' : ''}`}>
                                    <button className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded text-slate-400 hover:text-primary-600 transition-colors" title="Duplicate"><IconCopy className="w-3.5 h-3.5" /></button>
                                    <button 
                                        className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded text-slate-400 hover:text-red-600 transition-colors" 
                                        title="Delete"
                                        onClick={(e) => handleDeleteTemplate(template.id, e)}
                                    >
                                        <IconTrash className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preview / Editor Area */}
                <div className="flex-1 bg-slate-100 dark:bg-black/20 overflow-hidden flex flex-col">
                    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center shadow-sm z-10 no-print">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                {isEditorMode ? <IconEdit className="w-4 h-4 text-primary-500" /> : <IconEye className="w-4 h-4" />}
                                <span className="font-medium">{isEditorMode ? 'Editor Mode' : 'Live Preview'}</span>
                            </div>
                            
                            {selectedTemplate && (
                                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                                    <button 
                                        onClick={() => setIsEditorMode(false)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${!isEditorMode ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                                    >
                                        Preview
                                    </button>
                                    <button 
                                        onClick={() => setIsEditorMode(true)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${isEditorMode ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                                    >
                                        Design
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {selectedTemplate && (
                                <>
                                    <button onClick={handleExportWord} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center">
                                        <IconFileText className="w-3.5 h-3.5 mr-1.5" /> Word
                                    </button>
                                    <button onClick={handleExportPDF} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center">
                                        <IconDownload className="w-3.5 h-3.5 mr-1.5" /> PDF
                                    </button>
                                </>
                            )}
                            <button onClick={() => { alert("Changes saved successfully!"); setIsEditorMode(false); }} className={`px-4 py-1.5 text-xs font-bold rounded-lg bg-primary-600 text-white hover:bg-primary-500 transition-colors ${!isEditorMode ? 'hidden' : ''}`}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 flex overflow-hidden">
                        {isEditorMode && selectedTemplate && (
                            <div className="w-80 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-xl z-20 no-print">
                                {/* Editor Tabs */}
                                <div className="flex border-b border-slate-200 dark:border-slate-800">
                                    <button 
                                        onClick={() => setActiveSidebarTab('design')}
                                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeSidebarTab === 'design' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                    >
                                        Design
                                    </button>
                                    <button 
                                        onClick={() => setActiveSidebarTab('content')}
                                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeSidebarTab === 'content' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                    >
                                        Content
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                    {activeSidebarTab === 'design' ? (
                                        <div className="space-y-6 animate-fade-in">
                                            {/* Design Toggles... */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Toggles</label>
                                                <div className="space-y-3">
                                                    <label className="flex items-center space-x-3 text-sm cursor-pointer p-2 rounded hover:bg-white dark:hover:bg-slate-800">
                                                        <input type="checkbox" checked={editorConfig.showLogo} onChange={(e) => setEditorConfig({...editorConfig, showLogo: e.target.checked})} className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4" />
                                                        <span className="text-slate-700 dark:text-slate-300">Show Branding Logo</span>
                                                    </label>
                                                    <label className="flex items-center space-x-3 text-sm cursor-pointer p-2 rounded hover:bg-white dark:hover:bg-slate-800">
                                                        <input type="checkbox" checked={editorConfig.showDate} onChange={(e) => setEditorConfig({...editorConfig, showDate: e.target.checked})} className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4" />
                                                        <span className="text-slate-700 dark:text-slate-300">Show Date Field</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Visible Sections</label>
                                                <div className="space-y-1">
                                                    {Object.keys(editorConfig.sections).map(sec => (
                                                        <label key={sec} className="flex items-center space-x-3 text-sm cursor-pointer capitalize p-2 rounded hover:bg-white dark:hover:bg-slate-800">
                                                            <input 
                                                                type="checkbox" 
                                                                // @ts-ignore
                                                                checked={editorConfig.sections[sec]} 
                                                                // @ts-ignore
                                                                onChange={(e) => setEditorConfig({...editorConfig, sections: {...editorConfig.sections, [sec]: e.target.checked}})} 
                                                                className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4" 
                                                            />
                                                            <span className="text-slate-700 dark:text-slate-300">{sec}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Theme Accent</label>
                                                <div className="flex gap-3">
                                                    {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(color => (
                                                        <button 
                                                            key={color} 
                                                            onClick={() => setEditorConfig({...editorConfig, primaryColor: color})}
                                                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${editorConfig.primaryColor === color ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'}`}
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 animate-fade-in">
                                            {/* Document Title Editing */}
                                            <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Document Title</label>
                                                <input 
                                                    type="text" 
                                                    value={editableData.title || ''} 
                                                    onChange={(e) => handleDataChange('title', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold"
                                                />
                                            </div>

                                            {/* Company Details Section */}
                                            <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">Company Details</h3>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-500 mb-1">Company Name</label>
                                                        <input 
                                                            type="text" 
                                                            value={editableData.companyName || ''} 
                                                            onChange={(e) => handleDataChange('companyName', e.target.value)}
                                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-500 mb-1">Address & Info</label>
                                                        <textarea 
                                                            rows={2}
                                                            value={editableData.companyAddress || ''} 
                                                            onChange={(e) => handleDataChange('companyAddress', e.target.value)}
                                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Financial Settings Section */}
                                            <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">Financial Settings</h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-500 mb-1">Currency</label>
                                                        <select 
                                                            value={editableData.currency || 'USD'} 
                                                            onChange={(e) => handleDataChange('currency', e.target.value)}
                                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                                        >
                                                            <option value="USD">USD ($)</option>
                                                            <option value="EUR">EUR (€)</option>
                                                            <option value="GBP">GBP (£)</option>
                                                            <option value="INR">INR (₹)</option>
                                                            <option value="AUD">AUD ($)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-500 mb-1">Tax Rate (%)</label>
                                                        <input 
                                                            type="number" 
                                                            min="0"
                                                            max="100"
                                                            value={editableData.taxRate || 0} 
                                                            onChange={(e) => handleDataChange('taxRate', parseFloat(e.target.value))}
                                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Recipient Name</label>
                                                <input 
                                                    type="text" 
                                                    value={editableData.relatedTo} 
                                                    onChange={(e) => handleDataChange('relatedTo', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Reference #</label>
                                                <input 
                                                    type="text" 
                                                    value={editableData.refNumber} 
                                                    onChange={(e) => handleDataChange('refNumber', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Executive Summary</label>
                                                <textarea 
                                                    rows={4}
                                                    value={editableData.executiveSummary || ''}
                                                    onChange={(e) => handleDataChange('executiveSummary', e.target.value)}
                                                    placeholder="Enter text here..."
                                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                                />
                                            </div>

                                            {/* List Editor for Scope of Work */}
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Scope Items</label>
                                                    <button onClick={handleAddScope} className="text-primary-600 hover:text-primary-700 text-xs font-bold flex items-center"><IconPlus className="w-3 h-3 mr-1"/> Add</button>
                                                </div>
                                                <div className="space-y-2">
                                                    {(editableData.scopeOfWork || []).map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <input 
                                                                type="text" 
                                                                value={item} 
                                                                onChange={(e) => handleScopeChange(idx, e.target.value)}
                                                                className="flex-1 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:border-primary-500"
                                                            />
                                                            <button onClick={() => handleRemoveScope(idx)} className="text-slate-400 hover:text-red-500"><IconX className="w-4 h-4" /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* List Editor for Investment Items */}
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Line Items</label>
                                                    <button onClick={handleAddInvestment} className="text-primary-600 hover:text-primary-700 text-xs font-bold flex items-center"><IconPlus className="w-3 h-3 mr-1"/> Add</button>
                                                </div>
                                                <div className="space-y-3">
                                                    {(editableData.investmentItems || []).map((item, idx) => (
                                                        <div key={idx} className="bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 relative group">
                                                            <button onClick={() => handleRemoveInvestment(idx)} className="absolute top-1 right-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><IconX className="w-3 h-3" /></button>
                                                            <div className="mb-2">
                                                                <input 
                                                                    type="text" 
                                                                    value={item.description} 
                                                                    onChange={(e) => handleInvestmentChange(idx, 'description', e.target.value)}
                                                                    placeholder="Item description"
                                                                    className="w-full px-2 py-1 bg-transparent border-b border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
                                                                />
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="text-xs text-slate-500 mr-2">Cost:</span>
                                                                <input 
                                                                    type="number" 
                                                                    value={item.cost} 
                                                                    onChange={(e) => handleInvestmentChange(idx, 'cost', parseFloat(e.target.value))}
                                                                    className="w-24 px-2 py-1 bg-transparent border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:border-primary-500"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Payment Terms */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Payment Terms / Conditions</label>
                                                <textarea 
                                                    rows={3}
                                                    value={editableData.paymentTerms || ''}
                                                    onChange={(e) => handleDataChange('paymentTerms', e.target.value)}
                                                    placeholder="Enter terms..."
                                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                                />
                                            </div>

                                            {/* Digital Signature Section */}
                                            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-3">Digital Signature</h3>
                                                <div className="space-y-3 bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                                    {editableData.signature ? (
                                                        <div className="text-center">
                                                            <p className="text-sm text-slate-500 mb-2">Signed by:</p>
                                                            <p className="font-[cursive] text-2xl text-primary-600 mb-1" style={{ fontFamily: '"Brush Script MT", "Comic Sans MS", cursive' }}>{editableData.signature}</p>
                                                            <p className="text-xs text-slate-400">{editableData.signatureDate}</p>
                                                            <button 
                                                                onClick={() => setEditableData(prev => ({...prev, signature: '', signatureDate: ''}))}
                                                                className="mt-3 text-xs text-red-500 hover:text-red-600 font-medium"
                                                            >
                                                                Remove Signature
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-500 mb-1">Signee Name</label>
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="Type full name to sign"
                                                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            handleSignDocument((e.target as HTMLInputElement).value);
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 italic">Press Enter to apply signature.</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex-1 bg-slate-200 dark:bg-slate-900/50 overflow-y-auto custom-scrollbar p-8 relative">
                            {selectedTemplate ? (
                                <div className="max-w-[800px] mx-auto bg-white shadow-2xl min-h-[1000px] rounded-sm transform transition-all origin-top duration-300 relative print:shadow-none print:w-full">
                                    {/* Visual Overlay for hidden sections in editor mode */}
                                    {isEditorMode && (
                                        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col no-print">
                                            {!editorConfig.sections.header && (
                                                <div className="w-full h-32 bg-slate-100/90 backdrop-blur-sm flex items-center justify-center border-b border-red-200 text-red-500 font-bold uppercase tracking-widest text-xs">
                                                    Header Hidden
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {ActiveComponent && <ActiveComponent data={editableData} design={editorConfig} />}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 no-print">
                                    <IconLayout className="w-16 h-16 mb-4 opacity-50" />
                                    <p className="text-lg font-medium">Select a template to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Template Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Template</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><IconPlus className="w-6 h-6 rotate-45" /></button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Template Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newTemplateData.name}
                                    onChange={(e) => setNewTemplateData({...newTemplateData, name: e.target.value})}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                    placeholder="e.g. Q3 Sales Proposal"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Base Type</label>
                                    <select 
                                        value={newTemplateData.type}
                                        onChange={(e) => setNewTemplateData({...newTemplateData, type: e.target.value})}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white cursor-pointer"
                                    >
                                        {['Proposal', 'Quotation', 'Contract', 'Invoice', 'NDA'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                    <select 
                                        value={newTemplateData.category}
                                        onChange={(e) => setNewTemplateData({...newTemplateData, category: e.target.value})}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white cursor-pointer"
                                    >
                                        {['Sales', 'Legal', 'Finance', 'Operations', 'Marketing'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea 
                                    rows={3}
                                    value={newTemplateData.description}
                                    onChange={(e) => setNewTemplateData({...newTemplateData, description: e.target.value})}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white resize-none"
                                    placeholder="Brief description..."
                                />
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-lg shadow-md">Create Template</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Templates;

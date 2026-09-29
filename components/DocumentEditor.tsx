
import React, { useState, useEffect, useMemo } from 'react';
import { Document } from '../types';
import { 
    IconArrowLeft, IconSave, IconDownload, IconFileText, 
    IconCheckSquare, IconShield, IconCreditCard, IconLock,
    IconPlus, IconX
} from './Icons';
import { ProposalTemplate, QuotationTemplate, ContractTemplate, InvoiceTemplate, NDATemplate, TemplateData, DesignConfig } from './DocumentTemplates';

interface DocumentEditorProps {
    document: Document;
    onSave: (updatedDoc: Document) => void;
    onClose: () => void;
    defaultCurrency?: string;
    multiCurrency?: boolean;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ document, onSave, onClose, defaultCurrency = 'USD', multiCurrency = false }) => {
    const [activeSidebarTab, setActiveSidebarTab] = useState<'design' | 'content'>('design');
    const [editableData, setEditableData] = useState<TemplateData>({
        relatedTo: document.relatedTo,
        date: document.uploadedAt,
        refNumber: document.id,
        title: document.name.replace('.pdf', '').replace('.docx', ''),
        currency: multiCurrency ? (document.content?.currency || defaultCurrency) : defaultCurrency,
        taxRate: 0,
        paymentTerms: 'Net 30',
        ...document.content // Merge AI-generated content
    });

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

    const ActiveComponent = useMemo(() => {
        switch(document.type) {
            case 'Proposal': return ProposalTemplate;
            case 'Quotation': return QuotationTemplate;
            case 'Contract': return ContractTemplate;
            case 'Invoice': return InvoiceTemplate;
            case 'NDA': return NDATemplate;
            default: return ProposalTemplate;
        }
    }, [document.type]);

    const handleDataChange = (key: string, value: any) => {
        setEditableData(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        // Save the content structure back to the document object
        onSave({
            ...document,
            content: editableData
        });
        alert('Document saved successfully!');
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
            investmentItems: [...(prev.investmentItems || []), { description: 'New Item', cost: 0 }] 
        }));
    };

    const handleRemoveInvestment = (index: number) => {
        const newItems = [...(editableData.investmentItems || [])];
        newItems.splice(index, 1);
        setEditableData(prev => ({ ...prev, investmentItems: newItems }));
    };

    const handleExportPDF = () => {
        window.print();
    };

    return (
        <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-950 absolute inset-0 z-50 animate-fade-in">
            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center shadow-sm z-50 no-print">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="flex items-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                        <IconArrowLeft className="w-5 h-5 mr-2" /> Back
                    </button>
                    <div className="h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{document.name}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{document.type} • {document.status}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleExportPDF} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-sm flex items-center transition-colors">
                        <IconDownload className="w-4 h-4 mr-2" /> Export PDF
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium text-sm flex items-center shadow-lg shadow-primary-500/20 transition-all">
                        <IconSave className="w-4 h-4 mr-2" /> Save Changes
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-xl z-40 no-print">
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
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Toggles</label>
                                    <div className="space-y-3">
                                        <label className="flex items-center space-x-3 text-sm cursor-pointer p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                                            <input type="checkbox" checked={editorConfig.showLogo} onChange={(e) => setEditorConfig({...editorConfig, showLogo: e.target.checked})} className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4" />
                                            <span className="text-slate-700 dark:text-slate-300">Show Branding Logo</span>
                                        </label>
                                        <label className="flex items-center space-x-3 text-sm cursor-pointer p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                                            <input type="checkbox" checked={editorConfig.showDate} onChange={(e) => setEditorConfig({...editorConfig, showDate: e.target.checked})} className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4" />
                                            <span className="text-slate-700 dark:text-slate-300">Show Date Field</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Theme Accent</label>
                                    <div className="flex gap-3 flex-wrap">
                                        {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'].map(color => (
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
                            <div className="space-y-6">
                                {/* Common Fields */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Document Title</label>
                                        <input 
                                            type="text" 
                                            value={editableData.title || ''} 
                                            onChange={(e) => handleDataChange('title', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Recipient</label>
                                        <input 
                                            type="text" 
                                            value={editableData.relatedTo} 
                                            onChange={(e) => handleDataChange('relatedTo', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Executive Summary / Intro</label>
                                        <textarea 
                                            rows={4}
                                            value={editableData.executiveSummary || ''}
                                            onChange={(e) => handleDataChange('executiveSummary', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Financial Settings */}
                                <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Financial Settings</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Currency</label>
                                            <select
                                                value={editableData.currency || 'USD'}
                                                onChange={(e) => handleDataChange('currency', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                                            >
                                                <option value="USD">USD ($)</option>
                                                <option value="EUR">EUR (€)</option>
                                                <option value="GBP">GBP (£)</option>
                                                <option value="INR">INR (₹)</option>
                                                <option value="AUD">AUD ($)</option>
                                                <option value="CAD">CAD ($)</option>
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
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic List: Scope of Work */}
                                {editableData.scopeOfWork !== undefined && (
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
                                                        className="flex-1 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:border-primary-500"
                                                    />
                                                    <button onClick={() => handleRemoveScope(idx)} className="text-slate-400 hover:text-red-500"><IconX className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Dynamic List: Investment Items */}
                                {editableData.investmentItems !== undefined && (
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Financials</label>
                                            <button onClick={handleAddInvestment} className="text-primary-600 hover:text-primary-700 text-xs font-bold flex items-center"><IconPlus className="w-3 h-3 mr-1"/> Add</button>
                                        </div>
                                        <div className="space-y-3">
                                            {(editableData.investmentItems || []).map((item, idx) => (
                                                <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 relative group">
                                                    <button onClick={() => handleRemoveInvestment(idx)} className="absolute top-1 right-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><IconX className="w-3 h-3" /></button>
                                                    <div className="mb-2">
                                                        <input 
                                                            type="text" 
                                                            value={item.description} 
                                                            onChange={(e) => handleInvestmentChange(idx, 'description', e.target.value)}
                                                            placeholder="Description"
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
                                )}

                                {/* Payment Terms */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Payment Terms</label>
                                    <textarea
                                        rows={3}
                                        value={editableData.paymentTerms || ''}
                                        onChange={(e) => handleDataChange('paymentTerms', e.target.value)}
                                        placeholder="e.g. Net 30 days..."
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary-500 resize-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Preview Area */}
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-200 dark:bg-slate-900/50 relative overflow-hidden">
                    <div className="w-full h-full overflow-y-auto custom-scrollbar p-8">
                        <style>{`
                            @media print {
                                .no-print { display: none !important; }
                                body * { visibility: hidden; }
                                #document-preview, #document-preview * { visibility: visible; }
                                #document-preview { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
                            }
                        `}</style>
                        <div className="max-w-[800px] mx-auto bg-white shadow-2xl min-h-[1000px] rounded-sm transform transition-all origin-top duration-300 relative print:shadow-none print:w-full">
                            <ActiveComponent data={editableData} design={editorConfig} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentEditor;

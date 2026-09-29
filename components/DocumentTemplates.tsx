
import React from 'react';
import { IconCheckSquare, IconFileText, IconShield, IconCreditCard, IconLock } from './Icons';

export interface TemplateData {
    id?: string;
    relatedTo: string;
    date: string;
    refNumber?: string;
    executiveSummary?: string;
    scopeOfWork?: string[];
    investmentItems?: { description: string, cost: number }[];
    // New Fields
    companyName?: string;
    companyAddress?: string;
    currency?: string;
    taxRate?: number;
    paymentTerms?: string;
    title?: string;
    signature?: string;
    signatureDate?: string;
    [key: string]: any;
}

export interface DesignConfig {
    showLogo: boolean;
    showDate: boolean;
    primaryColor: string;
    sections: {
        header: boolean;
        details: boolean;
        content: boolean;
        signatures: boolean;
    };
}

interface TemplateProps {
    data: TemplateData;
    design?: DesignConfig;
}

import { formatCurrency } from '../lib/utils';

const defaultDesign: DesignConfig = {
    showLogo: true,
    showDate: true,
    primaryColor: '#6366f1',
    sections: { header: true, details: true, content: true, signatures: true }
};

// Signature Component Helper
const SignatureBlock = ({ data, color }: { data: TemplateData, color: string }) => {
    if (!data.signature) {
        return <div className="h-px bg-slate-300 w-64 mt-8"></div>;
    }
    return (
        <div className="mt-4">
            <div 
                className="font-[cursive] text-3xl px-4 py-2 border-b-2 inline-block transform -rotate-2 origin-left"
                style={{ 
                    fontFamily: '"Brush Script MT", "Comic Sans MS", cursive',
                    color: color,
                    borderColor: color
                }}
            >
                {data.signature}
            </div>
            <div className="text-[10px] text-slate-400 mt-2 font-mono uppercase tracking-wider">
                Digitally Signed: {data.signatureDate || new Date().toLocaleDateString()}
            </div>
        </div>
    );
};

export const ProposalTemplate = ({ data, design = defaultDesign }: TemplateProps) => {
  const subtotal = data.investmentItems 
    ? data.investmentItems.reduce((acc, item) => acc + item.cost, 0)
    : 0;
  
  const taxRate = data.taxRate || 0;
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;
  const currency = data.currency || 'USD';

  return (
    <div id="document-preview" className="bg-white text-slate-800 p-10 h-full overflow-y-auto shadow-sm font-sans min-h-[800px]">
        {design.sections.header && (
            <div className="border-b-2 pb-6 mb-8 flex justify-between items-end" style={{ borderColor: design.primaryColor }}>
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{data.title || 'Project Proposal'}</h1>
                    <p className="text-slate-500 mt-2 text-lg">Prepared for {data.relatedTo}</p>
                </div>
                {design.showLogo && (
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-1">
                            <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: design.primaryColor }}></div>
                            <div className="text-2xl font-bold" style={{ color: design.primaryColor }}>{data.companyName || 'NovaCRM'}</div>
                        </div>
                        <div className="text-sm text-slate-500 font-medium tracking-wide whitespace-pre-line text-right">
                            {data.companyAddress || 'Intelligence Systems'}
                        </div>
                    </div>
                )}
            </div>
        )}
        
        {design.sections.details && (
            <div className="grid grid-cols-2 gap-12 mb-12 bg-slate-50 p-6 rounded-xl border border-slate-100">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Prepared For</h3>
                    <p className="text-xl font-bold text-slate-900 mb-1">{data.relatedTo}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">123 Business Rd.<br/>Tech District, CA 94000</p>
                </div>
                <div className="text-right">
                    {design.showDate && (
                        <div className="mb-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Date</h3>
                            <p className="font-medium text-slate-900">{data.date}</p>
                        </div>
                    )}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Valid Until</h3>
                        <p className="font-medium text-slate-900">30 Days from Date</p>
                    </div>
                </div>
            </div>
        )}

        {design.sections.content && (
            <div className="space-y-10">
                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <span className="w-8 h-1 rounded-full mr-3" style={{ backgroundColor: design.primaryColor }}></span>
                        Executive Summary
                    </h2>
                    <p className="text-base leading-relaxed text-slate-600 whitespace-pre-line">
                        {data.executiveSummary || (
                            <>
                                Thank you for the opportunity to present this proposal to <strong>{data.relatedTo}</strong>. 
                                Based on our recent discussions, we have outlined a comprehensive strategy.
                            </>
                        )}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <span className="w-8 h-1 rounded-full mr-3" style={{ backgroundColor: design.primaryColor }}></span>
                        Scope of Work
                    </h2>
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <ul className="space-y-4">
                            {(data.scopeOfWork || []).map((item, i) => (
                                <li key={i} className="flex items-start text-sm text-slate-700">
                                    <span className="mr-3 mt-0.5 flex-shrink-0" style={{ color: design.primaryColor }}>
                                        <IconCheckSquare className="w-5 h-5" />
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <span className="w-8 h-1 rounded-full mr-3" style={{ backgroundColor: design.primaryColor }}></span>
                        Investment Summary
                    </h2>
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left font-bold text-slate-700">Description</th>
                                    <th className="px-6 py-4 text-right font-bold text-slate-700">Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {(data.investmentItems || []).map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 font-medium text-slate-900">{item.description}</td>
                                        <td className="px-6 py-4 text-right text-slate-600">
                                            {formatCurrency(item.cost, currency)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-50 border-t border-slate-200">
                                {taxRate > 0 && (
                                    <tr>
                                        <td className="px-6 py-3 text-right font-medium text-slate-500">Subtotal</td>
                                        <td className="px-6 py-3 text-right font-medium text-slate-700">
                                            {formatCurrency(subtotal, currency)}
                                        </td>
                                    </tr>
                                )}
                                {taxRate > 0 && (
                                    <tr>
                                        <td className="px-6 py-3 text-right font-medium text-slate-500">Tax ({taxRate}%)</td>
                                        <td className="px-6 py-3 text-right font-medium text-slate-700">
                                            {formatCurrency(taxAmount, currency)}
                                        </td>
                                    </tr>
                                )}
                                <tr>
                                    <td className="px-6 py-4 text-right font-bold text-slate-700 uppercase tracking-wide">Total Investment</td>
                                    <td className="px-6 py-4 text-right font-bold text-2xl" style={{ color: design.primaryColor }}>
                                        {formatCurrency(total, currency)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </section>
            </div>
        )}
        
        {design.sections.signatures && (
            <div className="mt-16 pt-8 border-t-2 border-slate-100 flex justify-between items-center">
                <div className="text-sm text-slate-500">
                    <p className="font-semibold uppercase tracking-wider mb-2">Authorized Signature</p>
                    <SignatureBlock data={data} color={design.primaryColor} />
                    <p className="mt-2 text-xs italic">By signing, you agree to the terms listed in the master agreement.</p>
                </div>
            </div>
        )}
    </div>
  );
};

export const QuotationTemplate = ({ data, design = defaultDesign }: TemplateProps) => {
    const subtotal = data.investmentItems 
        ? data.investmentItems.reduce((acc, item) => acc + item.cost, 0)
        : 0;
    const taxRate = data.taxRate || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    const currency = data.currency || 'USD';

    return (
      <div id="document-preview" className="bg-white text-slate-800 p-10 h-full overflow-y-auto shadow-sm font-mono text-sm relative min-h-[800px]">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none" style={{ color: design.primaryColor }}>
            <IconFileText className="w-96 h-96" />
        </div>

        {design.sections.header && (
            <div className="flex justify-between items-start mb-12 relative z-10">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: design.primaryColor }}>
                            <span className="font-bold text-xl">Q</span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900">{data.title || 'QUOTATION'}</h1>
                    </div>
                    <div className="space-y-1 text-slate-500">
                        <p>Ref: <span className="font-bold text-slate-900">#{data.refNumber || '1024'}</span></p>
                        {design.showDate && <p>Date: <span className="font-bold text-slate-900">{data.date}</span></p>}
                        <p>Due: <span className="font-bold text-slate-900">On Receipt</span></p>
                    </div>
                </div>
                {design.showLogo && (
                    <div className="text-right">
                        <h3 className="font-bold text-xl text-slate-900 mb-2">{data.companyName || 'NovaCRM Inc.'}</h3>
                        <p className="text-slate-500 whitespace-pre-line">{data.companyAddress || '100 Innovation Dr.\nSan Francisco, CA 94105'}</p>
                    </div>
                )}
            </div>
        )}

        {design.sections.details && (
            <div className="flex mb-12 bg-slate-50 rounded-lg p-8 border border-slate-100 relative z-10">
                <div className="flex-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Bill To</h3>
                    <p className="text-xl font-bold text-slate-900 mb-1">{data.relatedTo}</p>
                    <p className="text-slate-500">123 Corporate Blvd</p>
                </div>
                <div className="w-px bg-slate-200 mx-8"></div>
                <div className="flex-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Ship To</h3>
                    <p className="text-xl font-bold text-slate-900 mb-1">{data.relatedTo}</p>
                    <p className="text-slate-500">123 Corporate Blvd</p>
                </div>
            </div>
        )}

        {design.sections.content && (
            <>
                <table className="w-full mb-8 relative z-10">
                    <thead>
                        <tr className="border-b-2" style={{ borderColor: design.primaryColor }}>
                            <th className="py-4 text-left font-bold uppercase tracking-wider text-slate-900">Item Description</th>
                            <th className="py-4 text-center font-bold uppercase tracking-wider w-24 text-slate-900">Qty</th>
                            <th className="py-4 text-right font-bold uppercase tracking-wider w-32 text-slate-900">Price</th>
                            <th className="py-4 text-right font-bold uppercase tracking-wider w-40 text-slate-900 bg-slate-50">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(data.investmentItems || []).map((item, index) => (
                            <tr key={index}>
                                <td className="py-5 font-medium text-slate-800">{item.description}</td>
                                <td className="py-5 text-center text-slate-600">1</td>
                                <td className="py-5 text-right text-slate-600">{formatCurrency(item.cost, currency)}</td>
                                <td className="py-5 text-right font-bold text-slate-900 bg-slate-50">{formatCurrency(item.cost, currency)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end relative z-10">
                    <div className="w-72 space-y-3 bg-slate-50 p-6 rounded-lg border border-slate-100">
                        <div className="flex justify-between text-slate-500">
                            <span>Subtotal</span>
                            <span>{formatCurrency(subtotal, currency)}</span>
                        </div>
                        {taxRate > 0 && (
                            <div className="flex justify-between text-slate-500">
                                <span>Tax ({taxRate}%)</span>
                                <span>{formatCurrency(taxAmount, currency)}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t-2 pt-3 text-xl font-bold text-slate-900" style={{ borderColor: design.primaryColor }}>
                            <span>Total</span>
                            <span>{formatCurrency(total, currency)}</span>
                        </div>
                    </div>
                </div>
            </>
        )}

        {design.sections.signatures && (
            <div className="mt-16 pt-8 border-t border-slate-100 relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider mb-2">Terms & Conditions</h4>
                        <p className="text-slate-500 text-xs leading-relaxed max-w-2xl whitespace-pre-line">
                            {data.paymentTerms || "1. Payment is due within 15 days of invoice date.\n2. Please make checks payable to NovaCRM Inc."}
                        </p>
                    </div>
                    {data.signature && (
                        <div className="text-right">
                            <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider mb-2">Authorized By</h4>
                            <SignatureBlock data={data} color={design.primaryColor} />
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    );
};

export const ContractTemplate = ({ data, design = defaultDesign }: TemplateProps) => {
    const total = data.investmentItems 
        ? data.investmentItems.reduce((acc, item) => acc + item.cost, 0)
        : 40000;
    const currency = data.currency || 'USD';

    return (
        <div id="document-preview" className="bg-white text-slate-800 p-12 h-full overflow-y-auto shadow-sm font-serif min-h-[800px]">
            {design.sections.header && (
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-widest mb-2">{data.title || 'Service Agreement'}</h1>
                    <p className="text-slate-500 text-sm">Contract #{data.refNumber || 'CON-2024-001'}</p>
                    {design.showDate && <p className="text-slate-400 text-xs mt-1">Date: {data.date}</p>}
                </div>
            )}

            {design.sections.content && (
                <div className="space-y-6 text-justify leading-relaxed text-slate-700 text-sm max-w-3xl mx-auto">
                    <p>
                        This Service Agreement (the "Agreement") is made effective as of <strong>{data.date}</strong>, by and between <strong>{data.companyName || 'NovaCRM Inc.'}</strong> ("Service Provider"), and <strong>{data.relatedTo}</strong> ("Client").
                    </p>

                    <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider mt-8 mb-2" style={{ color: design.primaryColor }}>1. Description of Services</h3>
                    <p>
                        {data.executiveSummary || 'Service Provider will provide to Client the following services (collectively, the "Services"): Implementation of CRM software, Data migration, and Employee training.'}
                    </p>

                    <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider mt-8 mb-2" style={{ color: design.primaryColor }}>2. Payment</h3>
                    <p>
                        Payment shall be made to Service Provider in the total amount of <strong>{formatCurrency(total, currency)}</strong> upon completion of the Services.
                    </p>
                    <p>
                        {data.paymentTerms || "Payment terms are Net 30 from the date of invoice."}
                    </p>
                </div>
            )}

            {design.sections.signatures && (
                <div className="max-w-3xl mx-auto mt-16 grid grid-cols-2 gap-16">
                    <div>
                        <p className="font-bold text-slate-900 text-sm mb-8">Service Provider:</p>
                        <div className="h-px bg-slate-900 w-full mb-2"></div>
                        <p className="font-bold text-slate-900 text-xs">{data.companyName || 'NovaCRM Inc.'}</p>
                        <SignatureBlock data={data} color={design.primaryColor} />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 text-sm mb-8">Client:</p>
                        <div className="h-px bg-slate-900 w-full mb-2"></div>
                        <p className="font-bold text-slate-900 text-xs">{data.relatedTo}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export const InvoiceTemplate = ({ data, design = defaultDesign }: TemplateProps) => {
    const subtotal = data.investmentItems 
        ? data.investmentItems.reduce((acc, item) => acc + item.cost, 0)
        : 2000;
    const taxRate = data.taxRate || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    const currency = data.currency || 'USD';

    return (
        <div id="document-preview" className="bg-white text-slate-800 p-10 h-full overflow-y-auto shadow-sm font-sans min-h-[800px] flex flex-col">
            {design.sections.header && (
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter mb-2" style={{ color: design.primaryColor }}>{data.title || 'INVOICE'}</h1>
                        <p className="text-slate-500 text-lg">#{data.refNumber || 'INV-2024-001'}</p>
                    </div>
                    {design.showLogo && (
                        <div className="text-right">
                            <div className="text-xl font-bold text-slate-900">{data.companyName || 'NovaCRM Inc.'}</div>
                            <div className="text-slate-500 text-sm whitespace-pre-line">{data.companyAddress || '100 Innovation Dr.\nSan Francisco, CA 94105'}</div>
                        </div>
                    )}
                </div>
            )}

            {design.sections.details && (
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Billed To</h3>
                        <p className="text-xl font-bold text-slate-900">{data.relatedTo}</p>
                        <p className="text-slate-600 mt-1">123 Business Rd.<br/>Tech District, CA 94000</p>
                    </div>
                    <div className="space-y-4 text-right">
                        {design.showDate && (
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date Issued</h3>
                                <p className="text-slate-900 font-medium">{data.date}</p>
                            </div>
                        )}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amount Due</h3>
                            <p className="text-2xl font-bold" style={{ color: design.primaryColor }}>{formatCurrency(total, currency)}</p>
                        </div>
                    </div>
                </div>
            )}

            {design.sections.content && (
                <>
                    <table className="w-full mb-8">
                        <thead className="bg-slate-50 border-y border-slate-200">
                            <tr>
                                <th className="py-3 px-4 text-left font-bold text-slate-600 text-sm uppercase tracking-wider">Description</th>
                                <th className="py-3 px-4 text-right font-bold text-slate-600 text-sm uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(data.investmentItems || []).map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-4 px-4 font-medium text-slate-900">{item.description}</td>
                                    <td className="py-4 px-4 text-right font-bold text-slate-900">{formatCurrency(item.cost, currency)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end mb-16">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal, currency)}</span>
                            </div>
                            {taxRate > 0 && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Tax ({taxRate}%)</span>
                                    <span>{formatCurrency(taxAmount, currency)}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-slate-200 pt-2 text-xl font-bold text-slate-900">
                                <span>Total</span>
                                <span>{formatCurrency(total, currency)}</span>
                            </div>
                        </div>
                    </div>
                    {data.paymentTerms && (
                        <div className="text-xs text-slate-500 mt-auto border-t pt-4">
                            <p className="font-bold mb-1">Payment Terms:</p>
                            <p className="whitespace-pre-line">{data.paymentTerms}</p>
                        </div>
                    )}
                    {data.signature && (
                        <div className="mt-8 text-right">
                            <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider mb-2">Approved By</h4>
                            <SignatureBlock data={data} color={design.primaryColor} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export const NDATemplate = ({ data, design = defaultDesign }: TemplateProps) => (
    <div id="document-preview" className="bg-white text-slate-800 p-12 h-full overflow-y-auto shadow-sm font-serif min-h-[800px]">
        {design.sections.header && (
            <div className="text-center mb-12">
                {design.showLogo && (
                    <div className="flex justify-center mb-4">
                        <span style={{ color: design.primaryColor }}>
                            <IconLock className="w-10 h-10" />
                        </span>
                    </div>
                )}
                <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-widest border-b-2 pb-4 inline-block" style={{ borderColor: design.primaryColor }}>{data.title || 'Non-Disclosure Agreement'}</h1>
            </div>
        )}

        {design.sections.content && (
            <div className="max-w-3xl mx-auto space-y-6 text-justify leading-relaxed text-slate-700 text-sm">
                <p>
                    This Non-Disclosure Agreement (the "Agreement") is entered into as of <strong>{design.showDate ? data.date : '________'}</strong> (the "Effective Date"), by and between <strong>{data.companyName || 'NovaCRM Inc.'}</strong> ("Disclosing Party") and <strong>{data.relatedTo}</strong> ("Receiving Party").
                </p>

                <p>
                    {data.executiveSummary || '1. Purpose. The parties wish to explore a business opportunity of mutual interest and in connection with this opportunity, Disclosing Party may disclose to Receiving Party certain confidential technical and business information.'}
                </p>

                <p>
                    2. <strong>Confidential Information.</strong> "Confidential Information" means any information disclosed by Disclosing Party to Receiving Party, either directly or indirectly, in writing, orally or by inspection of tangible objects (including without limitation documents, prototypes, samples, plant and equipment).
                </p>

                <p>
                    3. <strong>Non-use and Non-disclosure.</strong> Receiving Party agrees not to use any Confidential Information for any purpose except to evaluate and engage in discussions concerning a potential business relationship between the parties. Receiving Party agrees not to disclose any Confidential Information to third parties or to such of its employees as are required to have the information in order to evaluate or engage in discussions concerning the contemplated business relationship.
                </p>
                
                {/* Dynamically render Scope items if present, treating them as additional clauses */}
                {data.scopeOfWork && data.scopeOfWork.length > 0 && (
                    <div className="mt-4">
                        {data.scopeOfWork.map((item, i) => (
                            <p key={i} className="mt-2">{4 + i}. <strong>Additional Term.</strong> {item}</p>
                        ))}
                    </div>
                )}
            </div>
        )}

        {design.sections.signatures && (
            <div className="max-w-3xl mx-auto mt-16 grid grid-cols-2 gap-16">
                <div>
                    <p className="font-bold text-slate-900 text-sm mb-8">Disclosing Party:</p>
                    <div className="h-px bg-slate-900 w-full mb-2"></div>
                    <p className="font-bold text-slate-900 text-xs">Name: {data.companyName || 'NovaCRM Inc.'}</p>
                    <p className="text-xs text-slate-500">Title: Authorized Representative</p>
                    <SignatureBlock data={data} color={design.primaryColor} />
                </div>
                <div>
                    <p className="font-bold text-slate-900 text-sm mb-8">Receiving Party:</p>
                    <div className="h-px bg-slate-900 w-full mb-2"></div>
                    <p className="font-bold text-slate-900 text-xs">Name: ______________________</p>
                    <p className="text-xs text-slate-500">Title: ______________________</p>
                </div>
            </div>
        )}
    </div>
);

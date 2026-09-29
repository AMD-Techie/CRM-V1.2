
import React from 'react';
import { IconGripVertical, IconBuilding, IconSearch, IconX, IconPlus, IconUser, IconMail, IconPhone } from './Icons';

interface SidebarItemProps {
    label: string;
    type: string;
    icon?: any;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ label, type, icon: Icon }) => (
    <div className="flex items-center p-3 bg-slate-800 rounded-lg cursor-move hover:bg-slate-700 transition-colors border border-slate-700 group shadow-sm">
        <IconGripVertical className="w-4 h-4 text-slate-500 mr-3 cursor-grab" />
        <div className="flex items-center gap-2">
            {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
            <span className="text-sm font-medium text-slate-200">{label}</span>
        </div>
        <span className="ml-auto text-[10px] text-slate-500 uppercase font-bold tracking-wider bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 group-hover:border-slate-600 transition-colors">{type}</span>
    </div>
);

const FormFieldPreview: React.FC<{ label: string; placeholder?: string; type?: string; hasAutocomplete?: boolean }> = ({ label, placeholder, type = "text", hasAutocomplete }) => (
    <div className="group relative border border-dashed border-slate-700 hover:border-primary-500/50 p-4 rounded-xl transition-all bg-slate-800/20 hover:bg-slate-800/50">
        <label className="block text-sm font-medium text-slate-400 mb-1.5 group-hover:text-primary-400 transition-colors">{label}</label>
        <div className="relative">
            <input 
                type={type} 
                disabled 
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-500 text-sm cursor-not-allowed"
            />
            {hasAutocomplete && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-10 hidden group-hover:block">
                    <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700 bg-slate-800/50">
                        Suggested Accounts
                    </div>
                    {['Acme Corp', 'Globex Inc', 'Soylent Corp'].map((acc, i) => (
                        <div key={i} className="px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 flex items-center justify-between">
                            <span>{acc}</span>
                            <IconBuilding className="w-3 h-3 text-slate-500" />
                        </div>
                    ))}
                </div>
            )}
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
            <button className="p-1 text-slate-400 hover:text-white"><IconX className="w-4 h-4" /></button>
        </div>
    </div>
);

const ContactLayoutEditor: React.FC = () => {
    return (
        <div className="flex h-full bg-[#0b1120] text-slate-100 overflow-hidden">
             {/* Field Library Sidebar */}
             <div className="w-80 bg-[#0f172a] border-r border-[#1e2330] flex flex-col flex-shrink-0">
                <div className="p-5 border-b border-[#1e2330] bg-[#0f172a]">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <IconPlus className="w-3.5 h-3.5" /> Field Library
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                    <div className="mt-4 mb-2 text-xs font-bold text-slate-600 uppercase tracking-wider px-1">Standard Fields</div>
                    <div className="space-y-2 mb-6">
                        <SidebarItem label="First Name" type="text" icon={IconUser} />
                        <SidebarItem label="Last Name" type="text" icon={IconUser} />
                        <SidebarItem label="Email" type="email" icon={IconMail} />
                        <SidebarItem label="Phone" type="tel" icon={IconPhone} />
                        <SidebarItem label="Job Title" type="text" />
                    </div>

                    <div className="mt-4 mb-2 text-xs font-bold text-slate-600 uppercase tracking-wider px-1">Relationships</div>
                    <div className="space-y-2 mb-6">
                        <SidebarItem label="Account Lookup" type="lookup" icon={IconBuilding} />
                        <SidebarItem label="Reports To" type="lookup" icon={IconUser} />
                    </div>

                    <div className="mt-4 mb-2 text-xs font-bold text-slate-600 uppercase tracking-wider px-1">Custom Fields</div>
                    <div className="space-y-2">
                        <SidebarItem label="Text Input" type="text" />
                        <SidebarItem label="Number" type="number" />
                        <SidebarItem label="Date Picker" type="date" />
                        <SidebarItem label="Dropdown" type="select" />
                        <SidebarItem label="Checkbox" type="boolean" />
                    </div>
                </div>
            </div>

            {/* Canvas / Preview Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
                <div className="p-5 border-b border-[#1e2330] flex justify-between items-center bg-[#0f172a]">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-500/10 p-2 rounded-lg text-primary-400">
                            <IconUser className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white">Create Contact Layout</h1>
                            <p className="text-xs text-slate-500">Drag fields from the library to configure the form layout.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancel</button>
                        <button className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-500 text-white rounded-lg shadow-lg shadow-primary-500/20 transition-all">Save Layout</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                                <h3 className="font-bold text-slate-200">General Information</h3>
                                <IconGripVertical className="w-4 h-4 text-slate-600 cursor-move" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <FormFieldPreview label="First Name" placeholder="e.g. Jane" />
                                <FormFieldPreview label="Last Name" placeholder="e.g. Doe" />
                                <FormFieldPreview label="Account Name" placeholder="Search accounts..." hasAutocomplete />
                                <FormFieldPreview label="Job Title" placeholder="e.g. VP Sales" />
                            </div>
                        </div>

                        <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                                <h3 className="font-bold text-slate-200">Contact Details</h3>
                                <IconGripVertical className="w-4 h-4 text-slate-600 cursor-move" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <FormFieldPreview label="Email Address" placeholder="jane@example.com" type="email" />
                                <FormFieldPreview label="Phone Number" placeholder="+1 (555) 000-0000" type="tel" />
                            </div>
                        </div>
                        
                        <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-slate-600 bg-slate-900/50 hover:bg-slate-900 transition-colors cursor-pointer">
                            <IconPlus className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-sm font-medium">Add New Section</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactLayoutEditor;

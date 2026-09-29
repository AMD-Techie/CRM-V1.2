import React, { useState } from 'react';
import { 
  IconBuilding, IconSettings, IconActivity, IconDatabase,
  IconCreditCard, IconUsers, IconCheckCircle, IconPlus,
  IconSearch, IconHardDrive, IconZap, IconLock, IconLayout, IconFileText
} from './Icons';

type Tab = 'overview' | 'config' | 'branding' | 'billing';

const MOCK_TENANTS = [
  { id: 't-1', name: 'Acme Corp', status: 'active', plan: 'Enterprise', region: 'us-east-1', users: 145 },
  { id: 't-2', name: 'Globex Inc', status: 'active', plan: 'Pro', region: 'eu-west-1', users: 32 },
  { id: 't-3', name: 'Soylent Corp', status: 'suspended', plan: 'Starter', region: 'us-west-2', users: 4 },
  { id: 't-4', name: 'Initech', status: 'active', plan: 'Enterprise', region: 'ap-south-1', users: 890 }
];

export default function TenantManagement() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('t-1');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedTenant = MOCK_TENANTS.find(t => t.id === selectedTenantId) || MOCK_TENANTS[0];

  const filteredTenants = MOCK_TENANTS.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 flex flex-col md:flex-row gap-6">
      
      {/* Left Sidebar - Tenant List */}
      <div className="w-full md:w-80 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[calc(100vh-100px)] sticky top-20">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
           <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <IconBuilding className="w-5 h-5 text-primary-600" />
              Tenancy Management
           </h2>
           <div className="relative">
             <IconSearch className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
             <input 
               type="text" 
               placeholder="Search tenants..."
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
             />
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
           {filteredTenants.map(tenant => (
              <button
                key={tenant.id}
                onClick={() => setSelectedTenantId(tenant.id)}
                className={`w-full text-left p-3 rounded-xl transition-colors flex items-center justify-between ${
                  selectedTenantId === tenant.id 
                    ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent'
                }`}
              >
                 <div>
                    <h3 className={`font-semibold ${selectedTenantId === tenant.id ? 'text-primary-700 dark:text-primary-400' : 'text-slate-900 dark:text-white'}`}>
                       {tenant.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                       <span className={`w-2 h-2 rounded-full ${tenant.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                       {tenant.plan}
                    </p>
                 </div>
                 <div className="text-right">
                    <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md">
                       {tenant.users} users
                    </span>
                 </div>
              </button>
           ))}
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
           <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-primary-600 dark:hover:bg-primary-700 text-white font-medium rounded-xl transition-colors">
              <IconPlus className="w-4 h-4" /> Provision New Tenant
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col space-y-6">
         {/* Tenant Header */}
         <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-8 flex items-start justify-between">
            <div>
               <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedTenant.name}</h1>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                     selectedTenant.status === 'active' 
                       ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                       : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                     {selectedTenant.status}
                  </span>
               </div>
               <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><IconDatabase className="w-4 h-4"/> Region: {selectedTenant.region}</span>
                  <span className="flex items-center gap-1.5"><IconLock className="w-4 h-4"/> Isolated Database Schema</span>
               </p>
            </div>
            <div className="text-right">
               <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Tenant ID</p>
               <p className="font-mono text-sm bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  {selectedTenant.id}
               </p>
            </div>
         </div>

         {/* Navigation Tabs */}
         <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
               onClick={() => setActiveTab('overview')}
               className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'overview' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
               <IconActivity className="w-4 h-4" /> Usage & Metering
            </button>
            <button
               onClick={() => setActiveTab('config')}
               className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'config' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
               <IconSettings className="w-4 h-4" /> Tenant Config & Isolation
            </button>
            <button
               onClick={() => setActiveTab('branding')}
               className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'branding' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
               <IconLayout className="w-4 h-4" /> Branding
            </button>
            <button
               onClick={() => setActiveTab('billing')}
               className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'billing' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
               <IconCreditCard className="w-4 h-4" /> Subscription & Plans
            </button>
         </div>

         {/* Content Area Based on Tab */}
         {activeTab === 'overview' && (
            <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                     <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                        <IconUsers className="w-5 h-5"/>
                     </div>
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Active Users</p>
                     <div className="flex items-end gap-2">
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{selectedTenant.users}</p>
                        <p className="text-sm text-slate-500 mb-1">/ {selectedTenant.plan === 'Enterprise' ? 'Unlimited' : '100'}</p>
                     </div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                     <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                        <IconZap className="w-5 h-5"/>
                     </div>
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">API Requests (Monthly)</p>
                     <div className="flex items-end gap-2">
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">1.2M</p>
                        <p className="text-sm text-slate-500 mb-1">/ 2M Limit</p>
                     </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                     <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                        <IconHardDrive className="w-5 h-5"/>
                     </div>
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Storage Used</p>
                     <div className="flex items-end gap-2">
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">45 GB</p>
                        <p className="text-sm text-slate-500 mb-1">/ 500 GB Limit</p>
                     </div>
                  </div>
               </div>

               <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Database Health & Isolation</h3>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 mb-4">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                           <IconDatabase className="w-6 h-6"/>
                        </div>
                        <div>
                           <p className="font-bold text-slate-900 dark:text-white">Schema: `tenant_{selectedTenant.id}`</p>
                           <p className="text-sm text-slate-500">Logical isolation inside shared cluster</p>
                        </div>
                     </div>
                     <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Healthy
                     </span>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'config' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
               <div className="p-6 md:p-8 space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tenant Configuration</h3>
                  
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Custom Domain</label>
                        <div className="flex gap-2">
                           <input type="text" defaultValue={`${selectedTenant.name.toLowerCase().replace(/\s/g, '-')}.novacrm.com`} className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                           <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors">Verify</button>
                        </div>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Residency Region</label>
                        <select defaultValue={selectedTenant.region} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                           <option value="us-east-1">US East (N. Virginia)</option>
                           <option value="us-west-2">US West (Oregon)</option>
                           <option value="eu-west-1">EU (Ireland)</option>
                           <option value="ap-south-1">Asia Pacific (Mumbai)</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-1">Cross-region migration requires downtime. Please schedule carefully.</p>
                     </div>

                     <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                        <label className="flex items-center justify-between mb-4">
                           <div>
                              <p className="font-semibold text-slate-900 dark:text-white">Single Sign-On (SSO)</p>
                              <p className="text-sm text-slate-500">Require SAML/OIDC for tenant authentication</p>
                           </div>
                           <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer bg-primary-600">
                               <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                           </div>
                        </label>
                        
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                           <div>
                              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Identity Provider Entity ID</label>
                              <input type="text" defaultValue="https://sts.windows.net/..." className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-white" />
                           </div>
                           <div>
                              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">SAML SSO URL</label>
                              <input type="text" defaultValue="https://login.microsoftonline.com/..." className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-white" />
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                     <button className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors shadow-sm">
                        Save Configuration
                     </button>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'branding' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-8">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Tenant Branding</h3>
               
               <div className="space-y-8">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company Logo</label>
                     <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center p-2">
                           {/* Placeholder Logo */}
                           <div className="w-full h-full bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center font-bold text-slate-400 text-sm overflow-hidden">
                              <IconBuilding className="w-8 h-8 opacity-50" />
                           </div>
                        </div>
                        <div>
                           <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors bg-white dark:bg-slate-800 shadow-sm mb-2">
                              Upload New Logo
                           </button>
                           <p className="text-xs text-slate-500">Recommended size: 256x256px. PNG or SVG.</p>
                        </div>
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Primary Color Theme</label>
                     <div className="flex gap-4">
                        <div className="relative">
                           <div className="w-10 h-10 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-900 cursor-pointer shadow-md">
                              <IconCheckCircle className="absolute inset-0 m-auto text-white w-5 h-5" />
                           </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500 hover:ring-4 ring-slate-100 dark:ring-slate-800 cursor-pointer transition-all shadow-sm"></div>
                        <div className="w-10 h-10 rounded-full bg-purple-600 hover:ring-4 ring-slate-100 dark:ring-slate-800 cursor-pointer transition-all shadow-sm"></div>
                        <div className="w-10 h-10 rounded-full bg-rose-500 hover:ring-4 ring-slate-100 dark:ring-slate-800 cursor-pointer transition-all shadow-sm"></div>
                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-300 hover:ring-4 ring-slate-100 dark:ring-slate-800 cursor-pointer transition-all shadow-sm flex items-center justify-center relative">
                           <span className="w-full h-px bg-red-500 absolute rotate-45 transform"></span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                     <button className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors shadow-sm">
                        Update Branding
                     </button>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'billing' && (
            <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Plan */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-700">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <p className="text-slate-400 text-sm font-medium">Current Plan</p>
                           <h2 className="text-3xl font-bold">{selectedTenant.plan}</h2>
                        </div>
                        <span className="bg-primary-500/20 text-primary-300 px-3 py-1 rounded-full text-xs font-bold border border-primary-500/30">Active</span>
                     </div>
                     <p className="text-4xl font-bold mb-6">
                        {selectedTenant.plan === 'Enterprise' ? '$999' : selectedTenant.plan === 'Pro' ? '$299' : '$49'}
                        <span className="text-lg text-slate-400 font-normal">/mo</span>
                     </p>
                     <ul className="space-y-3 text-sm text-slate-300 mb-8">
                        <li className="flex items-center gap-2"><IconCheckCircle className="w-4 h-4 text-emerald-400" /> {selectedTenant.plan === 'Enterprise' ? 'Unlimited' : 'Up to 100'} Users</li>
                        <li className="flex items-center gap-2"><IconCheckCircle className="w-4 h-4 text-emerald-400" /> {selectedTenant.plan === 'Enterprise' ? '2TB' : '500GB'} Storage</li>
                        <li className="flex items-center gap-2"><IconCheckCircle className="w-4 h-4 text-emerald-400" /> {selectedTenant.plan === 'Enterprise' ? '24/7 Phone Support' : 'Email Support'}</li>
                        {selectedTenant.plan === 'Enterprise' && <li className="flex items-center gap-2"><IconCheckCircle className="w-4 h-4 text-emerald-400" /> Dedicated Account Manager</li>}
                     </ul>
                     <button className="w-full py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl transition-colors">
                        Change Plan
                     </button>
                  </div>
                  
                  <div className="space-y-6">
                     <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Payment Method</h3>
                        <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                           <div className="flex items-center gap-3">
                              <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">VISA</div>
                              <div>
                                 <p className="font-medium text-slate-900 dark:text-white text-sm">•••• •••• •••• 4242</p>
                                 <p className="text-xs text-slate-500">Expires 12/26</p>
                              </div>
                           </div>
                           <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium text-sm">Edit</button>
                        </div>
                     </div>
                     
                     <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                           <h3 className="font-bold text-slate-900 dark:text-white">Recent Invoices</h3>
                           <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium text-sm">View All</button>
                        </div>
                        <div className="space-y-3">
                           {[
                              { date: 'May 01, 2026', amount: selectedTenant.plan === 'Enterprise' ? '$999.00' : '$299.00', status: 'Paid' },
                              { date: 'Apr 01, 2026', amount: selectedTenant.plan === 'Enterprise' ? '$999.00' : '$299.00', status: 'Paid' }
                           ].map((inv, i) => (
                              <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
                                 <div>
                                    <p className="font-medium text-sm text-slate-900 dark:text-white">{inv.date}</p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">{inv.status}</p>
                                 </div>
                                 <div className="flex items-center gap-3">
                                    <span className="font-medium text-slate-900 dark:text-white">{inv.amount}</span>
                                    <button className="p-1 text-slate-400 hover:text-primary-600 transition-colors">
                                       <IconFileText className="w-4 h-4" />
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
    </div>
  );
}

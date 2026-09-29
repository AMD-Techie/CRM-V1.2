import React, { useState } from 'react';
import { 
  IconShield, IconBot, IconDatabase, IconActivity, IconLock, 
  IconCheckCircle, IconSearch, IconKey, IconFileText, IconZap, 
  IconPlus, IconAlertTriangle, IconSettings
} from './Icons';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';

type Tab = 'dashboard' | 'logs' | 'policies' | 'models' | 'gateway';

const mockLogs = [
  { id: 'log-1', time: '10 min ago', user: 'Sarah J.', model: 'gpt-4', tokens: 1240, status: 'success', piiMasked: true, prompt: 'Generate sales email...' },
  { id: 'log-2', time: '15 min ago', user: 'Mike T.', model: 'gemini-pro', tokens: 840, status: 'success', piiMasked: false, prompt: 'Summarize meeting...' },
  { id: 'log-3', time: '45 min ago', user: 'System', model: 'claude-3', tokens: 4120, status: 'blocked', piiMasked: true, prompt: 'Extract patient data...' },
  { id: 'log-4', time: '1 hr ago', user: 'Alex W.', model: 'gpt-3.5', tokens: 350, status: 'success', piiMasked: false, prompt: 'Fix code snippet...' }
];

const mockCostData = [
  { name: 'Mon', gpt4: 45, gemini: 20, claude: 10 },
  { name: 'Tue', gpt4: 52, gemini: 25, claude: 15 },
  { name: 'Wed', gpt4: 38, gemini: 22, claude: 12 },
  { name: 'Thu', gpt4: 65, gemini: 30, claude: 18 },
  { name: 'Fri', gpt4: 48, gemini: 28, claude: 14 },
  { name: 'Sat', gpt4: 20, gemini: 10, claude: 5 },
  { name: 'Sun', gpt4: 22, gemini: 12, claude: 6 },
];

export default function AIGovernance() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center">
            <IconShield className="w-6 h-6 text-white dark:text-slate-900" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">AI Governance & Gateway</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400">Manage AI access scopes, audit trails, PII masking, and multi-model routing.</p>
      </header>

      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar">
        {[
          { id: 'dashboard', label: 'Overview & Costs', icon: IconActivity },
          { id: 'logs', label: 'Prompt Audit Logs', icon: IconFileText },
          { id: 'policies', label: 'Policies & PII', icon: IconLock },
          { id: 'models', label: 'Model Registry', icon: IconBot },
          { id: 'gateway', label: 'Gateway Config', icon: IconDatabase }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <main className="pt-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                 <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Token Usage (30d)</p>
                 <p className="text-3xl font-bold text-slate-900 dark:text-white">12.4M</p>
                 <p className="text-emerald-500 text-xs mt-2 flex items-center gap-1"><IconActivity className="w-3 h-3"/> +15% vs last month</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                 <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Estimated Cost (30d)</p>
                 <p className="text-3xl font-bold text-slate-900 dark:text-white">$845.20</p>
                 <p className="text-amber-500 text-xs mt-2 flex items-center gap-1">Approaching $1k budget limit</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                 <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">PII Masking Events</p>
                 <p className="text-3xl font-bold text-slate-900 dark:text-white">4,821</p>
                 <p className="text-emerald-500 text-xs mt-2">100% matched regex rules</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                 <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Blocked Requests</p>
                 <p className="text-3xl font-bold text-slate-900 dark:text-white">142</p>
                 <p className="text-slate-500 text-xs mt-2">Due to DLP policy violations</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Model Cost Analytics (USD)</h3>
               <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockCostData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                      />
                      <Legend />
                      <Bar dataKey="gpt4" name="GPT-4" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="gemini" name="Gemini Pro" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="claude" name="Claude 3" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 dark:bg-slate-900/50">
               <h3 className="font-bold text-slate-900 dark:text-white">AI Audit Trail & Prompts</h3>
               <div className="flex gap-2 w-full md:w-auto">
                 <div className="relative flex-1 md:w-64">
                   <IconSearch className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                   <input 
                     type="text" 
                     placeholder="Search Prompts or Users..."
                     className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                   />
                 </div>
                 <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    Export
                 </button>
               </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                     <tr>
                        <th className="px-6 py-3">Timestamp</th>
                        <th className="px-6 py-3">User / Identity</th>
                        <th className="px-6 py-3">Model</th>
                        <th className="px-6 py-3">Prompt Snippet</th>
                        <th className="px-6 py-3">Tokens</th>
                        <th className="px-6 py-3">Security</th>
                        <th className="px-6 py-3">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {mockLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                           <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{log.time}</td>
                           <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{log.user}</td>
                           <td className="px-6 py-4">
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs">
                                 {log.model}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{log.prompt}</td>
                           <td className="px-6 py-4 text-slate-500">{log.tokens.toLocaleString()}</td>
                           <td className="px-6 py-4">
                              {log.piiMasked ? (
                                 <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full w-max">
                                    <IconShield className="w-3 h-3" /> PII Masked
                                 </span>
                              ) : (
                                 <span className="text-xs text-slate-400">Clean</span>
                              )}
                           </td>
                           <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                 log.status === 'success' 
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                 {log.status === 'success' ? 'Allow' : 'Blocked'}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-center">
               <button className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline">View All Logs</button>
            </div>
          </div>
        )}

        {activeTab === 'policies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white dark:bg-slate-800 p-6 flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                   <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <IconLock className="w-5 h-5"/>
                   </div>
                   <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">PII Scrubber & Masking</h3>
                      <p className="text-xs text-slate-500">Automatically redaction of sensitive data before reaching LLMs</p>
                   </div>
                </div>
                <div className="space-y-4 flex-1">
                   {[
                      { name: 'Email Addresses', enabled: true },
                      { name: 'Phone Numbers', enabled: true },
                      { name: 'Credit Card (PCI)', enabled: true },
                      { name: 'Social Security Numbers (SSN)', enabled: true },
                      { name: 'Patient Health Info (PHI)', enabled: false },
                   ].map((policy, i) => (
                      <div key={i} className="flex justify-between items-center">
                         <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{policy.name}</span>
                         <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${policy.enabled ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                           <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${policy.enabled ? 'translate-x-4' : 'translate-x-1'}`} />
                         </div>
                      </div>
                   ))}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between">
                   <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"><IconPlus className="w-4 h-4"/> Custom Regex</button>
                   <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white text-sm font-medium rounded-lg transition-colors">Save Policies</button>
                </div>
             </div>

             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                   <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <IconAlertTriangle className="w-5 h-5"/>
                   </div>
                   <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">AI Access Scopes</h3>
                      <p className="text-xs text-slate-500">Role-based access control for AI features</p>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                      <p className="font-medium text-sm text-slate-900 dark:text-white mb-2">Executive Overview Gen (GPT-4)</p>
                      <select className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-2 focus:ring-primary-500">
                         <option>Managers & Above</option>
                         <option>All Users</option>
                         <option>Admins Only</option>
                      </select>
                   </div>
                   <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                      <p className="font-medium text-sm text-slate-900 dark:text-white mb-2">Email Drafting (Gemini Flash)</p>
                      <select className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-2 focus:ring-primary-500">
                         <option>All Users</option>
                         <option>Support & Sales Only</option>
                         <option>Admins Only</option>
                      </select>
                   </div>
                   <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                      <p className="font-medium text-sm text-slate-900 dark:text-white mb-2">Code Assistant</p>
                      <select className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-2 focus:ring-primary-500">
                         <option>Engineering Role</option>
                         <option>All Users</option>
                      </select>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'models' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div>
                   <h3 className="font-bold text-slate-900 dark:text-white">Active Model Routing</h3>
                   <p className="text-sm text-slate-500">Dynamically switch fallback models for cost and reliability.</p>
                </div>
                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2">
                   <IconPlus className="w-4 h-4" /> Add Provider API Key
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                   { name: 'Primary: OpenAI', model: 'GPT-4o', status: 'Healthy', latency: '420ms', icon: IconBot },
                   { name: 'Secondary: Google', model: 'Gemini 1.5 Pro', status: 'Healthy', latency: '350ms', icon: IconZap },
                   { name: 'Fallback: Anthropic', model: 'Claude 3.5 Sonnet', status: 'Testing', latency: '480ms', icon: IconShield },
                ].map((m, i) => (
                   <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start">
                         <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center">
                               <m.icon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                            </div>
                            <div>
                               <h4 className="font-bold text-slate-900 dark:text-white">{m.name}</h4>
                               <p className="text-xs text-slate-500">{m.model}</p>
                            </div>
                         </div>
                      </div>
                      <div className="p-5 bg-slate-50 dark:bg-slate-900/50 space-y-3">
                         <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Status</span>
                            <span className={`font-medium ${m.status === 'Healthy' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{m.status}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Latency Avg</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">{m.latency}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Rate Limit</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">10k RPM</span>
                         </div>
                      </div>
                      <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex justify-around">
                         <button className="text-slate-500 hover:text-primary-600 text-sm font-medium w-full py-1 transition-colors border-r border-slate-200 dark:border-slate-700">Test</button>
                         <button className="text-slate-500 hover:text-primary-600 text-sm font-medium w-full py-1 transition-colors">Config</button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'gateway' && (
           <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-12 text-center max-w-3xl mx-auto mt-8">
               <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center rounded-2xl mx-auto mb-6 transform rotate-3">
                  <IconDatabase className="w-10 h-10" />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Enterprise AI Gateway Architecture</h3>
               <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
                  All requests to LLMs are routed through the AI Gateway. This ensures consistent prompt templates, robust PII scrubbing, token rate limiting, semantic caching, and full audit logging across the organization.
               </p>
               <div className="space-y-3 max-w-md mx-auto text-left bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-sm shadow-inner text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-3"><IconCheckCircle className="w-4 h-4 text-emerald-500" /> Prompt Templates</div>
                  <div className="flex items-center gap-3"><IconCheckCircle className="w-4 h-4 text-emerald-500" /> PII Scrubber (Regex & ML Pattern)</div>
                  <div className="flex items-center gap-3"><IconCheckCircle className="w-4 h-4 text-emerald-500" /> Rate Limiter / Token Metering</div>
                  <div className="flex items-center gap-3"><IconCheckCircle className="w-4 h-4 text-emerald-500" /> Semantic AI Cache</div>
                  <div className="flex items-center gap-3"><IconCheckCircle className="w-4 h-4 text-emerald-500" /> Audit Logging (SIEM Exportable)</div>
               </div>
               <div className="mt-8">
                  <button className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                     View Gateway Docs
                  </button>
               </div>
           </div>
        )}
      </main>
    </div>
  );
}

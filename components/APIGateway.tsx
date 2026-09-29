import React, { useState } from 'react';
import { 
  IconSettings, IconActivity, IconDatabase, IconLock, 
  IconCheckCircle, IconSearch, IconKey, IconServer, 
  IconWebhook, IconRefreshCw, IconLink, IconBox, IconGlobe, IconAlertTriangle 
} from './Icons';

type Tab = 'dashboard' | 'marketplace' | 'webhooks' | 'retries' | 'settings';

const mockIntegrations = [
  { id: 'int-1', name: 'SAP ERP', category: 'ERP', importance: 'Critical', status: 'connected', latency: '45ms', throughput: '1.2k/min' },
  { id: 'int-2', name: 'SendGrid Email', category: 'Email', importance: 'Critical', status: 'connected', latency: '12ms', throughput: '4.5k/min' },
  { id: 'int-3', name: 'WhatsApp Business', category: 'Messaging', importance: 'High', status: 'degraded', latency: '120ms', throughput: '400/min' },
  { id: 'int-4', name: 'NetSuite Accounting', category: 'Accounting', importance: 'High', status: 'connected', latency: '85ms', throughput: '250/min' },
  { id: 'int-5', name: 'Workday HRMS', category: 'HRMS', importance: 'Medium', status: 'disconnected', latency: '-', throughput: '0/min' },
  { id: 'int-6', name: 'Shopify Plus', category: 'eCommerce', importance: 'Medium', status: 'connected', latency: '35ms', throughput: '800/min' }
];

const mockWebhooks = [
  { id: 'wh-1', name: 'Lead Created Sync', url: 'https://api.internal.corp/leads', events: ['lead.created'], status: 'active', successRate: 99.8 },
  { id: 'wh-2', name: 'ERP Order Dispatch', url: 'https://erp.acme.com/webhook/orders', events: ['deal.won'], status: 'active', successRate: 100 },
  { id: 'wh-3', name: 'Support Ticket Alert', url: 'https://pagerduty.com/api/...', events: ['ticket.escalated'], status: 'failing', successRate: 45.2 },
];

export default function APIGateway() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center">
            <IconServer className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">API Gateway & Integration Hub</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400">Enterprise middleware for webhooks, marketplace integrations, idempotency, and automated retries.</p>
      </header>

      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar">
        {[
          { id: 'dashboard', label: 'Gateway Overview', icon: IconActivity },
          { id: 'marketplace', label: 'Integration Marketplace', icon: IconBox },
          { id: 'webhooks', label: 'Webhook Engine', icon: IconWebhook },
          { id: 'retries', label: 'Retry Engine & DLQ', icon: IconRefreshCw },
          { id: 'settings', label: 'Idempotency & Auth', icon: IconKey }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
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
                 <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total API Calls (24h)</p>
                 <p className="text-3xl font-bold text-slate-900 dark:text-white">45.2M</p>
                 <p className="text-emerald-500 text-xs mt-2 flex items-center gap-1"><IconActivity className="w-3 h-3"/> +12% vs yesterday</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                 <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Avg Gateway Latency</p>
                 <p className="text-3xl font-bold text-slate-900 dark:text-white">24ms</p>
                 <p className="text-slate-500 text-xs mt-2">P99: 85ms</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                 <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Active Integrations</p>
                 <p className="text-3xl font-bold text-slate-900 dark:text-white">14</p>
                 <p className="text-slate-500 text-xs mt-2">Across 6 categories</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-amber-500">
                 <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Pending Retries / DLQ</p>
                 <p className="text-3xl font-bold text-slate-900 dark:text-white">1,420</p>
                 <p className="text-amber-500 text-xs mt-2">Queue slightly elevated</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Traffic Routing Overview</h3>
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl font-mono text-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-12 text-slate-600 dark:text-slate-300">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-2 mx-auto">
                                <IconGlobe className="w-8 h-8 text-indigo-500" />
                            </div>
                            <span>External Apps</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full mb-1">45.2M / day</span>
                            <div className="w-24 h-0.5 bg-indigo-500 relative">
                                <div className="absolute right-0 -top-[3px] w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-[6px] border-l-indigo-500"></div>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="w-24 h-24 bg-indigo-600 rounded-xl shadow-lg border-2 border-indigo-400 flex flex-col items-center justify-center mb-2 mx-auto text-white">
                                <IconServer className="w-8 h-8 mb-1" />
                                <span className="font-bold text-xs">API Gateway</span>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">Idempotency & Load Balancing</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-0.5 bg-slate-300 dark:bg-slate-600 relative">
                                <div className="absolute right-0 -top-[3px] w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-[6px] border-l-slate-300 dark:border-l-slate-600"></div>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-2 mx-auto">
                                <IconDatabase className="w-8 h-8 text-slate-500" />
                            </div>
                            <span>Nova CRM Core Service</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
               <div className="relative flex-1 max-w-md">
                   <IconSearch className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                   <input 
                     type="text" 
                     placeholder="Search Integrations (e.g., Salesforce, SAP, Stripe)..."
                     className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                   />
               </div>
               <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm">
                  Connect New App
               </button>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
               <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                     <tr>
                        <th className="px-6 py-3">Integration Name</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Importance</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Latency</th>
                        <th className="px-6 py-3">Throughput</th>
                        <th className="px-6 py-3"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {mockIntegrations.map(integration => (
                        <tr key={integration.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                           <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                   <IconBox className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                               </div>
                               {integration.name}
                           </td>
                           <td className="px-6 py-4 text-slate-500">
                              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">
                                 {integration.category}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                               <span className={`px-2 py-1 rounded text-xs font-bold ${integration.importance === 'Critical' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' : integration.importance === 'High' ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'}`}>
                                   {integration.importance}
                               </span>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`flex items-center gap-1.5 text-xs font-medium w-max px-2 py-1 rounded-full ${
                                 integration.status === 'connected' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                 integration.status === 'degraded' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                 <span className={`w-1.5 h-1.5 rounded-full ${integration.status === 'connected' ? 'bg-emerald-500' : integration.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                 <span className="capitalize">{integration.status}</span>
                              </span>
                           </td>
                           <td className="px-6 py-4 text-slate-500 font-mono text-xs">{integration.latency}</td>
                           <td className="px-6 py-4 text-slate-500 font-mono text-xs">{integration.throughput}</td>
                           <td className="px-6 py-4 text-right">
                               <button className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium">Configure</button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div className="space-y-6">
              <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Webhook Engine</h3>
                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center gap-2">
                    <IconLink className="w-4 h-4" /> Add Webhook Destination
                  </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                  {mockWebhooks.map(wh => (
                      <div key={wh.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                  <h4 className="font-bold text-slate-900 dark:text-white">{wh.name}</h4>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${wh.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                      {wh.status === 'active' ? 'Active' : 'Failing'}
                                  </span>
                              </div>
                              <p className="text-slate-500 font-mono text-xs mb-3 flex items-center gap-1">
                                  <IconWebhook className="w-3 h-3" /> POST {wh.url}
                              </p>
                              <div className="flex gap-2">
                                  {wh.events.map(ev => (
                                      <span key={ev} className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-mono">
                                          {ev}
                                      </span>
                                  ))}
                              </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 md:w-48 text-right border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-700 pt-4 md:pt-0 md:pl-4 mt-4 md:mt-0 w-full md:w-auto">
                              <div>
                                  <p className="text-xs text-slate-500 mb-1">Success Rate (24h)</p>
                                  <p className={`text-xl font-bold ${wh.successRate > 95 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                      {wh.successRate}%
                                  </p>
                              </div>
                              <div className="flex gap-3 text-sm mt-1">
                                  <button className="text-slate-500 hover:text-indigo-600 transition-colors">Logs</button>
                                  <button className="text-slate-500 hover:text-indigo-600 transition-colors">Edit</button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
        )}

        {activeTab === 'retries' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <IconRefreshCw className="w-5 h-5 text-indigo-500" />
                                Dead Letter Queue (DLQ)
                            </h3>
                            <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors text-slate-700 dark:text-slate-300 shadow-sm">
                                Replay All
                            </button>
                        </div>
                        <div className="p-0">
                            {[
                                { id: 'evt-991', dest: 'SAP ERP', type: 'deal.won', error: 'Connection Timeout', attempts: 4, nextRetry: 'in 5m' },
                                { id: 'evt-992', dest: 'Workday HRMS', type: 'user.created', error: 'HTTP 503 Service Unavailable', attempts: 2, nextRetry: 'in 15m' },
                                { id: 'evt-993', dest: 'Custom Webhook #3', type: 'ticket.escalated', error: 'HTTP 401 Unauthorized', attempts: 8, nextRetry: 'Paused' },
                            ].map(err => (
                                <div key={err.id} className="p-4 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold text-sm text-slate-900 dark:text-white">{err.dest} <span className="text-slate-400 font-normal ml-2 font-mono text-xs">{err.id}</span></span>
                                        <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs px-2 py-0.5 rounded border border-red-100 dark:border-red-800">{err.error}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs font-mono text-slate-500 mb-1">{err.type}</p>
                                            <p className="text-xs text-slate-500">Attempts: <span className="font-medium text-slate-700 dark:text-slate-300">{err.attempts} / 10</span></p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-500">Next retry: <span className="font-medium">{err.nextRetry}</span></span>
                                            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 py-1 px-2 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">Replay Now</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Retry Configuration</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Max Retry Attempts</label>
                                <select defaultValue="10 Attempts" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option>5 Attempts</option>
                                    <option>10 Attempts</option>
                                    <option>15 Attempts</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Backoff Strategy</label>
                                <select defaultValue="Exponential Backoff (w/ Jitter)" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option>Linear Backoff (5m)</option>
                                    <option>Exponential Backoff (w/ Jitter)</option>
                                    <option>Fixed Interval (10m)</option>
                                </select>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-xl text-sm transition-colors">Save Settings</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <IconKey className="w-5 h-5"/>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">API Authentication Keys</h3>
                            <p className="text-sm text-slate-500">Manage API keys used by external systems to hit your Gateway.</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div>
                                <h4 className="font-medium text-sm text-slate-900 dark:text-white">Production ERP Integration Key</h4>
                                <p className="text-xs font-mono text-slate-500 mt-1">pk_live_**********************82a</p>
                            </div>
                            <button className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 transition-colors">Revoke</button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div>
                                <h4 className="font-medium text-sm text-slate-900 dark:text-white">Zapier Connector Key</h4>
                                <p className="text-xs font-mono text-slate-500 mt-1">pk_live_**********************991</p>
                            </div>
                            <button className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 transition-colors">Revoke</button>
                        </div>
                    </div>
                    
                    <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 font-medium text-slate-900 dark:text-white rounded-xl transition-colors text-sm shadow-sm">
                        Generate New API Key
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <IconCheckCircle className="w-5 h-5"/>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Idempotency Controls</h3>
                            <p className="text-sm text-slate-500">Prevent duplicate processing for safe retries.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer bg-emerald-500 mt-0.5">
                                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-900 dark:text-white">Require Idempotency-Key Header</h4>
                                <p className="text-sm text-slate-500 mt-1">All POST/PATCH requests to the Gateway must include a unique <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded font-mono text-xs">Idempotency-Key</code> header to prevent double execution.</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Key Retention Period</label>
                            <select defaultValue="7 Days" className="w-full max-w-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
                                <option>24 Hours</option>
                                <option>7 Days</option>
                                <option>30 Days</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  IconShield, IconFileText, IconDownload, IconFilter, IconSearch, 
  IconCalendar, IconLock, IconHistory, IconSettings, IconAlertTriangle 
} from './Icons';

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'Login' | 'Data Export' | 'Permission Change' | 'Record Deletion' | 'AI Generation' | 'System';
  actor: string;
  ip: string;
  status: 'Success' | 'Failed' | 'Blocked';
  details: string;
}

const mockLogs: AuditLog[] = [
  { id: 'log-1', timestamp: '2023-10-27T14:32:01', action: 'User Login', category: 'Login', actor: 'sarah.c@company.com', ip: '192.168.1.104', status: 'Success', details: 'SSO Login via Azure AD' },
  { id: 'log-2', timestamp: '2023-10-27T13:15:22', action: 'Lead Export', category: 'Data Export', actor: 'david.w@company.com', ip: '198.51.100.22', status: 'Success', details: 'Exported 1,245 leads to CSV. Hash: a2b4c6x9' },
  { id: 'log-3', timestamp: '2023-10-27T11:45:00', action: 'Delete Account', category: 'Record Deletion', actor: 'admin@company.com', ip: '203.0.113.45', status: 'Success', details: 'Deleted Acc-8842 (Test Corp) permanently.' },
  { id: 'log-4', timestamp: '2023-10-26T16:20:11', action: 'Role Update', category: 'Permission Change', actor: 'superadmin@company.com', ip: '10.0.0.5', status: 'Success', details: 'Changed david.w@company.com from Sales Rep to Sales Manager' },
  { id: 'log-5', timestamp: '2023-10-26T15:10:05', action: 'Generate Proposal', category: 'AI Generation', actor: 'sarah.c@company.com', ip: '192.168.1.104', status: 'Success', details: 'Generated Enterprise Contract for Deal #304' },
  { id: 'log-6', timestamp: '2023-10-26T09:05:00', action: 'Unauthorized Access', category: 'Login', actor: 'unknown (failed auth)', ip: '45.33.22.11', status: 'Blocked', details: 'Failed MFA challenge 3 times' },
];

const AuditLogs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'logs' | 'retention' | 'reports'>('logs');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredLogs = mockLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center">
              <IconShield className="w-6 h-6 text-white dark:text-slate-900" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Audit & Compliance</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">Immutable logging, retention policies, and compliance reporting.</p>
        </div>
        {activeTab === 'logs' && (
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors flex items-center gap-2">
            <IconDownload className="w-4 h-4" /> Export Logs
          </button>
        )}
      </header>

      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'logs' ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <IconHistory className="w-4 h-4" />
          Immutable Activity Logs
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'reports' ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <IconFileText className="w-4 h-4" />
          Compliance Reporting
        </button>
        <button
          onClick={() => setActiveTab('retention')}
          className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'retention' ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <IconSettings className="w-4 h-4" />
          Retention Policies
        </button>
      </div>

      <main className="pt-6">
        {activeTab === 'logs' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-wrap gap-4 items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="relative flex-1 max-w-md">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search logs by actor, action, or category..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" 
                />
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                  <IconCalendar className="w-4 h-4" /> Last 7 Days
                </button>
                <button className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                  <IconFilter className="w-4 h-4" /> Filters
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/80 sticky top-0 backdrop-blur-md z-10 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Timestamp</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action & Category</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actor & IP Address</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit'
                        })}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{log.action}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {log.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{log.actor}</p>
                        <p className="font-mono text-xs text-slate-500 mt-1">{log.ip}</p>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          log.status === 'Success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                          log.status === 'Failed' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                          'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLogs.length === 0 && (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
                   <IconSearch className="w-8 h-8 opacity-20 mb-3" />
                   No logs found matching your search.
                </div>
              )}
            </div>
            {/* Blockchain / Immutable indicator */}
            <div className="bg-slate-50 dark:bg-slate-900 p-3 flex justify-center items-center gap-2 border-t border-slate-200 dark:border-slate-800">
               <IconLock className="w-3.5 h-3.5 text-emerald-500" />
               <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Logs are cryptographically hashed and immutable</span>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'SOC 2 Access Report', desc: 'Summary of all access controls, role changes, and MFA events.', date: 'Generated Oct 25' },
              { title: 'Data Export Audit', desc: 'Log of all bulk API operations and CSV exports across the instance.', date: 'Generated Oct 20' },
              { title: 'GDPR / CCPA Deletions', desc: 'Record of hard-deleted accounts and sanitized contacts.', date: 'Generated Oct 18' },
              { title: 'AI Usage Logs', desc: 'Traceability of all system actions performed by AI agents.', date: 'Generated Oct 15' }
            ].map(report => (
              <div key={report.title} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3 group hover:border-primary-400 transition-colors cursor-pointer">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl w-fit">
                  <IconFileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{report.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 flex-1">{report.desc}</p>
                <div className="pt-4 mt-auto border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs font-medium">
                  <span className="text-slate-400">{report.date}</span>
                  <span className="text-primary-600 dark:text-primary-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <IconDownload className="w-3.5 h-3.5" /> PDF
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'retention' && (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 max-w-3xl">
             <div className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/30">
                <IconAlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400">Data Retention Warning</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-500/80 mt-1">
                    Changing retention policies will automatically purge data older than the new threshold on the next nightly run. This action cannot be reversed.
                  </p>
                </div>
             </div>

             <div className="space-y-5">
                <div className="grid grid-cols-[1fr,200px] items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800">
                   <div>
                     <p className="font-bold text-slate-900 dark:text-white">Audit Logs</p>
                     <p className="text-sm text-slate-500">How long to keep immutable action logs.</p>
                   </div>
                   <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white">
                      <option>1 Year</option>
                      <option>3 Years</option>
                      <option>7 Years</option>
                      <option>Indefinitely</option>
                   </select>
                </div>

                <div className="grid grid-cols-[1fr,200px] items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800">
                   <div>
                     <p className="font-bold text-slate-900 dark:text-white">Communication Records</p>
                     <p className="text-sm text-slate-500">Emails, SMS, and WhatsApp chat history.</p>
                   </div>
                   <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white">
                      <option>6 Months</option>
                      <option>1 Year</option>
                      <option>3 Years</option>
                   </select>
                </div>

                <div className="grid grid-cols-[1fr,200px] items-center gap-4 py-3">
                   <div>
                     <p className="font-bold text-slate-900 dark:text-white">Deleted Entities</p>
                     <p className="text-sm text-slate-500">Soft-deleted items before permanent purge.</p>
                   </div>
                   <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white">
                      <option>30 Days</option>
                      <option>90 Days</option>
                      <option>180 Days</option>
                   </select>
                </div>

                <div className="pt-4">
                  <button className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors">
                    Save Policies
                  </button>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AuditLogs;

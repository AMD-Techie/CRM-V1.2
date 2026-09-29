import React, { useState } from 'react';
import { IconSettings, IconCheckCircle, IconClock, IconZap, IconPlus, IconArrowRight, IconMessageSquare, IconMail, IconPhone, IconBell, IconRepeat } from './Icons';
import { ConnectEmail } from './ConnectEmail';
import { EmailTemplates } from './EmailTemplates';
import { EmailSync } from './EmailSync';
import { Contact, Task, Lead } from '../types';

interface CommChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push' | 'webhook';
  status: 'active' | 'inactive' | 'error';
  queueSize: number;
  deliveryRate: string;
}

interface CommunicationHubProps {
  contacts?: Contact[];
  setContacts?: React.Dispatch<React.SetStateAction<Contact[]>>;
  tasks?: Task[];
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  leads?: Lead[];
  setLeads?: React.Dispatch<React.SetStateAction<Lead[]>>;
}

const mockChannels: CommChannel[] = [
  { id: '1', name: 'SendGrid Production', type: 'email', status: 'active', queueSize: 12, deliveryRate: '99.8%' },
  { id: '2', name: 'Twilio SMS', type: 'sms', status: 'active', queueSize: 0, deliveryRate: '98.5%' },
  { id: '3', name: 'WhatsApp Business API', type: 'whatsapp', status: 'active', queueSize: 45, deliveryRate: '99.1%' },
  { id: '4', name: 'FCM Push Notifications', type: 'push', status: 'active', queueSize: 0, deliveryRate: '99.9%' },
  { id: '5', name: 'External Webhook Engine', type: 'webhook', status: 'active', queueSize: 200, deliveryRate: '100%' },
];

const CommunicationHub: React.FC<CommunicationHubProps> = ({ 
  contacts = [], 
  setContacts = () => {}, 
  tasks = [], 
  setTasks = () => {},
  leads = [],
  setLeads = () => {}
}) => {
  const [activeTab, setActiveTab] = useState<'channels' | 'connect_email' | 'email_templates' | 'queues' | 'email_sync'>('email_sync');

  const getIcon = (type: CommChannel['type']) => {
    switch (type) {
      case 'email': return <IconMail className="w-5 h-5 text-blue-500" />;
      case 'sms': return <IconPhone className="w-5 h-5 text-emerald-500" />;
      case 'whatsapp': return <IconMessageSquare className="w-5 h-5 text-emerald-400" />;
      case 'push': return <IconBell className="w-5 h-5 text-amber-500" />;
      case 'webhook': return <IconRepeat className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Notification & Communication Hub</h1>
        <p className="text-slate-500 dark:text-slate-400">Centralized architecture for multi-channel message delivery and queues.</p>
      </header>

      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('email_sync')}
          className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'email_sync' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <IconMail className="w-4 h-4 text-indigo-500" />
          Email Sync
        </button>
        <button
          onClick={() => setActiveTab('connect_email')}
          className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'connect_email' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <IconMail className="w-4 h-4 text-indigo-500 animate-pulse" />
          Connect Professional Email
        </button>
        <button
          onClick={() => setActiveTab('email_templates')}
          className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'email_templates' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <svg className="w-4 h-4 text-indigo-505 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Email Templates (Outreach)
        </button>
        <button
          onClick={() => setActiveTab('channels')}
          className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'channels' ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <IconSettings className="w-4 h-4" />
          Active Channels
        </button>
        <button
          onClick={() => setActiveTab('queues')}
          className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'queues' ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <IconZap className="w-4 h-4" />
          Queue Management
        </button>
      </div>

      <main className="pt-6">
        {activeTab === 'email_sync' && (
          <EmailSync
            contacts={contacts}
            setContacts={setContacts}
            leads={leads}
            setLeads={setLeads}
          />
        )}

        {activeTab === 'connect_email' && (
          <ConnectEmail
            contacts={contacts}
            setContacts={setContacts}
            tasks={tasks}
            setTasks={setTasks}
          />
        )}

        {activeTab === 'email_templates' && (
          <EmailTemplates contacts={contacts} />
        )}

        {activeTab === 'channels' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Configured Providers</h2>
              <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 text-sm">
                <IconPlus className="w-4 h-4" /> Connect Provider
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockChannels.map(channel => (
                <div key={channel.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                      {getIcon(channel.type)}
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${channel.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                      {channel.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{channel.name}</h3>
                    <p className="text-sm text-slate-500 uppercase tracking-widest mt-1 font-mono text-[10px]">{channel.type}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">Delivery Rate</p>
                      <p className="font-medium text-slate-900 dark:text-white">{channel.deliveryRate}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-slate-500 dark:text-slate-400 text-xs">In Queue</p>
                       <p className="font-medium text-slate-900 dark:text-white">{channel.queueSize}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'queues' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100 dark:border-slate-700">
               <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Queues</h2>
             </div>
             <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Queue Name</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Messages</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Throughput</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mockChannels.map(channel => (
                     <tr key={channel.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                            {getIcon(channel.type)}
                            {channel.type.toUpperCase()}_QUEUE
                        </td>
                        <td className="p-4">
                           <span className="font-mono text-sm dark:text-slate-300">{channel.queueSize}</span>
                        </td>
                        <td className="p-4 text-sm text-slate-500 dark:text-slate-400">~120 msg/sec</td>
                        <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse"></span>
                                Processing
                            </span>
                        </td>
                        <td className="p-4 text-right">
                           <button className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">View Logs</button>
                        </td>
                     </tr>
                  ))}
              </tbody>
             </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default CommunicationHub;

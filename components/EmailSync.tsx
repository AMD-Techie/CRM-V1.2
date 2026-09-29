import React, { useState, useEffect } from 'react';
import { Contact, Lead, Activity } from '../types';
import { 
  IconMail, 
  IconRefreshCw, 
  IconCheckCircle, 
  IconAlertCircle, 
  IconInfo, 
  IconLink, 
  IconActivity, 
  IconMessageCircle, 
  IconSettings, 
  IconUser, 
  IconSparkles, 
  IconCheck, 
  IconPlus,
  IconClock
} from './Icons';

interface EmailSyncProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

interface EmailThread {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  status: 'unlinked' | 'linking' | 'linked';
  linkedAt?: string;
  snippet: string;
}

const INITIAL_THREADS: EmailThread[] = [
  {
    id: 'th-1',
    senderName: 'Sarah Connor',
    senderEmail: 'sarah@skynet.com',
    subject: 'Re: Security Framework Integration Proposal',
    body: `Hi Alex,

Thanks for the proposal draft you sent over last Tuesday. Our technical review board spent some time discussing the multi-tenant architecture and data isolation standards of NovaCRM. 

We raised a few questions about the direct database mapping and how backup encryptions are isolated. Let's make sure these security concerns are addressed in our next touchpoint. We want to align this with our Q3 implementation timeline. 

I am sending you our audit checklist PDF so your engineering team can review our requirements beforehand. Let's schedule a 30-minute sync to finalize these points.

Best regards,
Sarah Connor
CTO, SkyNet Systems`,
    timestamp: '2026-06-20T08:30:00Z',
    isRead: false,
    status: 'unlinked',
    snippet: 'Our technical review board spent some time discussing the multi-tenant architecture...'
  },
  {
    id: 'th-2',
    senderName: 'Ellen Ripley',
    senderEmail: 'ripley@weyland.com',
    subject: 'Fleet Logistics Integration - Telemetry Dashboard',
    body: `Hello Alex,

I read through your tracking software product description. We have unique operational circumstances on our outbound transport vessels where satellite coverage is patchy at best. 

Can we arrange a call this Wednesday at 14:00 standard time? The crew requires a solid sandbox demo of how the offline telemetry cache works and synchronizes once back in broadband range. 

If this slot works for you, please let me know and provide a calendar invite link.

Safe travels,
Ellen Ripley
Operations Lead, Weyland-Yutani Corp`,
    timestamp: '2026-06-19T14:15:00Z',
    isRead: true,
    status: 'unlinked',
    snippet: 'The crew requires a solid sandbox demo of how the offline telemetry cache works...'
  },
  {
    id: 'th-3',
    senderName: 'Miles Dyson',
    senderEmail: 'miles@cyberdyne.com',
    subject: 'Partnership Agreement Updates',
    body: `Hi Alex,

Our legal division has completed their second-pass review of the joint CRM integration agreement. Everything looks clean, and the budget allocation is officially authorized by our VP. 

I am ready to process the e-signatures on our portal once you deploy the final, validated agreement file. Please send over the updated PDF as soon as your executive sponsorship signs off. 

We are excited to build this integration together!

Best,
Miles Dyson
Director of Technology, Cyberdyne Systems`,
    timestamp: '2026-06-18T11:05:00Z',
    isRead: true,
    status: 'linked',
    linkedAt: '2026-06-18T16:00:00Z',
    snippet: 'Our legal division has completed their second-pass review of the joint CRM integration...'
  },
  {
    id: 'th-4',
    senderName: 'Richard Hendricks',
    senderEmail: 'richard@piedpiper.com',
    subject: 'Legacy Database Porting & Sync Adapters',
    body: `Hello,

I'm Richard from Pied Piper. We're looking for a CRM solution that can seamlessly link and mirror our proprietary compression core metrics. 

Do you have a dedicated migration pipeline or custom API adapters for indexing highly structured customer record files? Our relational tables are fairly non-standard, so the sync must be flexible. 

If you guys support custom database listeners or micro-sync daemons, please let me know. 

Thanks,
Richard Hendricks
CEO, Pied Piper`,
    timestamp: '2026-06-20T09:12:00Z',
    isRead: false,
    status: 'unlinked',
    snippet: 'We\'re looking for a CRM solution that can seamlessly link and mirror our proprietary compression core...'
  }
];

export const EmailSync: React.FC<EmailSyncProps> = ({ contacts, setContacts, leads, setLeads }) => {
  const [threads, setThreads] = useState<EmailThread[]>(() => {
    const saved = localStorage.getItem('crm_synchronized_email_threads');
    return saved ? JSON.parse(saved) : INITIAL_THREADS;
  });

  const [selectedId, setSelectedId] = useState<string>(INITIAL_THREADS[0].id);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [SYSTEM] Sync engine loaded.`
  ]);
  const [isLinkingMap, setIsLinkingMap] = useState<{ [key: string]: boolean }>({});
  const [autoLinkEnabled, setAutoLinkEnabled] = useState<boolean>(true);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('crm_synchronized_email_threads', JSON.stringify(threads));
  }, [threads]);

  const activeThread = threads.find(t => t.id === selectedId) || threads[0];

  const handleSyncInbox = () => {
    setIsSyncing(true);
    setSyncLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [IMAP] Initiating connection to secure SMTP/IMAP servers...`,
      `[${new Date().toLocaleTimeString()}] [SECURE] TLS handshake completed. Certificate status: Verified.`,
    ]);

    setTimeout(() => {
      setSyncLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [DISCOVERY] Scanning incoming folder folders...`,
        `[${new Date().toLocaleTimeString()}] [RESOLVER] Mapping sender addresses against registered CRM contacts...`
      ]);
    }, 1000);

    setTimeout(() => {
      // Find matches
      let matchedCount = 0;
      let unresolvedCount = 0;

      threads.forEach(t => {
        const contactExists = contacts.some(c => c.email.toLowerCase() === t.senderEmail.toLowerCase());
        if (contactExists) matchedCount++;
        else unresolvedCount++;
      });

      setSyncLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [RESOLVER] Found ${matchedCount} verified CRM contacts in recent mail.`,
        `[${new Date().toLocaleTimeString()}] [RESOLVER] Detected ${unresolvedCount} unmapped sender thread (Richard Hendricks).`,
        `[${new Date().toLocaleTimeString()}] [SYSTEM] Synchronization cycle complete.`
      ]);
      setIsSyncing(false);
      showToast('Inbox check succeeded! Checked 4 email threads.');
    }, 2200);
  };

  const showToast = (message: string) => {
    setShowNotification(message);
    setTimeout(() => setShowNotification(null), 4000);
  };

  const handleLinkThread = (thread: EmailThread) => {
    // Check if matching contact and lead exists
    const matchingContact = contacts.find(c => c.email.toLowerCase() === thread.senderEmail.toLowerCase());
    
    if (!matchingContact) {
      showToast(`Cannot link thread. No existing contact found for ${thread.senderEmail}. Try promoting to contact first.`);
      return;
    }

    const matchingLead = leads.find(l => l.email.toLowerCase() === thread.senderEmail.toLowerCase());
    
    if (!matchingLead) {
      showToast(`Contact matches "${matchingContact.name}" but no corresponding active Lead found! Create a Lead to link.`);
      return;
    }

    setIsLinkingMap(prev => ({ ...prev, [thread.id]: true }));

    // Simulate database mapping delay
    setTimeout(() => {
      // 1. Update matching Lead's activities
      const newActivity: Activity = {
        id: `act-email-sync-${Date.now()}`,
        type: 'email_sent',
        description: `Linked Synchronized Email Thread (IMAP) - Subject: "${thread.subject}" - Brief body summary: ${thread.snippet}`,
        timestamp: new Date().toISOString()
      };

      setLeads(prevLeads => prevLeads.map(lead => {
        if (lead.id === matchingLead.id) {
          const originalActivities = lead.activities || [];
          // Ensure activity not already duplicated
          const exists = originalActivities.some(a => a.description.includes(thread.subject));
          if (exists) return lead;
          return {
            ...lead,
            activities: [newActivity, ...originalActivities],
            lastContact: new Date().toISOString().split('T')[0]
          };
        }
        return lead;
      }));

      // 2. Mark this thread as linked in our list
      setThreads(prevThreads => prevThreads.map(t => {
        if (t.id === thread.id) {
          return {
            ...t,
            status: 'linked',
            linkedAt: new Date().toISOString()
          };
        }
        return t;
      }));

      setIsLinkingMap(prev => ({ ...prev, [thread.id]: false }));
      showToast(`Thread linked successfully! Activity logged in Lead: ${matchingLead.name}'s Timeline.`);
    }, 1200);
  };

  const handleCreateContactAndLead = (thread: EmailThread) => {
    // 1. Create matching contact
    const contactId = `c-new-${Date.now()}`;
    const newContact: Contact = {
      id: contactId,
      name: thread.senderName,
      firstName: thread.senderName.split(' ')[0] || thread.senderName,
      lastName: thread.senderName.split(' ').slice(1).join(' ') || '',
      email: thread.senderEmail,
      phone: '555-4422 (Imported)',
      company: 'Pied Piper',
      title: 'CEO',
      status: 'Active',
      owner: 'Alex Chen'
    };

    setContacts(prev => [...prev, newContact]);

    // 2. Create matching Lead
    const leadId = `l-new-${Date.now()}`;
    const newLead: Lead = {
      id: leadId,
      name: thread.senderName,
      firstName: thread.senderName.split(' ')[0] || thread.senderName,
      lastName: thread.senderName.split(' ').slice(1).join(' ') || '',
      email: thread.senderEmail,
      company: 'Pied Piper',
      phone: '555-4422 (Imported)',
      status: 'New',
      industry: 'Technology',
      score: 75,
      scoreBreakdown: { fit: 80, engagement: 70, budget: 75 },
      value: 65000,
      notes: 'Imported via Email Sync Module. Interested in custom compression listeners.',
      owner: 'Alex Chen',
      leadSource: 'Email Sync Integration',
      creationDate: new Date().toISOString().split('T')[0],
      activities: [
        { id: `act-init-${Date.now()}`, type: 'created', description: 'Lead provisioned from synced Email Thread', timestamp: new Date().toISOString() }
      ]
    };

    setLeads(prev => [newLead, ...prev]);

    showToast(`Created Contact & Lead for "${thread.senderName}". Ready to link email thread now!`);
  };

  // Helper colors for statuses
  const getBadgeStyle = (status: string, email: string) => {
    const isMatched = contacts.some(c => c.email.toLowerCase() === email.toLowerCase());
    const isLeadMatched = leads.some(l => l.email.toLowerCase() === email.toLowerCase());

    if (status === 'linked') {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25';
    }
    if (isMatched && isLeadMatched) {
      return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/25';
    }
    if (isMatched) {
      return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/25';
    }
    return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
  };

  const getStatusText = (status: string, email: string) => {
    const isMatched = contacts.some(c => c.email.toLowerCase() === email.toLowerCase());
    const isLeadMatched = leads.some(l => l.email.toLowerCase() === email.toLowerCase());

    if (status === 'linked') return 'Synced & Linked';
    if (isMatched && isLeadMatched) return 'Ready to Link';
    if (isMatched) return 'Contact Linked, No Lead';
    return 'Unresolved Sender';
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
      'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400',
      'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400'
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-3 border border-slate-800 animate-slide-in text-sm font-medium">
          <IconCheckCircle className="w-5 h-5 text-emerald-400" />
          <span>{showNotification}</span>
        </div>
      )}

      {/* Sync Status Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Connection</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">IMAP / Enterprise GSuite</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Authenticated to fayasamd@gmail.com</p>
          </div>
          <button 
            disabled={isSyncing}
            onClick={handleSyncInbox}
            className={`p-3 rounded-xl border border-slate-250 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors flex items-center justify-center ${isSyncing ? 'animate-spin text-slate-400' : 'text-slate-600 dark:text-slate-350'}`}
            title="Scan Sync Folders"
          >
            <IconRefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Database Synced Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-light text-slate-800 dark:text-slate-100 font-sans">
              {threads.filter(t => t.status === 'linked').length} / {threads.length} 
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Threads Linked</span>
          </div>
          <div className="w-full bg-slate-150 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-indigo-600 dark:bg-indigo-500 h-full transition-all duration-500" 
              style={{ width: `${(threads.filter(t => t.status === 'linked').length / threads.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">CRM Automated Engine</span>
            <p className="font-bold text-slate-900 dark:text-white">Auto-Link Discovered Threads</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Instantly map verified contact messages</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={autoLinkEnabled} 
              onChange={() => setAutoLinkEnabled(!autoLinkEnabled)}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>

      {/* Sync Monitor and Console Logs */}
      {isSyncing && (
        <div className="bg-slate-900 dark:bg-black rounded-2xl p-5 border border-slate-800 shadow-lg font-mono text-xs text-indigo-400 space-y-2">
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold tracking-widest pb-2 border-b border-slate-850">
            <span>SYNC CONSOLE MONITOR</span>
            <span className="flex items-center gap-1.5 animate-pulse text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              REALTIME LISTENER ACTIVE
            </span>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
            {syncLogs.map((log, index) => (
              <div key={index} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two-Column Thread Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Left Hand side email selector list */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Discovered Contact Threads</h3>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
              {threads.length} Discovered
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 overflow-y-auto max-h-[520px] custom-scrollbar flex-1">
            {threads.map((thread) => {
              const belongsToContact = contacts.some(c => c.email.toLowerCase() === thread.senderEmail.toLowerCase());
              const leadsToLead = leads.some(l => l.email.toLowerCase() === thread.senderEmail.toLowerCase());
              const isSelected = thread.id === selectedId;

              return (
                <button
                  key={thread.id}
                  onClick={() => setSelectedId(thread.id)}
                  className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex items-start gap-3 relative ${isSelected ? 'bg-slate-50 dark:bg-slate-700/60 border-l-4 border-indigo-600 dark:border-indigo-400' : 'border-l-4 border-transparent'}`}
                >
                  {/* Unread dot indicator */}
                  {!thread.isRead && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                  )}

                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${getAvatarColor(thread.senderName)}`}>
                    {thread.senderName.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <p className="font-bold text-slate-900 dark:text-white text-sm truncate pr-4">{thread.senderName}</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                        {new Date(thread.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{thread.subject}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-450 truncate">{thread.snippet}</p>
                    
                    {/* Status mapping badge */}
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${getBadgeStyle(thread.status, thread.senderEmail)}`}>
                        {getStatusText(thread.status, thread.senderEmail)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Hand side detail component */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
          {activeThread ? (
            <div className="flex-1 flex flex-col h-full">
              {/* Header block */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="space-y-1 flex-1">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{activeThread.subject}</h2>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-sans">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{activeThread.senderName}</span>
                      <span>&bull;</span>
                      <span className="font-mono">{activeThread.senderEmail}</span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400 font-bold dark:text-slate-500 font-mono">
                    {new Date(activeThread.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Thread Intelligence Mapping Box */}
              <div className="m-6 p-4 bg-indigo-50/15 dark:bg-indigo-950/20 border border-indigo-150/60 dark:border-indigo-900/35 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <IconSparkles className="w-5 h-5 text-indigo-500 animate-pulse flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-700 dark:text-indigo-300 uppercase tracking-wider">CRM Sync Mapping Intelligence</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                  {/* Map Status Contact */}
                  <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-150 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-1">CRM CONTACT LINK</p>
                      {contacts.find(c => c.email.toLowerCase() === activeThread.senderEmail.toLowerCase()) ? (
                        <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
                          <IconCheckCircle className="w-4 h-4 text-emerald-500" />
                          <span>{contacts.find(c => c.email.toLowerCase() === activeThread.senderEmail.toLowerCase())?.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                          <IconAlertCircle className="w-4 h-4" />
                          <span>No Contact Found</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Map Status Lead */}
                  <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-150 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-1">LEAD TIMELINE LINK</p>
                      {leads.find(l => l.email.toLowerCase() === activeThread.senderEmail.toLowerCase()) ? (
                        <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
                          <IconCheckCircle className="w-4 h-4 text-emerald-500" />
                          <span>{leads.find(l => l.email.toLowerCase() === activeThread.senderEmail.toLowerCase())?.name} Lead ({leads.find(l => l.email.toLowerCase() === activeThread.senderEmail.toLowerCase())?.status})</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                          <IconInfo className="w-4 h-4" />
                          <span>No Corresponding Lead</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="flex justify-end pt-1">
                  {activeThread.status === 'linked' ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-50/70 dark:bg-emerald-900/35 px-4 py-2.5 rounded-xl border border-emerald-150 dark:border-emerald-800/40 select-none">
                      <IconCheck className="w-4 h-4" />
                      <span>Thread Connected & Activity Logged</span>
                    </div>
                  ) : contacts.some(c => c.email.toLowerCase() === activeThread.senderEmail.toLowerCase()) &&
                    leads.some(l => l.email.toLowerCase() === activeThread.senderEmail.toLowerCase()) ? (
                    <button
                      disabled={isLinkingMap[activeThread.id]}
                      onClick={() => handleLinkThread(activeThread)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLinkingMap[activeThread.id] ? (
                        <>
                          <IconRefreshCw className="w-4 h-4 animate-spin" />
                          <span>Linking to Lead Activities...</span>
                        </>
                      ) : (
                        <>
                          <IconLink className="w-4 h-4" />
                          <span>Sync & Link to Lead Activities</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCreateContactAndLead(activeThread)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <IconPlus className="w-4 h-4" />
                      <span>Import Contact & Link Lead</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Email Content Body */}
              <div className="flex-1 p-6 font-sans text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap select-text h-full overflow-y-auto max-h-[380px] custom-scrollbar">
                {activeThread.body}
              </div>

              {/* Action details footer */}
              {activeThread.status === 'linked' && activeThread.linkedAt && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                  <IconActivity className="w-4 h-4 text-emerald-500" />
                  <span>Activity logs synchronized on: {new Date(activeThread.linkedAt).toLocaleString()} with Lead Registry.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-slate-400 dark:text-slate-500 p-8 space-y-2 select-none">
              <IconMail className="w-12 h-12 stroke-1 opacity-70 animate-pulse text-indigo-400" />
              <p className="font-bold text-sm">No Thread Selected</p>
              <p className="text-xs">Select an email thread from the left list to review sync parameters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

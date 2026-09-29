import React, { useState, useEffect } from 'react';
import { Contact, Task } from '../types';

interface ConnectEmailProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

interface SimulatedEmail {
  id: string;
  senderName: string;
  senderEmail: string;
  company: string;
  subject: string;
  body: string;
  rawSignature: string;
  detectedData: {
    phone?: string;
    title?: string;
    name?: string;
    company?: string;
    taskTitle?: string;
    taskDueDate?: string;
  };
  processed: boolean;
}

const INITIAL_EMAILS: SimulatedEmail[] = [
  {
    id: 'email-1',
    senderName: 'Sarah Connor',
    senderEmail: 'sarah.connor@cyberdyne.io',
    company: 'Cyberdyne Systems',
    subject: 'Urgent: Revised scope details & pricing schedule',
    body: "Hi Alex, appreciate your call today! We are tightening up our project blueprints. Please note that my direct mobile number has changed to +1 (310) 555-0199. Let's make sure you update my CRM card so the sales team can reach me. Also, copy our discussion items and create a task for yourself to review the Cyberdyne pricing proposal by next Friday. Speak soon!",
    rawSignature: 'Sarah Connor\nOperations Director | Cyberdyne Systems\nMobile: +1 (310) 555-0199\nsarah.connor@cyberdyne.io',
    detectedData: {
      phone: '+1 (310) 555-0199',
      title: 'Operations Director',
      name: 'Sarah Connor',
      company: 'Cyberdyne Systems',
      taskTitle: "Review Cyberdyne proposal",
      taskDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days out
    },
    processed: false
  },
  {
    id: 'email-2',
    senderName: 'Bruce Wayne',
    senderEmail: 'bruce@waynecorp.com',
    company: 'Wayne Enterprises',
    subject: 'Updated Contact & Design Review request',
    body: "Hello Alex. Just wanted to shoot over a quick update. I was officially promoted to Chairman & CEO of Wayne Enterprises this afternoon, so please adjust my details on our key account records. In addition, let's get things moving on the clean energy front. Can you schedule a task to prepare the Gotham microgrid draft design by next Tuesday? Thank you.",
    rawSignature: 'Bruce Wayne\nChairman & CEO, Wayne Enterprises\nConfidential Secretary: Alfred\nbruce@waynecorp.com',
    detectedData: {
      title: 'Chairman & CEO',
      name: 'Bruce Wayne',
      company: 'Wayne Enterprises',
      taskTitle: 'Prepare Gotham microgrid draft',
      taskDueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 4 days out
    },
    processed: false
  },
  {
    id: 'email-3',
    senderName: 'Selina Kyle',
    senderEmail: 'selina@gothamcats.org',
    company: 'Gotham Cats',
    subject: 'Registration Inquiry & Follow-up',
    body: "Hello! I am Selina Kyle, Director of Ops at Gotham Feline Association. Our team mentioned you guys have great software deals. Can you register me as a new contact in your CRM? My primary telephone is +1 (555) 777-8888. Also, I'd like a follow-up call task created for our feline shelter supply request by this Saturday.",
    rawSignature: 'Selina Kyle\nDirector of Ops, Gotham Feline Association\nPhone: +1 (555) 777-8888\nEmail: selina@gothamcats.org',
    detectedData: {
      phone: '+1 (555) 777-8888',
      title: 'Director of Ops',
      name: 'Selina Kyle',
      company: 'Gotham Cats',
      taskTitle: 'Follow-up call on supply request',
      taskDueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 2 days out
    },
    processed: false
  },
  {
    id: 'email-4',
    senderName: 'Clark Kent',
    senderEmail: 'clark.kent@dailyplanet.com',
    company: 'Daily Planet',
    subject: 'Media Release Draft & Phone update',
    body: "Alex, update my records please: my official title is now Senior Investigative Journalist, and my dedicated direct line has changed to +1 (212) 555-0144. Let's make sure the CRM matches. Finally, please set up a reminder task to send me the media release draft tomorrow morning.",
    rawSignature: 'Clark Kent\nSenior Investigative Journalist | The Daily Planet\nPhone: +1 (212) 555-0144\nclark.kent@dailyplanet.com',
    detectedData: {
      phone: '+1 (212) 555-0144',
      title: 'Senior Investigative Journalist',
      name: 'Clark Kent',
      company: 'Daily Planet',
      taskTitle: 'Send media release draft to Clark',
      taskDueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Tomorrow
    },
    processed: false
  }
];

export const ConnectEmail: React.FC<ConnectEmailProps> = ({ contacts, setContacts, tasks, setTasks }) => {
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    return localStorage.getItem('email_connected_status') === 'true';
  });
  const [emailAddress, setEmailAddress] = useState<string>(() => {
    return localStorage.getItem('email_connected_address') || 'alex.chen@enterprise.com';
  });
  const [provider, setProvider] = useState<string>('google');
  
  // Rule toggles
  const [rules, setRules] = useState({
    autoCreateTasks: true,
    autoUpdateContacts: true,
    engine: 'deepseek-nova',
    syncFreq: 'realtime'
  });

  // Connecting animation
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectStep, setConnectStep] = useState(0);

  // Sync scan animations
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  // Loaded emails list state (saved to local storage temporarily to persist processed state in session)
  const [emails, setEmails] = useState<SimulatedEmail[]>(() => {
    const saved = localStorage.getItem('simulated_sync_emails');
    return saved ? JSON.parse(saved) : INITIAL_EMAILS;
  });

  // Event sync terminal logs
  const [logs, setLogs] = useState<string[]>(() => {
    const saved = localStorage.getItem('email_sync_terminal_logs');
    if (saved) return JSON.parse(saved);
    return [
      `[${new Date().toISOString().replace('T', ' ').substring(0, 19)}] [SYSTEM] Sync engine initialized, awaiting inbox connection...`
    ];
  });

  // Processing individual email AI detail state modal/drawer
  const [selectedEmailForAI, setSelectedEmailForAI] = useState<SimulatedEmail | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiStep, setAiStep] = useState(0);

  useEffect(() => {
    localStorage.setItem('email_connected_status', isConnected.toString());
    localStorage.setItem('email_connected_address', emailAddress);
  }, [isConnected, emailAddress]);

  useEffect(() => {
    localStorage.setItem('simulated_sync_emails', JSON.stringify(emails));
  }, [emails]);

  useEffect(() => {
    localStorage.setItem('email_sync_terminal_logs', JSON.stringify(logs));
  }, [logs]);

  const addLog = (message: string, type: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' = 'INFO') => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setLogs(prev => [
      `[${timestamp}] [${type}] ${message}`,
      ...prev.slice(0, 49) // Keep last 50 logs
    ]);
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailAddress) return;
    setIsConnecting(true);
    setConnectStep(1);

    const steps = [
      'Establishing TLS Secure Connection to provider servers...',
      'Verifying OAuth 2.0 Identity Token authorization...',
      'Mapping remote Inbox folder structures (INBOX, SENT, ARCHIVE)...',
      'Deploying secure Nova Sync webhook listener daemon...',
      'SUCCESS'
    ];

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < steps.length) {
        setConnectStep(current + 1);
        addLog(`OAuth status: ${steps[current - 1]}`, 'INFO');
      } else {
        clearInterval(interval);
        setIsConnecting(false);
        setIsConnected(true);
        addLog(`Successfully connected inbox ${emailAddress}! Live sync webhook is now ACTIVE.`, 'SUCCESS');
      }
    }, 750);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    addLog(`Disconnected inbox ${emailAddress}. Sync listener has been shutdown.`, 'WARN');
  };

  // Process a single email using the Interactive Nova AI Modal
  const openEmailAIProcessor = (email: SimulatedEmail) => {
    setSelectedEmailForAI(email);
    setIsProcessingAI(true);
    setAiStep(1);

    const stepsAILogs = [
      `Decoding email thread signature blocks & message semantics...`,
      `Applying Deep NLP algorithm to isolate professional entity markers...`,
      `Synthesizing Action-items: Task '${email.detectedData.taskTitle}' suggested...`,
      `Extracted signature fields: Name='${email.detectedData.name}', Title='${email.detectedData.title || ''}', Company='${email.detectedData.company || ''}'`,
      `READY`
    ];

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < stepsAILogs.length) {
        setAiStep(current + 1);
        addLog(`[Nova AI] ${stepsAILogs[current - 1]}`, 'INFO');
      } else {
        clearInterval(interval);
        setIsProcessingAI(false);
      }
    }, 600);
  };

  const executeSyncMerge = (email: SimulatedEmail) => {
    // 1. Process Task if enabled
    if (rules.autoCreateTasks && email.detectedData.taskTitle) {
      const newTask: Task = {
        id: `tasks-ai-${Date.now()}-${Math.floor(Math.random() * 100)}`,
        title: email.detectedData.taskTitle,
        dueDate: email.detectedData.taskDueDate || new Date().toISOString().split('T')[0],
        status: 'Not Started',
        priority: 'Normal',
        relatedTo: email.senderName,
        description: `Automatically created from professional email request.\n\nSender: ${email.senderName} (${email.senderEmail})\nOriginal Email Body Snippet:\n"${email.body.substring(0, 150)}..."`
      };
      setTasks(prev => [newTask, ...prev]);
      addLog(`Created new Task: "${email.detectedData.taskTitle}" assigned to Alex Chen.`, 'SUCCESS');
    }

    // 2. Process Contact update if enabled
    if (rules.autoUpdateContacts) {
      // Find existing contact by email (case-insensitive check)
      const existingContactIdx = contacts.findIndex(
        c => c.email.toLowerCase().trim() === email.senderEmail.toLowerCase().trim()
      );

      if (existingContactIdx !== -1) {
        // Upgrade existing contact's fields
        setContacts(prev => {
          const updated = [...prev];
          const curr = updated[existingContactIdx];
          
          updated[existingContactIdx] = {
            ...curr,
            title: email.detectedData.title || curr.title || 'Unknown',
            phone: email.detectedData.phone || curr.phone || '',
            company: email.detectedData.company || curr.company || 'Unknown',
            lastActivity: new Date().toISOString().split('T')[0]
          };
          return updated;
        });
        addLog(`Updated contact record for ${email.senderName} with new parsed data.`, 'SUCCESS');
      } else {
        // Create as a new Contact!
        const newContact: Contact = {
          id: `contact-ai-${Date.now()}-${Math.floor(Math.random() * 100)}`,
          name: email.senderName,
          email: email.senderEmail,
          phone: email.detectedData.phone || '',
          company: email.detectedData.company || 'Unknown',
          title: email.detectedData.title || 'Unknown',
          status: 'New',
          lastActivity: new Date().toISOString().split('T')[0],
          owner: 'Alex Chen'
        };
        setContacts(prev => [newContact, ...prev]);
        addLog(`Created new Contact: "${email.senderName}" from extracted email credentials.`, 'SUCCESS');
      }
    }

    // Mark email as processed
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, processed: true } : e));
    setSelectedEmailForAI(null);
  };

  const handleGlobalScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanMessage('Scanning IMAP mailbox... searching for unprocessed professional signatures...');
    addLog('Manual Scan Initiated. Scanning remote folders...', 'INFO');

    setTimeout(() => {
      setScanMessage('Applying NLP Parser: Extracting entity deltas...');
      
      setTimeout(() => {
        // Find first unprocessed email and process it automatically as an exciting show of power
        const nextUnprocessed = emails.find(e => !e.processed);
        if (nextUnprocessed) {
          addLog(`Scanning completed: Found unprocessed message from ${nextUnprocessed.senderName}. Automatically executing extraction...`, 'INFO');
          executeSyncMerge(nextUnprocessed);
          setIsScanning(false);
          setScanMessage('');
        } else {
          addLog('Scanning completed. Clean sync - all professional threads perfectly aligned.', 'SUCCESS');
          setIsScanning(false);
          setScanMessage('');
          alert('Scan complete! Your professional inbox is up-to-date. All threads have been synced.');
        }
      }, 1000);
    }, 1200);
  };

  const resetAllSimulatedEmails = () => {
    setEmails(INITIAL_EMAILS);
    addLog('Reset simulated inbox data to demonstration defaults.', 'WARN');
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wider uppercase border border-indigo-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              Smart Automation Service
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Connect Professional Email</h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Connect your professional Outlook or Gmail workplace inbox. Once paired, Nova Intelligence continuously scans incoming threads, detects contact updates in email signatures, and builds action items directly in your task manager.
            </p>
          </div>
          <div className="flex-shrink-0">
            {isConnected ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button 
                  onClick={handleGlobalScan}
                  disabled={isScanning}
                  className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {isScanning ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Scanning...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.228 10H18.22M7 10h12H7z"/>
                      </svg>
                      Scan Inbox Now
                    </>
                  )}
                </button>
                <button 
                  onClick={handleDisconnect}
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-sm border border-slate-700 transition-colors flex items-center justify-center gap-1"
                >
                  Disconnect Inbox
                </button>
              </div>
            ) : (
              <div className="px-4 py-3 bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 rounded-2xl text-xs font-semibold text-center uppercase tracking-wider">
                Awaiting Connection
              </div>
            )}
          </div>
        </div>
      </div>

      {isScanning && (
        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
          <svg className="animate-spin h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">{scanMessage}</span>
        </div>
      )}

      {/* Main Grid: Settings vs Preview */}
      {!isConnected ? (
        /* Configuration Screen (DISCONNECTED STATE) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 md:p-8 shadow-sm space-y-8">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Email Provider Connection</h3>
              <p className="text-slate-400 text-xs">Pair your workplace accounts to activate machine-learning inbox agents.</p>
            </div>

            {/* Provider Grid Selector */}
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setProvider('google')}
                className={`p-4 rounded-2xl border-2 text-center transition-all ${provider === 'google' ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-500 text-blue-600 dark:text-blue-400' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500'}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.01 0-.01-.01-.19-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="text-xs font-bold font-sans">Google Gmail</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('office')}
                className={`p-4 rounded-2xl border-2 text-center transition-all ${provider === 'office' ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-500 text-amber-600 dark:text-amber-400' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500'}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path fill="#F25022" d="M1 1h10v10H1z"/>
                    <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                    <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                    <path fill="#FFB900" d="M13 13h10v10H13z"/>
                  </svg>
                  <span className="text-xs font-bold">Office 365</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('imap')}
                className={`p-4 rounded-2xl border-2 text-center transition-all ${provider === 'imap' ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500'}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                  <span className="text-xs font-bold">IMAP / Exchange</span>
                </div>
              </button>
            </div>

            {/* Connection Form */}
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Professional Email Address</label>
                <input 
                  type="email" 
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="alex.chen@enterprise.com" 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                  disabled={isConnecting}
                />
              </div>

              {provider === 'imap' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">IMAP Server</label>
                    <input 
                      type="text" 
                      placeholder="imap.enterprise.com" 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-slate-900 dark:text-white text-sm"
                      disabled={isConnecting}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Port</label>
                    <input 
                      type="text" 
                      placeholder="993" 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-slate-900 dark:text-white text-sm"
                      disabled={isConnecting}
                    />
                  </div>
                </div>
              )}

              {/* Dynamic Connecting Stage Steps */}
              {isConnecting && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Executing verification steps...</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px] text-slate-400">
                    <p className={connectStep >= 1 ? 'text-indigo-500' : ''}>[STEP 1] TLS Handshake connection ... {connectStep >= 2 ? 'DONE' : ''}</p>
                    <p className={connectStep >= 2 ? 'text-indigo-500' : ''}>[STEP 2] Verifying OAuth scope claims ... {connectStep >= 3 ? 'DONE' : ''}</p>
                    <p className={connectStep >= 3 ? 'text-indigo-500' : ''}>[STEP 3] Reading inbox folders structure ... {connectStep >= 4 ? 'DONE' : ''}</p>
                    <p className={connectStep >= 4 ? 'text-indigo-500' : ''}>[STEP 4] Deploying sync triggers ... {connectStep >= 5 ? 'DONE' : ''}</p>
                  </div>
                </div>
              )}

              {/* Action trigger button */}
              <button
                type="submit"
                disabled={isConnecting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all text-sm tracking-wide uppercase"
              >
                {isConnecting ? 'Authenticating Secure Connect...' : 'Authorize OAuth & Sync Professional Account'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Secure Workspace Integration
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                NovaCRM respects your privacy. We process incoming emails server-side with zero persistent mail storage. Only entities detected as CRM updates (signatures and specific structural tasks) are retained inside your live account.
              </p>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Continuous signature drift monitoring
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  No mail persistent databases
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Manual and automatic triggers supported
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* ACTIVE CONNECTED CONSOLE SCREEN */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          {/* Rules & Sync Engine Section */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Active connection details */}
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-750">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Connection</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold leading-none bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/55">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{emailAddress}</p>
                <p className="text-xs text-slate-400 font-mono">Channel: Webhook OAuth</p>
              </div>
              <div className="space-y-2 pt-2 text-[11px] text-slate-400 dark:text-slate-400 leading-relaxed font-sans">
                <p className="flex justify-between">
                  <span>Engine Model:</span>
                  <strong className="text-slate-600 dark:text-slate-300">NovaAI-Reasoner</strong>
                </p>
                <p className="flex justify-between">
                  <span>Sync Frequency:</span>
                  <strong className="text-slate-600 dark:text-slate-300">Instant (Realtime push)</strong>
                </p>
              </div>
            </div>

            {/* Automation toggle policies */}
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Sync Automation Rules</h3>
                <p className="text-slate-400 text-xs">Configure triggers on parsed threads.</p>
              </div>

              <div className="space-y-4">
                {/* Rule Toggle A */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Auto-create CRM Tasks</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Generate tasks from extracted email scheduling requests.</p>
                  </div>
                  <button
                    onClick={() => setRules(prev => ({ ...prev, autoCreateTasks: !prev.autoCreateTasks }))}
                    className={`flex-shrink-0 w-11 h-6 rounded-full transition-colors relative ${rules.autoCreateTasks ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-md transition-transform ${rules.autoCreateTasks ? 'translate-x-5' : 'translate-x-0'}`}></span>
                  </button>
                </div>

                {/* Rule Toggle B */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Auto-adjust Contacts</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Update phone, titles,/companies automatically when signatures shift.</p>
                  </div>
                  <button
                    onClick={() => setRules(prev => ({ ...prev, autoUpdateContacts: !prev.autoUpdateContacts }))}
                    className={`flex-shrink-0 w-11 h-6 rounded-full transition-colors relative ${rules.autoUpdateContacts ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-md transition-transform ${rules.autoUpdateContacts ? 'translate-x-5' : 'translate-x-0'}`}></span>
                  </button>
                </div>
              </div>

              {/* Sync settings picker */}
              <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-750">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Signature NLP Model</label>
                  <select 
                    value={rules.engine}
                    onChange={(e) => setRules(prev => ({ ...prev, engine: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 py-2.5 px-3 rounded-xl text-slate-800 dark:text-gray-200 text-xs focus:outline-none"
                  >
                    <option value="deepseek-nova">Deepseek R1 (Nova Spec)</option>
                    <option value="gemini-flash">Gemini 1.5 Flash (Default)</option>
                    <option value="gemini-pro">Gemini 1.5 Pro (Deep Scan)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Incoming Email Inbox simulator Section */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="p-1 flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Simulation Professional Inbox</h3>
                <p className="text-slate-400 text-xs">Simulated live emails for testing extraction.</p>
              </div>
              <button 
                onClick={resetAllSimulatedEmails}
                className="text-xs text-slate-500 hover:text-indigo-600 font-bold hover:underline"
              >
                Reset Sync Records
              </button>
            </div>

            {/* Emails Stack */}
            <div className="space-y-4">
              {emails.map((email) => (
                <div 
                  key={email.id} 
                  className={`bg-white dark:bg-slate-800 border rounded-3xl p-5 md:p-6 shadow-sm transition-all relative ${
                    email.processed 
                      ? 'border-slate-200 dark:border-slate-700 opacity-75' 
                      : 'border-indigo-200/60 dark:border-indigo-900 ring-2 ring-indigo-500/5 hover:border-indigo-400 dark:hover:border-indigo-700'
                  }`}
                >
                  
                  {/* Processed Badge Ribbon */}
                  {email.processed && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 text-[10px] font-bold">
                      <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      Synchronized & Processed
                    </div>
                  )}

                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 flex-shrink-0">
                        {email.senderName.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm">{email.senderName}</h4>
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono truncate max-w-[150px] md:max-w-none">
                            {`<${email.senderEmail}>`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {email.company} • Subject: <strong className="text-slate-600 dark:text-slate-300">{email.subject}</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body Text */}
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed pl-13 mb-5 border-l-2 border-slate-100 dark:border-slate-700">
                    {email.body}
                  </p>

                  {/* Extraction Entities Delta Card */}
                  <div className="bg-slate-50 dark:bg-slate-850/65 rounded-2xl p-4 ml-13 flex flex-wrap gap-4 items-center justify-between border border-slate-100 dark:border-slate-800">
                    <div className="space-y-2">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nova AI Entity Extraction</span>
                      <div className="flex flex-wrap gap-2.5">
                        {email.detectedData.phone && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 text-xs font-semibold border border-blue-100 dark:border-blue-900/40">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                            </svg>
                            Phone: {email.detectedData.phone}
                          </span>
                        )}
                        {email.detectedData.title && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 text-xs font-semibold border border-purple-100 dark:border-purple-900/40">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            Title: {email.detectedData.title}
                          </span>
                        )}
                        {email.detectedData.taskTitle && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 text-xs font-semibold border border-amber-100 dark:border-amber-900/40">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                            </svg>
                            Task: {email.detectedData.taskTitle}
                          </span>
                        )}
                      </div>
                    </div>

                    {!email.processed && (
                      <button 
                        onClick={() => openEmailAIProcessor(email)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-505 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all tracking-wide flex items-center gap-1.5 shadow-sm hover:shadow-md"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                        </svg>
                        AI Analyze & Sync
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>

            {/* Direct Navigation Guidelines Links */}
            <div className="bg-[#0b1120] rounded-3xl p-6 text-slate-300 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  Mock Sync Pipeline Active
                </p>
                <p className="text-xs text-slate-400">Your processed tasks and contacts are immediately saved in the master CRM state!</p>
              </div>
              <p className="text-xs font-semibold text-indigo-400">
                Check "Contacts" & "Tasks" menus to inspect live models.
              </p>
            </div>

            {/* Live Terminal Log Viewer */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-inner">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                  Connected Sync Terminal logs
                </span>
                <button 
                  onClick={() => setLogs([`[${new Date().toISOString().replace('T', ' ').substring(0, 19)}] [SYSTEM] Logs container flushed.`])}
                  className="text-[10px] text-slate-500 hover:text-slate-300 hover:underline font-mono"
                >
                  Clear logs
                </button>
              </div>
              <div className="h-44 overflow-y-auto font-mono text-[11px] space-y-1.5 custom-scrollbar text-left">
                {logs.map((log, index) => {
                  let colorClass = 'text-slate-400';
                  if (log.includes('[SUCCESS]')) colorClass = 'text-emerald-400 font-bold';
                  if (log.includes('[WARN]')) colorClass = 'text-amber-500';
                  if (log.includes('[ERROR]')) colorClass = 'text-red-400';
                  return (
                    <p key={index} className={`whitespace-pre-wrap leading-relaxed ${colorClass}`}>
                      {log}
                    </p>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* MODAL / DRAWER FOR INTERACTIVE AI PROCESSOR STEPS */}
      {isProcessingAI && selectedEmailForAI && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-850 rounded-3xl p-6 md:p-8 space-y-6 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h4 className="text-lg font-bold">Integrating with Nova AI</h4>
                <p className="text-xs text-slate-400">Parsing thread from {selectedEmailForAI.senderName}</p>
              </div>
              <button 
                onClick={() => setIsProcessingAI(false)}
                className="p-1 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span>Extracting context semantic entities...</span>
                  <span>{aiStep * 20}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${aiStep * 20}%` }}></div>
                </div>
              </div>

              {/* Progress Detail Lines */}
              <div className="space-y-2 bg-slate-950/50 p-4 rounded-2xl border border-slate-800 font-mono text-xs">
                <p className={aiStep >= 1 ? 'text-indigo-400' : 'text-slate-600'}>▶ Initializing deep NLP signature parser...</p>
                <p className={aiStep >= 2 ? 'text-indigo-400' : 'text-slate-600'}>▶ Isolating entity vectors ... found sender '{selectedEmailForAI.senderName}'</p>
                <p className={aiStep >= 3 ? 'text-indigo-400' : 'text-slate-600'}>▶ Detected update properties: {JSON.stringify(selectedEmailForAI.detectedData)}</p>
                <p className={aiStep >= 4 ? 'text-emerald-400 font-bold animate-pulse' : 'text-slate-600'}>▶ Entities extracted successfully! Confirm CRM synchronization below.</p>
              </div>

              {/* CRM Update Action Breakdown comparison */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sync Actions to Execute</span>
                
                {rules.autoUpdateContacts && (
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between text-xs text-indigo-200">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      Contact Update: <strong>{selectedEmailForAI.senderName}</strong>
                    </span>
                    <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded-full font-bold">
                      {selectedEmailForAI.detectedData.phone ? 'Phone & Title' : 'Title Update'}
                    </span>
                  </div>
                )}

                {rules.autoCreateTasks && selectedEmailForAI.detectedData.taskTitle && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs text-amber-200">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                      New Task: <strong>{selectedEmailForAI.detectedData.taskTitle}</strong>
                    </span>
                    <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                      7 Days Due
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-800">
              <button 
                onClick={() => setIsProcessingAI(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-755 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={() => executeSyncMerge(selectedEmailForAI)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25"
              >
                Approve & Sync to CRM
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

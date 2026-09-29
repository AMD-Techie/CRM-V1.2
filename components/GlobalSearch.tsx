import React, { useState, useEffect, useRef } from 'react';
import { IconSearch, IconX, IconBriefcase, IconUser, IconCalendar, IconFileText, IconPhone, IconCheckSquare, IconLayoutDashboard } from './Icons';
import { Lead, Deal, Task, Meeting, Contact, Account, Call, Document } from '../types';

interface GlobalSearchProps {
  leads: Lead[];
  deals: Deal[];
  tasks: Task[];
  meetings: Meeting[];
  contacts: Contact[];
  accounts: Account[];
  calls: Call[];
  documents: Document[];
  onNavigate: (view: string, itemId?: string) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ 
  leads, deals, tasks, meetings, contacts, accounts, calls, documents, onNavigate 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
  };

  const getResults = () => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const results: Array<{ id: string; title: string; subtitle: string; type: string; icon: any; view: string }> = [];

    // Search Contacts
    contacts.forEach(c => {
      if (c.name.toLowerCase().includes(lowerQuery) || c.email?.toLowerCase().includes(lowerQuery)) {
        results.push({ id: c.id, title: c.name, subtitle: c.email || c.title, type: 'Contact', icon: IconUser, view: 'contacts' });
      }
    });

    // Search Accounts
    accounts.forEach(a => {
      if (a.name.toLowerCase().includes(lowerQuery) || a.industry.toLowerCase().includes(lowerQuery)) {
        results.push({ id: a.id, title: a.name, subtitle: a.industry, type: 'Account', icon: IconBriefcase, view: 'accounts' });
      }
    });

    // Search Leads (including notes)
    leads.forEach(l => {
      if (
        l.name.toLowerCase().includes(lowerQuery) || 
        l.company.toLowerCase().includes(lowerQuery) ||
        l.notes?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({ id: l.id, title: l.name, subtitle: `Lead at ${l.company}`, type: 'Lead', icon: IconUser, view: 'leads' });
      }
    });

    // Search Deals (including notes/activities)
    deals.forEach(d => {
      let match = false;
      if (d.title.toLowerCase().includes(lowerQuery) || d.notes?.toLowerCase().includes(lowerQuery)) {
        match = true;
      }
      d.activities?.forEach(a => {
         if (a.description?.toLowerCase().includes(lowerQuery)) match = true;
      });
      
      if (match) {
        results.push({ id: d.id, title: d.title, subtitle: `Deal Value: $${d.value.toLocaleString()}`, type: 'Deal', icon: IconBriefcase, view: 'pipeline' });
      }
    });

    // Search Tasks
    tasks.forEach(t => {
      if (t.title.toLowerCase().includes(lowerQuery) || t.description?.toLowerCase().includes(lowerQuery)) {
        results.push({ id: t.id, title: t.title, subtitle: `Due: ${t.dueDate}`, type: 'Task', icon: IconCheckSquare, view: 'tasks' });
      }
    });

    // Search Meetings
    meetings.forEach(m => {
      if (m.title.toLowerCase().includes(lowerQuery) || m.agenda?.toLowerCase().includes(lowerQuery)) {
        results.push({ id: m.id, title: m.title, subtitle: `Date: ${new Date(m.date).toLocaleDateString()}`, type: 'Meeting', icon: IconCalendar, view: 'meetings' });
      }
    });

    // Search Calls (Emails/Notes equivalents)
    calls.forEach(c => {
      if (c.subject.toLowerCase().includes(lowerQuery) || c.notes?.toLowerCase().includes(lowerQuery)) {
        const typeLabel = c.type === 'Email' ? 'Email' : 'Communication';
        results.push({ id: c.id, title: c.subject, subtitle: `Outcome: ${c.outcome || 'N/A'}`, type: typeLabel, icon: IconPhone, view: 'calls' });
      }
    });

    // Search Documents (Attachments/Summaries)
    documents.forEach(d => {
      let match = false;
      if (d.name.toLowerCase().includes(lowerQuery) || d.type.toLowerCase().includes(lowerQuery)) {
        match = true;
      }
      
      if (d.content) {
         if (typeof d.content === 'string' && d.content.toLowerCase().includes(lowerQuery)) {
            match = true;
         } else if (typeof d.content === 'object' && JSON.stringify(d.content).toLowerCase().includes(lowerQuery)) {
            match = true;
         }
      }

      if (match) {
        const typeLabel = d.type.includes('AI') || d.type.includes('Summary') ? 'AI Summary' : 'Attachment';
        results.push({ id: d.id, title: d.name, subtitle: `Type: ${d.type}`, type: typeLabel, icon: IconFileText, view: 'documents' });
      }
    });

    return results.slice(0, 10); // Limit results
  };

  const results = getResults();

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mr-14 md:mr-4 w-48 md:w-64"
      >
        <IconSearch className="w-4 h-4" />
        <span>Search...</span>
        <span className="ml-auto text-xs bg-slate-100 dark:bg-slate-700 font-mono px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">⌘K</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh]">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleClose}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <IconSearch className="w-5 h-5 text-slate-400 mr-3" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across contacts, notes, tasks, emails, attachments..."
                className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-lg"
              />
              <button onClick={handleClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors ml-2">
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
              {query && results.length > 0 ? (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Search Results</div>
                  {results.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onNavigate(result.view, result.id);
                        handleClose();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors shadow-sm">
                        <result.icon className="w-4 h-4 text-primary-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{result.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{result.subtitle}</p>
                      </div>
                      <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 capitalize group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                        {result.type}
                      </span>
                    </button>
                  ))}
                </div>
              ) : query ? (
                <div className="py-12 text-center">
                  <IconSearch className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No results found for "{query}"</p>
                  <p className="text-slate-400 text-sm mt-1">Try searching for a different term.</p>
                </div>
              ) : (
                <div className="py-6 px-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Links</p>
                  <div className="grid grid-cols-2 gap-2">
                     <button onClick={() => { onNavigate('contacts'); handleClose(); }} className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"><IconUser className="w-4 h-4 text-slate-400"/> Recent Contacts</button>
                     <button onClick={() => { onNavigate('pipeline'); handleClose(); }} className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"><IconBriefcase className="w-4 h-4 text-slate-400"/> Active Deals</button>
                     <button onClick={() => { onNavigate('tasks'); handleClose(); }} className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"><IconCheckSquare className="w-4 h-4 text-slate-400"/> My Tasks</button>
                     <button onClick={() => { onNavigate('dashboard'); handleClose(); }} className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"><IconLayoutDashboard className="w-4 h-4 text-slate-400"/> Dashboard</button>
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
               <div className="flex items-center gap-4">
                 <span className="flex items-center gap-1"><kbd className="bg-white dark:bg-slate-800 border dark:border-slate-700 px-1.5 py-0.5 rounded shadow-sm">↑</kbd><kbd className="bg-white dark:bg-slate-800 border dark:border-slate-700 px-1.5 py-0.5 rounded shadow-sm">↓</kbd> Navigate</span>
                 <span className="flex items-center gap-1"><kbd className="bg-white dark:bg-slate-800 border dark:border-slate-700 px-1.5 py-0.5 rounded shadow-sm">esc</kbd> Dismiss</span>
               </div>
               <span><strong>Elasticsearch</strong> Indexed</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;

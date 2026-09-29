import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Contact } from '../types';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'sales' | 'marketing' | 'follow_up' | 'support' | 'custom';
  tags: string[];
  lastModified: string;
}

interface EmailTemplatesProps {
  contacts: Contact[];
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'temp-1',
    name: 'Cold Outreach - CRM Value Proposition',
    subject: 'Streamlining operations at {{company}}',
    body: 'Hi {{contact_name}},\n\nI hope this email finds you well. I’ve been following {{company}}’s impressive growth, particularly under your leadership as {{title}}.\n\nEvaluating your customer engagement strategy, I noticed companies in the {{industry}} industry often struggle with signature drift and slow follow-ups. NovaCRM automates custom task workflows and unifies communications to save teams up to 15 hours per week.\n\nWould you be open to a brief 10-minute call next Tuesday at 2 PM to explore if we can deliver similar results for your department?\n\nBest regards,\n\n{{sender_name}}\nNova Intelligence, Corporate Solutions',
    category: 'sales',
    tags: ['Intro', 'Outbound', 'CRM'],
    lastModified: '2026-06-03'
  },
  {
    id: 'temp-2',
    name: 'Post-Meeting Quick Follow-Up',
    subject: 'Thanks for your time today - Next Steps',
    body: 'Hi {{contact_name}},\n\nThank you for taking the time to connect today. It was great learning more about {{company}}’s roadmap and your goals as {{title}}.\n\nAs discussed, we are setting up a custom sandbox tailored to your team. I will follow up with the access details early next week.\n\nIn the meantime, feel free to reach out if you have any immediate questions. I look forward to working together!\n\nBest,\n\n{{sender_name}}',
    category: 'follow_up',
    tags: ['Meeting', 'Action Items'],
    lastModified: '2026-06-04'
  },
  {
    id: 'temp-3',
    name: 'Contract & Pricing Proposal Delivery',
    subject: 'NovaCRM Proposal & Pricing Schedule for {{company}}',
    body: 'Dear {{contact_name}},\n\nFollowing up on our demonstration, I am pleased to share the tailored contract proposal for {{company}}.\n\nWe have structured this package to address key workflows we discussed, including active channel queues and enterprise secure IAM roles to align with your needs. You can view the draft specifications attached to your main portal.\n\nPlease let me know if you would like me to draft key adjustments before we finalize the legal sign-offs by the end of this month.\n\nWarm regards,\n\n{{sender_name}}\nNovaCRM Account Executive',
    category: 'sales',
    tags: ['Proposal', 'Finance'],
    lastModified: '2026-05-28'
  },
  {
    id: 'temp-4',
    name: 'Customer Satisfaction Escalation Response',
    subject: 'Escalation Update: Ticket resolution query',
    body: 'Hello {{contact_name}},\n\nMy name is {{sender_name}}, and I head the Technical Success Team here at Nova. Your ticket regarding custom IMAP authentication issues was brought to my desk.\n\nI wanted to personally reassure you that our core engineers have resolved the queue timeout, and the updates are fully deployed to your instance. Please let me know if your team can now receive external updates cleanly.\n\nThank you for your valuable patience as we resolved this.\n\nSincerely,\n\n{{sender_name}}',
    category: 'support',
    tags: ['Escalation', 'Technical'],
    lastModified: '2026-06-01'
  }
];

export const EmailTemplates: React.FC<EmailTemplatesProps> = ({ contacts = [] }) => {
  // Read / write templates from localStorage
  const [templates, setTemplates] = useState<EmailTemplate[]>(() => {
    const saved = localStorage.getItem('crm_email_templates');
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  
  // Tabs for right panel
  const [panelTab, setPanelTab] = useState<'edit' | 'test'>('edit');

  // New Template state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Omit<EmailTemplate, 'id' | 'lastModified'>>({
    name: '',
    subject: '',
    body: '',
    category: 'sales',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  // Target Template fields (currently selected for viewing/editing)
  const currentTemplate = templates.find(t => t.id === selectedTemplateId);
  const [editName, setEditName] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editCategory, setEditCategory] = useState<'sales' | 'marketing' | 'follow_up' | 'support' | 'custom'>('sales');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagText, setEditTagText] = useState('');

  // Testing variables state
  const [testContactId, setTestContactId] = useState<string>(contacts[0]?.id || '');
  const [testSenderName, setTestSenderName] = useState('Alex Chen');
  const [simulationStatus, setSimulationStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  // Sync back state
  useEffect(() => {
    localStorage.setItem('crm_email_templates', JSON.stringify(templates));
  }, [templates]);

  // Load selected template values into edit state
  useEffect(() => {
    if (currentTemplate) {
      setEditName(currentTemplate.name);
      setEditSubject(currentTemplate.subject);
      setEditBody(currentTemplate.body);
      setEditCategory(currentTemplate.category);
      setEditTags(currentTemplate.tags);
    }
  }, [selectedTemplateId]);

  // Automatically update selected test contact ID if contacts list loads
  useEffect(() => {
    if (contacts.length > 0 && !testContactId) {
      setTestContactId(contacts[0].id);
    }
  }, [contacts]);

  const handleSaveTemplate = () => {
    if (!currentTemplate) return;
    setTemplates(prev => prev.map(t => {
      if (t.id === selectedTemplateId) {
        return {
          ...t,
          name: editName,
          subject: editSubject,
          body: editBody,
          category: editCategory,
          tags: editTags,
          lastModified: new Date().toISOString().split('T')[0]
        };
      }
      return t;
    }));
    alert('Changes saved successfully!');
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.body) {
      alert('Please fill out all required fields.');
      return;
    }

    const brandNew: EmailTemplate = {
      ...newTemplate,
      id: `temp-${Date.now()}`,
      lastModified: new Date().toISOString().split('T')[0]
    };

    setTemplates(prev => [brandNew, ...prev]);
    setSelectedTemplateId(brandNew.id);
    setIsCreatingNew(false);
    // Reset state
    setNewTemplate({
      name: '',
      subject: '',
      body: '',
      category: 'sales',
      tags: []
    });
    setTagInput('');
  };

  const handleDeleteTemplate = (id: string) => {
    if (templates.length <= 1) {
      alert('You must have at least one email template.');
      return;
    }
    if (confirm('Are you sure you want to delete this template?')) {
      const remaining = templates.filter(t => t.id !== id);
      setTemplates(remaining);
      setSelectedTemplateId(remaining[0].id);
    }
  };

  const addTagToNew = () => {
    const text = tagInput.trim();
    if (text && !newTemplate.tags.includes(text)) {
      setNewTemplate(p => ({ ...p, tags: [...p.tags, text] }));
      setTagInput('');
    }
  };

  const removeTagFromNew = (tag: string) => {
    setNewTemplate(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }));
  };

  const addTagToEdit = () => {
    const text = editTagText.trim();
    if (text && !editTags.includes(text)) {
      setEditTags(prev => [...prev, text]);
      setEditTagText('');
    }
  };

  const removeTagFromEdit = (tag: string) => {
    setEditTags(prev => prev.filter(t => t !== tag));
  };

  // Helper keyword substitute
  const renderMergedText = (rawStr: string): string => {
    const matchingContact = contacts.find(c => c.id === testContactId);
    let output = rawStr;

    // Default mock tags if contact not loaded
    const contactName = matchingContact ? matchingContact.name : 'Sarah Connor';
    const splitName = contactName.split(' ');
    const firstName = splitName[0] || 'Sarah';
    const lastName = splitName.slice(1).join(' ') || 'Connor';
    const email = matchingContact ? matchingContact.email : 'sarah.connor@cyberdyne.io';
    const phone = matchingContact ? matchingContact.phone : '+1 (310) 555-0199';
    const company = matchingContact ? matchingContact.company : 'Cyberdyne Systems';
    const title = matchingContact ? matchingContact.title : 'Operations Director';
    const industry = (matchingContact as any)?.industry || 'Technology';

    output = output.replace(/\{\{contact_name\}\}/g, contactName);
    output = output.replace(/\{\{first_name\}\}/g, firstName);
    output = output.replace(/\{\{last_name\}\}/g, lastName);
    output = output.replace(/\{\{email\}\}/g, email);
    output = output.replace(/\{\{phone\}\}/g, phone);
    output = output.replace(/\{\{company\}\}/g, company);
    output = output.replace(/\{\{title\}\}/g, title);
    output = output.replace(/\{\{industry\}\}/g, industry);
    output = output.replace(/\{\{sender_name\}\}/g, testSenderName);

    return output;
  };

  // Trigger test send simulation
  const handleSimulateSend = () => {
    setSimulationStatus('sending');
    setTimeout(() => {
      setSimulationStatus('success');
      setTimeout(() => {
        setSimulationStatus('idle');
      }, 3000);
    }, 1500);
  };

  // Filter criteria
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Intro Sub-head Panel */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Email Templates & Snippets Manager
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Write email templates with variables. Merge contacts instantly to preview, copy, or simulate outreach.
          </p>
        </div>
        <button
          onClick={() => setIsCreatingNew(!isCreatingNew)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-colors flex items-center gap-2 justify-center shadow-md hover:shadow-indigo-600/10"
        >
          {isCreatingNew ? (
            <>Back to Library</>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create New Template
            </>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isCreatingNew ? (
          /* CREATE NEW TEMPLATE FORM */
          <motion.div
            key="creative-new"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 shadow-sm space-y-6"
          >
            <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Design Outreach Blueprint</h3>
              <p className="text-xs text-slate-400">Build interactive layouts using double curly bracket tokens.</p>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Template Display Alias</label>
                  <input
                    type="text"
                    required
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Sales Follow-up (Week 2)"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Category Channel</label>
                  <select
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate(p => ({ ...p, category: e.target.value as any }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="sales">Sales & Business Development</option>
                    <option value="marketing">Marketing Announcements</option>
                    <option value="follow_up">Standard Multi-step Follow-up</option>
                    <option value="support">Service & Technical Support</option>
                    <option value="custom">Custom Miscellaneous</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Subject Line Theme</label>
                <input
                  type="text"
                  required
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate(p => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g. Action Required: Custom scope parameters for {{company}}"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Email Markdown Body</label>
                  <div className="flex flex-wrap gap-1.5 text-[10px] text-indigo-500 font-mono">
                    <span>Token: <code>{"{{contact_name}}"}</code></span>
                    <span>•</span>
                    <span><code>{"{{company}}"}</code></span>
                    <span>•</span>
                    <span><code>{"{{title}}"}</code></span>
                    <span>•</span>
                    <span><code>{"{{sender_name}}"}</code></span>
                  </div>
                </div>
                <textarea
                  rows={9}
                  required
                  value={newTemplate.body}
                  onChange={(e) => setNewTemplate(p => ({ ...p, body: e.target.value }))}
                  placeholder="Hi {{contact_name}},\n\nI was reviewing company requirements for {{company}}...\n\nSincerely,\n{{sender_name}}"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
                />
              </div>

              {/* Tags addition */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Outreach Tags</label>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add e.g. Outbound, Urgent"
                    className="max-w-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTagToNew();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addTagToNew}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {newTemplate.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTagFromNew(tag)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all"
                >
                  Save to Library
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          /* REGULAR TEMPLATE EXPLORER GRID */
          <motion.div
            key="library-grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column: templates directory index */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm space-y-4 max-h-[850px] overflow-y-auto custom-scrollbar">
              
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Search templates, subjects, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
                
                {/* Category selectors */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['all', 'sales', 'marketing', 'follow_up', 'support'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                        selectedCategory === cat 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {cat.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Templates Listing */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-750">
                {filteredTemplates.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No templates match the filters.</p>
                ) : (
                  filteredTemplates.map(temp => (
                    <button
                      key={temp.id}
                      onClick={() => setSelectedTemplateId(temp.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-2 ${
                        selectedTemplateId === temp.id
                          ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-500/10 shadow-sm'
                          : 'border-slate-100 dark:border-slate-750 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
                          temp.category === 'sales' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          temp.category === 'marketing' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                          temp.category === 'follow_up' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {temp.category === 'follow_up' ? 'follow' : temp.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{temp.lastModified}</span>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">{temp.name}</h4>
                        <p className="text-xs text-slate-400 font-medium truncate">Subj: {temp.subject}</p>
                      </div>

                      {temp.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {temp.tags.map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] text-slate-500 dark:text-slate-400">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>

            </div>

            {/* Right Column: Template content workspace */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[600px]">
              
              {/* Workspace Header Tabs */}
              <div className="flex border-b border-slate-100 dark:border-slate-700 bg-slate-50/55 dark:bg-slate-900/30 px-6 justify-between items-center">
                <div className="flex gap-4">
                  <button
                    onClick={() => setPanelTab('edit')}
                    className={`py-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-colors ${
                      panelTab === 'edit'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Template Blueprint Editor
                  </button>
                  <button
                    onClick={() => setPanelTab('test')}
                    className={`py-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-colors ${
                      panelTab === 'test'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Interactive Sandbox & Merge
                  </button>
                </div>

                {currentTemplate && (
                  <button
                    onClick={() => handleDeleteTemplate(currentTemplate.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 p-2"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-16V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Template
                  </button>
                )}
              </div>

              {/* Workspace Content Panels */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                {currentTemplate ? (
                  <AnimatePresence mode="wait">
                    {panelTab === 'edit' ? (
                      /* MAIN BLUEPRINT WRITER */
                      <motion.div
                        key="edit-workings"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-5"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Template Display Title</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-slate-950 dark:text-white font-bold text-sm focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Category Class</label>
                            <select
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value as any)}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-slate-900 dark:text-white focus:outline-none text-xs"
                            >
                              <option value="sales">Sales & Business Development</option>
                              <option value="marketing">Marketing Announcements</option>
                              <option value="follow_up">Standard Multi-step Follow-up</option>
                              <option value="support">Service & Technical Support</option>
                              <option value="custom">Custom Miscellaneous</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Subject Theme Header</label>
                          <input
                            type="text"
                            value={editSubject}
                            onChange={(e) => setEditSubject(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-slate-900 dark:text-white font-medium text-sm focus:outline-none"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Email Markdown Template</label>
                            <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded font-mono">Use double braces</span>
                          </div>
                          <textarea
                            rows={11}
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-xl text-slate-900 dark:text-white font-sans leading-relaxed focus:outline-none text-sm"
                          />
                        </div>

                        {/* Edit tags */}
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Refining Tags</label>
                          <div className="flex items-center gap-1.5 mb-2">
                            <input
                              type="text"
                              value={editTagText}
                              onChange={(e) => setEditTagText(e.target.value)}
                              placeholder="New tag..."
                              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addTagToEdit();
                                }
                              }}
                            />
                            <button
                              onClick={addTagToEdit}
                              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg text-xs"
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {editTags.map(tag => (
                              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                {tag}
                                <button
                                  onClick={() => removeTagFromEdit(tag)}
                                  className="hover:text-red-500 font-bold"
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 text-right">
                          <button
                            onClick={handleSaveTemplate}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl tracking-wider uppercase transition-colors"
                          >
                            Save Template Changes
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      /* ACTIVE sandbox & MERGE ENGINE TESTER */
                      <motion.div
                        key="test-workings"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        {/* Selector parameters panel */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Simulate Target Contact</label>
                            <select
                              value={testContactId}
                              onChange={(e) => setTestContactId(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs"
                            >
                              {contacts.length === 0 ? (
                                <option value="">-- No contacts found in CRM --</option>
                              ) : (
                                contacts.map(c => (
                                  <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                                ))
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Simulate Sender Name</label>
                            <input
                              type="text"
                              value={testSenderName}
                              onChange={(e) => setTestSenderName(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs"
                            />
                          </div>
                        </div>

                        {/* Interactive Render Email Box */}
                        <div className="bg-slate-900 border border-slate-950 rounded-2xl p-4 md:p-6 text-white space-y-4 shadow-inner relative">
                          
                          {/* Sending status simulator alerts */}
                          <AnimatePresence>
                            {simulationStatus === 'sending' && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-950/90 rounded-2xl flex flex-col items-center justify-center space-y-3 z-10"
                              >
                                <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-sm font-bold text-slate-300">Routing outreach package through active SendGrid thread...</span>
                              </motion.div>
                            )}

                            {simulationStatus === 'success' && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-950/90 rounded-2xl flex flex-col items-center justify-center space-y-3 z-10 p-6 text-center"
                              >
                                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/35">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <h4 className="font-bold text-white text-base">Campaign Message Sent!</h4>
                                <p className="text-xs text-slate-400 max-w-sm">
                                  Outreach email simulation executed. Active contact log record was appended successfully for test.
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Top Metadata Headers */}
                          <div className="space-y-2 border-b border-slate-800 pb-4 font-sans text-xs">
                            <div className="flex items-center gap-3">
                              <span className="text-slate-500 font-bold w-12 text-right">From:</span>
                              <span className="text-indigo-400 font-medium font-mono">{testSenderName.toLowerCase().replace(/[^a-z]/g, '')}@novcrm.com</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-500 font-bold w-12 text-right">To:</span>
                              <span className="text-slate-300 font-medium">
                                {contacts.find(c => c.id === testContactId)?.name || 'Sarah Connor'} 
                                <span className="text-slate-500 text-[11px] ml-1 font-mono">{`<${contacts.find(c => c.id === testContactId)?.email || 'sarah.connor@cyberdyne.io'}>`}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-3 pt-1">
                              <span className="text-slate-500 font-bold w-12 text-right">Subject:</span>
                              <span className="text-indigo-200 font-bold text-sm tracking-tight">
                                {renderMergedText(editSubject)}
                              </span>
                            </div>
                          </div>

                          {/* Body Text Output block */}
                          <div className="py-4 font-sans text-slate-300 text-sm whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar">
                            {renderMergedText(editBody)}
                          </div>

                        </div>

                        {/* Control Triggers */}
                        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
                          <p className="text-xs text-slate-400">
                            Placeholders replaced: <strong className="text-indigo-500">Contact details matched</strong>
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const payload = `Subject: ${renderMergedText(editSubject)}\n\n${renderMergedText(editBody)}`;
                                navigator.clipboard.writeText(payload);
                                alert('Rendered email copied to clipboard!');
                              }}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors"
                            >
                              Copy Final Email
                            </button>
                            <button
                              onClick={handleSimulateSend}
                              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                              Send Simulated Email
                            </button>
                          </div>
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>
                ) : (
                  <p className="text-sm text-slate-400 py-12 text-center">Please select a template from the index folder left.</p>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  IconSettings, IconFilter, IconCheckCircle, IconClock, IconZap, 
  IconPlus, IconArrowRight, IconPlay, IconPause, IconMoreVertical,
  IconMail, IconSend, IconCheck, IconAlertCircle, IconSave
} from './Icons';
import { Lead } from '../types';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  trigger: string;
  lastRun: string;
}

const mockWorkflows: Workflow[] = [
  { id: '1', name: 'Lead Stagnation SLA Alert', description: 'Triggers in-app alerts when a lead remains stuck in any pipeline stage for > 3 months (90 days)', status: 'active', trigger: 'SLA Breach (90 days)', lastRun: 'Just now' },
  { id: '2', name: 'High Value Lead Assignment', description: 'Assign leads with score > 80 to Senior Sales', status: 'active', trigger: 'Lead Score Update', lastRun: '2 mins ago' },
  { id: '3', name: 'Stale Deal Escalation', description: 'Escalate deals stuck in negotiation for 7 days', status: 'active', trigger: 'SLA Breach (7 days)', lastRun: '1 hour ago' },
  { id: '4', name: 'Quarterly Review Reminder', description: 'Send automated reminders for QBRs', status: 'paused', trigger: 'Schedule (Monthly)', lastRun: '14 days ago' },
  { id: '5', name: 'Discount Approval', description: 'Require VP approval for discounts > 20%', status: 'active', trigger: 'Deal Update', lastRun: '5 mins ago' }
];

interface WorkflowsProps {
  leads?: Lead[];
}

const Workflows: React.FC<WorkflowsProps> = ({ leads = [] }) => {
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows);
  const [isCreating, setIsCreating] = useState(false);

  // SLA & Nudge parameters:
  const [nudgeEnabled, setNudgeEnabled] = useState(() => {
    const saved = localStorage.getItem('nova_sla_nudge_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [nudgeThreshold, setNudgeThreshold] = useState(() => {
    const saved = localStorage.getItem('nova_sla_nudge_threshold');
    return saved ? parseInt(saved, 10) : 60;
  });
  const [slaThreshold, setSlaThreshold] = useState(() => {
    const saved = localStorage.getItem('nova_sla_threshold');
    return saved ? parseInt(saved, 10) : 90;
  });
  const [nudgeEmailSubject, setNudgeEmailSubject] = useState(() => {
    return localStorage.getItem('nova_sla_nudge_subject') || '[Nudge] Lead Stagnation Warning: {lead_name}';
  });
  const [nudgeEmailBody, setNudgeEmailBody] = useState(() => {
    return localStorage.getItem('nova_sla_nudge_body') || 'Hi {owner_name},\n\nOur system detected that the lead "{lead_name}" has remained in the "{lead_stage}" pipeline stage for {days} days, exceeding our {threshold}-day warning threshold.\n\nPlease follow up with them as soon as possible to keep the opportunity moving.\n\nBest regards,\nNova CRM Automated Assistant';
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSavePolicy = () => {
    localStorage.setItem('nova_sla_nudge_enabled', nudgeEnabled.toString());
    localStorage.setItem('nova_sla_nudge_threshold', nudgeThreshold.toString());
    localStorage.setItem('nova_sla_threshold', slaThreshold.toString());
    localStorage.setItem('nova_sla_nudge_subject', nudgeEmailSubject);
    localStorage.setItem('nova_sla_nudge_body', nudgeEmailBody);
    showToast('SLA & Nudging parameters updated successfully!');
  };

  const [manualNudgesSent, setManualNudgesSent] = useState<string[]>([]);
  const handleSendManualNudge = (leadId: string, leadName: string) => {
    setManualNudgesSent(prev => [...prev, leadId]);
    showToast(`Simulation: Nudge email dispatched to owner for ${leadName}!`);
  };

  // Compute live stagnant leads
  const today = new Date();
  
  const leadsInNudgeZone = useMemo(() => {
    return leads.filter(lead => {
      const dateStr = lead.statusUpdatedAt || lead.creationDate;
      if (!dateStr) return false;
      const lastUpdate = new Date(dateStr);
      const diffTime = Math.abs(today.getTime() - lastUpdate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= nudgeThreshold && diffDays < slaThreshold;
    });
  }, [leads, nudgeThreshold, slaThreshold]);

  // Expandable state for template editor
  const [isTemplateExpanded, setIsTemplateExpanded] = useState(false);

  // Generate Email Preview Text based on template and first match or dummy data
  const emailPreview = useMemo(() => {
    const sampleLead = leadsInNudgeZone[0] || leads[0] || {
      name: 'Michael Scott',
      owner: 'Pam Beesly',
      status: 'Qualified',
    };
    
    const leadName = sampleLead.name || `${sampleLead.firstName || ''} ${sampleLead.lastName || ''}`.trim() || 'John Doe';
    const ownerName = sampleLead.owner || 'Sales Agent';
    const leadStage = sampleLead.status || 'In Progress';
    
    let daysDiff = 64; 
    if (sampleLead.statusUpdatedAt || sampleLead.creationDate) {
      const dateStr = sampleLead.statusUpdatedAt || sampleLead.creationDate;
      const lastUpdate = new Date(dateStr!);
      const diffTime = Math.abs(today.getTime() - lastUpdate.getTime());
      daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const sub = nudgeEmailSubject
      .replace('{lead_name}', leadName)
      .replace('{lead_stage}', leadStage)
      .replace('{days}', daysDiff.toString())
      .replace('{threshold}', nudgeThreshold.toString())
      .replace('{owner_name}', ownerName);

    const body = nudgeEmailBody
      .replace('{lead_name}', leadName)
      .replace('{lead_stage}', leadStage)
      .replace('{days}', daysDiff.toString())
      .replace('{threshold}', nudgeThreshold.toString())
      .replace('{owner_name}', ownerName);

    return {
      to: sampleLead.owner ? `${sampleLead.owner.toLowerCase().replace(/\s+/g, '')}@novacrm.com` : 'owner@novacrm.com',
      subject: sub,
      body: body
    };
  }, [nudgeEmailSubject, nudgeEmailBody, leadsInNudgeZone, leads, nudgeThreshold]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Workflow Automation Engine</h1>
          <p className="text-slate-500 dark:text-slate-400">Design rule-based triggers, approvals, and SLA escalations.</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          {isCreating ? 'Back to List' : <><IconPlus className="w-5 h-5" /> Create Workflow</>}
        </button>
      </header>

      {!isCreating ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main List Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden animate-fade-in">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex gap-4">
                <div className="relative flex-1">
                  <IconFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search workflows..." className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm select-none" />
                </div>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Workflow Name</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trigger</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Run</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {workflows.map(wf => (
                    <tr key={wf.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group">
                      <td className="p-4">
                        <p className="font-medium text-slate-900 dark:text-white">{wf.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{wf.description}</p>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <IconZap className="w-3 h-3 text-amber-500" />
                          {wf.trigger}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          wf.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                          wf.status === 'paused' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {wf.status === 'active' && <IconPlay className="w-3 h-3" />}
                          {wf.status === 'paused' && <IconPause className="w-3 h-3" />}
                          {wf.status.charAt(0).toUpperCase() + wf.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{wf.lastRun}</td>
                      <td className="p-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <IconMoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SLA & Early Nudge Configuration Sidebar Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col gap-5 relative overflow-hidden animate-fade-in">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700/50 pb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <IconSettings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">SLA & Nudging Policy</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-450">Stagnant pipeline trigger settings</p>
                </div>
              </div>

              {/* Toggle automated nudges */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-slate-850 dark:text-slate-200">Automate owner nudges</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Trigger email alerts to lead owners</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={nudgeEnabled} 
                    onChange={(e) => setNudgeEnabled(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-500/35 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {nudgeEnabled && (
                <>
                  {/* early nudge slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                        <IconClock className="w-3.5 h-3.5 text-slate-450 text-blue-500" />
                        Early Nudge Threshold
                      </label>
                      <span className="text-xs font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300 px-2 py-0.5 rounded-full">{nudgeThreshold} Days</span>
                    </div>
                    <input 
                      type="range" 
                      min="15" 
                      max="89" 
                      step="5"
                      value={nudgeThreshold} 
                      onChange={(e) => setNudgeThreshold(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Dispatches early nudge email alerts to lead owners when inactivity is between <strong>{nudgeThreshold}</strong> and <strong>{slaThreshold}</strong> days.
                    </p>
                  </div>

                  {/* SLA critical slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                        <IconAlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        Critical SLA Threshold
                      </label>
                      <span className="text-xs font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 px-2 py-0.5 rounded-full">{slaThreshold} Days</span>
                    </div>
                    <input 
                      type="range" 
                      min="90" 
                      max="180" 
                      step="5"
                      value={slaThreshold} 
                      onChange={(e) => setSlaThreshold(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Triggers full dashboard in-app stagnation flags if lead sits stuck in stage above <strong>{slaThreshold} days</strong>.
                    </p>
                  </div>

                  {/* Customizable Email Template */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                    <button 
                      onClick={() => setIsTemplateExpanded(!isTemplateExpanded)}
                      className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <IconMail className="w-3.5 h-3.5 text-primary-500" />
                        Customize Nudge Template
                      </span>
                      <IconPlus className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isTemplateExpanded ? 'rotate-45' : ''}`} />
                    </button>
                    {isTemplateExpanded && (
                      <div className="p-3 bg-white dark:bg-slate-805 border-t border-slate-200 dark:border-slate-700 space-y-3">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wide font-extrabold text-slate-500 dark:text-slate-400 mb-1">Subject Template</label>
                          <input 
                            type="text" 
                            value={nudgeEmailSubject} 
                            onChange={(e) => setNudgeEmailSubject(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-905 border border-slate-200 dark:border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wide font-extrabold text-slate-500 dark:text-slate-400 mb-1">Email Body Template</label>
                          <textarea 
                            rows={4}
                            value={nudgeEmailBody} 
                            onChange={(e) => setNudgeEmailBody(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-905 border border-slate-200 dark:border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono leading-relaxed"
                          />
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Available placeholders: {'{owner_name}'}, {'{lead_name}'}, {'{lead_stage}'}, {'{days}'}, {'{threshold}'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Live Template Preview Card */}
                  <div className="p-4 bg-slate-900 dark:bg-slate-950 text-slate-200 rounded-xl font-mono text-[10px] leading-relaxed shadow-lg border border-slate-800">
                    <div className="border-b border-slate-800 pb-2 mb-2 flex items-center justify-between text-[9px] text-slate-500 uppercase tracking-wide">
                      <span>Live Preview Engine</span>
                      <span className="text-primary-400 flex items-center gap-1 font-bold">● standard rendering</span>
                    </div>
                    <div className="space-y-1 text-slate-400">
                      <div><span className="text-slate-600">To:</span> {emailPreview.to}</div>
                      <div><span className="text-slate-600">Subject:</span> <span className="text-slate-200 font-bold">{emailPreview.subject}</span></div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800/80 whitespace-pre-wrap text-slate-300 text-[10px]">
                      {emailPreview.body}
                    </div>
                  </div>
                </>
              )}

              {/* Trigger Saving Config */}
              <button 
                onClick={handleSavePolicy}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 font-bold text-white text-xs rounded-xl shadow-md shadow-primary-600/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <IconSave className="w-4 h-4" />
                Save Nudge Policy Settings
              </button>
            </div>

            {/* Dynamic matching leads list in inactivity queue */}
            {nudgeEnabled && (
              <div className="bg-white dark:bg-slate-805 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 flex items-center justify-center text-[10px] font-extrabold">{leadsInNudgeZone.length}</span>
                    Nudge Queue (60+ days)
                  </h4>
                  <span className="text-[10px] uppercase font-extrabold tracking-wide text-primary-550 dark:text-primary-400">SLA Pending</span>
                </div>
                {leadsInNudgeZone.length === 0 ? (
                  <p className="text-[11px] text-slate-550 dark:text-slate-400 italic text-center py-4 bg-slate-50 dark:bg-slate-900/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    Excellent pipeline status! All leads are advanced or updated within {nudgeThreshold} days threshold.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar">
                    {leadsInNudgeZone.map(lead => {
                      const ageDays = lead && (lead.statusUpdatedAt || lead.creationDate) ? 
                        Math.ceil(Math.abs(today.getTime() - new Date(lead.statusUpdatedAt || lead.creationDate!).getTime()) / (1000 * 60 * 60 * 24)) : 65;
                      const hasSent = manualNudgesSent.includes(lead.id);
                      return (
                        <div key={lead.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 group/lead transition-all hover:bg-slate-100/50">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{lead.name || `${lead.firstName || ''} ${lead.lastName || ''}`.trim()}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-400">{lead.status || 'New'}</span>
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                                <IconClock className="w-3 h-3" />
                                {ageDays}d stagnant
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleSendManualNudge(lead.id, lead.name || `${lead.firstName || ''} ${lead.lastName || ''}`)}
                            disabled={hasSent}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                              hasSent 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-500/10' 
                                : 'bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 group-hover/lead:border-blue-400'
                            }`}
                          >
                            {hasSent ? (
                              <>
                                <IconCheck className="w-3 h-3" />
                                <span>Dispatched</span>
                              </>
                            ) : (
                              <>
                                <IconSend className="w-3 h-3 text-slate-400 group-hover/lead:text-blue-500 animate-pulse" />
                                <span>Dispatch</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 min-h-[600px] flex flex-col items-center justify-start relative overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTQ4LCAxNjMsIDE4NCwgMC4yKSIvPjwvc3ZnPg==')]">
            
            {/* Trigger Node */}
            <div className="bg-white dark:bg-slate-800 border-2 border-primary-500 rounded-xl p-4 shadow-lg w-72 mb-8 relative z-10">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                    <IconZap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Trigger</p>
                    <p className="font-semibold text-slate-900 dark:text-white">Lead Score Updates</p>
                  </div>
               </div>
            </div>

            {/* Arrow */}
            <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-700 mb-8 relative z-0">
               <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 border-r-2 border-b-2 border-slate-300 dark:border-slate-700 rotate-45"></div>
            </div>

            {/* Condition Node */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-md w-72 mb-8 relative z-10">
               <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <IconFilter className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Condition</p>
                    <p className="font-semibold text-slate-900 dark:text-white">Score &gt; 80</p>
                  </div>
               </div>
               <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2 text-xs font-mono text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                  IF lead.score GREATER_THAN 80
               </div>
            </div>

            {/* Split Arrows */}
            <div className="flex w-64 justify-between mb-8 relative z-0">
                <div className="w-[120px] h-8 border-t-2 border-l-2 border-slate-300 dark:border-slate-700 rounded-tl-xl relative">
                     <div className="absolute -bottom-2 left-0 -translate-x-1/2 w-3 h-3 border-r-2 border-b-2 border-slate-300 dark:border-slate-700 rotate-45 translate-x-[2px]"></div>
                </div>
                <div className="w-[120px] h-8 border-t-2 border-r-2 border-slate-300 dark:border-slate-700 rounded-tr-xl relative">
                     <div className="absolute -bottom-2 right-0 translate-x-1/2 w-3 h-3 border-r-2 border-b-2 border-slate-300 dark:border-slate-700 rotate-45 -translate-x-[2px]"></div>
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-4 bg-slate-300 dark:bg-slate-700"></div>
            </div>

             <div className="flex gap-8 z-10">
                {/* Action Node 1 */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-md w-64">
                  <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <IconCheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Action</p>
                        <p className="font-semibold text-slate-900 dark:text-white">Assign to Senior</p>
                      </div>
                  </div>
                </div>

                {/* Action Node 2 */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-md w-64">
                  <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <IconPlay className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Action</p>
                        <p className="font-semibold text-slate-900 dark:text-white">Notify Director</p>
                      </div>
                  </div>
                </div>
            </div>

          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 h-fit sticky top-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Node Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Node Type</label>
                <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
                  <option>Condition (IF/ELSE)</option>
                  <option>Action</option>
                  <option>Approval Request</option>
                  <option>SLA Escalation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Field</label>
                <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
                  <option>Lead Score</option>
                  <option>Deal Value</option>
                  <option>Days in Stage</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Operator</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
                      <option>&gt; Greater Than</option>
                      <option>&lt; Less Than</option>
                      <option>= Equals</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Value</label>
                    <input type="number" defaultValue={80} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
              </div>
              <button className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors mt-4">
                Save Node
              </button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 space-y-3">
              <button className="w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium rounded-lg transition-colors">
                Test Workflow
              </button>
              <button className="w-full py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200 font-medium rounded-lg transition-colors">
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workflows;

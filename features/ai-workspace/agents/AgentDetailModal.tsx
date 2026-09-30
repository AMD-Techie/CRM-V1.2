import React from 'react';
import { AIAgent } from '../../../types/ai';
import { 
  IconSparkles, 
  IconZap, 
  IconShield, 
  IconCheckCircle, 
  IconPlay, 
  IconEdit, 
  IconX, 
  IconLock, 
  IconEye, 
  IconClock, 
  IconChevronRight, 
  IconArrowRight,
  IconDatabase,
  IconUsers
} from '../../../components/Icons';

interface AgentDetailModalProps {
  agent: AIAgent;
  isOpen: boolean;
  onClose: () => void;
  onOpenStudio: (agent: AIAgent) => void;
  onTriggerRun: (agent: AIAgent) => void;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  agent,
  isOpen,
  onClose,
  onOpenStudio,
  onTriggerRun
}) => {
  if (!isOpen) return null;

  const activeVer = agent.versions.find(v => v.version === agent.activeVersion) || agent.versions[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                agent.status === 'active' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' :
                agent.status === 'paused' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30' :
                'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30'
              }`}>
                {agent.status}
              </span>
              <span className="text-xs font-bold text-slate-400">
                Active: {agent.activeVersion}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {String(agent.category || 'General').replace(/_/g, ' ')}
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {agent.name}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {agent.tagline || agent.description}
            </p>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Telemetry Strip */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Executions</span>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{agent.totalExecutions.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Success Rate</span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{agent.successRate}%</div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Last Run</span>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">{agent.lastRunAt || 'Never'}</div>
          </div>
        </div>

        {/* Purpose Statement */}
        {agent.purpose && (
          <div className="p-4 rounded-2xl bg-primary-50/40 dark:bg-primary-950/20 border border-primary-500/20 space-y-1">
            <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Business Purpose</span>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{agent.purpose}</p>
          </div>
        )}

        {/* Assigned Model & Capabilities */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Active Capabilities ({agent.capabilities.length}) · Model: <span className="font-mono text-primary-600 dark:text-primary-400">{activeVer?.model}</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {agent.capabilities.map(c => (
              <span key={c} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {c.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Guardrails */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Operational Guardrails ({agent.guardrails.length})
          </span>
          <div className="space-y-1.5">
            {agent.guardrails.map((gr, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <IconShield className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{gr}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Version History Quick Summary */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Version Timeline ({agent.versions.length})
          </span>
          <div className="space-y-1.5">
            {agent.versions.map(v => (
              <div key={v.version} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{v.version}</span>
                  <span className="text-slate-400">({v.status})</span>
                </div>
                <span className="text-[11px] text-slate-400">{new Date(v.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              onClose();
              onTriggerRun(agent);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <IconPlay className="w-3.5 h-3.5 text-emerald-500" />
            <span>Run Test</span>
          </button>
          
          <button
            onClick={() => {
              onClose();
              onOpenStudio(agent);
            }}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 flex items-center gap-1.5"
          >
            <IconEdit className="w-3.5 h-3.5" />
            <span>Open in Agent Studio</span>
          </button>
        </div>
      </div>
    </div>
  );
};

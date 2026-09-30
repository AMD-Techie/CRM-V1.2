import React, { useState } from 'react';
import { useCapabilitiesQuery, useToggleCapabilityMutation } from '../../../hooks';
import { AgentCapabilityDefinition } from '../../../types/ai';
import { 
  IconShield, 
  IconCheckCircle, 
  IconAlertTriangle, 
  IconZap, 
  IconSearch, 
  IconFilter,
  IconLock,
  IconRefreshCw
} from '../../../components/Icons';

interface CapabilitiesMatrixViewProps {
  onNavigate?: (view: string, id?: string) => void;
}

export const CapabilitiesMatrixView: React.FC<CapabilitiesMatrixViewProps> = ({ onNavigate }) => {
  const { data: capabilities = [], isLoading, refetch } = useCapabilitiesQuery();
  const toggleCapabilityMutation = useToggleCapabilityMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');

  const filteredCapabilities = capabilities.filter(cap => {
    const matchesCategory = selectedCategory === 'all' || cap.category === selectedCategory;
    const matchesRisk = selectedRisk === 'all' || cap.riskLevel === selectedRisk;
    const matchesSearch = !searchTerm || 
      cap.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      cap.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cap.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesRisk && matchesSearch;
  });

  const handleToggle = async (id: string) => {
    await toggleCapabilityMutation.mutateAsync(id);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 mb-1 uppercase tracking-wider">
            <IconShield className="w-4 h-4" />
            <span>Capability Boundary Isolation (DeepSeek Model)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Registered Capabilities & Boundary Contracts
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
            Service/provider/consumer separation: strictly guarded technical capabilities with explicit input/output contracts, risk levels, and approval policies.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors self-start sm:self-auto"
          title="Refresh Capabilities"
        >
          <IconRefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="relative flex-1 min-w-[220px]">
          <IconSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search capabilities by name, key, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              <option value="crm">CRM Records</option>
              <option value="communication">Communication</option>
              <option value="knowledge">Knowledge</option>
              <option value="calendar">Calendar</option>
              <option value="analytics">Analytics</option>
              <option value="integration">Integration</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Risk Tier:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="all">All Risk Tiers</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk (Approval Required)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCapabilities.map(cap => (
          <div
            key={cap.id}
            className={`p-5 rounded-3xl border transition-all space-y-3 ${
              cap.enabled
                ? 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-slate-200/40 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/30 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {cap.category}
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {cap.name}
                </h3>
                <span className="font-mono text-[10px] text-primary-600 dark:text-primary-400 font-bold">
                  {cap.key}
                </span>
              </div>

              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                cap.riskLevel === 'high' ? 'bg-red-500/15 text-red-800 dark:text-red-300' :
                cap.riskLevel === 'medium' ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300' :
                'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
              }`}>
                {cap.riskLevel}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              {cap.description}
            </p>

            {/* Input & Output Contracts */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                <span className="text-slate-400 font-bold block mb-0.5 font-sans uppercase text-[9px]">Input Contract</span>
                {cap.inputContract}
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                <span className="text-slate-400 font-bold block mb-0.5 font-sans uppercase text-[9px]">Output Contract</span>
                {cap.outputContract}
              </div>
            </div>

            {/* Invocations & Policy Toggle */}
            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-[10px] text-slate-400">
                {cap.totalInvocations} total calls
              </span>

              <button
                onClick={() => handleToggle(cap.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  cap.enabled
                    ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {cap.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useSkillsQuery, useCapabilitiesQuery, useCreateSkillMutation, useUpdateSkillMutation } from '../../../hooks';
import { AgentSkill } from '../../../types/ai';
import { 
  IconSparkles, 
  IconPlus, 
  IconCheckCircle, 
  IconBook, 
  IconShield, 
  IconZap, 
  IconX,
  IconEdit,
  IconSearch,
  IconRefreshCw
} from '../../../components/Icons';

interface SkillsViewProps {
  onNavigate?: (view: string, id?: string) => void;
}

export const SkillsView: React.FC<SkillsViewProps> = ({ onNavigate }) => {
  const { data: skills = [], isLoading, refetch } = useSkillsQuery();
  const { data: capabilities = [] } = useCapabilitiesQuery();
  const createSkillMutation = useCreateSkillMutation();
  const updateSkillMutation = useUpdateSkillMutation();

  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Create Skill Form State
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredSkills = skills.filter(skill => {
    const matchesCategory = categoryFilter === 'all' || skill.category === categoryFilter;
    const matchesSearch = !searchTerm || 
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.key.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeSkill = skills.find(s => s.id === selectedSkillId) || filteredSkills[0] || skills[0];

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) return;

    await createSkillMutation.mutateAsync({
      name,
      key,
      version: 'v1.0',
      description,
      instructions,
      status: 'published',
      category: 'sales_playbook',
      capabilityIds: selectedCapabilities.length > 0 ? selectedCapabilities : ['cap_crm_read_lead'],
      evaluationStatus: 'not_evaluated'
    });

    setIsCreateModalOpen(false);
    setName('');
    setKey('');
    setDescription('');
    setInstructions('');
    setToastMessage(`Skill "${name}" created and published.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 text-white flex items-center justify-between shadow-xl animate-fade-in fixed bottom-6 right-6 z-50 max-w-md">
          <div className="flex items-center gap-3">
            <IconCheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white p-1">
            <IconX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 mb-1 uppercase tracking-wider">
            <IconBook className="w-4 h-4" />
            <span>Procedural Business Skills Library</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Procedural Skills & Business Playbooks
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
            Hermes-style reusable business procedures loaded on-demand during agent runs, separating procedural instructions from persistent memory.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Refresh Skills"
          >
            <IconRefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <IconPlus className="w-4 h-4" />
            <span>New Business Skill</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="relative flex-1 min-w-[220px]">
          <IconSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search skills by name, key, or instructions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', 'sales_playbook', 'deal_governance', 'relationship_ops'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                categoryFilter === cat
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Split: Skills List & Detail Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Skills Directory (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Skills Directory ({filteredSkills.length})
            </h3>

            <div className="space-y-2.5">
              {filteredSkills.map(skill => {
                const isSelected = activeSkill?.id === skill.id;
                return (
                  <div
                    key={skill.id}
                    onClick={() => setSelectedSkillId(skill.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/30 ring-2 ring-primary-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900 dark:text-white">{skill.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">{skill.version}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
                          {skill.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {skill.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span className="font-mono text-primary-600 dark:text-primary-400">{skill.key}</span>
                        <span>{skill.capabilityIds.length} Capabilities Bound</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Skill Detail Dossier (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeSkill ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                      Procedural Skill Dossier
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{activeSkill.key}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {activeSkill.version}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {activeSkill.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {activeSkill.description}
                  </p>
                </div>

                {onNavigate && (
                  <button
                    onClick={() => onNavigate('ai_evaluations')}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                  >
                    <IconSparkles className="w-3.5 h-3.5" />
                    <span>Evaluate Skill</span>
                  </button>
                )}
              </div>

              {/* Instructions Playbook */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Procedural Execution Steps (Hermes Playbook)
                </span>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {activeSkill.instructions}
                </div>
              </div>

              {/* Bound Guarded Capabilities */}
              <div className="space-y-3">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Bound Capability Boundaries ({activeSkill.capabilityIds.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {activeSkill.capabilityIds.map(capId => {
                    const cap = capabilities.find(c => c.id === capId || c.key === capId);
                    return (
                      <div key={capId} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconZap className="w-3.5 h-3.5 text-primary-500" />
                          <strong className="text-slate-900 dark:text-white font-mono text-[11px]">{cap?.key || capId}</strong>
                        </div>
                        <span className="text-[9px] font-bold uppercase text-slate-400">{cap?.category || 'crm'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Telemetry Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Executions</span>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{activeSkill.totalExecutions || 0}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Success Rate</span>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{activeSkill.successRate || 100}%</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Evaluation Status</span>
                  <div className="text-xs font-black uppercase text-primary-600 dark:text-primary-400 mt-1">{activeSkill.evaluationStatus || 'Passed'}</div>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              Select a procedural skill to inspect its configuration.
            </div>
          )}
        </div>
      </div>

      {/* Create Skill Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <IconBook className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Create Procedural Business Skill
                  </h3>
                  <p className="text-xs text-slate-500">Define structured operational execution instructions</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSkill} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Skill Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Qualification Playbook"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Key Identifier *</label>
                  <input
                    type="text"
                    placeholder="sales.lead_qualification"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe what business procedure this skill performs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Step-by-Step Instructions</label>
                <textarea
                  rows={4}
                  placeholder="1. Query CRM for account details...&#10;2. Evaluate ICP match score...&#10;3. Stage action payload..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSkillMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <IconPlus className="w-3.5 h-3.5" />
                  <span>{createSkillMutation.isPending ? 'Publishing...' : 'Publish Skill'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

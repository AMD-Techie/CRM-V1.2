import React, { useState } from 'react';
import { AIAgent, AgentCategory, AgentCapability, ApprovalPolicy } from '../../../types/ai';
import { useCreateAgentMutation, useAIModelsQuery } from '../../../hooks';
import { IconSparkles, IconX, IconPlus, IconZap } from '../../../components/Icons';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: (createdAgent: AIAgent) => void;
}

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({ isOpen, onClose, onAgentCreated }) => {
  const { data: models = [] } = useAIModelsQuery();
  const createAgentMutation = useCreateAgentMutation();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [category, setCategory] = useState<AgentCategory>('lead_qualification');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro');
  const [owner, setOwner] = useState('Alex Chen (Sales Ops)');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setError('Please provide agent name and description.');
      return;
    }

    const defaultCapabilities: AgentCapability[] = category === 'lead_qualification' 
      ? ['search_leads', 'read_customer', 'enrich_company_data']
      : category === 'deal_acceleration'
      ? ['read_customer', 'draft_email', 'draft_whatsapp', 'create_task']
      : category === 'risk_management'
      ? ['analyze_opportunity', 'calculate_deal_risk', 'create_task']
      : ['read_customer', 'analyze_opportunity', 'generate_executive_brief'];

    const newAgentPayload = {
      name,
      tagline: tagline || `${name} Service`,
      description,
      purpose: purpose || description,
      role: `${name} Specialist`,
      category,
      owner,
      status: 'draft' as const,
      activeVersion: 'v1.0-draft',
      versions: [
        {
          version: 'v1.0-draft',
          status: 'draft' as const,
          instructions: `You are the ${name}. Formulate high-quality recommendations and operational actions based on CRM context.`,
          purpose: purpose || description,
          model: selectedModel,
          capabilities: defaultCapabilities,
          guardrails: ['Follow strict organizational communication standards', 'Always enforce required approval policies'],
          knowledgeScope: ['sales_playbook', 'product_catalog'],
          approvalPolicy: 'require_on_external_comms' as ApprovalPolicy,
          permissions: {
            read: true,
            create: true,
            update: true,
            delete: false,
            send: false,
            approve: false,
            execute: false,
            accessTier: 'staged_actions' as const
          },
          triggers: [
            { id: 'tr_manual_init', type: 'manual' as const, name: '1-Click Trigger', description: 'Manual trigger', enabled: true }
          ],
          actionPolicies: [
            { actionType: 'create_task', label: 'Create Follow-up Task', policy: 'autonomous' as ApprovalPolicy, riskLevel: 'low' as const },
            { actionType: 'send_email', label: 'Outbound Email', policy: 'always_require' as ApprovalPolicy, riskLevel: 'high' as const }
          ],
          createdAt: new Date().toISOString()
        }
      ],
      capabilities: defaultCapabilities,
      triggers: [
        { id: 'tr_manual_init', type: 'manual' as const, name: '1-Click Trigger', description: 'Manual trigger', enabled: true }
      ],
      guardrails: ['Follow strict organizational communication standards', 'Always enforce required approval policies'],
      knowledgeScope: ['sales_playbook', 'product_catalog'],
      approvalPolicy: 'require_on_external_comms' as ApprovalPolicy,
      permissions: {
        read: true,
        create: true,
        update: true,
        delete: false,
        send: false,
        approve: false,
        execute: false,
        accessTier: 'staged_actions' as const
      },
      actionPolicies: [
        { actionType: 'create_task', label: 'Create Follow-up Task', policy: 'autonomous' as ApprovalPolicy, riskLevel: 'low' as const },
        { actionType: 'send_email', label: 'Outbound Email', policy: 'always_require' as ApprovalPolicy, riskLevel: 'high' as const }
      ]
    };

    const created = await createAgentMutation.mutateAsync(newAgentPayload);
    onAgentCreated(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xl p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <IconSparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Create New AI Agent
              </h3>
              <p className="text-xs text-slate-500">Initialize a new autonomous CRM agent in Draft status</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Agent Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Inbound Deal Accelerator"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AgentCategory)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              >
                <option value="lead_qualification">Lead Qualification</option>
                <option value="deal_acceleration">Deal Acceleration & Follow-up</option>
                <option value="risk_management">Risk Radar & Churn Sentinel</option>
                <option value="account_expansion">Account Expansion</option>
                <option value="customer_support">Customer Support & SLA</option>
                <option value="executive_advisory">Executive Advisory & Briefing</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Automated high-touch pipeline recovery"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description *</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly explain what this agent accomplishes..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">AI Model Assignment</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              >
                {models.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.providerId})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Assigned Team / Owner</label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 flex items-center gap-1.5"
            >
              <IconPlus className="w-3.5 h-3.5" />
              <span>Create Draft Agent</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

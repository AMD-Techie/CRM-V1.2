import { KnowledgeSource, KnowledgeDocument } from '../types/knowledge';
import { apiClient } from './client';

export const INITIAL_KNOWLEDGE_SOURCES: KnowledgeSource[] = [
  {
    id: 'src_playbook',
    name: 'Enterprise Sales Playbook',
    type: 'sales_playbook',
    description: 'Core B2B objection handling, value propositions, buyer personas, and stage-by-stage qualification criteria.',
    totalDocuments: 8,
    totalTokens: 142000,
    indexStatus: 'indexed',
    lastSyncAt: 'Yesterday at 06:00 PM',
    authorizedRoles: ['admin', 'manager', 'sales_rep'],
    boundAgentsCount: 4
  },
  {
    id: 'src_products',
    name: 'Product Catalog & Technical Specs',
    type: 'product_catalog',
    description: 'Feature matrices, API specifications, platform security compliance, and integration capability matrices.',
    totalDocuments: 14,
    totalTokens: 285000,
    indexStatus: 'indexed',
    lastSyncAt: '2 days ago',
    authorizedRoles: ['admin', 'manager', 'sales_rep', 'support'],
    boundAgentsCount: 3
  },
  {
    id: 'src_pricing',
    name: 'Q3/Q4 Enterprise Pricing & Discount Matrix',
    type: 'pricing_matrix',
    description: 'Tiered volume pricing, multi-year discounting rules, partner margins, and executive approval thresholds.',
    totalDocuments: 4,
    totalTokens: 68000,
    indexStatus: 'indexed',
    lastSyncAt: 'Sep 15, 2026',
    authorizedRoles: ['admin', 'manager'],
    boundAgentsCount: 2
  },
  {
    id: 'src_faqs',
    name: 'Customer Support & Resolution FAQs',
    type: 'faq_database',
    description: 'Frequently asked customer questions, billing resolution flows, data migration guides, and SLA policies.',
    totalDocuments: 32,
    totalTokens: 195000,
    indexStatus: 'indexed',
    lastSyncAt: 'Today at 08:30 AM',
    authorizedRoles: ['admin', 'manager', 'sales_rep', 'support'],
    boundAgentsCount: 2
  }
];

export const INITIAL_KNOWLEDGE_DOCS: KnowledgeDocument[] = [
  {
    id: 'doc_pb_01',
    sourceId: 'src_playbook',
    title: 'Enterprise AI & Security Procurement Guide',
    category: 'sales_playbook',
    version: 'v3.2',
    fileSize: '1.4 MB',
    chunkCount: 42,
    tokenCount: 18400,
    indexStatus: 'indexed',
    lastIndexedAt: '2026-09-20',
    author: 'Elena Rostova',
    description: 'Standard responses for SOC2, ISO27001, data residency, and GDPR compliance questions.',
    usedByAgentIds: ['agent_lead_qual', 'agent_sales_followup']
  },
  {
    id: 'doc_pb_02',
    sourceId: 'src_playbook',
    title: 'SaaS Competitor Counter-Positioning Sheet',
    category: 'sales_playbook',
    version: 'v2.0',
    fileSize: '890 KB',
    chunkCount: 28,
    tokenCount: 12100,
    indexStatus: 'indexed',
    lastIndexedAt: '2026-09-22',
    author: 'Alex Chen',
    description: 'Key differentiators against legacy CRM suites and pricing transparency points.',
    usedByAgentIds: ['agent_sales_followup', 'agent_deal_risk']
  },
  {
    id: 'doc_pr_01',
    sourceId: 'src_pricing',
    title: '2026 Tier 1 Enterprise License Agreement Guidelines',
    category: 'pricing_matrix',
    version: 'v4.0',
    fileSize: '2.1 MB',
    chunkCount: 56,
    tokenCount: 24500,
    indexStatus: 'indexed',
    lastIndexedAt: '2026-09-15',
    author: 'Sarah Jenkins',
    description: 'Commercial terms, SLA guarantees, multi-year lock-in discounts, and payment terms.',
    usedByAgentIds: ['agent_sales_followup']
  }
];

export const knowledgeApi = {
  async getKnowledgeSources(): Promise<KnowledgeSource[]> {
    const saved = localStorage.getItem('nova_ai_knowledge_sources');
    const local = saved ? JSON.parse(saved) : INITIAL_KNOWLEDGE_SOURCES;
    return apiClient.get<KnowledgeSource[]>('/ai/knowledge/sources', local);
  },

  async getSources(): Promise<KnowledgeSource[]> {
    return knowledgeApi.getKnowledgeSources();
  },

  async getKnowledgeDocuments(sourceId?: string): Promise<KnowledgeDocument[]> {
    const saved = localStorage.getItem('nova_ai_knowledge_docs');
    const local = saved ? JSON.parse(saved) : INITIAL_KNOWLEDGE_DOCS;
    const docs = await apiClient.get<KnowledgeDocument[]>('/ai/knowledge/docs', local);
    if (sourceId) {
      return docs.filter(d => d.sourceId === sourceId);
    }
    return docs;
  },

  async getDocuments(sourceId?: string): Promise<KnowledgeDocument[]> {
    return knowledgeApi.getKnowledgeDocuments(sourceId);
  },

  async reindexSource(sourceId: string): Promise<void> {
    const sources = await knowledgeApi.getKnowledgeSources();
    const updated = sources.map(s => s.id === sourceId ? { ...s, indexStatus: 'indexed' as const, lastSyncAt: 'Just now' } : s);
    localStorage.setItem('nova_ai_knowledge_sources', JSON.stringify(updated));
  },

  async syncSource(sourceId: string): Promise<void> {
    return knowledgeApi.reindexSource(sourceId);
  }
};

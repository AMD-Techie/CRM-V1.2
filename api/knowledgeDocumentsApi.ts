import { KnowledgeDocument } from '../types/knowledge';
import { apiClient } from './client';

export const INITIAL_KNOWLEDGE_DOCS: KnowledgeDocument[] = [
  {
    id: 'doc_pb_01',
    sourceId: 'src_playbook',
    title: 'Enterprise AI & Security Procurement Guide',
    category: 'sales_playbook',
    version: 'v3.2',
    fileSize: '1.4 MB',
    mimeType: 'application/pdf',
    contentHash: 'sha256_9b841a09ef281c',
    chunkCount: 42,
    tokenCount: 18400,
    indexStatus: 'indexed',
    lastIndexedAt: '2026-09-20',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
    author: 'Elena Rostova',
    description: 'Standard responses for SOC2 Type II, ISO27001, data residency, GDPR compliance, and encryption keys.',
    authorizedRoles: ['admin', 'manager', 'sales_rep'],
    usedByAgentIds: ['agent_lead_qual', 'agent_sales_followup']
  },
  {
    id: 'doc_pb_02',
    sourceId: 'src_playbook',
    title: 'SaaS Competitor Counter-Positioning Sheet',
    category: 'sales_playbook',
    version: 'v2.0',
    fileSize: '890 KB',
    mimeType: 'text/markdown',
    contentHash: 'sha256_7c1248ba109df2',
    chunkCount: 28,
    tokenCount: 12100,
    indexStatus: 'indexed',
    lastIndexedAt: '2026-09-22',
    effectiveFrom: '2026-06-01',
    author: 'Alex Chen',
    description: 'Key differentiators against legacy CRM suites, migration timelines, and pricing transparency points.',
    authorizedRoles: ['admin', 'manager', 'sales_rep'],
    usedByAgentIds: ['agent_sales_followup', 'agent_deal_risk']
  },
  {
    id: 'doc_pr_01',
    sourceId: 'src_pricing',
    title: '2026 Tier 1 Enterprise License Agreement Guidelines',
    category: 'pricing_matrix',
    version: 'v4.0',
    fileSize: '2.1 MB',
    mimeType: 'application/pdf',
    contentHash: 'sha256_f82901ce0198bb',
    chunkCount: 56,
    tokenCount: 24500,
    indexStatus: 'indexed',
    lastIndexedAt: '2026-09-15',
    effectiveFrom: '2026-07-01',
    effectiveTo: '2027-06-30',
    author: 'Sarah Jenkins',
    description: 'Commercial terms, SLA guarantees, multi-year lock-in discounts, volume tiers, and VP approval thresholds.',
    authorizedRoles: ['admin', 'manager'],
    usedByAgentIds: ['agent_sales_followup']
  },
  {
    id: 'doc_prod_01',
    sourceId: 'src_products',
    title: 'Nova Platform Integration Matrix & REST API Specs',
    category: 'product_catalog',
    version: 'v2.4',
    fileSize: '3.2 MB',
    mimeType: 'text/markdown',
    contentHash: 'sha256_5a9182bb30ef11',
    chunkCount: 64,
    tokenCount: 31200,
    indexStatus: 'indexed',
    lastIndexedAt: '2026-09-28',
    effectiveFrom: '2026-01-01',
    author: 'Dev Platform Ops',
    description: 'ERP connector specifications, Webhook rate limits, OAuth2 scopes, and single sign-on parameters.',
    authorizedRoles: ['admin', 'manager', 'sales_rep', 'support'],
    usedByAgentIds: ['agent_lead_qual', 'agent_sales_followup']
  }
];

export const knowledgeDocumentsApi = {
  async getKnowledgeDocuments(sourceId?: string): Promise<KnowledgeDocument[]> {
    const saved = localStorage.getItem('nova_ai_knowledge_docs');
    const local = saved ? JSON.parse(saved) : INITIAL_KNOWLEDGE_DOCS;
    const docs = await apiClient.get<KnowledgeDocument[]>('/ai/knowledge/docs', local);
    if (sourceId) {
      return docs.filter(d => d.sourceId === sourceId);
    }
    return docs;
  },

  async getDocumentById(id: string): Promise<KnowledgeDocument | null> {
    const docs = await knowledgeDocumentsApi.getKnowledgeDocuments();
    const found = docs.find(d => d.id === id) || null;
    return apiClient.get<KnowledgeDocument | null>(`/ai/knowledge/docs/${id}`, found);
  },

  async createDocument(doc: Omit<KnowledgeDocument, 'id' | 'chunkCount' | 'tokenCount' | 'indexStatus' | 'lastIndexedAt'>): Promise<KnowledgeDocument> {
    const docs = await knowledgeDocumentsApi.getKnowledgeDocuments();
    const newDoc: KnowledgeDocument = {
      ...doc,
      id: `doc_${Date.now()}`,
      chunkCount: Math.floor(Math.random() * 20) + 10,
      tokenCount: Math.floor(Math.random() * 8000) + 3000,
      indexStatus: 'indexed',
      lastIndexedAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newDoc, ...docs];
    localStorage.setItem('nova_ai_knowledge_docs', JSON.stringify(updated));
    return apiClient.post<KnowledgeDocument>('/ai/knowledge/docs', newDoc, newDoc);
  },

  async deleteDocument(id: string): Promise<void> {
    const docs = await knowledgeDocumentsApi.getKnowledgeDocuments();
    const updated = docs.filter(d => d.id !== id);
    localStorage.setItem('nova_ai_knowledge_docs', JSON.stringify(updated));
    return apiClient.delete<void>(`/ai/knowledge/docs/${id}`);
  }
};

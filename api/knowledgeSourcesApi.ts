import { KnowledgeSource } from '../types/knowledge';
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
    boundAgentsCount: 4,
    config: {
      chunking: {
        strategy: 'markdown_header',
        chunkSize: 512,
        chunkOverlap: 64,
        preserveHeaders: true
      },
      embeddingModel: 'text-embedding-004',
      retrievalK: 8,
      minScoreThreshold: 0.65,
      rerankerEnabled: true,
      rerankerModel: 'cross-encoder-bge-large',
      hybridWeightVector: 0.65,
      hybridWeightKeyword: 0.35
    }
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
    boundAgentsCount: 3,
    config: {
      chunking: {
        strategy: 'sentence',
        chunkSize: 384,
        chunkOverlap: 48
      },
      embeddingModel: 'text-embedding-004',
      retrievalK: 6,
      minScoreThreshold: 0.60,
      rerankerEnabled: false,
      hybridWeightVector: 0.50,
      hybridWeightKeyword: 0.50
    }
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
    boundAgentsCount: 2,
    config: {
      chunking: {
        strategy: 'fixed',
        chunkSize: 256,
        chunkOverlap: 32
      },
      embeddingModel: 'text-embedding-004',
      retrievalK: 5,
      minScoreThreshold: 0.72,
      rerankerEnabled: true,
      rerankerModel: 'cross-encoder-cohere-v3',
      hybridWeightVector: 0.40,
      hybridWeightKeyword: 0.60
    }
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
    boundAgentsCount: 2,
    config: {
      chunking: {
        strategy: 'semantic_window',
        chunkSize: 512,
        chunkOverlap: 64
      },
      embeddingModel: 'text-embedding-004',
      retrievalK: 6,
      minScoreThreshold: 0.60,
      rerankerEnabled: false,
      hybridWeightVector: 0.55,
      hybridWeightKeyword: 0.45
    }
  }
];

export const knowledgeSourcesApi = {
  async getKnowledgeSources(): Promise<KnowledgeSource[]> {
    const saved = localStorage.getItem('nova_ai_knowledge_sources');
    const local = saved ? JSON.parse(saved) : INITIAL_KNOWLEDGE_SOURCES;
    return apiClient.get<KnowledgeSource[]>('/ai/knowledge/sources', local);
  },

  async getSourceById(id: string): Promise<KnowledgeSource | null> {
    const sources = await knowledgeSourcesApi.getKnowledgeSources();
    const found = sources.find(s => s.id === id) || null;
    return apiClient.get<KnowledgeSource | null>(`/ai/knowledge/sources/${id}`, found);
  },

  async createKnowledgeSource(source: Omit<KnowledgeSource, 'id' | 'totalDocuments' | 'totalTokens' | 'lastSyncAt' | 'boundAgentsCount'>): Promise<KnowledgeSource> {
    const sources = await knowledgeSourcesApi.getKnowledgeSources();
    const newSource: KnowledgeSource = {
      ...source,
      id: `src_${Date.now()}`,
      totalDocuments: 0,
      totalTokens: 0,
      lastSyncAt: 'Just now',
      boundAgentsCount: 0
    };
    const updated = [newSource, ...sources];
    localStorage.setItem('nova_ai_knowledge_sources', JSON.stringify(updated));
    return apiClient.post<KnowledgeSource>('/ai/knowledge/sources', newSource, newSource);
  },

  async updateSourceConfig(sourceId: string, config: Partial<KnowledgeSource['config']>): Promise<KnowledgeSource> {
    const sources = await knowledgeSourcesApi.getKnowledgeSources();
    const target = sources.find(s => s.id === sourceId);
    if (!target) throw new Error('Source not found');
    const updatedSource: KnowledgeSource = {
      ...target,
      config: { ...target.config!, ...config }
    };
    const updated = sources.map(s => s.id === sourceId ? updatedSource : s);
    localStorage.setItem('nova_ai_knowledge_sources', JSON.stringify(updated));
    return apiClient.put<KnowledgeSource>(`/ai/knowledge/sources/${sourceId}`, updatedSource, updatedSource);
  },

  async reindexSource(sourceId: string): Promise<void> {
    const sources = await knowledgeSourcesApi.getKnowledgeSources();
    const updated = sources.map(s => s.id === sourceId ? { ...s, indexStatus: 'indexed' as const, lastSyncAt: 'Just now' } : s);
    localStorage.setItem('nova_ai_knowledge_sources', JSON.stringify(updated));
    return apiClient.post<void>(`/ai/knowledge/sources/${sourceId}/reindex`, {});
  }
};

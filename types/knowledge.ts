export type KnowledgeSourceType = 
  | 'sales_playbook' 
  | 'product_catalog' 
  | 'pricing_matrix' 
  | 'faq_database' 
  | 'compliance_policy' 
  | 'crm_historical_data' 
  | 'external_url';

export type VectorIndexStatus = 'indexed' | 'indexing' | 'pending' | 'failed' | 'stale';

export type ChunkingStrategy = 'fixed' | 'sentence' | 'markdown_header' | 'semantic_window';

export interface ChunkingConfig {
  strategy: ChunkingStrategy;
  chunkSize: number;
  chunkOverlap: number;
  preserveHeaders?: boolean;
}

export interface KnowledgeSourceConfig {
  chunking: ChunkingConfig;
  embeddingModel: string;
  retrievalK: number;
  minScoreThreshold: number;
  rerankerEnabled: boolean;
  rerankerModel?: string;
  hybridWeightVector?: number; // e.g. 0.6
  hybridWeightKeyword?: number; // e.g. 0.4
}

export interface KnowledgeDocument {
  id: string;
  sourceId: string;
  tenantId?: string;
  title: string;
  category: KnowledgeSourceType;
  version: string;
  fileSize?: string;
  mimeType?: string;
  contentHash?: string;
  chunkCount: number;
  tokenCount: number;
  indexStatus: VectorIndexStatus;
  lastIndexedAt: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  author: string;
  description: string;
  authorizedRoles?: string[];
  usedByAgentIds: string[];
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  sourceId: string;
  sourceName?: string;
  chunkIndex: number;
  content: string;
  tokens: number;
  pageNumber?: number;
  sectionHeading?: string;
  similarityScore?: number;
  bm25Score?: number;
  fusedScore?: number;
  rerankScore?: number;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeSource {
  id: string;
  tenantId?: string;
  name: string;
  type: KnowledgeSourceType;
  description: string;
  totalDocuments: number;
  totalTokens: number;
  indexStatus: VectorIndexStatus;
  lastSyncAt: string;
  authorizedRoles: string[];
  boundAgentsCount: number;
  config?: KnowledgeSourceConfig;
}

export type KnowledgeSourceType = 
  | 'sales_playbook' 
  | 'product_catalog' 
  | 'pricing_matrix' 
  | 'faq_database' 
  | 'compliance_policy' 
  | 'crm_historical_data' 
  | 'external_url';

export type VectorIndexStatus = 'indexed' | 'indexing' | 'pending' | 'failed' | 'stale';

export interface KnowledgeDocument {
  id: string;
  sourceId: string;
  title: string;
  category: KnowledgeSourceType;
  version: string;
  fileSize?: string;
  chunkCount: number;
  tokenCount: number;
  indexStatus: VectorIndexStatus;
  lastIndexedAt: string;
  author: string;
  description: string;
  usedByAgentIds: string[];
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  chunkIndex: number;
  content: string;
  similarityScore?: number;
  tokens: number;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: KnowledgeSourceType;
  description: string;
  totalDocuments: number;
  totalTokens: number;
  indexStatus: VectorIndexStatus;
  lastSyncAt: string;
  authorizedRoles: string[];
  boundAgentsCount: number;
}

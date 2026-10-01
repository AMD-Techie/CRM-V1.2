import { KnowledgeChunk, KnowledgeDocument, KnowledgeSource } from './knowledge';
import { CopilotContext, AgentRuntimeContext } from './ai';

export type RetrievalMode = 'vector' | 'keyword' | 'hybrid';

export type RetrievalStrategy = 'single_shot' | 'corrective' | 'agentic';

export type RerankerProvider = 
  | 'none' 
  | 'cross_encoder' 
  | 'bge_reranker' 
  | 'cohere' 
  | 'heuristic';

export interface GroundingPolicy {
  minimumEvidenceCount?: number;
  retrievalThreshold?: number;
  rerankingThreshold?: number;
  groundingThreshold?: number;
  insufficientEvidenceAction: 'warn' | 'abstain' | 'request_more_context' | 'retry_retrieval';
}

export interface KnowledgeCitation {
  id: string;
  sourceId: string;
  sourceName?: string;
  documentId: string;
  documentTitle: string;
  chunkId: string;
  pageNumber?: number;
  sectionHeading?: string;
  snippet: string;
  similarityScore?: number;
  fusedScore?: number;
  confidenceScore?: number;
}

/**
 * Dedicated domain abstraction for retrieved evidence.
 * Decoupled from stored KnowledgeChunk to capture query-specific ranking,
 * vector/keyword/RRF/rerank scores, and citation provenance.
 */
export interface RAGEvidence {
  id: string;
  chunkId: string;
  documentId: string;
  documentTitle: string;
  sourceId: string;
  sourceName?: string;
  pageNumber?: number;
  sectionHeading?: string;
  content: string;
  tokens: number;
  retrievalMode: RetrievalMode;
  rank: number;
  vectorScore?: number;
  keywordScore?: number;
  rrfScore?: number;
  rerankScore?: number;
  finalScore: number;
  citationId?: string;
  metadata?: Record<string, unknown>;
}

export interface GroundingEvaluation {
  id: string;
  runId?: string;
  contextPackId: string;
  status: 
    | 'pending' 
    | 'evaluating' 
    | 'grounded' 
    | 'partially_grounded' 
    | 'not_grounded' 
    | 'insufficient_evidence';
  supportedClaimCount?: number;
  unsupportedClaimCount?: number;
  score?: number; // Grounding faithfulness score (0.0 to 1.0)
  citationIds?: string[];
  summary?: string;
  evaluatedAt?: string;
}

export interface ContextPack {
  id: string;
  runId?: string;
  tenantId?: string;
  query: string;
  domainRoute?: string;
  crmContext?: CopilotContext | AgentRuntimeContext;
  knowledgeEvidence: RAGEvidence[];
  citations: KnowledgeCitation[];
  totalTokens?: number;
  assembledAt: string;
}

export interface RAGSearchOptions {
  mode?: RetrievalMode;
  strategy?: RetrievalStrategy;
  sourceIds?: string[];
  category?: string;
  topK?: number;
  minScoreThreshold?: number;
  reranker?: RerankerProvider;
  tenantId?: string;
  userRole?: string;
}

export interface RAGResult {
  query: string;
  retrievalMode: RetrievalMode;
  retrievalStrategy: RetrievalStrategy;
  routedDomain: string;
  vectorCandidates: number;
  keywordCandidates: number;
  fusedCandidates: number;
  rerankedCandidates: number;
  executionTimeMs: number;
  evidence: RAGEvidence[];
  citations: KnowledgeCitation[];
  policyDecision?: {
    allowed: boolean;
    reason?: string;
  };
  groundingEvaluation?: GroundingEvaluation;
}

export type RAGDiagnosticCategory = 
  | 'NoKnowledgeFound'
  | 'LowSimilarity'
  | 'KeywordMiss'
  | 'MetadataFilterDrop'
  | 'TenantFilterDrop'
  | 'PermissionDenied'
  | 'StaleIndex'
  | 'DocumentNotIndexed'
  | 'ChunkingProblem'
  | 'RerankerDroppedEvidence'
  | 'InsufficientEvidence'
  | 'RetrievalTimeout';

export interface RAGDiagnosticRecord {
  id: string;
  runId?: string;
  query: string;
  retrievalMode: RetrievalMode;
  retrievalStrategy?: RetrievalStrategy;
  domainRoute: string;
  tenantId?: string;
  category: RAGDiagnosticCategory;
  severity: 'info' | 'warning' | 'error';
  scoreCutoff?: number;
  topScore?: number;
  evidenceCount: number;
  explanation: string;
  timestamp: string;
}

export interface RAGEvaluationMetric {
  id: string;
  query: string;
  domain: string;
  retrievalMode: RetrievalMode;
  retrievalStrategy?: RetrievalStrategy;
  contextRelevanceScore: number; // 0.0 - 1.0
  groundingFaithfulnessScore: number; // 0.0 - 1.0
  answerRelevanceScore: number; // 0.0 - 1.0
  hallucinationRisk: 'none' | 'low' | 'medium' | 'high';
  evaluatedAt: string;
  notes?: string;
}

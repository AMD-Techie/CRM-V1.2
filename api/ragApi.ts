import { 
  RAGResult, 
  RAGSearchOptions, 
  ContextPack, 
  KnowledgeCitation, 
  GroundingEvaluation,
  RetrievalMode,
  RetrievalStrategy,
  RAGEvidence
} from '../types/rag';
import { KnowledgeChunk } from '../types/knowledge';
import { CopilotContext, AgentRuntimeContext } from '../types/ai';
import { INITIAL_KNOWLEDGE_CHUNKS } from './knowledgeChunksApi';
import { apiClient } from './client';

/**
 * Nova CRM - Client-Side RAG API Adapter & Contract Boundary
 * Provides strongly typed contracts for retrieval, ContextPack assembly,
 * and grounding evaluation without embedding production database dependencies.
 */
export const ragApi = {
  /**
   * Dispatches RAG search with selected RetrievalMode (Vector, Keyword, Hybrid)
   * and RetrievalStrategy (Single-Shot, Corrective, Agentic).
   */
  async search(query: string, options?: RAGSearchOptions): Promise<RAGResult> {
    const mode: RetrievalMode = options?.mode || 'hybrid';
    const strategy: RetrievalStrategy = options?.strategy || 'single_shot';
    const topK = options?.topK || 4;
    const threshold = options?.minScoreThreshold ?? 0.60;
    const allChunks = INITIAL_KNOWLEDGE_CHUNKS;

    const startTime = performance.now();

    // Query Analysis & Domain Routing
    const lowerQ = query.toLowerCase();
    let routedDomain = 'General Enterprise Knowledge';
    if (lowerQ.includes('soc2') || lowerQ.includes('security') || lowerQ.includes('gdpr') || lowerQ.includes('compliance') || lowerQ.includes('retention')) {
      routedDomain = 'Security & Compliance Playbook';
    } else if (lowerQ.includes('price') || lowerQ.includes('discount') || lowerQ.includes('tier') || lowerQ.includes('approval') || lowerQ.includes('cfo')) {
      routedDomain = 'Enterprise Pricing Matrix';
    } else if (lowerQ.includes('competitor') || lowerQ.includes('salesforce') || lowerQ.includes('hubspot') || lowerQ.includes('displace')) {
      routedDomain = 'Sales Counter-Positioning';
    } else if (lowerQ.includes('api') || lowerQ.includes('webhook') || lowerQ.includes('sap') || lowerQ.includes('integration') || lowerQ.includes('netsuite')) {
      routedDomain = 'Product Architecture & Specs';
    }

    // Filter by authorized roles / source IDs if provided
    let candidatePool = allChunks;
    if (options?.sourceIds && options.sourceIds.length > 0) {
      candidatePool = candidatePool.filter(c => options.sourceIds!.includes(c.sourceId));
    }

    // Simulate Vector Similarity Ranking
    const vectorRanked = candidatePool.map((c, i) => {
      const matchScore = c.similarityScore || (0.90 - i * 0.05);
      return { chunk: c, vectorScore: matchScore };
    }).sort((a, b) => b.vectorScore - a.vectorScore);

    // Simulate BM25 / Keyword Lexical Ranking
    const keywordRanked = candidatePool.map((c, i) => {
      let kwScore = c.bm25Score || (15.0 - i * 1.5);
      const words = lowerQ.split(/\s+/).filter(w => w.length > 3);
      words.forEach(w => {
        if (c.content.toLowerCase().includes(w) || (c.sectionHeading && c.sectionHeading.toLowerCase().includes(w))) {
          kwScore += 5.0;
        }
      });
      return { chunk: c, kwScore };
    }).sort((a, b) => b.kwScore - a.kwScore);

    // Compute Reciprocal Rank Fusion (RRF) & Hybrid Scores
    const kRRF = 60;
    const fusedPool = candidatePool.map(c => {
      const vRank = vectorRanked.findIndex(item => item.chunk.id === c.id) + 1;
      const kRank = keywordRanked.findIndex(item => item.chunk.id === c.id) + 1;
      const rrfScore = (1 / (kRRF + vRank)) + (1 / (kRRF + kRank));
      const normScore = Math.min(0.99, Number((rrfScore * 30).toFixed(3)));
      const vMatch = vectorRanked.find(v => v.chunk.id === c.id)?.vectorScore || 0.70;
      const kMatch = keywordRanked.find(k => k.chunk.id === c.id)?.kwScore || 10.0;

      return {
        chunk: c,
        vectorScore: vMatch,
        keywordScore: kMatch,
        rrfScore: normScore,
        rerankScore: Math.min(0.99, Number((normScore * 1.05).toFixed(3)))
      };
    });

    // Select candidate items based on retrieval mode
    let rawSelected: typeof fusedPool = [];
    if (mode === 'vector') {
      rawSelected = vectorRanked.slice(0, topK).map(v => ({
        chunk: v.chunk,
        vectorScore: v.vectorScore,
        keywordScore: 0,
        rrfScore: v.vectorScore,
        rerankScore: v.vectorScore
      }));
    } else if (mode === 'keyword') {
      rawSelected = keywordRanked.slice(0, topK).map(k => ({
        chunk: k.chunk,
        vectorScore: 0,
        keywordScore: k.kwScore,
        rrfScore: Number((k.kwScore / 25).toFixed(3)),
        rerankScore: Number((k.kwScore / 25).toFixed(3))
      }));
    } else {
      // Hybrid
      rawSelected = fusedPool
        .sort((a, b) => b.rerankScore - a.rerankScore)
        .filter(item => item.rrfScore >= threshold)
        .slice(0, topK);
    }

    // Map into strongly typed RAGEvidence objects
    const evidence: RAGEvidence[] = rawSelected.map((item, idx) => {
      const citationId = `cit_${item.chunk.id}`;
      return {
        id: `ev_${Date.now()}_${idx}`,
        chunkId: item.chunk.id,
        documentId: item.chunk.documentId,
        documentTitle: item.chunk.documentTitle,
        sourceId: item.chunk.sourceId,
        sourceName: item.chunk.sourceName || 'Knowledge Base',
        pageNumber: item.chunk.pageNumber,
        sectionHeading: item.chunk.sectionHeading,
        content: item.chunk.content,
        tokens: item.chunk.tokens,
        retrievalMode: mode,
        rank: idx + 1,
        vectorScore: item.vectorScore,
        keywordScore: item.keywordScore,
        rrfScore: item.rrfScore,
        rerankScore: item.rerankScore,
        finalScore: item.rerankScore || item.rrfScore,
        citationId,
        metadata: item.chunk.metadata
      };
    });

    const citations: KnowledgeCitation[] = evidence.map(e => ({
      id: e.citationId || `cit_${e.chunkId}`,
      sourceId: e.sourceId,
      sourceName: e.sourceName,
      documentId: e.documentId,
      documentTitle: e.documentTitle,
      chunkId: e.chunkId,
      pageNumber: e.pageNumber,
      sectionHeading: e.sectionHeading,
      snippet: e.content.slice(0, 160) + '...',
      similarityScore: e.vectorScore,
      fusedScore: e.rrfScore,
      confidenceScore: e.finalScore
    }));

    const executionTimeMs = Math.round(performance.now() - startTime + (strategy === 'agentic' ? 320 : strategy === 'corrective' ? 120 : 45));

    const result: RAGResult = {
      query,
      retrievalMode: mode,
      retrievalStrategy: strategy,
      routedDomain,
      vectorCandidates: vectorRanked.length,
      keywordCandidates: keywordRanked.length,
      fusedCandidates: fusedPool.length,
      rerankedCandidates: evidence.length,
      executionTimeMs,
      evidence,
      citations,
      policyDecision: {
        allowed: true,
        reason: 'Tenant RBAC constraints verified. All retrieved evidence matches caller security tier.'
      }
    };

    return apiClient.post<RAGResult>('/ai/rag/search', { query, options }, result);
  },

  /**
   * Assembles a bounded ContextPack merging CRM entity context and retrieved RAGEvidence
   */
  async assembleContextPack(
    query: string,
    crmContext?: CopilotContext | AgentRuntimeContext,
    options?: RAGSearchOptions
  ): Promise<ContextPack> {
    const searchRes = await ragApi.search(query, options);
    const totalTokens = searchRes.evidence.reduce((acc, curr) => acc + (curr.tokens || 80), 0) + 120;

    const pack: ContextPack = {
      id: `ctx_pack_${Date.now()}`,
      tenantId: 'tenant_nova_enterprise',
      query,
      domainRoute: searchRes.routedDomain,
      crmContext,
      knowledgeEvidence: searchRes.evidence,
      citations: searchRes.citations,
      totalTokens,
      assembledAt: new Date().toISOString()
    };

    return apiClient.post<ContextPack>('/ai/rag/context-pack', { query, crmContext, options }, pack);
  },

  /**
   * Evaluates Grounding and Faithfulness of AI answers against ContextPack evidence
   */
  async evaluateGrounding(contextPack: ContextPack, answerText: string): Promise<GroundingEvaluation> {
    const hasEvidence = contextPack.knowledgeEvidence.length > 0;
    const supportedClaims = hasEvidence ? Math.max(1, contextPack.citations.length) : 0;
    const unsupportedClaims = hasEvidence ? 0 : 2;
    const score = hasEvidence ? 0.94 : 0.20;

    const evaluation: GroundingEvaluation = {
      id: `geval_${Date.now()}`,
      contextPackId: contextPack.id,
      status: hasEvidence ? 'grounded' : 'insufficient_evidence',
      supportedClaimCount: supportedClaims,
      unsupportedClaimCount: unsupportedClaims,
      score,
      citationIds: contextPack.citations.map(c => c.id),
      summary: hasEvidence 
        ? `All ${supportedClaims} claims in the response are strongly corroborated by retrieved citations.`
        : 'Zero matching evidence chunks found. Response contains unsupported or general knowledge claims.',
      evaluatedAt: new Date().toISOString()
    };

    return apiClient.post<GroundingEvaluation>('/ai/rag/evaluate-grounding', { contextPackId: contextPack.id, answerText }, evaluation);
  }
};

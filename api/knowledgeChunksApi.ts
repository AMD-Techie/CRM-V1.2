import { KnowledgeChunk } from '../types/knowledge';
import { apiClient } from './client';

export const INITIAL_KNOWLEDGE_CHUNKS: KnowledgeChunk[] = [
  {
    id: 'chk_pb01_01',
    documentId: 'doc_pb_01',
    documentTitle: 'Enterprise AI & Security Procurement Guide',
    sourceId: 'src_playbook',
    sourceName: 'Enterprise Sales Playbook',
    chunkIndex: 1,
    pageNumber: 3,
    sectionHeading: 'Section 1.2: SOC2 Type II & Data Residency Guarantees',
    content: 'Nova CRM maintains annual SOC2 Type II audit certifications across all production data centers in US-East, EU-Central (Frankfurt), and AP-Southeast (Tokyo). Customer CRM databases, conversation transcripts, and embedding vectors are strictly encrypted at rest using AES-256 and in transit via TLS 1.3. No customer data is shared across tenant boundaries or used for foundational model pre-training.',
    tokens: 92,
    similarityScore: 0.94,
    bm25Score: 14.2,
    fusedScore: 0.96,
    rerankScore: 0.98
  },
  {
    id: 'chk_pb01_02',
    documentId: 'doc_pb_01',
    documentTitle: 'Enterprise AI & Security Procurement Guide',
    sourceId: 'src_playbook',
    sourceName: 'Enterprise Sales Playbook',
    chunkIndex: 2,
    pageNumber: 4,
    sectionHeading: 'Section 1.4: AI Zero Data Retention (ZDR) Architecture',
    content: 'All Gemini API and LLM inference calls executed by Nova CRM Copilot and autonomous agents operate under enterprise Zero Data Retention (ZDR) agreements. Inference prompts and completion tokens are discarded immediately post-execution and never logged to persistent model provider storage.',
    tokens: 78,
    similarityScore: 0.91,
    bm25Score: 12.8,
    fusedScore: 0.92,
    rerankScore: 0.95
  },
  {
    id: 'chk_pr01_01',
    documentId: 'doc_pr_01',
    documentTitle: '2026 Tier 1 Enterprise License Agreement Guidelines',
    sourceId: 'src_pricing',
    sourceName: 'Q3/Q4 Enterprise Pricing & Discount Matrix',
    chunkIndex: 1,
    pageNumber: 2,
    sectionHeading: 'Section 2.1: Multi-Year Discount & Approval Schedule',
    content: 'Standard volume discounts are structured as follows: 1-Year commitments receive up to 10% discount at Director approval. 2-Year commitments receive up to 18% discount at VP Sales approval. 3-Year commitments exceeding $150,000 ARR are eligible for up to 25% discount, requiring CRO and CFO co-signatures in the Approval Center.',
    tokens: 88,
    similarityScore: 0.89,
    bm25Score: 16.5,
    fusedScore: 0.94,
    rerankScore: 0.97
  },
  {
    id: 'chk_pr01_02',
    documentId: 'doc_pr_01',
    documentTitle: '2026 Tier 1 Enterprise License Agreement Guidelines',
    sourceId: 'src_pricing',
    sourceName: 'Q3/Q4 Enterprise Pricing & Discount Matrix',
    chunkIndex: 2,
    pageNumber: 3,
    sectionHeading: 'Section 2.3: Over-the-Limit Commercial Exceptions',
    content: 'Discounts exceeding 25% or custom payment terms (e.g. Net 60, split quarterly invoices) require explicit exception approval from the Finance Committee before generating formal contract proposals.',
    tokens: 64,
    similarityScore: 0.82,
    bm25Score: 11.0,
    fusedScore: 0.85,
    rerankScore: 0.89
  },
  {
    id: 'chk_pb02_01',
    documentId: 'doc_pb_02',
    documentTitle: 'SaaS Competitor Counter-Positioning Sheet',
    sourceId: 'src_playbook',
    sourceName: 'Enterprise Sales Playbook',
    chunkIndex: 1,
    pageNumber: 1,
    sectionHeading: 'Section 1.1: Legacy CRM Displacement Tactics',
    content: 'When competing against legacy CRM monoliths (e.g. Salesforce, HubSpot), emphasize Nova CRM’s native multi-agent orchestration console, sub-second unified Copilot response times, transparent per-seat AI pricing, and zero required professional services integrations.',
    tokens: 74,
    similarityScore: 0.85,
    bm25Score: 9.8,
    fusedScore: 0.86,
    rerankScore: 0.88
  },
  {
    id: 'chk_prod01_01',
    documentId: 'doc_prod_01',
    documentTitle: 'Nova Platform Integration Matrix & REST API Specs',
    sourceId: 'src_products',
    sourceName: 'Product Catalog & Technical Specs',
    chunkIndex: 1,
    pageNumber: 5,
    sectionHeading: 'Section 3.1: Real-Time Webhook & ERP Synchronization',
    content: 'Nova CRM provides bidirectional synchronization with SAP, NetSuite, and Workday via high-throughput webhooks (up to 2,000 requests/sec per tenant). Changes to Deals, Billing Addresses, and Invoices propagate in under 800 milliseconds.',
    tokens: 82,
    similarityScore: 0.84,
    bm25Score: 10.4,
    fusedScore: 0.87,
    rerankScore: 0.90
  }
];

export const knowledgeChunksApi = {
  async getChunksByDocumentId(documentId: string): Promise<KnowledgeChunk[]> {
    const saved = localStorage.getItem('nova_ai_knowledge_chunks');
    const local = saved ? JSON.parse(saved) : INITIAL_KNOWLEDGE_CHUNKS;
    const all = await apiClient.get<KnowledgeChunk[]>('/ai/knowledge/chunks', local);
    return all.filter(c => c.documentId === documentId);
  },

  async getAllChunks(): Promise<KnowledgeChunk[]> {
    const saved = localStorage.getItem('nova_ai_knowledge_chunks');
    const local = saved ? JSON.parse(saved) : INITIAL_KNOWLEDGE_CHUNKS;
    return apiClient.get<KnowledgeChunk[]>('/ai/knowledge/chunks', local);
  }
};

import { RAGDiagnosticRecord } from '../types/rag';
import { apiClient } from './client';

export const INITIAL_RAG_DIAGNOSTICS: RAGDiagnosticRecord[] = [
  {
    id: 'diag_rag_01',
    runId: 'run_lq_9082',
    query: 'What is the SOC2 compliance posture and data retention timeline for European tenants?',
    retrievalMode: 'hybrid',
    domainRoute: 'Security & Compliance Playbook',
    tenantId: 'tenant_nova_enterprise',
    category: 'StaleIndex',
    severity: 'warning',
    scoreCutoff: 0.65,
    topScore: 0.94,
    evidenceCount: 2,
    explanation: 'Document "Enterprise AI & Security Procurement Guide" was re-indexed 10 days ago. Newer compliance appendix v3.3 is available in drafting queue.',
    timestamp: '2026-09-30 10:15:22'
  },
  {
    id: 'diag_rag_02',
    runId: 'run_comm_4410',
    query: 'Can a sales rep grant a 30% discount on a 2-year enterprise agreement?',
    retrievalMode: 'hybrid',
    domainRoute: 'Enterprise Pricing Matrix',
    tenantId: 'tenant_nova_enterprise',
    category: 'RerankerDroppedEvidence',
    severity: 'info',
    scoreCutoff: 0.70,
    topScore: 0.89,
    evidenceCount: 2,
    explanation: 'Reranker promoted Section 2.1 (Approval thresholds) and pruned Section 2.3 (Over-the-limit exceptions) due to token budget constraint.',
    timestamp: '2026-09-30 11:20:05'
  },
  {
    id: 'diag_rag_03',
    runId: 'run_supp_1190',
    query: 'How to migrate custom Salesforce Apex triggers to Nova workflow engine?',
    retrievalMode: 'keyword',
    domainRoute: 'Product Architecture & Specs',
    tenantId: 'tenant_nova_enterprise',
    category: 'KeywordMiss',
    severity: 'warning',
    scoreCutoff: 0.60,
    topScore: 0.58,
    evidenceCount: 0,
    explanation: 'Lexical keyword search failed to match exact phrase "Salesforce Apex triggers". Recommend switching retrieval mode to Hybrid or Agentic RAG.',
    timestamp: '2026-09-30 12:45:10'
  },
  {
    id: 'diag_rag_04',
    runId: 'run_faqs_8812',
    query: 'Is multi-region database failover supported on standard tier plans?',
    retrievalMode: 'vector',
    domainRoute: 'General Enterprise Knowledge',
    tenantId: 'tenant_nova_enterprise',
    category: 'MetadataFilterDrop',
    severity: 'info',
    scoreCutoff: 0.60,
    topScore: 0.76,
    evidenceCount: 1,
    explanation: 'Metadata filter restricted search to public FAQ database, excluding internal infrastructure architecture specs.',
    timestamp: '2026-09-30 13:10:44'
  }
];

export const knowledgeDiagnosticsApi = {
  async getDiagnostics(): Promise<RAGDiagnosticRecord[]> {
    const saved = localStorage.getItem('nova_rag_diagnostics');
    const local = saved ? JSON.parse(saved) : INITIAL_RAG_DIAGNOSTICS;
    return apiClient.get<RAGDiagnosticRecord[]>('/ai/rag/diagnostics', local);
  },

  async clearDiagnostics(): Promise<void> {
    localStorage.setItem('nova_rag_diagnostics', JSON.stringify([]));
    return apiClient.delete<void>('/ai/rag/diagnostics');
  }
};

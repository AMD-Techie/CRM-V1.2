import { RAGEvaluationMetric } from '../types/rag';
import { apiClient } from './client';

export const INITIAL_RAG_EVALUATIONS: RAGEvaluationMetric[] = [
  {
    id: 'eval_rag_01',
    query: 'What security certifications does Nova CRM hold and where is European customer data stored?',
    domain: 'Security & Compliance Playbook',
    retrievalMode: 'hybrid',
    contextRelevanceScore: 0.96,
    groundingFaithfulnessScore: 0.98,
    answerRelevanceScore: 0.95,
    hallucinationRisk: 'none',
    evaluatedAt: '2026-09-30 09:30:00',
    notes: 'Grounding verified against SOC2 chunk chk_pb01_01. All data residency points accurately cited.'
  },
  {
    id: 'eval_rag_02',
    query: 'Can a sales rep approve a 20% discount on a 2-year deal without VP signoff?',
    domain: 'Enterprise Pricing Matrix',
    retrievalMode: 'hybrid',
    contextRelevanceScore: 0.92,
    groundingFaithfulnessScore: 0.94,
    answerRelevanceScore: 0.96,
    hallucinationRisk: 'none',
    evaluatedAt: '2026-09-30 10:45:00',
    notes: 'Faithfully cited Section 2.1 showing 18% VP threshold; accurately derived that 20% requires VP approval.'
  },
  {
    id: 'eval_rag_03',
    query: 'What are the bidirectional sync latency benchmarks for SAP ERP integration?',
    domain: 'Product Architecture & Specs',
    retrievalMode: 'keyword',
    contextRelevanceScore: 0.88,
    groundingFaithfulnessScore: 0.91,
    answerRelevanceScore: 0.89,
    hallucinationRisk: 'low',
    evaluatedAt: '2026-09-30 11:15:00',
    notes: 'Cited 800ms sync latency accurately from chk_prod01_01.'
  },
  {
    id: 'eval_rag_04',
    query: 'How does Nova compare against Salesforce on custom agent workflows?',
    domain: 'Sales Counter-Positioning',
    retrievalMode: 'hybrid',
    retrievalStrategy: 'agentic',
    contextRelevanceScore: 0.94,
    groundingFaithfulnessScore: 0.95,
    answerRelevanceScore: 0.97,
    hallucinationRisk: 'none',
    evaluatedAt: '2026-09-30 14:00:00',
    notes: 'Multi-hop retrieval pulled both displacement tactics and architecture spec chunks cleanly.'
  }
];

export const ragEvaluationApi = {
  async getEvaluations(): Promise<RAGEvaluationMetric[]> {
    const saved = localStorage.getItem('nova_rag_evaluations');
    const local = saved ? JSON.parse(saved) : INITIAL_RAG_EVALUATIONS;
    return apiClient.get<RAGEvaluationMetric[]>('/ai/rag/evaluations', local);
  },

  async recordEvaluation(evalMetric: Omit<RAGEvaluationMetric, 'id' | 'evaluatedAt'>): Promise<RAGEvaluationMetric> {
    const evals = await ragEvaluationApi.getEvaluations();
    const newEval: RAGEvaluationMetric = {
      ...evalMetric,
      id: `eval_rag_${Date.now()}`,
      evaluatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    const updated = [newEval, ...evals];
    localStorage.setItem('nova_rag_evaluations', JSON.stringify(updated));
    return apiClient.post<RAGEvaluationMetric>('/ai/rag/evaluations', newEval, newEval);
  }
};

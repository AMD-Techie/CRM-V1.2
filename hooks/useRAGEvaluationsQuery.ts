import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RAGEvaluationMetric } from '../types/rag';
import { ragEvaluationApi } from '../api/ragEvaluationApi';

export const RAG_EVALUATIONS_QUERY_KEY = ['rag-evaluations'] as const;

export function useRAGEvaluationsQuery() {
  return useQuery<RAGEvaluationMetric[]>({
    queryKey: RAG_EVALUATIONS_QUERY_KEY,
    queryFn: () => ragEvaluationApi.getEvaluations(),
    staleTime: 1000 * 60 * 5
  });
}

export function useRecordRAGEvaluationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (metric: Parameters<typeof ragEvaluationApi.recordEvaluation>[0]) =>
      ragEvaluationApi.recordEvaluation(metric),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RAG_EVALUATIONS_QUERY_KEY });
    }
  });
}

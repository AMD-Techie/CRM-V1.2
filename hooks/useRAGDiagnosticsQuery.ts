import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RAGDiagnosticRecord } from '../types/rag';
import { knowledgeDiagnosticsApi } from '../api/knowledgeDiagnosticsApi';

export const RAG_DIAGNOSTICS_QUERY_KEY = ['rag-diagnostics'] as const;

export function useRAGDiagnosticsQuery() {
  return useQuery<RAGDiagnosticRecord[]>({
    queryKey: RAG_DIAGNOSTICS_QUERY_KEY,
    queryFn: () => knowledgeDiagnosticsApi.getDiagnostics(),
    staleTime: 1000 * 60 * 2
  });
}

export function useClearRAGDiagnosticsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => knowledgeDiagnosticsApi.clearDiagnostics(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RAG_DIAGNOSTICS_QUERY_KEY });
    }
  });
}

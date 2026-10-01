import { useQuery } from '@tanstack/react-query';
import { RAGResult, RAGSearchOptions } from '../types/rag';
import { ragApi } from '../api/ragApi';

export const RAG_SEARCH_QUERY_KEY = ['rag-search'] as const;

export function useRAGSearchQuery(query: string, options?: RAGSearchOptions) {
  return useQuery<RAGResult>({
    queryKey: [...RAG_SEARCH_QUERY_KEY, query, options],
    queryFn: () => ragApi.search(query, options),
    enabled: Boolean(query.trim()),
    staleTime: 1000 * 30 // 30s cache
  });
}

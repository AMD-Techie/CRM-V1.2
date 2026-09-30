import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { KnowledgeSource, KnowledgeDocument } from '../types/knowledge';
import { knowledgeApi } from '../api/knowledgeApi';

export const KNOWLEDGE_SOURCES_QUERY_KEY = ['knowledge-sources'] as const;
export const KNOWLEDGE_DOCS_QUERY_KEY = ['knowledge-docs'] as const;

export function useKnowledgeSourcesQuery() {
  return useQuery<KnowledgeSource[]>({
    queryKey: KNOWLEDGE_SOURCES_QUERY_KEY,
    queryFn: () => knowledgeApi.getSources(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useKnowledgeDocsQuery(sourceId?: string) {
  return useQuery<KnowledgeDocument[]>({
    queryKey: sourceId ? ['knowledge-docs', sourceId] : KNOWLEDGE_DOCS_QUERY_KEY,
    queryFn: () => knowledgeApi.getDocuments(sourceId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useReindexSourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sourceId: string) => knowledgeApi.syncSource(sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KNOWLEDGE_SOURCES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: KNOWLEDGE_DOCS_QUERY_KEY });
    }
  });
}

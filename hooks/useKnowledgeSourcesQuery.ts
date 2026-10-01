import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { KnowledgeSource } from '../types/knowledge';
import { knowledgeSourcesApi } from '../api/knowledgeSourcesApi';

export const KNOWLEDGE_SOURCES_QUERY_KEY = ['knowledge-sources'] as const;

export function useKnowledgeSourcesQuery() {
  return useQuery<KnowledgeSource[]>({
    queryKey: KNOWLEDGE_SOURCES_QUERY_KEY,
    queryFn: () => knowledgeSourcesApi.getKnowledgeSources(),
    staleTime: 1000 * 60 * 5
  });
}

export function useKnowledgeSourceDetailQuery(id: string | null) {
  return useQuery<KnowledgeSource | null>({
    queryKey: [...KNOWLEDGE_SOURCES_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const res = await knowledgeSourcesApi.getSourceById(id);
      return res ?? null;
    },
    enabled: Boolean(id)
  });
}

export function useCreateKnowledgeSourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (source: Parameters<typeof knowledgeSourcesApi.createKnowledgeSource>[0]) =>
      knowledgeSourcesApi.createKnowledgeSource(source),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KNOWLEDGE_SOURCES_QUERY_KEY });
    }
  });
}

export function useUpdateKnowledgeSourceConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sourceId, config }: { sourceId: string; config: Partial<KnowledgeSource['config']> }) =>
      knowledgeSourcesApi.updateSourceConfig(sourceId, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KNOWLEDGE_SOURCES_QUERY_KEY });
    }
  });
}

export function useReindexKnowledgeSourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sourceId: string) => knowledgeSourcesApi.reindexSource(sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KNOWLEDGE_SOURCES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['knowledge-docs'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-chunks'] });
    }
  });
}

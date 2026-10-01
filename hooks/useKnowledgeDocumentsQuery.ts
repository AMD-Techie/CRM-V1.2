import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { KnowledgeDocument } from '../types/knowledge';
import { knowledgeDocumentsApi } from '../api/knowledgeDocumentsApi';

export const KNOWLEDGE_DOCS_QUERY_KEY = ['knowledge-docs'] as const;

export function useKnowledgeDocumentsQuery(sourceId?: string) {
  return useQuery<KnowledgeDocument[]>({
    queryKey: sourceId ? ['knowledge-docs', sourceId] : KNOWLEDGE_DOCS_QUERY_KEY,
    queryFn: () => knowledgeDocumentsApi.getKnowledgeDocuments(sourceId),
    staleTime: 1000 * 60 * 5
  });
}

export function useKnowledgeDocumentDetailQuery(id: string | null) {
  return useQuery<KnowledgeDocument | null>({
    queryKey: ['knowledge-doc', id],
    queryFn: async () => {
      if (!id) return null;
      const doc = await knowledgeDocumentsApi.getDocumentById(id);
      return doc ?? null;
    },
    enabled: Boolean(id)
  });
}

export function useCreateKnowledgeDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (doc: Parameters<typeof knowledgeDocumentsApi.createDocument>[0]) =>
      knowledgeDocumentsApi.createDocument(doc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KNOWLEDGE_DOCS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['knowledge-sources'] });
    }
  });
}

export function useDeleteKnowledgeDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => knowledgeDocumentsApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KNOWLEDGE_DOCS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['knowledge-sources'] });
    }
  });
}

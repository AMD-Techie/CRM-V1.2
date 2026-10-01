import { useQuery } from '@tanstack/react-query';
import { KnowledgeChunk } from '../types/knowledge';
import { knowledgeChunksApi } from '../api/knowledgeChunksApi';

export const KNOWLEDGE_CHUNKS_QUERY_KEY = ['knowledge-chunks'] as const;

export function useKnowledgeChunksQuery(documentId?: string) {
  return useQuery<KnowledgeChunk[]>({
    queryKey: documentId ? ['knowledge-chunks', documentId] : KNOWLEDGE_CHUNKS_QUERY_KEY,
    queryFn: () => documentId ? knowledgeChunksApi.getChunksByDocumentId(documentId) : knowledgeChunksApi.getAllChunks(),
    staleTime: 1000 * 60 * 5
  });
}

import { useQuery, useMutation } from '@tanstack/react-query';
import { ContextPack, RAGSearchOptions, GroundingEvaluation } from '../types/rag';
import { CopilotContext, AgentRuntimeContext } from '../types/ai';
import { ragApi } from '../api/ragApi';

export const RAG_CONTEXT_PACK_QUERY_KEY = ['rag-context-pack'] as const;

export function useRAGContextPackQuery(
  query: string,
  crmContext?: CopilotContext | AgentRuntimeContext,
  options?: RAGSearchOptions
) {
  return useQuery<ContextPack>({
    queryKey: [...RAG_CONTEXT_PACK_QUERY_KEY, query, crmContext, options],
    queryFn: () => ragApi.assembleContextPack(query, crmContext, options),
    enabled: Boolean(query.trim()),
    staleTime: 1000 * 30
  });
}

export function useEvaluateGroundingMutation() {
  return useMutation<GroundingEvaluation, Error, { contextPack: ContextPack; answerText: string }>({
    mutationFn: ({ contextPack, answerText }) => ragApi.evaluateGrounding(contextPack, answerText)
  });
}

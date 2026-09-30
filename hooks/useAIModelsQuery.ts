import { useQuery } from '@tanstack/react-query';
import { AIProvider, AIModelDefinition } from '../types/ai';
import { aiModelsApi } from '../api/aiModelsApi';

export const AI_PROVIDERS_QUERY_KEY = ['ai-providers'] as const;
export const AI_MODELS_QUERY_KEY = ['ai-models'] as const;

export function useAIProvidersQuery() {
  return useQuery<AIProvider[]>({
    queryKey: AI_PROVIDERS_QUERY_KEY,
    queryFn: () => aiModelsApi.getProviders(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useAIModelsQuery() {
  return useQuery<AIModelDefinition[]>({
    queryKey: AI_MODELS_QUERY_KEY,
    queryFn: () => aiModelsApi.getModels(),
    staleTime: 1000 * 60 * 10,
  });
}

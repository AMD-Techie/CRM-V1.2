import { useQuery } from '@tanstack/react-query';
import { AIInsight } from '../types/ai';
import { actionsApi } from '../api/actionsApi';

export const INSIGHTS_QUERY_KEY = ['ai-insights'] as const;

export function useInsightsQuery() {
  return useQuery<AIInsight[]>({
    queryKey: INSIGHTS_QUERY_KEY,
    queryFn: () => actionsApi.getInsights(),
    staleTime: 1000 * 60 * 3,
  });
}

import { useQuery } from '@tanstack/react-query';
import { runtimeEventsApi } from '../api/runtimeEventsApi';
import { RuntimeEvent } from '../types/ai';

export const RUNTIME_EVENTS_QUERY_KEY = ['runtime-events'] as const;

export function useRuntimeEventsQuery(runId: string | null, options?: { refetchInterval?: number }) {
  return useQuery<RuntimeEvent[]>({
    queryKey: [...RUNTIME_EVENTS_QUERY_KEY, runId],
    queryFn: () => (runId ? runtimeEventsApi.getEventsByRunId(runId) : Promise.resolve([])),
    enabled: Boolean(runId),
    refetchInterval: options?.refetchInterval
  });
}

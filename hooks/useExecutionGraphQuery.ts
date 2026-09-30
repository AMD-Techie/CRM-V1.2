import { useQuery } from '@tanstack/react-query';
import { executionGraphsApi } from '../api/executionGraphsApi';
import { ExecutionGraph } from '../types/ai';

export const EXECUTION_GRAPHS_QUERY_KEY = ['execution-graphs'] as const;

export function useExecutionGraphsQuery() {
  return useQuery<ExecutionGraph[]>({
    queryKey: EXECUTION_GRAPHS_QUERY_KEY,
    queryFn: () => executionGraphsApi.getExecutionGraphs()
  });
}

export function useExecutionGraphQuery(graphIdOrAgentVersion?: string | null) {
  return useQuery<ExecutionGraph | null>({
    queryKey: [...EXECUTION_GRAPHS_QUERY_KEY, graphIdOrAgentVersion],
    queryFn: async () => {
      if (!graphIdOrAgentVersion) return null;
      const res = await executionGraphsApi.getExecutionGraphById(graphIdOrAgentVersion);
      return res || null;
    },
    enabled: Boolean(graphIdOrAgentVersion)
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentRuntimeApi } from '../api/agentRuntimeApi';
import { AgentExecutionRequest, AgentRun } from '../types/ai';

export const AGENT_RUNS_QUERY_KEY = ['agent-runtime-runs'];
export const AGENT_RUN_DETAIL_QUERY_KEY = ['agent-runtime-run'];

export function useAgentRunsQuery(
  filters?: { agentId?: string; status?: string; targetEntityType?: string; workflowId?: string },
  options?: { refetchInterval?: number }
) {
  return useQuery<AgentRun[]>({
    queryKey: [...AGENT_RUNS_QUERY_KEY, filters],
    queryFn: async () => {
      const runs = await agentRuntimeApi.listAgentRuns(filters);
      return runs || [];
    },
    staleTime: 5000,
    refetchInterval: options?.refetchInterval
  });
}

export function useAgentRunDetailQuery(runId: string | null, options?: { refetchInterval?: number }) {
  return useQuery<AgentRun | null>({
    queryKey: [...AGENT_RUN_DETAIL_QUERY_KEY, runId],
    queryFn: async () => {
      if (!runId) return null;
      const run = await agentRuntimeApi.getAgentRun(runId);
      return run || null;
    },
    enabled: Boolean(runId),
    refetchInterval: options?.refetchInterval
  });
}

export function useStartAgentRunMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AgentExecutionRequest) => agentRuntimeApi.startAgentRun(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AGENT_RUNS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    }
  });
}

export function usePauseAgentRunMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ runId, reason }: { runId: string; reason?: string }) => 
      agentRuntimeApi.pauseAgentRun(runId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: AGENT_RUNS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...AGENT_RUN_DETAIL_QUERY_KEY, variables.runId] });
    }
  });
}

export function useResumeAgentRunMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (runId: string) => agentRuntimeApi.resumeAgentRun(runId),
    onSuccess: (_, runId) => {
      queryClient.invalidateQueries({ queryKey: AGENT_RUNS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...AGENT_RUN_DETAIL_QUERY_KEY, runId] });
    }
  });
}

export function useCancelAgentRunMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ runId, reason }: { runId: string; reason?: string }) => 
      agentRuntimeApi.cancelAgentRun(runId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: AGENT_RUNS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...AGENT_RUN_DETAIL_QUERY_KEY, variables.runId] });
    }
  });
}

export function useRetryAgentRunMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (runId: string) => agentRuntimeApi.retryAgentRun(runId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AGENT_RUNS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    }
  });
}

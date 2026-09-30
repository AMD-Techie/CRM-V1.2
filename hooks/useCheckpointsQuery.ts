import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkpointsApi } from '../api/checkpointsApi';
import { RuntimeCheckpoint } from '../types/ai';

export const CHECKPOINTS_QUERY_KEY = ['checkpoints'] as const;

export function useCheckpointsQuery(runId: string | null) {
  return useQuery<RuntimeCheckpoint[]>({
    queryKey: [...CHECKPOINTS_QUERY_KEY, runId],
    queryFn: () => (runId ? checkpointsApi.getCheckpointsByRunId(runId) : Promise.resolve([])),
    enabled: Boolean(runId)
  });
}

export function useCreateCheckpointMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ runId, nodeId, nodeName, summary }: { runId: string; nodeId: string; nodeName: string; summary: string }) =>
      checkpointsApi.createCheckpoint(runId, nodeId, nodeName, summary),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [...CHECKPOINTS_QUERY_KEY, vars.runId] });
    }
  });
}

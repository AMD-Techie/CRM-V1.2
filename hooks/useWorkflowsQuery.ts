import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowsApi } from '../api/workflowsApi';
import { Workflow } from '../types/ai';

export const WORKFLOWS_QUERY_KEY = ['workflows'] as const;

export function useWorkflowsQuery() {
  return useQuery<Workflow[]>({
    queryKey: WORKFLOWS_QUERY_KEY,
    queryFn: () => workflowsApi.getWorkflows(),
    staleTime: 1000 * 60 * 5
  });
}

export function useWorkflowDetailQuery(id: string | null) {
  return useQuery<Workflow | null>({
    queryKey: [...WORKFLOWS_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const wf = await workflowsApi.getWorkflowById(id);
      return wf || null;
    },
    enabled: Boolean(id)
  });
}

export function useCreateWorkflowMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workflow: Omit<Workflow, 'id' | 'totalExecutions' | 'successRate' | 'createdAt' | 'updatedAt'>) => 
      workflowsApi.createWorkflow(workflow),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKFLOWS_QUERY_KEY });
    }
  });
}

export function useUpdateWorkflowMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workflow: Workflow) => workflowsApi.updateWorkflow(workflow),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKFLOWS_QUERY_KEY });
    }
  });
}

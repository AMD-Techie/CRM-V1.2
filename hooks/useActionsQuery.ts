import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AIAction } from '../types/ai';
import { actionsApi } from '../api/actionsApi';

export const ACTIONS_QUERY_KEY = ['ai-actions'] as const;

export function useActionsQuery() {
  return useQuery<AIAction[]>({
    queryKey: ACTIONS_QUERY_KEY,
    queryFn: () => actionsApi.getActions(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useExecuteActionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (actionId: string) => actionsApi.executeAction(actionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIONS_QUERY_KEY });
    }
  });
}

export function useDismissActionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ actionId, reason }: { actionId: string; reason?: string }) => 
      actionsApi.rejectAction(actionId, reason),
    onMutate: async ({ actionId, reason }) => {
      await queryClient.cancelQueries({ queryKey: ACTIONS_QUERY_KEY });
      const previousActions = queryClient.getQueryData<AIAction[]>(ACTIONS_QUERY_KEY);
      
      if (previousActions) {
        queryClient.setQueryData<AIAction[]>(
          ACTIONS_QUERY_KEY,
          previousActions.map(a => a.id === actionId ? { ...a, status: 'rejected' as const, rejectionReason: reason } : a)
        );
      }
      return { previousActions };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousActions) {
        queryClient.setQueryData(ACTIONS_QUERY_KEY, context.previousActions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ACTIONS_QUERY_KEY });
    }
  });
}

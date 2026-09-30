import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AIAgent } from '../types/ai';
import { agentsApi } from '../api/agentsApi';

export const AGENTS_QUERY_KEY = ['agents'] as const;

export function useAgentsQuery() {
  return useQuery<AIAgent[]>({
    queryKey: AGENTS_QUERY_KEY,
    queryFn: () => agentsApi.getAgents(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateAgentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newAgent: Omit<AIAgent, 'id' | 'totalExecutions' | 'successRate' | 'createdAt' | 'updatedAt'>) => 
      agentsApi.createAgent(newAgent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AGENTS_QUERY_KEY });
    }
  });
}

export function useDeleteAgentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => agentsApi.deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AGENTS_QUERY_KEY });
    }
  });
}

export function useCreateDraftVersionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, baseVersion }: { agentId: string; baseVersion?: string }) => 
      agentsApi.createDraftVersion(agentId, baseVersion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AGENTS_QUERY_KEY });
    }
  });
}

export function usePublishVersionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, versionNumber, changelog }: { agentId: string; versionNumber: string; changelog?: string }) => 
      agentsApi.publishVersion(agentId, versionNumber, changelog),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AGENTS_QUERY_KEY });
    }
  });
}

export function useArchiveVersionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, versionNumber }: { agentId: string; versionNumber: string }) => 
      agentsApi.archiveVersion(agentId, versionNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AGENTS_QUERY_KEY });
    }
  });
}

export function useUpdateAgentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (agent: AIAgent) => agentsApi.updateAgent(agent),
    onMutate: async (updatedAgent: AIAgent) => {
      await queryClient.cancelQueries({ queryKey: AGENTS_QUERY_KEY });
      const previousAgents = queryClient.getQueryData<AIAgent[]>(AGENTS_QUERY_KEY);
      if (previousAgents) {
        queryClient.setQueryData<AIAgent[]>(
          AGENTS_QUERY_KEY,
          previousAgents.map(a => a.id === updatedAgent.id ? updatedAgent : a)
        );
      }
      return { previousAgents };
    },
    onError: (_err, _agent, context) => {
      if (context?.previousAgents) {
        queryClient.setQueryData(AGENTS_QUERY_KEY, context.previousAgents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: AGENTS_QUERY_KEY });
    }
  });
}

export function useTriggerAgentRunMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, entityType, entityId, triggerEvent }: { agentId: string; entityType: string; entityId: string; triggerEvent?: string }) => 
      agentsApi.triggerAgentRun(agentId, entityType, entityId, triggerEvent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-runtime-runs'] });
      queryClient.invalidateQueries({ queryKey: AGENTS_QUERY_KEY });
    }
  });
}


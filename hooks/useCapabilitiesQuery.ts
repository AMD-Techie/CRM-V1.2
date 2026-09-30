import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { capabilitiesApi } from '../api/capabilitiesApi';
import { AgentCapabilityDefinition } from '../types/ai';

export const CAPABILITIES_QUERY_KEY = ['capabilities'] as const;

export function useCapabilitiesQuery() {
  return useQuery<AgentCapabilityDefinition[]>({
    queryKey: CAPABILITIES_QUERY_KEY,
    queryFn: () => capabilitiesApi.getCapabilities(),
    staleTime: 1000 * 60 * 5
  });
}

export function useToggleCapabilityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => capabilitiesApi.toggleCapability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAPABILITIES_QUERY_KEY });
    }
  });
}

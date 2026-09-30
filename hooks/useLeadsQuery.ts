import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Lead } from '../types/crm';
import { leadsApi } from '../api/leadsApi';

export const LEADS_QUERY_KEY = ['leads'] as const;

export function useLeadsQuery() {
  return useQuery<Lead[]>({
    queryKey: LEADS_QUERY_KEY,
    queryFn: () => leadsApi.getLeads(),
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

export function useLeadQuery(id?: string) {
  return useQuery<Lead | null>({
    queryKey: ['leads', id],
    queryFn: async () => {
      if (!id) return null;
      const lead = await leadsApi.getLeadById(id);
      return lead || null;
    },
    enabled: Boolean(id)
  });
}

export function useCreateLeadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newLead: Omit<Lead, 'id'>) => leadsApi.createLead(newLead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    }
  });
}

export function useUpdateLeadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lead: Lead) => leadsApi.updateLead(lead),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['leads', updated.id] });
    }
  });
}

export function useDeleteLeadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsApi.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    }
  });
}

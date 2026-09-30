import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Deal } from '../types/crm';
import { dealsApi } from '../api/crmApi';

export const DEALS_QUERY_KEY = ['deals'] as const;

export function useDealsQuery() {
  return useQuery<Deal[]>({
    queryKey: DEALS_QUERY_KEY,
    queryFn: () => dealsApi.getDeals(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateDealMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newDeal: Omit<Deal, 'id'>) => dealsApi.createDeal(newDeal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEALS_QUERY_KEY });
    }
  });
}

export function useUpdateDealMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deal: Deal) => dealsApi.updateDeal(deal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEALS_QUERY_KEY });
    }
  });
}

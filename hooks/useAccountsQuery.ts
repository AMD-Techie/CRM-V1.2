import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Account } from '../types/crm';
import { accountsApi } from '../api/crmApi';

export const ACCOUNTS_QUERY_KEY = ['accounts'] as const;

export function useAccountsQuery() {
  return useQuery<Account[]>({
    queryKey: ACCOUNTS_QUERY_KEY,
    queryFn: () => accountsApi.getAccounts(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (account: Omit<Account, 'id'>) => accountsApi.createAccount(account),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });
    }
  });
}

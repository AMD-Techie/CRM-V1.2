import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApprovalItem } from '../types/ai';
import { approvalsApi } from '../api/approvalsApi';

export const APPROVALS_QUERY_KEY = ['approvals'] as const;

export function useApprovalsQuery() {
  return useQuery<ApprovalItem[]>({
    queryKey: APPROVALS_QUERY_KEY,
    queryFn: () => approvalsApi.getApprovals(),
    staleTime: 1000 * 30, // 30s
  });
}

export function useApproveActionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approvalsApi.approveItem(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: APPROVALS_QUERY_KEY });
      const previousApprovals = queryClient.getQueryData<ApprovalItem[]>(APPROVALS_QUERY_KEY);
      
      if (previousApprovals) {
        queryClient.setQueryData<ApprovalItem[]>(
          APPROVALS_QUERY_KEY,
          previousApprovals.map(item => 
            item.id === id 
              ? { ...item, status: 'approved' as const, reviewedAt: 'Just now', reviewedBy: 'Current User' }
              : item
          )
        );
      }
      return { previousApprovals };
    },
    onError: (_err, _id, context) => {
      if (context?.previousApprovals) {
        queryClient.setQueryData(APPROVALS_QUERY_KEY, context.previousApprovals);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: APPROVALS_QUERY_KEY });
    }
  });
}

export function useRejectActionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approvalsApi.rejectItem(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: APPROVALS_QUERY_KEY });
      const previousApprovals = queryClient.getQueryData<ApprovalItem[]>(APPROVALS_QUERY_KEY);
      
      if (previousApprovals) {
        queryClient.setQueryData<ApprovalItem[]>(
          APPROVALS_QUERY_KEY,
          previousApprovals.map(item => 
            item.id === id 
              ? { ...item, status: 'rejected' as const, reviewedAt: 'Just now', reviewedBy: 'Current User' }
              : item
          )
        );
      }
      return { previousApprovals };
    },
    onError: (_err, _id, context) => {
      if (context?.previousApprovals) {
        queryClient.setQueryData(APPROVALS_QUERY_KEY, context.previousApprovals);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: APPROVALS_QUERY_KEY });
    }
  });
}

export function useBulkApproveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => approvalsApi.bulkApprove(ids),
    onMutate: async (ids: string[]) => {
      await queryClient.cancelQueries({ queryKey: APPROVALS_QUERY_KEY });
      const previousApprovals = queryClient.getQueryData<ApprovalItem[]>(APPROVALS_QUERY_KEY);
      
      if (previousApprovals) {
        queryClient.setQueryData<ApprovalItem[]>(
          APPROVALS_QUERY_KEY,
          previousApprovals.map(item => 
            ids.includes(item.id)
              ? { ...item, status: 'approved' as const, reviewedAt: 'Just now', reviewedBy: 'Current User' }
              : item
          )
        );
      }
      return { previousApprovals };
    },
    onError: (_err, _ids, context) => {
      if (context?.previousApprovals) {
        queryClient.setQueryData(APPROVALS_QUERY_KEY, context.previousApprovals);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: APPROVALS_QUERY_KEY });
    }
  });
}

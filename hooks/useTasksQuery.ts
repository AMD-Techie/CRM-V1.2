import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, Meeting, Call } from '../types/crm';
import { tasksApi, meetingsApi, callsApi } from '../api/crmApi';

export const TASKS_QUERY_KEY = ['tasks'] as const;
export const MEETINGS_QUERY_KEY = ['meetings'] as const;
export const CALLS_QUERY_KEY = ['calls'] as const;

export function useTasksQuery() {
  return useQuery<Task[]>({
    queryKey: TASKS_QUERY_KEY,
    queryFn: () => tasksApi.getTasks(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task: Omit<Task, 'id'>) => tasksApi.createTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    }
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task: Task) => tasksApi.updateTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    }
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    }
  });
}

export function useMeetingsQuery() {
  return useQuery<Meeting[]>({
    queryKey: MEETINGS_QUERY_KEY,
    queryFn: () => meetingsApi.getMeetings(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCallsQuery() {
  return useQuery<Call[]>({
    queryKey: CALLS_QUERY_KEY,
    queryFn: () => callsApi.getCalls(),
    staleTime: 1000 * 60 * 5,
  });
}

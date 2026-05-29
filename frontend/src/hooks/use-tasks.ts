'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks, getTask, deleteTask } from '@/lib/api';
import type { Task } from '@/lib/types';

export function useTasks(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ['tasks', page, pageSize],
    queryFn: () => getTasks(page, pageSize),
  });
}

export function useTask(taskId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTask(taskId!),
    enabled: !!taskId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data as Task | undefined;
      if (data && (data.state === 4 || data.state === 0)) {
        return 2000; // Poll every 2s when processing
      }
      return false;
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

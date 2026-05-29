'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createVideo, getTask } from '@/lib/api';
import type { VideoParams, Task } from '@/lib/types';

export function useVideoGeneration() {
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<Task | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: createVideo,
    onSuccess: (data) => {
      setCurrentTaskId(data.task_id);
      setIsPolling(true);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const pollTask = useCallback(async () => {
    if (!currentTaskId) return;

    try {
      const task = await getTask(currentTaskId);
      setTaskStatus(task);

      if (task.state === 1 || task.state === -1) {
        setIsPolling(false);
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    } catch {
      setIsPolling(false);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
  }, [currentTaskId, queryClient]);

  useEffect(() => {
    if (isPolling && currentTaskId) {
      pollingRef.current = setInterval(pollTask, 2000);
      // Also poll immediately
      pollTask();
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isPolling, currentTaskId, pollTask]);

  const generateVideo = useCallback(
    (params: VideoParams) => {
      setTaskStatus(null);
      generateMutation.mutate(params);
    },
    [generateMutation]
  );

  const reset = useCallback(() => {
    setCurrentTaskId(null);
    setTaskStatus(null);
    setIsPolling(false);
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  return {
    generateVideo,
    reset,
    isGenerating: generateMutation.isPending || isPolling,
    currentTaskId,
    taskStatus,
    error: generateMutation.error,
  };
}

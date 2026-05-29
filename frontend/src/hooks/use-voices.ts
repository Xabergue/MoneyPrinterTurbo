'use client';

import { useQuery } from '@tanstack/react-query';
import { getVoices } from '@/lib/api';

export function useVoices() {
  return useQuery({
    queryKey: ['voices'],
    queryFn: getVoices,
    select: (data) => {
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    },
  });
}

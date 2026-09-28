'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addressKeys } from '@/hooks/address/queryKeys';
import { createAddress } from '@/lib/apiClient';

/** 배송지 추가. */
export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: addressKeys.list() });
    },
  });
}

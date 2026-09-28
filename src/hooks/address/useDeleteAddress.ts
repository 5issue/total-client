'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addressKeys } from '@/hooks/address/queryKeys';
import { deleteAddress } from '@/lib/apiClient';

/** 배송지 삭제. */
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: addressKeys.list() });
    },
  });
}

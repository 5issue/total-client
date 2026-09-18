'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addressKeys } from '@/hooks/address/queryKeys';
import { updateAddress } from '@/lib/apiClient';
import type { SaveAddressRequest } from '@/types/address';

/** 배송지 수정. */
export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addressId, body }: { addressId: number; body: SaveAddressRequest }) =>
      updateAddress(addressId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: addressKeys.list() });
    },
  });
}

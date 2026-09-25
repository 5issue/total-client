'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { fridgeKeys } from '@/hooks/fridge/queryKeys';
import { deleteFridgeItem } from '@/lib/apiClient';

/** My냉장고 품목 삭제. 성공 후 목록을 무효화한다(api-convention §7 — 기본 invalidate). */
export function useDeleteFridgeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFridgeItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fridgeKeys.lists() }),
  });
}

'use client';

import { useQuery } from '@tanstack/react-query';

import { fridgeKeys } from '@/hooks/fridge/queryKeys';
import { fetchFridgeItems } from '@/lib/apiClient';

/** My냉장고 품목 목록 조회 (api-convention §1·§4). `MyFridgeViewContainer` 가 소비. */
export function useFridgeItems() {
  return useQuery({
    queryKey: fridgeKeys.lists(),
    queryFn: fetchFridgeItems,
  });
}

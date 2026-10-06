'use client';

import { useQuery } from '@tanstack/react-query';

import { addressKeys } from '@/hooks/address/queryKeys';
import { getAddresses } from '@/lib/apiClient';

/** 배송지 목록 조회 — `AddressManageView`/`CartView` 가 같은 캐시를 공유한다. */
export function useAddresses() {
  return useQuery({
    queryKey: addressKeys.list(),
    queryFn: getAddresses,
  });
}

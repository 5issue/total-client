'use client';

import { useContext } from 'react';

import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { DeliveryAddressStoreContext } from '@/providers/DeliveryAddressStoreProvider';
import type { DeliveryAddressStore } from '@/stores/deliveryAddressStore';

function useDeliveryAddressStoreApi() {
  const store = useContext(DeliveryAddressStoreContext);
  if (!store) {
    throw new Error(
      'useDeliveryAddressStore 는 <DeliveryAddressStoreProvider> 내부에서만 사용할 수 있습니다.',
    );
  }
  return store;
}

/**
 * 단일 원시값/참조 selector 전용.
 * 예: const selectedId = useDeliveryAddressStore((s) => s.selectedId);
 */
export function useDeliveryAddressStore<T>(selector: (state: DeliveryAddressStore) => T): T {
  return useStore(useDeliveryAddressStoreApi(), selector);
}

/**
 * 배열/객체를 반환하는 selector 전용. useShallow 를 강제로 감싸 참조만 바뀐 리렌더를 막는다.
 */
export function useDeliveryAddressStoreShallow<T>(selector: (state: DeliveryAddressStore) => T): T {
  return useStore(useDeliveryAddressStoreApi(), useShallow(selector));
}

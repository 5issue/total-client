'use client';

import { useContext } from 'react';

import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { DeliveryDetailStoreContext } from '@/providers/DeliveryDetailStoreProvider';
import type { DeliveryDetailStore } from '@/stores/deliveryDetailStore';

function useDeliveryDetailStoreApi() {
  const store = useContext(DeliveryDetailStoreContext);
  if (!store) {
    throw new Error(
      'useDeliveryDetailStore 는 <DeliveryDetailStoreProvider> 내부에서만 사용할 수 있습니다.',
    );
  }
  return store;
}

/**
 * 단일 원시값/참조 selector 전용.
 * 예: const detail = useDeliveryDetailStore((s) => s.detail);
 */
export function useDeliveryDetailStore<T>(selector: (state: DeliveryDetailStore) => T): T {
  return useStore(useDeliveryDetailStoreApi(), selector);
}

/**
 * 배열/객체를 반환하는 selector 전용. useShallow 를 강제로 감싸 참조만 바뀐 리렌더를 막는다.
 */
export function useDeliveryDetailStoreShallow<T>(selector: (state: DeliveryDetailStore) => T): T {
  return useStore(useDeliveryDetailStoreApi(), useShallow(selector));
}

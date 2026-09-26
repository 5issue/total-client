'use client';

import { useContext } from 'react';

import { useStore } from 'zustand';

import { CheckoutDeliveryDetailStoreContext } from '@/providers/CheckoutDeliveryDetailStoreProvider';
import type { CheckoutDeliveryDetailStore } from '@/stores/checkoutDeliveryDetailStore';

function useCheckoutDeliveryDetailStoreApi() {
  const store = useContext(CheckoutDeliveryDetailStoreContext);
  if (!store) {
    throw new Error(
      'useCheckoutDeliveryDetailStore 는 <CheckoutDeliveryDetailStoreProvider> 내부에서만 사용할 수 있습니다.',
    );
  }
  return store;
}

/**
 * 단일 원시값/참조 selector 전용.
 * 예: const detail = useCheckoutDeliveryDetailStore((s) => s.detail);
 */
export function useCheckoutDeliveryDetailStore<T>(
  selector: (state: CheckoutDeliveryDetailStore) => T,
): T {
  return useStore(useCheckoutDeliveryDetailStoreApi(), selector);
}

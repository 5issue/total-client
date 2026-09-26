'use client';

import { createContext, useState, type ReactNode } from 'react';

import {
  createCheckoutDeliveryDetailStore,
  type CheckoutDeliveryDetailStoreApi,
} from '@/stores/checkoutDeliveryDetailStore';

/**
 * 체크아웃 배송 상세정보 스토어 Provider. `DeliveryAddressStoreProvider` 와 동일 패턴 —
 * useState 지연 초기화로 마운트당 1회만 인스턴스를 만든다(모듈 싱글턴 금지).
 * 실제 selector 훅은 `@/hooks/useCheckoutDeliveryDetailStore` 에서 제공한다.
 */
export const CheckoutDeliveryDetailStoreContext =
  createContext<CheckoutDeliveryDetailStoreApi | null>(null);

export function CheckoutDeliveryDetailStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState<CheckoutDeliveryDetailStoreApi>(() =>
    createCheckoutDeliveryDetailStore(),
  );

  return (
    <CheckoutDeliveryDetailStoreContext.Provider value={store}>
      {children}
    </CheckoutDeliveryDetailStoreContext.Provider>
  );
}

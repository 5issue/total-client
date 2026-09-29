'use client';

import { createContext, useState, type ReactNode } from 'react';

import {
  createDeliveryDetailStore,
  type DeliveryDetailStoreApi,
} from '@/stores/deliveryDetailStore';

/**
 * 배송 상세정보 스토어 Provider. `DeliveryAddressStoreProvider` 와 동일 패턴 —
 * useState 지연 초기화로 마운트당 1회만 인스턴스를 만든다(모듈 싱글턴 금지).
 * 실제 selector 훅은 `@/hooks/useDeliveryDetailStore` 에서 제공한다.
 */
export const DeliveryDetailStoreContext = createContext<DeliveryDetailStoreApi | null>(null);

export function DeliveryDetailStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState<DeliveryDetailStoreApi>(() => createDeliveryDetailStore());

  return (
    <DeliveryDetailStoreContext.Provider value={store}>
      {children}
    </DeliveryDetailStoreContext.Provider>
  );
}

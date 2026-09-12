'use client';

import { createContext, useState, type ReactNode } from 'react';

import {
  createDeliveryAddressStore,
  type DeliveryAddressStoreApi,
} from '@/stores/deliveryAddressStore';

/**
 * 선택된 배송지 스토어 Provider. `UIStoreProvider` 와 동일한 패턴 —
 * useState 지연 초기화로 마운트당 1회만 인스턴스를 만든다(모듈 싱글턴 금지).
 * 실제 selector 훅은 `@/hooks/useDeliveryAddressStore` 에서 제공한다.
 */
export const DeliveryAddressStoreContext = createContext<DeliveryAddressStoreApi | null>(null);

export function DeliveryAddressStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState<DeliveryAddressStoreApi>(() => createDeliveryAddressStore());

  return (
    <DeliveryAddressStoreContext.Provider value={store}>
      {children}
    </DeliveryAddressStoreContext.Provider>
  );
}

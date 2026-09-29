import { createStore } from 'zustand/vanilla';

import type { DeliveryDetailFormFields } from '@/types/deliveryDetail';

/**
 * 주문서 배송 상세정보 (클라 UI 상태).
 *
 * `/checkout` 와 `/checkout/delivery-detail` 은 다른 라우트라 로컬 state 로는
 * "동의하고 저장" 값이 되돌아가지 않는다. 서버 API 가 아니라 세션 한정 폼 확정값이라
 * TanStack Query 가 아니라 Zustand 팩토리 + Provider 로 둔다(code-style §3).
 */
export type DeliveryDetailState = {
  detail: DeliveryDetailFormFields | null;
};

export type DeliveryDetailActions = {
  setDetail: (detail: DeliveryDetailFormFields) => void;
  clearDetail: () => void;
};

export type DeliveryDetailStore = DeliveryDetailState & DeliveryDetailActions;

export const defaultDeliveryDetailState: DeliveryDetailState = {
  detail: null,
};

export const createDeliveryDetailStore = (
  initState: DeliveryDetailState = defaultDeliveryDetailState,
) => {
  return createStore<DeliveryDetailStore>()((set) => ({
    ...initState,
    setDetail: (detail) => set({ detail }),
    clearDetail: () => set({ detail: null }),
  }));
};

export type DeliveryDetailStoreApi = ReturnType<typeof createDeliveryDetailStore>;

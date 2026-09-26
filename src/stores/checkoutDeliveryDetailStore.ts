import { createStore } from 'zustand/vanilla';

import type { DeliveryDetailFormFields } from '@/types/deliveryDetail';

/**
 * 체크아웃 '배송 상세정보' 입력값 (클라 UI 상태, `deliveryAddressStore` 와 동일 패턴).
 *
 * `/checkout/delivery-detail`(`DeliveryDetailEditView`)이 폼 값을 저장하고, `/checkout`
 * (`CheckoutView`)이 이 스토어를 읽어 "배송 상세정보" 행에 반영한다 — 두 화면이 서로 다른
 * 라우트라 props 로 못 넘기고, 백엔드에도 저장하지 않는 값이라(이슈 #92 범위) 서버 상태가
 * 아닌 여기 둔다.
 */
export type CheckoutDeliveryDetailState = {
  detail: DeliveryDetailFormFields | null;
};

export type CheckoutDeliveryDetailActions = {
  setDetail: (detail: DeliveryDetailFormFields) => void;
};

export type CheckoutDeliveryDetailStore = CheckoutDeliveryDetailState &
  CheckoutDeliveryDetailActions;

export const defaultCheckoutDeliveryDetailState: CheckoutDeliveryDetailState = {
  detail: null,
};

export const createCheckoutDeliveryDetailStore = (
  initState: CheckoutDeliveryDetailState = defaultCheckoutDeliveryDetailState,
) => {
  return createStore<CheckoutDeliveryDetailStore>()((set) => ({
    ...initState,
    setDetail: (detail) => set({ detail }),
  }));
};

export type CheckoutDeliveryDetailStoreApi = ReturnType<typeof createCheckoutDeliveryDetailStore>;

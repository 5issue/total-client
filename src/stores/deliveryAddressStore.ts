import { createStore } from 'zustand/vanilla';

/**
 * 장바구니에 표시할 "선택된 배송지" 요약 (클라 UI 상태, 마운트당 생성 팩토리 + Provider + 훅까지
 * 배선된 참조 구현 — `uiStore.ts` 와 동일 패턴).
 *
 * `AddressManageView`(`/mypage/addresses`)에서 라디오로 고른 배송지를 `CartView`(`/cart`)가
 * 그대로 보여주기 위한 **화면 간 공유 상태**다. 두 화면이 서로 다른 로컬 state 만 갖고 있으면
 * 라우트를 오가는 순간 선택이 사라지므로(CSR 화면 전환 = 다른 컴포넌트 트리, 로컬 state 소멸)
 * `src/app/providers.tsx` 아래에서 전역으로 살아있는 이 스토어가 둘을 이어준다.
 *
 * 백엔드 연동 전(퍼블 단계)이라 서버 응답이 아니라 순수 클라이언트 상태 — 실제 배송지
 * CRUD·기본배송지·영속화는 데이터 연결 시 TanStack Query 로 옮기고, 이 스토어는 "현재 화면에
 * 표시할 요약값"만 계속 들고 있으면 된다.
 */
export type SelectedDeliveryAddress = {
  id: string;
  /** 장바구니에 표시할 주소 한 줄 요약(도로명 + 상세주소). */
  addressLine: string;
  /** 배송 유형(예: "샛별배송"). 백엔드 없어 지금은 배송지에 고정값으로 붙어 있다. */
  deliveryType?: string;
};

export type DeliveryAddressState = {
  selected: SelectedDeliveryAddress | null;
};

export type DeliveryAddressActions = {
  setSelected: (address: SelectedDeliveryAddress | null) => void;
};

export type DeliveryAddressStore = DeliveryAddressState & DeliveryAddressActions;

export const defaultDeliveryAddressState: DeliveryAddressState = {
  selected: null,
};

export const createDeliveryAddressStore = (
  initState: DeliveryAddressState = defaultDeliveryAddressState,
) => {
  return createStore<DeliveryAddressStore>()((set) => ({
    ...initState,
    setSelected: (address) => set({ selected: address }),
  }));
};

export type DeliveryAddressStoreApi = ReturnType<typeof createDeliveryAddressStore>;

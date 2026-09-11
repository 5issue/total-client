import { createStore } from 'zustand/vanilla';

import type { AddressView } from '@/components/organisms/mypage/model';

/**
 * 배송지 목록 + 선택 상태 (클라 UI 상태, 마운트당 생성 팩토리 + Provider + 훅까지 배선된
 * 참조 구현 — `uiStore.ts` 와 동일 패턴).
 *
 * `AddressManageView`(`/mypage/addresses`)와 `CartView`(`/cart`) 가 **같은 목록을 공유**한다.
 * 각자 로컬 state 로 들고 있으면 라우트를 오갈 때마다(CSR 화면 전환 = 다른 컴포넌트 트리) 목록·선택이
 * 사라진다 — `AddressManageView` 가 재마운트되며 빈 목록으로 되돌아가 장바구니의 기존 선택까지
 * 지워버리는 문제(코드래빗 리뷰)가 그래서 생겼다. `src/app/providers.tsx` 아래에서 전역으로
 * 살아있는 이 스토어가 목록 자체를 들고 있어야 그 문제가 안 생긴다.
 *
 * 백엔드 연동 전(퍼블 단계)이라 서버 응답이 아니라 순수 클라이언트 상태 — 실제 배송지
 * CRUD·기본배송지·영속화는 데이터 연결 시 TanStack Query 로 옮긴다.
 */
export type DeliveryAddressState = {
  addresses: AddressView[];
  selectedId: string | null;
};

export type DeliveryAddressActions = {
  /** React `setState` 와 동일하게 값 또는 updater 함수를 받는다. */
  setAddresses: (updater: AddressView[] | ((prev: AddressView[]) => AddressView[])) => void;
  setSelectedId: (updater: string | null | ((prev: string | null) => string | null)) => void;
};

export type DeliveryAddressStore = DeliveryAddressState & DeliveryAddressActions;

export const defaultDeliveryAddressState: DeliveryAddressState = {
  addresses: [],
  selectedId: null,
};

export const createDeliveryAddressStore = (
  initState: DeliveryAddressState = defaultDeliveryAddressState,
) => {
  return createStore<DeliveryAddressStore>()((set) => ({
    ...initState,
    setAddresses: (updater) =>
      set((state) => ({
        addresses: typeof updater === 'function' ? updater(state.addresses) : updater,
      })),
    setSelectedId: (updater) =>
      set((state) => ({
        selectedId: typeof updater === 'function' ? updater(state.selectedId) : updater,
      })),
  }));
};

export type DeliveryAddressStoreApi = ReturnType<typeof createDeliveryAddressStore>;

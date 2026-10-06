import { createStore } from 'zustand/vanilla';

/**
 * 선택된 배송지 id (클라 UI 상태, 마운트당 생성 팩토리 + Provider + 훅까지 배선된
 * 참조 구현 — `uiStore.ts` 와 동일 패턴).
 *
 * `AddressManageView`(`/mypage/addresses`)와 `CartView`(`/cart`) 가 **같은 선택 상태**를
 * 공유한다. 각자 로컬 state 로 들고 있으면 라우트를 오갈 때마다(CSR 화면 전환 = 다른 컴포넌트
 * 트리) 선택이 사라진다 — `src/app/providers.tsx` 아래에서 전역으로 살아있는 이 스토어가
 * 선택 id 를 들고 있어야 그 문제가 안 생긴다.
 *
 * 배송지 **목록**은 여기 없다 — 서버 데이터라 `hooks/address/useAddresses`(TanStack Query)
 * 캐시가 소스 오브 트루스이고, 이 스토어와 별개로 두 화면이 같은 쿼리 키를 통해 캐시를
 * 공유한다(이슈 #119, api-convention 안티패턴 — "전역 Zustand 스토어에 서버 응답 저장" 금지).
 */
export type DeliveryAddressState = {
  selectedId: string | null;
};

export type DeliveryAddressActions = {
  /** React `setState` 와 동일하게 값 또는 updater 함수를 받는다. */
  setSelectedId: (updater: string | null | ((prev: string | null) => string | null)) => void;
};

export type DeliveryAddressStore = DeliveryAddressState & DeliveryAddressActions;

export const defaultDeliveryAddressState: DeliveryAddressState = {
  selectedId: null,
};

export const createDeliveryAddressStore = (
  initState: DeliveryAddressState = defaultDeliveryAddressState,
) => {
  return createStore<DeliveryAddressStore>()((set) => ({
    ...initState,
    setSelectedId: (updater) =>
      set((state) => ({
        selectedId: typeof updater === 'function' ? updater(state.selectedId) : updater,
      })),
  }));
};

export type DeliveryAddressStoreApi = ReturnType<typeof createDeliveryAddressStore>;

import { createStore } from 'zustand/vanilla';

/**
 * 클라이언트 UI 상태 스토어 (뼈대 / 예시).
 *
 * 원칙:
 * - 모듈 최상단 create() 싱글턴 금지. SSR 에서 요청 간 상태가 공유되는 것을 막는다.
 * - zustand/vanilla 의 createStore 로 "팩토리"만 정의한다.
 * - Provider 가 useRef 로 마운트당 1회 인스턴스화한다 (UIStoreProvider.tsx).
 * - 서버 상태(API 응답)는 절대 여기 두지 않는다 -> TanStack Query 담당.
 *
 * 실제 도메인 스토어(장바구니 draft, 필터 상태 등)는 다음 단계에서 별도 파일로 추가.
 */

export type UIState = {
  isMobileNavOpen: boolean;
  isCartDrawerOpen: boolean;
  /** 검색 화면 SearchBar 포커스(키패드 ON) 여부 — true 인 동안 BottomNav 를 숨긴다
   *  (Figma "화면" node 577-13645, 키패드 ON 목업엔 하단 탭바가 없다). */
  isSearchInputFocused: boolean;
};

export type UIActions = {
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleCartDrawer: () => void;
  setSearchInputFocused: (focused: boolean) => void;
  reset: () => void;
};

export type UIStore = UIState & UIActions;

export const defaultUIState: UIState = {
  isMobileNavOpen: false,
  isCartDrawerOpen: false,
  isSearchInputFocused: false,
};

export const createUIStore = (initState: UIState = defaultUIState) => {
  return createStore<UIStore>()((set) => ({
    ...initState,
    openMobileNav: () => set({ isMobileNavOpen: true }),
    closeMobileNav: () => set({ isMobileNavOpen: false }),
    toggleCartDrawer: () => set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),
    setSearchInputFocused: (focused) => set({ isSearchInputFocused: focused }),
    reset: () => set(defaultUIState),
  }));
};

export type UIStoreApi = ReturnType<typeof createUIStore>;

'use client';

import { createContext, useState, type ReactNode } from 'react';

import { createUIStore, type UIStoreApi } from '@/stores/uiStore';

/**
 * UI 스토어 Provider.
 * useState 지연 초기화로 마운트당 1회만 store 인스턴스를 만든다 (모듈 싱글턴 금지).
 * useRef 가 아닌 이유: ref.current 는 렌더 중 접근이 금지되어 있고(eslint react-hooks/refs),
 * 이 store 는 Provider value 로 렌더에 바로 쓰이므로 useState 지연 초기화가 안전하다.
 * 실제 selector 훅은 @/hooks/useUIStore 에서 제공한다.
 */
export const UIStoreContext = createContext<UIStoreApi | null>(null);

export function UIStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState<UIStoreApi>(() => createUIStore());

  return <UIStoreContext.Provider value={store}>{children}</UIStoreContext.Provider>;
}

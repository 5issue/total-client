'use client';

import { createContext, useState, type ReactNode } from 'react';

import { createThemeStore, type ThemeStoreApi } from '@/stores/themeStore';

/**
 * 테마 스토어 Provider. `useState` 지연 초기화로 마운트당 1회만 인스턴스화한다
 * (UIStoreProvider 와 동일 패턴 — 모듈 싱글턴 금지).
 *
 * 복원 로직이 없다 — 앱을 새로 열면 항상 스토어 초기값('light')으로 시작한다
 * (2026-09-18 결정, themeStore 문서 참고). 이전엔 마운트 시 localStorage/OS 선호를
 * 읽어 보정했지만, "실행하면 항상 기본 모드" 요구와 맞지 않아 제거했다.
 */
export const ThemeStoreContext = createContext<ThemeStoreApi | null>(null);

export function ThemeStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState<ThemeStoreApi>(() => createThemeStore());

  return <ThemeStoreContext.Provider value={store}>{children}</ThemeStoreContext.Provider>;
}

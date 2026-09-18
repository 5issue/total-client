'use client';

import { useContext } from 'react';

import { useStore } from 'zustand';

import { ThemeStoreContext } from '@/providers/ThemeStoreProvider';
import type { ThemeStore } from '@/stores/themeStore';

/** 단일 원시값/함수 selector 전용. 예: `const theme = useThemeStore((s) => s.theme)`. */
export function useThemeStore<T>(selector: (state: ThemeStore) => T): T {
  const store = useContext(ThemeStoreContext);
  if (!store) {
    throw new Error('useThemeStore 는 <ThemeStoreProvider> 내부에서만 사용할 수 있습니다.');
  }
  return useStore(store, selector);
}

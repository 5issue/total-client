'use client';

import { useContext } from 'react';

import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { AuthTokenStoreContext } from '@/providers/AuthTokenStoreProvider';
import type { AuthTokenStore } from '@/stores/useAuthTokenStore';

function useAuthTokenStoreApi() {
  const store = useContext(AuthTokenStoreContext);
  if (!store) {
    throw new Error('useAuthToken 은 <AuthTokenStoreProvider> 내부에서만 사용할 수 있습니다.');
  }
  return store;
}

/**
 * 단일 원시값 selector 전용.
 * 예: const accessToken = useAuthToken((s) => s.accessToken);
 */
export function useAuthToken<T>(selector: (state: AuthTokenStore) => T): T {
  return useStore(useAuthTokenStoreApi(), selector);
}

/**
 * 배열/객체를 반환하는 selector 전용. useShallow 강제 (code-style §3-3).
 * 예: const { setAccessToken, clear } = useAuthTokenShallow((s) => ({ setAccessToken: s.setAccessToken, clear: s.clear }));
 */
export function useAuthTokenShallow<T>(selector: (state: AuthTokenStore) => T): T {
  return useStore(useAuthTokenStoreApi(), useShallow(selector));
}

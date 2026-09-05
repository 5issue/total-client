'use client';

import { createContext, useEffect, useState, type ReactNode } from 'react';

import { registerAccessTokenRef } from '@/lib/authTokenRef';
import { createAuthTokenStore, type AuthTokenStoreApi } from '@/stores/useAuthTokenStore';

/**
 * Access Token 스토어 Provider.
 * useState 지연 초기화로 마운트당 1회만 store 인스턴스를 만든다 (uiStore 와 동일 패턴, 모듈 싱글턴 금지).
 * 실제 selector 훅은 `@/hooks/auth/useAuthToken` 에서 제공한다.
 *
 * `apiClient.ts` 는 React 트리 밖의 평범한 모듈이라 이 컨텍스트를 직접 구독할 수 없다 —
 * 마운트 시 `registerAccessTokenRef` 로 "현재 값을 읽고/쓰는 함수"만 등록해 다리를 놓는다
 * (스토어 자체를 전역화하지 않음, `authTokenRef.ts` 참고).
 */
export const AuthTokenStoreContext = createContext<AuthTokenStoreApi | null>(null);

export function AuthTokenStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState<AuthTokenStoreApi>(() => createAuthTokenStore());

  useEffect(() => {
    registerAccessTokenRef({
      get: () => store.getState().accessToken,
      set: (token) => store.getState().setAccessToken(token),
      clear: () => store.getState().clear(),
    });
  }, [store]);

  return <AuthTokenStoreContext.Provider value={store}>{children}</AuthTokenStoreContext.Provider>;
}

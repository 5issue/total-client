'use client';

import type { ReactNode } from 'react';

import { AuthTokenStoreProvider } from '@/providers/AuthTokenStoreProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { UIStoreProvider } from '@/providers/UIStoreProvider';

/**
 * 모든 클라이언트 Provider 합성 지점.
 * layout.tsx 는 이 컴포넌트 하나만 감싼다. Provider 를 추가할 때도 여기서만 조합한다.
 *
 * 합성 순서 원칙: 서버 상태(TanStack Query) -> 클라 UI 상태(Zustand, Access Token 포함) -> (이후) 테마/토스트 등
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <UIStoreProvider>
        <AuthTokenStoreProvider>{children}</AuthTokenStoreProvider>
      </UIStoreProvider>
    </QueryProvider>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';

import { authKeys } from '@/hooks/auth/queryKeys';
import { bootstrapSession } from '@/lib/apiClient';

/**
 * 앱 부팅 시 무음 재발급 결과를 공유하는 쿼리 (api-convention §4).
 *
 * `SessionBootstrap` 이 트리 최상단에서 한 번 마운트해 트리거하고, 이후 어느 컴포넌트든
 * 같은 쿼리 키로 세션 유무(`data.authenticated`)를 읽는다. 재발급 자체(accessToken 을
 * 메모리에 채우는 것)는 `bootstrapSession` 이 수행하므로, 이 훅은 "로그인 여부" 신호만 제공한다.
 *
 * `retry: false` — 401(게스트)은 재시도 대상이 아니다. `staleTime: Infinity` — 세션은
 * 로그인/로그아웃 이벤트로만 무효화한다(포커스·마운트마다 재검증하지 않음).
 */
export function useSession() {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: bootstrapSession,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

'use client';

import { useSession } from '@/hooks/auth/useSession';

/**
 * 앱 부팅 시 무음 재발급을 1회 트리거하는 렌더 없는 컴포넌트.
 * `providers.tsx` 에서 `AuthTokenStoreProvider`(스토어) · `QueryProvider`(쿼리) 안쪽에 둔다.
 * OAuth 콜백 착지 직후에도, 유효한 `refresh_token` 쿠키로 재방문했을 때도 accessToken 을
 * 메모리에 미리 채워, 첫 인증 요청이 401→retry 를 거치지 않게 한다.
 */
export function SessionBootstrap() {
  useSession();
  return null;
}

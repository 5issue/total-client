'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useSession } from '@/hooks/auth/useSession';
import { safeRedirect } from '@/lib/safeRedirect';

/**
 * 이미 로그인된 사용자가 `/login` 에 도달하면 `?redirect=` 대상(없으면 홈)으로 돌려보낸다.
 * `(auth)` 는 "비로그인 전용"(structure §1).
 *
 * 세션 판단은 `SessionBootstrap` 이 채운 `useSession()` 결과 — 미들웨어의 쿠키 낙관 검사가
 * 아니라 실제 무음 재발급 성공 여부다(만료 쿠키로는 여기서 튕기지 않는다). 렌더는 없다.
 */
export function GuestGate() {
  const router = useRouter();
  const { data } = useSession();

  useEffect(() => {
    if (!data?.authenticated) return;
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    router.replace(safeRedirect(redirect));
  }, [data?.authenticated, router]);

  return null;
}

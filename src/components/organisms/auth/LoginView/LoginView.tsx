'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { SocialLoginPanel } from '@/components/organisms/auth/SocialLoginPanel';
import { KurlyHeader } from '@/components/organisms/shared/KurlyHeader';
import { useSession } from '@/hooks/auth/useSession';
import { safeRedirect } from '@/lib/safeRedirect';

/**
 * 로그인 화면 (organism). Figma "5팀 UI 공유용" — node 577-13111 "LoginScreen".
 *
 * `(shop)` 라우트라 상단 헤더(`KurlyHeader`) / 하단 BottomNav(마이컬리 활성)를 두른다.
 * 카카오·네이버 소셜 로그인만.
 *
 * 이미 로그인된 사용자가 오면(직접 접근 등) `?redirect=` 대상(없으면 `/mypage`)으로 돌려보낸다 —
 * 세션 판단은 `SessionBootstrap` 이 채운 `useSession()` 결과(쿠키 낙관 검사 아님).
 */
export function LoginView() {
  const router = useRouter();
  const { data } = useSession();

  useEffect(() => {
    if (data?.authenticated !== true) return;
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    router.replace(redirect ? safeRedirect(redirect) : '/mypage');
  }, [data?.authenticated, router]);

  return (
    <>
      <KurlyHeader />

      {/* Figma node 577-13111: 헤더 아래 로그인 안내(gap-140) → 소셜 버튼(gap-140). */}
      <div className="flex flex-1 flex-col items-center px-4 pt-35">
        <section className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-display-xs text-fg">로그인을 해주세요!</h1>
          <p className="text-heading-4 text-fg">컬리의 다양한 혜택들을 받아보실 수 있어요.</p>
        </section>
        <SocialLoginPanel className="mt-35 w-full" />
      </div>
    </>
  );
}

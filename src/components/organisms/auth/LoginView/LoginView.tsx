'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { SocialLoginPanel } from '@/components/organisms/auth/SocialLoginPanel';
import { KurlyHeader } from '@/components/organisms/shared/KurlyHeader';
import { useSession } from '@/hooks/auth/useSession';
import { safeRedirect } from '@/lib/safeRedirect';

/** SSR 패스에는 `window` 가 없다 — 서버에선 `undefined`, 클라이언트 첫 렌더에서 실제 값. */
function readReturnTo(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const redirect = new URLSearchParams(window.location.search).get('redirect');
  return redirect ? safeRedirect(redirect) : undefined;
}

/**
 * 로그인 화면 (organism). Figma "5팀 UI 공유용" — node 577-13111 "LoginScreen".
 *
 * `(shop)` 라우트라 상단 헤더(`KurlyHeader`) / 하단 BottomNav(마이컬리 활성)를 두른다.
 * 카카오·네이버 소셜 로그인만.
 *
 * 이미 로그인된 사용자가 오면(직접 접근 등) `?redirect=` 대상(없으면 `/mypage`)으로 돌려보낸다 —
 * 세션 판단은 `SessionBootstrap` 이 채운 `useSession()` 결과(쿠키 낙관 검사 아님).
 *
 * 로그아웃 상태로 온 경우엔 같은 `?redirect=` 값을 소셜 로그인 시작 시 `returnTo` 로 실어
 * 보낸다 — Spring 이 콜백 리다이렉트에 그대로 되돌려줘서 로그인 후 원래 페이지로 복귀한다
 * (미들웨어가 붙이는 `redirect` 값 — `middleware.ts`).
 */
export function LoginView() {
  const router = useRouter();
  const { data } = useSession();
  const [returnTo] = useState(readReturnTo);

  useEffect(() => {
    if (data?.authenticated !== true) return;
    router.replace(returnTo ?? '/mypage');
  }, [data?.authenticated, returnTo, router]);

  return (
    <>
      <KurlyHeader />

      {/* Figma node 577-13111: 헤더 아래 로그인 안내(gap-140) → 소셜 버튼(gap-140). */}
      <div className="flex flex-1 flex-col items-center px-4 pt-35">
        <section className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-display-xs text-fg">로그인을 해주세요!</h1>
          <p className="text-heading-4 text-fg">컬리의 다양한 혜택들을 받아보실 수 있어요.</p>
        </section>
        <SocialLoginPanel className="mt-35 w-full" returnTo={returnTo} />
      </div>
    </>
  );
}

'use client';

import type { ReactNode } from 'react';

import { usePathname } from 'next/navigation';

import { BottomNav } from '@/components/organisms/shared/BottomNav';
import { SwipeTabShell } from '@/components/organisms/shared/SwipeTabShell';

/**
 * (shop) 셸 크롬(BottomNav + 전역 스와이프 탭 + BottomNav 높이만큼의 하단 여백)을 두르지 않는
 * 경로. 자체 하단 CTA 를 가진 "밀어서 띄운" 전체화면 뷰 — 크롬을 켜면 CTA 와 겹친다.
 */
const CHROMELESS_PREFIXES = ['/cart'];

function isChromeless(pathname: string): boolean {
  return CHROMELESS_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * (shop) 공통 셸의 클라 경계. 대부분의 화면은 BottomNav + 전역 스와이프 탭 + 하단 여백을
 * 두르지만, 장바구니처럼 자체 하단 CTA 를 가진 전체화면 뷰는 이 크롬을 전부 끈다
 * (PR #58 리뷰, dew2314 — "장바구니 화면엔 BottomNav 불필요, 주문 CTA 와 겹칠 수 있음").
 *
 * `(shop)/layout.tsx` 는 서버로 남고 `children`(page) 도 서버에서 그대로 렌더된다 —
 * `usePathname` 이 필요한 이 래퍼만 클라 경계를 갖는다(SwipeTabShell 과 같은 패턴).
 */
export function ShopShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (isChromeless(pathname)) {
    return <main className="flex flex-1 flex-col">{children}</main>;
  }

  return (
    <>
      {/* BottomNav 가 fixed 라 문서 흐름을 안 차지하는 만큼 콘텐츠 하단을 예약한다 —
          디자인팀 핸드오프 기준값(BottomNav만 있는 화면 112px, globals.css
          `--spacing-bottom-nav-safe` 참고)과 정확히 일치시킨 값이라 근사치가 아니다. */}
      <main className="pb-bottom-nav-safe flex flex-1 flex-col">
        <SwipeTabShell className="flex-1">{children}</SwipeTabShell>
      </main>
      <BottomNav />
    </>
  );
}

'use client';

import type { ReactNode } from 'react';

import { BottomNav } from '@/components/organisms/shared/BottomNav';
import { SwipeTabShell } from '@/components/organisms/shared/SwipeTabShell';

/**
 * (shop) `(chrome)` 그룹의 클라 경계. BottomNav + 전역 스와이프 탭 + BottomNav 높이만큼의
 * 하단 여백을 두른다. 크롬리스 화면은 이 컴포넌트를 쓰지 않고 `(chromeless)/layout.tsx` 가
 * `<main>` 만 렌더한다 — pathname 분기는 하이드레이션 불일치를 만든다.
 *
 * `(shop)/layout.tsx` 는 서버 프레임만, `(chrome)/layout.tsx` 가 이 래퍼를 붙인다.
 * `children`(page) 은 서버에서 그대로 통과한다(SwipeTabShell 과 같은 패턴).
 */
export function ShopShell({ children }: { children: ReactNode }) {
  return (
    <>
      {/* pb-bottom-nav-safe: BottomNav 가 fixed 라 문서 흐름을 안 차지하는 만큼 콘텐츠 하단
          예약 — 디자인팀 핸드오프 기준값(BottomNav만 있는 화면 112px, globals.css
          `--spacing-bottom-nav-safe` 참고)과 정확히 일치시킨 값이라 근사치가 아니다. */}
      <main className="pb-bottom-nav-safe flex flex-1 flex-col">
        <SwipeTabShell className="flex-1">{children}</SwipeTabShell>
      </main>
      <BottomNav />
    </>
  );
}

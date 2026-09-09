'use client';

import type { ReactNode } from 'react';

import { useSwipeTabNavigation } from '@/hooks/useSwipeTabNavigation';

import { NAV_ITEMS } from '../BottomNav/nav-items';

/**
 * <main> 안쪽 페이지 콘텐츠를 감싸 화면(콘텐츠 영역)에서 좌우로 스와이프하면 탭이
 * 전환되게 한다(디자인팀 요청, PR #58 리뷰) — BottomNav 는 일부러 이 래퍼 밖(형제)에 둔다.
 * 탭바는 탭(클릭)으로만 전환하면 되고, 바 위에서까지 스와이프가 겹치는 걸 원치 않는다는
 * 팔로우업 피드백 반영. (shop)/layout.tsx 는 여전히 서버 컴포넌트로 남고(children 통과),
 * 상호작용이 필요한 이 래퍼만 클라 경계를 갖는다.
 *
 * ⚠️ 화면 내부에 자체 가로 스와이프가 필요한 콘텐츠(상품 이미지 캐러셀 등)가 생기면 이
 * 전역 핸들러와 충돌한다 — 그 컴포넌트에서 `onTouchStart`/`onTouchEnd` 에
 * `event.stopPropagation()` 을 걸거나, 스와이프 탭 전환 존을 좁히는 재설계가 필요할 수 있다.
 */
export function SwipeTabShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const swipeHandlers = useSwipeTabNavigation(NAV_ITEMS);

  return (
    <div className={`touch-pan-y ${className ?? ''}`.trim()} {...swipeHandlers}>
      {children}
    </div>
  );
}

'use client';

import { useRef, type TouchEvent as ReactTouchEvent } from 'react';

import { usePathname, useRouter } from 'next/navigation';

const SWIPE_THRESHOLD_PX = 40;

export type SwipeTab = { href: string };

/**
 * 화면 전체에서 좌우 스와이프로 탭(라우트) 전환. 왼쪽 스와이프 = 다음 탭, 오른쪽 = 이전 탭
 * (끝에서는 멈춤, 순환 없음). 탭(터치 이동 없음)은 임계값 미만이라 아무 일도 일어나지 않고
 * 브라우저가 원래 클릭/터치를 그대로 처리한다 — 실제 드래그가 발생하면 브라우저가 합성
 * click 을 취소하므로 이중 네비게이션도 없다. 서드파티 제스처 라이브러리 없이 네이티브
 * 터치 이벤트만 사용(번들 최소화, code-style §8).
 *
 * 반환값을 `touch-pan-y`(가로 드래그를 브라우저 자체 제스처가 가로채지 못하게)와 함께
 * 화면 전체를 감싸는 컨테이너에 스프레드한다.
 *
 * ⚠️ deltaY 도 같이 봐야 한다 — X 값만 보면 세로로 길게 스크롤하는 손가락이 살짝만
 * 옆으로 틀어져도(실제 터치에서 흔함) 40px 를 넘어 탭이 전환돼버린다(#69 검색
 * 화면에서 목록을 위아래로 스크롤하다 다른 탭으로 튕기는 버그로 재현). 가로 이동량이
 * 세로 이동량보다 클 때만 스와이프로 인정한다.
 */
export function useSwipeTabNavigation(tabs: SwipeTab[]) {
  const pathname = usePathname();
  const router = useRouter();
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  function handleTouchStart(event: ReactTouchEvent<HTMLElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchStartY.current = event.touches[0]?.clientY ?? null;
  }

  function handleTouchEnd(event: ReactTouchEvent<HTMLElement>) {
    const startX = touchStartX.current;
    const startY = touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (startX === null || startY === null) return;

    const endX = event.changedTouches[0]?.clientX ?? startX;
    const endY = event.changedTouches[0]?.clientY ?? startY;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    if (Math.abs(deltaX) <= Math.abs(deltaY)) return;

    const currentIndex = tabs.findIndex((tab) => isTabActive(pathname, tab.href));
    if (currentIndex === -1) return;

    const nextTab = tabs[deltaX < 0 ? currentIndex + 1 : currentIndex - 1];
    if (!nextTab) return;

    router.push(nextTab.href);
  }

  function handleTouchCancel() {
    touchStartX.current = null;
    touchStartY.current = null;
  }

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
  };
}

function isTabActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

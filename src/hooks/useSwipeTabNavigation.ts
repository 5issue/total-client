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
 */
export function useSwipeTabNavigation(tabs: SwipeTab[]) {
  const pathname = usePathname();
  const router = useRouter();
  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(event: ReactTouchEvent<HTMLElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: ReactTouchEvent<HTMLElement>) {
    const startX = touchStartX.current;
    touchStartX.current = null;
    if (startX === null) return;

    const endX = event.changedTouches[0]?.clientX ?? startX;
    const deltaX = endX - startX;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;

    const currentIndex = tabs.findIndex((tab) => isTabActive(pathname, tab.href));
    if (currentIndex === -1) return;

    const nextTab = tabs[deltaX < 0 ? currentIndex + 1 : currentIndex - 1];
    if (!nextTab) return;

    router.push(nextTab.href);
  }

  function handleTouchCancel() {
    touchStartX.current = null;
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

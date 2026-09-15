'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 스크롤 상단이동 플로팅 버튼 노출 조건 (범용 훅). Figma "5팀 디자인 시스템" —
 * Floating Button 노출 스펙(사용자 핸드오프): 최하단 도달 시 또는(하단 스크롤 중) 위로
 * 스크롤 시 노출, 아래로 스크롤 시 숨김, 최상단(y=0) 도달 시 숨김.
 *
 * `window.scroll`(passive) 로 이전 위치와 비교 — 최상단/최하단은 강제 판정, 그 사이는
 * 방향만 본다. `document.documentElement.scrollHeight` 는 레이아웃마다 리플로우 비용이
 * 있어 매 스크롤 이벤트에서 새로 읽되, `passive: true` 로 메인 스레드 블로킹은 피한다.
 */
export function useScrollToTopVisibility() {
  const [visible, setVisible] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    function handleScroll() {
      const y = window.scrollY;
      const atTop = y <= 0;
      const atBottom = y + window.innerHeight >= document.documentElement.scrollHeight - 1;

      if (atTop) setVisible(false);
      else if (atBottom) setVisible(true);
      else if (y < lastY.current)
        setVisible(true); // 위로 스크롤
      else if (y > lastY.current) setVisible(false); // 아래로 스크롤

      lastY.current = y;
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return visible;
}

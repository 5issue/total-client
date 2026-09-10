'use client';

import { useEffect, type RefObject } from 'react';

/**
 * 컨테이너 안으로 키보드 포커스를 가두는 범용 훅 (전체화면 패널·커스텀 다이얼로그용) —
 * code-style-convention §5 "커스텀 드롭다운/모달은 포커스 트랩 + Esc 닫기".
 *
 * `active` 가 켜지면: 첫 포커서블로 포커스 이동 → Tab/Shift+Tab 이 컨테이너 안에서 순환 →
 * 꺼질 때 직전에 포커스돼 있던 요소로 복원. 컨테이너 자신이 포커스를 받을 수 있어야 하므로
 * 대상 요소에 `tabIndex={-1}` 을 준다.
 *
 * `Modal` 은 포털·스크롤 잠금·중첩 카운트까지 얽혀 자체 구현을 유지한다(추후 통합 여지).
 * 이 훅은 포커스 이동/순환/복원만 담당한다.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function useFocusTrap(ref: RefObject<HTMLElement | null>, active = true) {
  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = () => [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)];

    const first = focusables()[0];
    (first ?? container).focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const items = focusables();
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (!firstEl || !lastEl) {
        e.preventDefault();
        return;
      }
      const activeEl = document.activeElement;

      if (e.shiftKey && (activeEl === firstEl || activeEl === container)) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && activeEl === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [ref, active]);
}

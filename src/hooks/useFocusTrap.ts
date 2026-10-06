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
 * `resetKey` 가 바뀌면(예: 다단계 패널이 위젯→폼으로 전환) 포커스 이동을 다시 한다 — 안 그러면
 * 이전 단계에서 포커스돼 있던 요소가 DOM 에서 사라졌을 때 포커스가 컨테이너 밖(body)으로
 * 빠져나가 Tab 트랩이 깨진다(코드래빗 리뷰).
 *
 * iframe(카카오 우편번호 위젯 등, 교차 출처) 안에서 일어나는 keydown 은 부모 문서로 안
 * 버블링돼서 컨테이너의 keydown 리스너로는 그 안의 Tab/Shift+Tab 을 못 잡는다 — iframe
 * 내부 마지막 포커서블에서 Tab 하면 브라우저가 네이티브로 포커스를 컨테이너 밖으로 옮겨버린다.
 * 그래서 `focusin` 을 document 레벨에서 따로 듣고, 포커스가 컨테이너 밖으로 나가면(어떤
 * 경로로든) 즉시 첫 포커서블로 되돌린다(코드래빗 리뷰).
 *
 * `Modal` 은 포털·스크롤 잠금·중첩 카운트까지 얽혀 자체 구현을 유지한다(추후 통합 여지) —
 * 그 위에 `Modal` 이 열려 포커스를 가져가는 중(`role="dialog"` 안)이면 `focusin` 되돌리기를
 * 건너뛴다. 이 훅은 포커스 이동/순환/복원만 담당한다.
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

export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active = true,
  resetKey?: unknown,
) {
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

    // 화살표 함수라야 위 `if (!container) return` 의 null 좁히기가 클로저 안까지 이어진다
    // (함수 선언은 호이스팅 때문에 안 이어짐 — handleKeyDown 은 container 를 비교에만 써서 무관).
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as Node | null;
      if (!target || container.contains(target)) return;
      // 중첩된 다이얼로그(예: 이 패널 위에 뜨는 확인 Modal)가 자체적으로 포커스를 관리하는
      // 중이면 건드리지 않는다 — 그 스코프 밖으로 완전히 나갔을 때만 되돌린다.
      if (target instanceof Element && target.closest('[role="dialog"]')) return;
      const items = focusables();
      (items[0] ?? container).focus();
    };

    container.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
      previouslyFocused?.focus?.();
    };
  }, [ref, active, resetKey]);
}

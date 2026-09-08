'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { KeyboardEvent, MouseEvent, PointerEvent, ReactNode } from 'react';

import { createPortal } from 'react-dom';

/**
 * 하단에서 올라오는 시트 (molecule). Modal 과 같은 접근성·잠금 규칙에 슬라이드 + 드래그를 더한 것.
 * Figma "5팀 디자인 시스템" — `bar`(2702:5193, 상단 핸들) + 시트 본문.
 *
 * - `document.body` 포털. `role="dialog"` `aria-modal` + 포커스 트랩 + `body` 스크롤 잠금
 *   + Esc·백드롭으로 닫기(Modal 과 동일).
 * - 열림/닫힘 모두 `translateY` 트랜지션 — 닫혀 있을 땐 화면 밖(`translate-y-full`) + `pointer-events-none`
 *   로 마운트를 유지한 채 비활성화한다(양방향 애니메이션).
 * - 상단 핸들을 아래로 끌어내리면(임계값 초과) 닫힌다 — 그 미만이면 제자리로 스냅백.
 *   내부 콘텐츠는 `overflow-y-auto` 로 자체 스크롤한다.
 * - 상태 없는 컨트롤드 — `open` / `onClose` 는 부모 소유.
 */
export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** 스크린리더용 시트 제목. */
  ariaLabel: string;
  /** 스크롤되는 본문. */
  children: ReactNode;
  /** 스크롤 영역 밖에 고정되는 하단 영역(주문 CTA 등). */
  footer?: ReactNode;
  /** 시트 최대 높이. 기본 `85dvh`. */
  maxHeight?: string;
  /** 백드롭 클릭으로 닫기. 기본 true. */
  closeOnBackdrop?: boolean;
  className?: string;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const DRAG_CLOSE_THRESHOLD = 96;
const emptySubscribe = () => () => {};

let openSheetCount = 0;
let bodyOverflowBeforeLock = '';

export function BottomSheet({
  open,
  onClose,
  ariaLabel,
  children,
  footer,
  maxHeight = '85dvh',
  closeOnBackdrop = true,
  className,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  // SSR·하이드레이션 1차 렌더에는 포털을 만들지 않는다(서버는 null, 클라 첫 렌더도 null → 불일치 없음).
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const dragStartRef = useRef<number | null>(null);

  // body 스크롤 잠금 + 포커스 이동/복귀 (Modal 과 동일). setState 없이 DOM 만 만진다.
  useEffect(() => {
    if (!open) return;
    const restore = document.activeElement as HTMLElement | null;
    if (openSheetCount === 0) {
      bodyOverflowBeforeLock = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    openSheetCount += 1;
    const sheet = sheetRef.current;
    (sheet?.querySelector<HTMLElement>(FOCUSABLE) ?? sheet)?.focus();
    return () => {
      openSheetCount -= 1;
      if (openSheetCount === 0) document.body.style.overflow = bodyOverflowBeforeLock;
      restore?.focus?.();
    };
  }, [open]);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !sheetRef.current) return;
    const items = [...sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    const firstEl = items[0];
    const lastEl = items.at(-1);
    if (!firstEl || !lastEl) {
      e.preventDefault();
      return;
    }
    if (e.shiftKey && document.activeElement === firstEl) {
      e.preventDefault();
      lastEl.focus();
    } else if (!e.shiftKey && document.activeElement === lastEl) {
      e.preventDefault();
      firstEl.focus();
    }
  }

  function handleBackdrop(e: MouseEvent<HTMLDivElement>) {
    if (closeOnBackdrop && e.target === e.currentTarget) onClose();
  }

  function handleDragStart(e: PointerEvent<HTMLDivElement>) {
    dragStartRef.current = e.clientY;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function handleDragMove(e: PointerEvent<HTMLDivElement>) {
    if (dragStartRef.current === null) return;
    setDragY(Math.max(0, e.clientY - dragStartRef.current));
  }
  function handleDragEnd() {
    if (dragStartRef.current === null) return;
    if (dragY > DRAG_CLOSE_THRESHOLD) onClose();
    dragStartRef.current = null;
    setDragging(false);
    setDragY(0);
  }

  if (!hydrated) return null;

  return createPortal(
    <div
      aria-hidden={!open}
      className={`bg-overlay fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-200 ${
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      onMouseDown={handleBackdrop}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        style={{
          maxHeight,
          transform: open && dragging ? `translateY(${dragY}px)` : undefined,
        }}
        className={[
          'bg-surface rounded-tl-l rounded-tr-l flex w-full max-w-screen-sm flex-col ease-out focus:outline-none',
          open ? 'translate-y-0' : 'translate-y-full',
          dragging
            ? 'transition-none'
            : 'transition-transform duration-300 motion-reduce:transition-none',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          className="flex shrink-0 cursor-grab touch-none justify-center pt-3 pb-2 active:cursor-grabbing"
        >
          <span aria-hidden className="bg-overlay-blue h-1 w-[34px] rounded-full" />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer ? <div className="shrink-0">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

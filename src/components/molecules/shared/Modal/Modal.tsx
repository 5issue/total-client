'use client';

import { useEffect, useId, useRef } from 'react';
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';

import { createPortal } from 'react-dom';

/**
 * 중앙 다이얼로그 (molecule).
 * Figma "5팀 디자인 시스템" — node 2415-5998 "Modal".
 *
 * - `document.body` 에 포털. `role="dialog"` `aria-modal` + 포커스 트랩(Tab 순환) +
 *   열릴 때 포커스 이동·닫힐 때 트리거로 복귀 + `body` 스크롤 잠금 + Esc·백드롭으로 닫기.
 * - 상태를 갖지 않는 컨트롤드 — `open` / `onClose` 는 부모 소유.
 * - 액션 버튼은 `footer` 슬롯으로 받는다(Button atom 도입 후 그걸로 채운다).
 *   `footerLayout` 이 Figma Button_Align(가로/세로)에 대응.
 */
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** 제목 아래 본문 텍스트. */
  description?: string;
  /** description 외 추가 본문(폼 등). */
  children?: ReactNode;
  /** 하단 액션 버튼 영역. */
  footer?: ReactNode;
  /** footer 배치. row = 가로 균등분할, column = 세로 스택. 기본 row. */
  footerLayout?: 'row' | 'column';
  /** 백드롭 클릭으로 닫기. 기본 true. */
  closeOnBackdrop?: boolean;
  /** 카드에 적용할 클래스(폭 조정 등). */
  className?: string;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  footerLayout = 'row',
  closeOnBackdrop = true,
  className,
}: ModalProps) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const restore = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const card = cardRef.current;
    const first = card?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? card)?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      restore?.focus?.();
    };
  }, [open]);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !cardRef.current) return;

    const items = [...cardRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    const firstEl = items[0];
    const lastEl = items[items.length - 1];
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

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="bg-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={handleBackdrop}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={[
          'bg-surface flex w-full max-w-xs flex-col gap-8 rounded-xl px-4 pt-8 pb-4 focus:outline-none',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="flex flex-col gap-3">
          <h2 id={titleId} className="text-heading-2 text-fg">
            {title}
          </h2>
          {description ? (
            <p id={descId} className="text-body-s text-fg-secondary">
              {description}
            </p>
          ) : null}
          {children}
        </div>

        {footer ? (
          <div
            className={footerLayout === 'column' ? 'flex flex-col gap-2' : 'flex gap-2 *:flex-1'}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

'use client';

import { useEffect, useId, useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

import { Icon } from '@/components/atoms/Icon';

/**
 * 앵커에 붙는 닫기 가능한 말풍선 안내 (molecule).
 * Figma "5팀 디자인 시스템" — node 2448-1155 "Tooltip".
 *
 * - 순수 hover 툴팁이 아니라 닫기(X) 버튼이 있는 코치마크형 팝오버 → `role="dialog"`(비모달).
 *   `open` 은 부모가 소유(컨트롤드), Esc·X 로 `onClose`.
 * - `placement` 는 말풍선이 앵커 기준 어디에 뜨는지(꼬리는 반대쪽). `align` 은 top/bottom 에서
 *   꼬리 위치(Figma direction/Align 대응).
 * - 위치는 앵커를 감싼 `relative` 컨테이너 안에서 절대배치. `overflow:hidden` 조상에 잘릴 수 있음.
 */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
export type TooltipAlign = 'start' | 'center' | 'end';

export interface TooltipProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** 말풍선이 앵커 기준 뜨는 방향. 기본 top. */
  placement?: TooltipPlacement;
  /** top/bottom 에서 꼬리 위치. 기본 center. */
  align?: TooltipAlign;
  /** 앵커 요소. */
  children: ReactNode;
  className?: string;
}

const BUBBLE_POS: Record<TooltipPlacement, Record<TooltipAlign, string>> = {
  top: {
    start: 'bottom-full left-0 mb-2',
    center: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
    end: 'bottom-full right-0 mb-2',
  },
  bottom: {
    start: 'top-full left-0 mt-2',
    center: 'top-full left-1/2 mt-2 -translate-x-1/2',
    end: 'top-full right-0 mt-2',
  },
  left: {
    start: 'right-full top-1/2 mr-2 -translate-y-1/2',
    center: 'right-full top-1/2 mr-2 -translate-y-1/2',
    end: 'right-full top-1/2 mr-2 -translate-y-1/2',
  },
  right: {
    start: 'left-full top-1/2 ml-2 -translate-y-1/2',
    center: 'left-full top-1/2 ml-2 -translate-y-1/2',
    end: 'left-full top-1/2 ml-2 -translate-y-1/2',
  },
};

const TAIL_POS: Record<TooltipPlacement, Record<TooltipAlign, string>> = {
  top: {
    start: 'bottom-0 left-4 translate-y-1/2',
    center: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
    end: 'bottom-0 right-4 translate-y-1/2',
  },
  bottom: {
    start: 'top-0 left-4 -translate-y-1/2',
    center: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
    end: 'top-0 right-4 -translate-y-1/2',
  },
  left: {
    start: 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2',
    center: 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2',
    end: 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2',
  },
  right: {
    start: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2',
    center: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2',
    end: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2',
  },
};

export function Tooltip({
  open,
  onClose,
  title,
  description,
  placement = 'top',
  align = 'center',
  children,
  className,
}: TooltipProps) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    bubbleRef.current?.focus();
    return () => prevFocus?.focus?.();
  }, [open]);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }

  return (
    <div className={['relative inline-block', className].filter(Boolean).join(' ')}>
      {children}

      {open ? (
        <div
          ref={bubbleRef}
          role="dialog"
          aria-labelledby={titleId}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className={`rounded-m bg-fg absolute z-50 flex w-max items-start gap-2 px-3 py-2 focus:outline-none ${BUBBLE_POS[placement][align]}`}
        >
          <div className="text-label-xs text-fg-inverse flex flex-col">
            <p id={titleId}>{title}</p>
            {description ? <p>{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-fg-inverse shrink-0"
          >
            <Icon name="close" size={20} aria-hidden />
          </button>
          <span
            aria-hidden="true"
            className={`bg-fg absolute size-2.5 rotate-45 ${TAIL_POS[placement][align]}`}
          />
        </div>
      ) : null}
    </div>
  );
}

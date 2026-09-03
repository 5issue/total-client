'use client';

import { Children, isValidElement, useState } from 'react';
import type { ReactNode } from 'react';

import { Icon } from '@/components/atoms/Icon';

/**
 * 목록을 일부만 보이고 하단 토글로 "펼쳐보기 / 접기" (molecule).
 * Figma "5팀 디자인 시스템" — node 2415-5383 "Accordion_Brakerdown".
 *
 * 헤더가 아니라 **하단 중앙 토글**로 여닫는다. 아이템 카드는 `children` 으로 받아
 * 카드 종류에 무관하다 — Figma `Item_H_Brakerdown` 이 바뀌어도 이 셸은 그대로.
 * `collapsedCount` 개만 보이다가 펼치면 전체.
 */
export interface AccordionBreakdownProps {
  /** 목록 아이템(카드). */
  children: ReactNode;
  /** 접힘 상태에서 보여줄 개수. 기본 3. */
  collapsedCount?: number;
  defaultOpen?: boolean;
  /** 펼치기 문구. 기본 `총 {N}건 제품 펼쳐보기`. */
  expandLabel?: (total: number) => string;
  /** 접기 문구. 기본 `접기`. */
  collapseLabel?: string;
  className?: string;
}

export function AccordionBreakdown({
  children,
  collapsedCount = 3,
  defaultOpen = false,
  expandLabel = (n) => `총 ${n}건 제품 펼쳐보기`,
  collapseLabel = '접기',
  className,
}: AccordionBreakdownProps) {
  const [open, setOpen] = useState(defaultOpen);
  const items = Children.toArray(children).filter(isValidElement);
  const visible = open ? items : items.slice(0, collapsedCount);
  const hasToggle = items.length > collapsedCount;

  return (
    <div className={['flex flex-col gap-5', className].filter(Boolean).join(' ')}>
      <ul className="flex flex-col gap-4">
        {visible.map((node) => (
          <li key={node.key}>{node}</li>
        ))}
      </ul>

      {hasToggle ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-heading-5 text-fg-tertiary flex h-8 items-center justify-center gap-1"
        >
          {open ? collapseLabel : expandLabel(items.length)}
          <Icon
            name="arrow-down"
            size={20}
            className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>
      ) : null}
    </div>
  );
}

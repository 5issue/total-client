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
 *
 * 펼침/접힘은 `grid-template-rows: 0fr → 1fr` 트릭으로 애니메이션한다(사용자 피드백
 * — 이전엔 그냥 배열을 slice 해서 순간적으로 나타났다 사라졌다). `height: auto` 는
 * 직접 트랜지션할 수 없어 JS 로 실측하지 않고도 부드럽게 여닫는 표준 CSS 기법이다.
 * 숨겨진 항목은 항상 DOM 에 있고(`overflow-hidden` 으로 시각적으로만 가림) `grid`
 * 트랙 크기만 바뀐다. 접혔을 때 목록 사이 간격이 남지 않도록, 보이는 항목과 숨긴
 * 항목 사이 여백(`gap-4`)은 부모의 `gap` 이 아니라 숨긴 목록 자체의 `pt-4` 로 줘서
 * 접혔을 때 이 패딩도 같이 사라지게 한다.
 *
 * 화살표 회전도 `transition-transform` 이 아니라 `transition-[rotate]` 를 쓴다 —
 * Tailwind v4 의 `rotate-*` 는 `transform` 이 아니라 별도 `rotate` 속성이라
 * `transition-transform` 으론 트랜지션 대상에 안 잡힌다(다시 담기 토스트에서 발견한
 * 것과 같은 문제, `translate-*` 도 동일).
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
  const visibleItems = items.slice(0, collapsedCount);
  const hiddenItems = items.slice(collapsedCount);
  const hasToggle = hiddenItems.length > 0;

  return (
    <div className={['flex flex-col', className].filter(Boolean).join(' ')}>
      <ul className="flex flex-col gap-4">
        {visibleItems.map((node) => (
          <li key={node.key}>{node}</li>
        ))}
      </ul>

      {hasToggle ? (
        <div
          aria-hidden={!open}
          className={[
            'grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
            open ? 'grid-rows-[1fr]' : 'pointer-events-none grid-rows-[0fr]',
          ].join(' ')}
        >
          <ul className="flex flex-col gap-4 overflow-hidden pt-4">
            {hiddenItems.map((node) => (
              <li key={node.key}>{node}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasToggle ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-heading-5 text-fg-tertiary mt-5 flex h-8 items-center justify-center gap-1"
        >
          {open ? collapseLabel : expandLabel(items.length)}
          <Icon
            name="arrow-down"
            size={20}
            className={`shrink-0 transition-[rotate] duration-300 ease-out motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>
      ) : null}
    </div>
  );
}

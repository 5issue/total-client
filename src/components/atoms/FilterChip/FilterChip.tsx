'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { Icon, type IconName } from '@/components/atoms/Icon/Icon';

/**
 * 필터/멤버십 혜택 토글 칩 (Figma "Filter_Chip", node 2424-1469/1471/1468/1470).
 * State(Default/Selected) × Style(Basic/Gradient) 2×2 조합.
 *
 * Style=Gradient 보더는 그라데이션(`bg-filter-chip-gradient`, color.css)이라 `border` 로
 * 못 받는다 — 바깥 button 이 그라데이션 배경 위에 1px 패딩만 두고 안쪽 span 이 상태별 배경을
 * 채우는 padding-box 트릭으로 구현. 바깥 요소를 button 으로 둬야 1px 보더 위 클릭도
 * 이벤트가 잡힌다(안쪽만 button 이면 보더 부분 클릭이 씹힘).
 *
 * 트레일링 화살표(arrow-down)는 필터 확장 가능함을 나타내는 고정 요소라 prop 이 아니다.
 */
export interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 토글 상태(Figma "State"). */
  selected?: boolean;
  /** Figma "Style" — 기본 브랜드 보더(basic) vs 멤버십 강조 그라데이션 보더(gradient). */
  tone?: 'basic' | 'gradient';
  /** 장식용(aria-hidden)으로 렌더 — accessible name 은 항상 `children` 텍스트가 담당. */
  leadingIcon?: IconName;
  children: ReactNode;
}

const BASIC_VARIANT_CLASSNAME: Record<'default' | 'selected', string> = {
  default: 'border-primary text-brand-secondary',
  selected: 'bg-brand-50 border-brand-200 text-primary',
};

function FilterChipContent({
  leadingIcon,
  children,
}: {
  leadingIcon?: IconName;
  children: ReactNode;
}) {
  return (
    <>
      {leadingIcon ? <Icon name={leadingIcon} size={24} aria-hidden /> : null}
      {children}
      <Icon name="arrow-down" size={20} aria-hidden />
    </>
  );
}

export function FilterChip({
  selected = false,
  tone = 'basic',
  leadingIcon,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: FilterChipProps) {
  if (tone === 'gradient') {
    return (
      <button
        type={type}
        disabled={disabled}
        aria-pressed={selected}
        className={[
          'bg-filter-chip-gradient inline-flex h-9 shrink-0 items-center justify-center rounded-full p-px disabled:pointer-events-none',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <span
          className={[
            'text-brand-secondary text-label-m inline-flex h-full items-center justify-center gap-1 rounded-full px-3 py-2 whitespace-nowrap transition-colors motion-reduce:transition-none',
            selected ? 'bg-brand-50' : 'bg-surface',
          ].join(' ')}
        >
          <FilterChipContent leadingIcon={leadingIcon}>{children}</FilterChipContent>
        </span>
      </button>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      aria-pressed={selected}
      className={[
        'text-label-m inline-flex h-9 items-center justify-center gap-1 rounded-full border px-3 py-2 whitespace-nowrap transition-colors disabled:pointer-events-none motion-reduce:transition-none',
        BASIC_VARIANT_CLASSNAME[selected ? 'selected' : 'default'],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <FilterChipContent leadingIcon={leadingIcon}>{children}</FilterChipContent>
    </button>
  );
}

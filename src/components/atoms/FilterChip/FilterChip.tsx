'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { Icon, type IconName } from '@/components/atoms/Icon/Icon';

/**
 * 필터/멤버십 혜택 토글 칩 (Figma "Filter_Chip", node 2424-1469/1471/1468/1470).
 * State(Default/Selected) × Style(Basic/Gradient) 2×2 조합.
 *
 * Style=Gradient 의 보더는 실제로 그라데이션(왼쪽 #D665FF → 오른쪽 #00E3FF)이다 —
 * `get_design_context` 는 그라데이션 스트로크를 첫 스톱만 남기고 단색으로
 * 뭉개서 반환해(#d665ff) 처음엔 단색 토큰으로 잘못 구현했다가, Figma 스크린샷
 * (좌: 보라 우: 청록)으로 정정했다. 좌→우 수평이라 CSS 90deg.
 * CSS 는 `border`가 그라데이션을 직접 못 받아 padding-box 이중 배경 트릭으로 구현:
 * 바깥 span 이 그라데이션 배경 위에 1px 패딩만 두고, 안쪽 button 이 상태별 배경을 채운다.
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

const GRADIENT_BORDER = 'linear-gradient(90deg, #d665ff 0%, #00e3ff 100%)';

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
      <span
        className={['inline-flex shrink-0 rounded-full p-px', className].filter(Boolean).join(' ')}
        style={{ backgroundImage: GRADIENT_BORDER }}
      >
        <button
          type={type}
          disabled={disabled}
          aria-pressed={selected}
          className={[
            'text-brand-secondary text-label-m inline-flex h-[34px] items-center justify-center gap-1 rounded-full px-3 py-2 whitespace-nowrap transition-colors disabled:pointer-events-none motion-reduce:transition-none',
            selected ? 'bg-brand-50' : 'bg-surface',
          ].join(' ')}
          {...props}
        >
          <FilterChipContent leadingIcon={leadingIcon}>{children}</FilterChipContent>
        </button>
      </span>
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

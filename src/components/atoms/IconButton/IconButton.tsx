'use client';

import type { ButtonHTMLAttributes } from 'react';

import { Icon, type IconName } from '@/components/atoms/Icon/Icon';

/**
 * Figma foundation 페이지 "Type_State_Matrix, Contents=Icon" 컴포넌트(node 2486 계열,
 * S/M/L 실측 44/48/56px, 아이콘 20/20/28px) 기준. `atoms/Button` 의 색상 토큰과는 다른
 * 더 옅은 전용 팔레트를 쓴다 — 예: Primary 기본값이 `bg-primary` 가 아니라 `bg-brand-50`
 * (get_design_context 로 각 5 Type × 4 State 조합 실측 확인, 2026-09-08).
 * Pressed 상태에서 Figma 데모가 하트(채움) 아이콘으로 바뀌는 걸 `activeIcon`(선택)으로 반영—
 * `group-active:` CSS로만 처리해 마우스를 누르고 있는 동안만 보이고 떼면 즉시 `icon`으로
 * 되돌아간다(지속되는 "찜" 상태 저장은 아님 — 실제 토글 유지는 이 atom을 쓰는 쪽이
 * `icon` prop 자체를 바꿔서 구현해야 한다).
 */
export type IconButtonVariant =
  'primary' | 'secondary' | 'tertiary' | 'outlinePrimary' | 'outlineBlack';
export type IconButtonSize = 's' | 'm' | 'l';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  icon: IconName;
  /** 누르고 있는 동안(`:active`)만 잠깐 보여줄 아이콘 — 위시리스트 하트의 "누르면 채워짐" 프리뷰용. */
  activeIcon?: IconName;
  /** 아이콘 전용이라 accessible name 을 버튼이 직접 책임진다 — 항상 필수. */
  'aria-label': string;
}

// 하트 아이콘(outline)은 `fill="currentColor"`라 버튼의 text 색을 물려받는다 — Figma 실측
// (S/M 2026-09-08, 색상은 사이즈 무관 동일값 확인): Default 는 Primary/Secondary/Tertiary/
// Outline_P 가 `text-primary`(#690085), Outline_B 는 Button.tsx 의 outlineBlack 과 동일하게
// `text-fg`. Disabled 아이콘은 5종 전부 Figma "Icon/Disabled" 토큰(#c9d5df = neutral-400)
// 하나로 통일 — `Text/disabled`(fg-disabled, #b5c4cf = neutral-500, 배경에 쓰는 색과 겹침)와
// 다른 별도 토큰이라 혼동 주의.
const VARIANT_CLASSNAME: Record<IconButtonVariant, string> = {
  primary:
    'bg-brand-50 text-primary hover:bg-brand-200 active:bg-brand-50 disabled:bg-neutral-500 disabled:text-neutral-400',
  secondary:
    'bg-brand-100 text-primary hover:bg-brand-50 active:bg-brand-200 disabled:bg-neutral-500 disabled:text-neutral-400',
  tertiary:
    'bg-neutral-100 text-primary hover:bg-neutral-200 active:bg-neutral-400 disabled:bg-neutral-500 disabled:text-neutral-400',
  outlinePrimary:
    'border border-neutral-300 text-primary hover:bg-surface hover:border-brand-200 active:bg-surface active:border-brand-200 disabled:bg-surface disabled:border-neutral-400 disabled:text-neutral-400',
  outlineBlack:
    'bg-surface border border-neutral-300 text-fg hover:border-neutral-800 active:border-brand-200 disabled:border-neutral-400 disabled:text-neutral-400',
};

// Figma 실측 고정값(2486 계열) — 대괄호 임의값 금지(code-style §6-1)라 Tailwind 기본 스케일로 표현.
const SIZE_BOX_CLASSNAME: Record<IconButtonSize, string> = {
  s: 'size-11', // 44px
  m: 'size-12', // 48px
  l: 'size-14', // 56px
};

const SIZE_ICON_PX: Record<IconButtonSize, number> = {
  s: 20,
  m: 20,
  l: 28,
};

// activeIcon 오버레이를 절대 위치시킬 래퍼 크기 — SIZE_ICON_PX 와 동일 값(20/20/28px)을
// Tailwind 기본 스케일로 표현(대괄호 임의값 금지, code-style §6-1).
const SIZE_ICON_WRAPPER_CLASSNAME: Record<IconButtonSize, string> = {
  s: 'size-5',
  m: 'size-5',
  l: 'size-7',
};

export function IconButton({
  variant = 'primary',
  size = 's',
  icon,
  activeIcon,
  disabled,
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  const iconSize = SIZE_ICON_PX[size];

  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        'group focus-visible:outline-border-active rounded-m inline-flex items-center justify-center outline-offset-2 transition-colors focus-visible:outline-2 disabled:pointer-events-none motion-reduce:transition-none',
        SIZE_BOX_CLASSNAME[size],
        VARIANT_CLASSNAME[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {activeIcon ? (
        <span className={['relative inline-flex', SIZE_ICON_WRAPPER_CLASSNAME[size]].join(' ')}>
          <Icon name={icon} size={iconSize} aria-hidden className="group-active:opacity-0" />
          <Icon
            name={activeIcon}
            size={iconSize}
            aria-hidden
            className="absolute inset-0 opacity-0 group-active:opacity-100"
          />
        </span>
      ) : (
        <Icon name={icon} size={iconSize} aria-hidden />
      )}
    </button>
  );
}

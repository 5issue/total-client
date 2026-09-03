'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { Icon, type IconName } from '@/components/atoms/Icon/Icon';

/**
 * Black 은 Hover/Pressed 에서 색이 바뀌지 않는 게 디자인 확정값이다(2026-09-03 확인).
 * Danger 는 Default 가 outline 스타일로 변경되고 Hover 가 삭제돼(Default 와 동일),
 * Pressed 만 옅은 오렌지 오버레이(`bg-orange/4`)로 구분한다 — Figma node 2867-2886 반영.
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'black'
  | 'outlinePrimary'
  | 'outlineBlack'
  | 'text'
  | 'danger';

/** xs 는 Figma 에 Outline_B 타입만 실측 검증됨(높이 32px). */
export type ButtonSize = 'xs' | 's' | 'm' | 'l' | 'xl';

interface ButtonBaseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 장식용(aria-hidden)으로 렌더한다 — 접근 가능한 이름은 항상 `children` 텍스트가 담당. */
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  /** 아이콘 전용 사용은 미지원이라 항상 필수 — 텍스트 없는 버튼이 accessible name 을 잃는 것을 막는다. */
  children: ReactNode;
}

// xs 는 Figma 에 outlineBlack 조합만 존재해 다른 variant 와 섞이지 않도록 타입으로 강제한다.
export type ButtonProps = ButtonBaseProps &
  (
    | { size?: Exclude<ButtonSize, 'xs'>; variant?: ButtonVariant }
    | { size: 'xs'; variant: 'outlineBlack' }
  );

const VARIANT_CLASSNAME: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-fg-inverse hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-50 disabled:text-brand-200',
  secondary:
    'bg-brand-100 text-primary hover:bg-brand-200 active:bg-brand-300 active:text-brand-900 disabled:border disabled:border-neutral-400 disabled:bg-surface-secondary disabled:text-fg-disabled',
  tertiary:
    'bg-surface-secondary text-fg hover:bg-neutral-500 active:bg-neutral-500 disabled:bg-neutral-700 disabled:text-fg-disabled',
  black: 'bg-black text-fg-inverse disabled:bg-neutral-700 disabled:text-fg-disabled',
  outlinePrimary:
    'border border-primary text-primary hover:bg-brand-50 hover:text-brand-700 active:bg-brand-200 active:text-brand-700 disabled:border-neutral-400 disabled:text-fg-disabled',
  outlineBlack:
    'border border-neutral-400 text-fg hover:border-neutral-800 hover:bg-surface-secondary active:border-neutral-800 active:bg-surface-secondary disabled:text-fg-disabled',
  text: 'text-primary hover:bg-brand-100 active:bg-brand-200 disabled:text-fg-disabled',
  danger:
    'border border-fg-danger text-fg-danger active:bg-orange/4 disabled:border-neutral-400 disabled:bg-surface-secondary disabled:text-fg-disabled',
};

const SIZE_TEXT_CLASSNAME: Record<ButtonSize, string> = {
  xs: 'text-label-l',
  s: 'text-label-l',
  m: 'text-heading-4',
  l: 'text-heading-1',
  xl: 'text-heading-1',
};

const SIZE_ICON_PX: Record<ButtonSize, number> = {
  xs: 20,
  s: 20,
  m: 20,
  l: 28,
  xl: 28,
};

const SIZE_PADDING_Y_CLASSNAME: Record<ButtonSize, string> = {
  xs: 'py-1.5',
  s: 'py-2',
  m: 'py-2',
  l: 'py-2',
  xl: 'py-2',
};

export function Button({
  variant = 'primary',
  size = 's',
  leadingIcon,
  trailingIcon,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  // Black 은 S 사이즈에서만 Bold 확인됨(Figma) — M/L/XL 은 확인 전까지 기본 가중치 사용.
  const textClassName =
    variant === 'black' && size === 's' ? 'text-label-xl' : SIZE_TEXT_CLASSNAME[size];
  const iconSize = SIZE_ICON_PX[size];

  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        'rounded-m focus-visible:outline-border-active inline-flex items-center justify-center gap-1 px-1 whitespace-nowrap outline-offset-2 transition-colors focus-visible:outline-2 disabled:pointer-events-none motion-reduce:transition-none',
        SIZE_PADDING_Y_CLASSNAME[size],
        VARIANT_CLASSNAME[variant],
        textClassName,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {leadingIcon ? <Icon name={leadingIcon} size={iconSize} aria-hidden /> : null}
      {children}
      {trailingIcon ? <Icon name={trailingIcon} size={iconSize} aria-hidden /> : null}
    </button>
  );
}

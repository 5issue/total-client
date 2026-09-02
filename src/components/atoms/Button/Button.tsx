'use client';

import type { ButtonHTMLAttributes } from 'react';

import { Icon, type IconName } from '@/components/atoms/Icon/Icon';

/**
 * 공용 버튼 (atom). Figma "5팀 디자인 시스템" — node 2374-2674 "Button" (Type_State_Matrix).
 *
 * Black/Danger 의 Hover·Pressed 는 Figma 소스 자체가 Default 와 동일하거나(Black)
 * 채움→외곽선으로 바뀌는(Danger) 이상치라, 다른 filled 타입과 일관되게 opacity 로
 * 대체했다 — 디자이너 확인 후 정식 색상으로 교체 필요.
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

export type ButtonSize = 's' | 'm' | 'l' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 텍스트가 항상 있으므로 장식용(aria-hidden)으로 렌더한다. */
  leadingIcon?: IconName;
  trailingIcon?: IconName;
}

const VARIANT_CLASSNAME: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-fg-inverse hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-50 disabled:text-brand-200',
  secondary:
    'bg-brand-100 text-primary hover:bg-brand-200 active:bg-brand-300 active:text-brand-900 disabled:border disabled:border-neutral-400 disabled:bg-surface-secondary disabled:text-fg-disabled',
  tertiary:
    'bg-surface-secondary text-fg hover:bg-neutral-700 active:bg-neutral-800 disabled:bg-neutral-700 disabled:text-fg-disabled',
  black:
    'bg-black text-fg-inverse hover:opacity-90 active:opacity-80 disabled:bg-neutral-700 disabled:text-fg-disabled',
  outlinePrimary:
    'border border-primary text-primary hover:bg-brand-50 hover:text-brand-700 active:bg-brand-200 active:text-brand-700 disabled:border-neutral-400 disabled:text-fg-disabled',
  outlineBlack:
    'border border-neutral-400 text-fg hover:border-neutral-800 hover:bg-surface-secondary active:border-neutral-800 active:bg-neutral-700 disabled:text-fg-disabled',
  text: 'text-primary hover:bg-brand-100 active:bg-brand-200 disabled:text-fg-disabled',
  danger:
    'bg-fg-danger text-fg-inverse hover:opacity-90 active:opacity-80 disabled:border disabled:border-neutral-400 disabled:bg-surface-secondary disabled:text-fg-disabled',
};

const SIZE_TEXT_CLASSNAME: Record<ButtonSize, string> = {
  s: 'text-label-l',
  m: 'text-heading-4',
  l: 'text-heading-1',
  xl: 'text-heading-1',
};

const SIZE_ICON_PX: Record<ButtonSize, number> = {
  s: 20,
  m: 20,
  l: 28,
  xl: 28,
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
        'rounded-m inline-flex items-center justify-center gap-1 px-1 py-2 whitespace-nowrap transition-colors disabled:pointer-events-none motion-reduce:transition-none',
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

'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { Icon, type IconName } from '@/components/atoms/Icon/Icon';

/**
 * onRemove 유무로 두 Figma 컴포넌트를 하나의 atom 에 담는다.
 * - onRemove 없음: "Select_Chip"(state=Default/Selected) — 필터·태그 토글용, solid 배경.
 * - onRemove 있음: "Chip"(Type=Default/Pressed) — 선택된 값 표시 + 삭제, outline 배경.
 * 시각적으로 다른 두 컴포넌트라 각자의 클래스 묶음을 그대로 쓴다(Button VARIANT_CLASSNAME 과 동일 패턴).
 */
export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** onRemove 가 없을 때만 의미 있는 토글 상태. */
  selected?: boolean;
  /** 제공하면 outline 스타일 + trailing 삭제 버튼으로 렌더한다. */
  onRemove?: () => void;
  /** 장식용(aria-hidden)으로 렌더한다 — 접근 가능한 이름은 항상 `children` 텍스트가 담당. */
  leadingIcon?: IconName;
  /** 아이콘 전용 사용은 미지원이라 항상 필수 — 텍스트 없는 칩이 accessible name 을 잃는 것을 막는다. */
  children: ReactNode;
}

const BASE_CLASSNAME =
  'inline-flex items-center justify-center gap-1 whitespace-nowrap transition-colors disabled:pointer-events-none motion-reduce:transition-none';

/**
 * body-m 의 letter-spacing 토큰(0)이 Figma 실측(-1px)과 다르다 — 전시 보드가 아니라
 * 컴포넌트 노드(2426:1283)에서 직접 확인한 값이라, typography.css 쪽 재검증이 필요하다.
 */
const SOLID_TEXT_CLASSNAME = 'text-body-m';

export function Chip({
  selected = false,
  onRemove,
  leadingIcon,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ChipProps) {
  if (onRemove) {
    const removeLabel = typeof children === 'string' ? `${children} 삭제` : '삭제';

    return (
      <span
        className={[
          BASE_CLASSNAME,
          'border-border text-label-l text-fg rounded-full border px-4 py-2',
          disabled ? 'pointer-events-none opacity-50' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {leadingIcon ? <Icon name={leadingIcon} size={20} aria-hidden /> : null}
        {children}
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={removeLabel}
          className="active:bg-overlay-blue -mr-1 shrink-0 rounded-full disabled:pointer-events-none"
        >
          <Icon name="close" size={20} aria-hidden />
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
        BASE_CLASSNAME,
        'rounded-m h-10 px-4',
        SOLID_TEXT_CLASSNAME,
        selected ? 'text-fg-inverse bg-neutral-950' : 'bg-surface-secondary text-fg',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {leadingIcon ? <Icon name={leadingIcon} size={20} aria-hidden /> : null}
      {children}
    </button>
  );
}

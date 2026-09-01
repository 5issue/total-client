'use client';

import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

/**
 * 단일 줄 텍스트 입력 (atom).
 * Figma "5팀 디자인 시스템" — node 2394-3737 "Input".
 *
 * - 상태: Default / Focused(자동) / Filled / Disabled / Error.
 * - 우측 아이콘은 컴포넌트가 그리지 않고 `trailing` 슬롯으로 받는다(검색 아이콘 등).
 * - `label` 은 접근성상 필수이며 기본은 시각적으로 숨긴다(디자인이 label 없는 박스).
 * - 폼 연결(React Hook Form register 등)은 나머지 props 스프레드로 처리한다.
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** `<label htmlFor>` 로 연결되는 접근성 라벨. */
  label: string;
  /** label 을 입력 위에 시각적으로 노출한다. 기본 false(sr-only). */
  labelVisible?: boolean;
  /** 에러 메시지. 있으면 `aria-invalid` + 활성 보더 + 하단 `role="alert"` 텍스트. */
  error?: string;
  /** 우측 슬롯 — 아이콘/버튼(24×24 권장). 색은 `currentColor` 로 따라온다. */
  trailing?: ReactNode;
}

const BOX_BASE = 'flex items-center gap-1 rounded-m border py-2 pl-4 pr-3 transition-colors';

export function Input({
  label,
  labelVisible = false,
  error,
  trailing,
  id,
  disabled,
  'aria-describedby': describedBy,
  ...props
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const invalid = Boolean(error);

  // 보더는 상호작용 상태만 반영한다(Figma: 에러는 하단 텍스트로만 표시, 보더 불변).
  const box = [
    BOX_BASE,
    disabled
      ? 'bg-surface-secondary text-fg-disabled'
      : 'bg-surface text-fg focus-within:border-border-active',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className={labelVisible ? 'text-label-l text-fg' : 'sr-only'}>
        {label}
      </label>

      <div className={box}>
        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={
            [invalid ? errorId : null, describedBy].filter(Boolean).join(' ') || undefined
          }
          className="text-heading-5 placeholder:text-fg-quaternary disabled:placeholder:text-fg-disabled min-w-0 flex-1 bg-transparent placeholder:font-normal focus:outline-none"
          {...props}
        />
        {trailing ? (
          <span className="flex size-6 shrink-0 items-center justify-center" aria-hidden="true">
            {trailing}
          </span>
        ) : null}
      </div>

      {invalid ? (
        <p id={errorId} role="alert" className="text-label-xs text-fg-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

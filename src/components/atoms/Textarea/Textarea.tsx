'use client';

import { useId, useState } from 'react';
import type { ChangeEvent, TextareaHTMLAttributes } from 'react';

/**
 * 여러 줄 텍스트 입력 (atom).
 * Figma "5팀 디자인 시스템" — node 2409-4568 "Input_contents".
 *
 * - 상태: Default / Focused(자동) / Typing / Disabled.
 * - 박스 우측 하단에 `hint`("최소 10자") 또는 `maxLength` 글자수 카운터를 표시한다.
 * - Figma 에는 error 상태가 없지만, 폼 규칙(§4)상 error 는 박스 아래 `role="alert"` 로 노출한다.
 * - `label` 은 접근성상 필수이며 기본은 시각적으로 숨긴다.
 */
export interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'aria-describedby'
> {
  /** `<label htmlFor>` 로 연결되는 접근성 라벨. */
  label: string;
  /** label 을 입력 위에 시각적으로 노출한다. 기본 false(sr-only). */
  labelVisible?: boolean;
  /** 박스 우측 하단 보조 텍스트(예: "최소 10자"). `maxLength` 가 있으면 카운터가 우선. */
  hint?: string;
  /** 에러 메시지. 있으면 `aria-invalid` + 박스 아래 `role="alert"` 텍스트. */
  error?: string;
}

const BOX_BASE =
  'flex flex-col gap-3 rounded-m border p-3 transition-colors focus-within:border-border-active';

export function Textarea({
  label,
  labelVisible = false,
  hint,
  error,
  id,
  disabled,
  rows = 5,
  maxLength,
  value,
  defaultValue,
  onChange,
  'aria-invalid': ariaInvalid,
  ...props
}: TextareaProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;
  const invalid = Boolean(error);

  const [count, setCount] = useState(() => String(value ?? defaultValue ?? '').length);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCount(e.target.value.length);
    onChange?.(e);
  };

  const showCounter = maxLength != null;
  const currentCount = value != null ? String(value).length : count;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId} className={labelVisible ? 'text-label-l text-fg' : 'sr-only'}>
        {label}
      </label>

      <div className={BOX_BASE}>
        <textarea
          id={fieldId}
          rows={rows}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-invalid={invalid ? true : ariaInvalid}
          aria-describedby={
            [invalid ? errorId : null, showCounter || hint ? descId : null]
              .filter(Boolean)
              .join(' ') || undefined
          }
          className="text-heading-5 placeholder:text-fg-quaternary w-full resize-none bg-transparent placeholder:font-normal focus:outline-none disabled:cursor-not-allowed"
          {...props}
        />

        {showCounter ? (
          <p id={descId} className="text-label-xs self-end">
            <span className="text-fg">{currentCount}</span>
            <span className="text-fg-quaternary"> / {maxLength}</span>
          </p>
        ) : hint ? (
          <p id={descId} className="text-label-xs text-fg-quaternary self-end">
            {hint}
          </p>
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

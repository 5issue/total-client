'use client';

import { useId, useRef, useState } from 'react';
import type { ChangeEvent, InputHTMLAttributes, KeyboardEvent } from 'react';

import { Icon } from '@/components/atoms/Icon';

/**
 * 검색 입력 (atom).
 * Figma "5팀 디자인 시스템" — node 2379-2215 "Search Bar".
 *
 * - 상태(Default / Focused / Typing / Filled)는 값·포커스에 따라 자연히 갈린다.
 *   컨테이너 스타일은 모든 상태가 동일하다(Figma 확인).
 * - 값이 있을 때만 우측 클리어(X) 버튼을 노출한다.
 * - Enter 로 `onSearch`. 제어/비제어 모두 지원(Textarea 와 동일한 방식).
 * - 좌측 돋보기 / 우측 X 는 Icon atom(`search` · `close`, #19).
 * - Figma 에는 포커스 스타일이 없지만, 키보드 포커스 가시성(WCAG 2.4.7)을 위해
 *   `focus-within` 시 활성 보더를 준다. (code-style §5 접근성)
 */
export interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** `<label htmlFor>` 로 연결되는 접근성 라벨. */
  label: string;
  /** label 을 입력 위에 시각적으로 노출한다. 기본 false(sr-only). */
  labelVisible?: boolean;
  /** Enter 입력 시 현재 값으로 호출. */
  onSearch?: (value: string) => void;
  /** 클리어(X) 버튼 클릭 시 호출. 값이 비워진 뒤 입력에 포커스가 돌아간다. */
  onClear?: () => void;
}

const BOX_BASE =
  'flex h-10 items-center gap-2 rounded-m border border-transparent bg-surface-secondary pl-2 transition-colors focus-within:border-border-active';

export function SearchBar({
  label,
  labelVisible = false,
  id,
  value,
  defaultValue,
  onChange,
  onSearch,
  onClear,
  disabled,
  placeholder = '검색어를 입력해주세요',
  'aria-describedby': describedBy,
  ...props
}: SearchBarProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const inputRef = useRef<HTMLInputElement>(null);

  const isControlled = value != null;
  const [inner, setInner] = useState(() => String(defaultValue ?? ''));
  // 입력은 항상 React 제어. 비제어 모드에서는 내부 state 가 값의 출처다
  // (클리어 버튼이 DOM 값을 직접 비울 수 있어야 하므로).
  const current = isControlled ? String(value) : inner;
  const showClear = current.length > 0 && !disabled;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInner(e.target.value);
    onChange?.(e);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearch?.(current);
  };

  const handleClear = () => {
    if (!isControlled) setInner('');
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className={labelVisible ? 'text-label-l text-fg' : 'sr-only'}>
        {label}
      </label>

      <div className={showClear ? `${BOX_BASE} pr-0` : `${BOX_BASE} pr-2`}>
        <Icon name="search" size={24} className="text-fg-quaternary shrink-0" aria-hidden />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={current}
          disabled={disabled}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-describedby={describedBy}
          className="text-body-l text-fg placeholder:text-fg-quaternary min-w-0 flex-1 bg-transparent placeholder:font-medium focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
          {...props}
        />
        {showClear ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="검색어 지우기"
            className="text-fg-quaternary flex size-10 shrink-0 items-center justify-center"
          >
            <Icon name="close" size={24} aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}

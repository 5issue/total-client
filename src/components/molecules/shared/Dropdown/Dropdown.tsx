'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

import { Icon } from '@/components/atoms/Icon';

/**
 * 단일 선택 드롭다운 (molecule).
 * Figma "5팀 디자인 시스템" — node 2403-4380 (Dropdown_Box / Dropdown_Text / Modal_Dropdown).
 *
 * - WAI-ARIA "Select-Only Combobox" 패턴: 포커스는 트리거(`role="combobox"`)에 머물고,
 *   `aria-activedescendant` 로 목록 안의 가상 포커스를 가리킨다. `<ul role="listbox">` 는
 *   시각·클릭 대상일 뿐 포커스를 받지 않는다.
 * - 키보드: 닫힘 상태에서 ↓/↑/Enter/Space 로 열기 / 열림 상태에서 ↑↓ 이동(비활성 건너뜀)·
 *   Home/End·Enter/Space 선택·Esc 닫기·Tab 닫고 이동. 바깥 클릭 시 닫힘.
 * - 상태를 갖지 않는 컨트롤드 — `value` / `onChange` 로만 소통(상태 소유는 부모).
 * - 팝오버는 트리거 기준 절대배치(아래). `overflow:hidden` 조상에 잘릴 수 있음 — 그 경우 부모에서 처리.
 */
export type DropdownOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export interface DropdownProps {
  /** 트리거의 접근성 이름 (예: "정렬 기준"). */
  label: string;
  options: DropdownOption[];
  /** 선택된 값. `null` 이면 placeholder 를 보여준다. */
  value: string | null;
  onChange: (value: string) => void;
  /** `box`(테두리 트리거) / `text`(테두리 없는 인라인 트리거). 기본 box. */
  variant?: 'box' | 'text';
  /** box 를 컨테이너 폭에 맞추고 라벨↔쉐브론을 양끝 정렬(Figma Dropdown_Box Size=L). */
  block?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const TRIGGER_BASE =
  'flex items-center gap-1 whitespace-nowrap transition-colors disabled:cursor-not-allowed';

export function Dropdown({
  label,
  options,
  value,
  onChange,
  variant = 'box',
  block = false,
  placeholder = '선택하기',
  disabled = false,
  className,
}: DropdownProps) {
  const uid = useId();
  const listboxId = `${uid}-listbox`;
  const optionId = (i: number) => `${uid}-opt-${i}`;

  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const selectedIndex = options.findIndex((o) => o.value === value);
  const [activeIndex, setActiveIndex] = useState(selectedIndex >= 0 ? selectedIndex : 0);

  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;
  const enabledIndexes = options.reduce<number[]>((acc, o, i) => {
    if (!o.disabled) acc.push(i);
    return acc;
  }, []);

  function openMenu(toLast = false) {
    if (disabled || enabledIndexes.length === 0) return;
    const edge = (toLast ? enabledIndexes[enabledIndexes.length - 1] : enabledIndexes[0]) ?? 0;
    setActiveIndex(
      selectedIndex >= 0 && !toLast && !options[selectedIndex]?.disabled ? selectedIndex : edge,
    );
    setOpen(true);
  }

  function closeMenu(refocus = true) {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }

  function selectAt(index: number) {
    const opt = options[index];
    if (!opt || opt.disabled) return;
    onChange(opt.value);
    closeMenu();
  }

  function moveActive(dir: 1 | -1 | 'first' | 'last') {
    if (enabledIndexes.length === 0) return;
    const pos = enabledIndexes.indexOf(activeIndex);
    let nextPos: number;
    if (dir === 'first') nextPos = 0;
    else if (dir === 'last') nextPos = enabledIndexes.length - 1;
    else if (pos < 0) nextPos = dir === 1 ? 0 : enabledIndexes.length - 1;
    else nextPos = (pos + dir + enabledIndexes.length) % enabledIndexes.length;
    setActiveIndex(enabledIndexes[nextPos] ?? activeIndex);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openMenu();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        openMenu(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        moveActive(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveActive(-1);
        break;
      case 'Home':
        e.preventDefault();
        moveActive('first');
        break;
      case 'End':
        e.preventDefault();
        moveActive('last');
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        selectAt(activeIndex);
        break;
      case 'Escape':
        e.preventDefault();
        closeMenu();
        break;
      case 'Tab':
        closeMenu(false);
        break;
    }
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const boxClass =
    variant === 'box'
      ? [
          'rounded-s border border-border',
          disabled ? 'bg-surface-secondary' : 'bg-surface',
          block ? 'py-1 pr-3 pl-4' : 'h-10 px-3 py-2',
        ].join(' ')
      : 'py-3';

  const triggerClass = [
    TRIGGER_BASE,
    block ? 'text-heading-5 w-full justify-between' : 'text-body-m justify-center',
    boxClass,
    disabled ? 'text-fg-disabled' : selected ? 'text-fg' : 'text-fg-secondary',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={wrapRef} className={block ? 'relative block' : 'relative inline-block'}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        disabled={disabled}
        onClick={() => (open ? closeMenu(false) : openMenu())}
        onKeyDown={handleKeyDown}
        className={triggerClass}
      >
        <span className={block ? 'min-w-0 truncate' : undefined}>
          {selected ? selected.label : placeholder}
        </span>
        <Icon
          name="arrow-down"
          size={20}
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={label}
          className="shadow-m rounded-m bg-surface absolute top-full left-0 z-50 mt-1 flex w-max min-w-full flex-col gap-1 p-1"
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            const isActive = i === activeIndex && !opt.disabled;
            return (
              <li
                key={opt.value}
                id={optionId(i)}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled || undefined}
                onClick={() => selectAt(i)}
                onPointerMove={() => !opt.disabled && setActiveIndex(i)}
                className={[
                  'flex items-center px-2 py-3 whitespace-nowrap',
                  opt.disabled
                    ? 'text-fg-disabled cursor-not-allowed'
                    : isSelected
                      ? 'text-label-l text-primary cursor-pointer'
                      : 'text-label-m text-fg cursor-pointer',
                  isActive ? 'bg-surface-secondary rounded-s' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

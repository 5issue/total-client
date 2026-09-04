'use client';

import { useId, useState } from 'react';
import type { ReactNode } from 'react';

import { Icon } from '@/components/atoms/Icon';

/**
 * 헤더 클릭으로 패널을 접었다 펴는 아코디언 셸 (molecule).
 * Figma "5팀 디자인 시스템" — node 2415-5383 "Accordion".
 *
 * 이건 **제네릭 셸**이다: 헤더 버튼 + 접히는 패널 + `aria-expanded`/`aria-controls` +
 * 쉐브론(Icon `arrow-down`) 회전만 담당한다. 도메인별 헤더/내용은
 * `AccordionFilter` · `AccordionOrder` 등이 이 컴포넌트를 감싸 구현한다.
 *
 * - `<button aria-expanded aria-controls>` + `<div id hidden>`. 키보드는 네이티브 `<button>`.
 * - 제어(`open`) / 비제어(`defaultOpen`) 모두 지원.
 */
export interface AccordionProps {
  /** 헤더 내용. 문자열이면 heading 스타일. */
  header: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onToggle?: (open: boolean) => void;
  disabled?: boolean;
  /** 루트 `<div>` 클래스. */
  className?: string;
  /** 헤더 `<button>` 의 레이아웃 클래스(기본 `min-h-12 px-4` 를 대체). */
  headerClassName?: string;
}

const HEADER_BASE =
  'text-heading-4 text-fg disabled:text-fg-disabled flex w-full items-center justify-between gap-3 text-left transition-colors disabled:cursor-not-allowed';

export function Accordion({
  header,
  children,
  open: controlledOpen,
  defaultOpen = false,
  onToggle,
  disabled = false,
  className,
  headerClassName,
}: AccordionProps) {
  const uid = useId();
  const btnId = `${uid}-btn`;
  const panelId = `${uid}-panel`;

  const isControlled = controlledOpen != null;
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const open = isControlled ? controlledOpen : innerOpen;

  function toggle() {
    const next = !open;
    if (!isControlled) setInnerOpen(next);
    onToggle?.(next);
  }

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      <button
        id={btnId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        disabled={disabled}
        onClick={toggle}
        className={[HEADER_BASE, headerClassName ?? 'min-h-12 px-4'].join(' ')}
      >
        <span className="min-w-0 flex-1">{header}</span>
        <Icon
          name="arrow-down"
          size={24}
          className={`text-fg-secondary shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      <div id={panelId} hidden={!open}>
        {children}
      </div>
    </div>
  );
}

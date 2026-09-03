'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

import { Icon } from '@/components/atoms/Icon';

/**
 * 월 그리드 날짜 선택 (molecule).
 * Figma "5팀 디자인 시스템" — node 2448-1704 "Calendar".
 *
 * - 상태를 갖지 않는 컨트롤드 — 선택값은 `value`(`Date | null`), 변경은 `onChange`.
 *   표시 월은 내부 상태(`defaultMonth` 로 초기값만).
 * - WAI-ARIA `grid` 패턴: `role="grid"` + roving tabIndex + 방향키/Home/End/PageUp·Down.
 *   비활성 날짜도 포커스는 되며 선택만 막힌다(`aria-disabled`).
 * - 색상 매핑: 선택 셀 배경은 Figma `Surface/Tertiary(#323a40)` = `--color-neutral-950`
 *   해시 일치라 프리미티브 `bg-neutral-950` 사용(code-style §6-1). 강조 셀은 Figma
 *   `State=Enabled` = `Surface/Secondary` → `bg-surface-secondary`. 일요일 `#ff2b54` ·
 *   요일 라벨 `#aba6a6` 는 시스템에 없어 `fg-danger` / `fg-tertiary` 로 근사(디자인 협의 대기).
 */
export interface CalendarProps {
  /** 선택된 날짜. `null` 이면 선택 없음. 시각은 무시하고 연·월·일로만 비교. */
  value: Date | null;
  onChange: (date: Date) => void;
  /** 처음 보여줄 달(비제어). 기본: `value` 의 달 → 없으면 오늘. */
  defaultMonth?: Date;
  /** 선택 가능한 최소·최대 날짜(경계 포함). */
  min?: Date;
  max?: Date;
  /** `min`/`max` 외에 추가로 비활성화할 날짜 판정. */
  isDateDisabled?: (date: Date) => boolean;
  /**
   * 선택은 안 됐지만 "고를 수 있는 날짜"로 상시 강조(`bg-surface-secondary`).
   * 예: 정기배송 요일에 해당하는 날짜들. 선택된 날짜/비활성 날짜에는 적용되지 않는다.
   */
  isDateHighlighted?: (date: Date) => boolean;
  className?: string;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const WEEKDAY_LABELS = [
  '일요일',
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일',
] as const;

const DATE_LABEL_FORMAT = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
});

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addDays(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function clampDayOfMonth(monthStart: Date, day: number) {
  const last = endOfMonth(monthStart).getDate();
  return new Date(monthStart.getFullYear(), monthStart.getMonth(), Math.min(day, last));
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function buildWeeks(month: Date): (Date | null)[][] {
  const first = startOfMonth(month);
  const total = endOfMonth(month).getDate();
  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = [];

  for (let i = 0; i < first.getDay(); i += 1) week.push(null);
  for (let day = 1; day <= total; day += 1) {
    week.push(new Date(month.getFullYear(), month.getMonth(), day));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

/** 탭 타깃은 44px(접근성 §5), 보이는 원은 Figma 스펙대로 36px. */
const NAV_BUTTON =
  'text-fg-secondary disabled:text-fg-disabled flex size-11 items-center justify-center disabled:cursor-not-allowed';
const NAV_CIRCLE = 'border-border flex size-9 items-center justify-center rounded-full border';

const DAY_BASE =
  'text-label-m flex size-11 items-center justify-center rounded-full transition-colors';

export function Calendar({
  value,
  onChange,
  defaultMonth,
  min,
  max,
  isDateDisabled,
  isDateHighlighted,
  className,
}: CalendarProps) {
  const captionId = useId();
  const dayRefs = useRef(new Map<string, HTMLButtonElement>());
  const shouldRefocus = useRef(false);

  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(defaultMonth ?? value ?? new Date()),
  );
  const [focusedDate, setFocusedDate] = useState(() => value ?? new Date());

  useEffect(() => {
    if (!shouldRefocus.current) return;
    shouldRefocus.current = false;
    dayRefs.current.get(dayKey(focusedDate))?.focus();
  }, [focusedDate, viewMonth]);

  const today = startOfDay(new Date());
  const weeks = buildWeeks(viewMonth);

  function isDisabledDate(date: Date) {
    const d = startOfDay(date);
    if (min && d < startOfDay(min)) return true;
    if (max && d > startOfDay(max)) return true;
    return isDateDisabled?.(date) ?? false;
  }

  const canGoPrev = !min || endOfMonth(addMonths(viewMonth, -1)) >= startOfDay(min);
  const canGoNext = !max || startOfMonth(addMonths(viewMonth, 1)) <= startOfDay(max);

  function goToMonth(delta: number) {
    const next = addMonths(viewMonth, delta);
    setViewMonth(next);
    setFocusedDate(clampDayOfMonth(next, focusedDate.getDate()));
  }

  function moveFocus(next: Date) {
    shouldRefocus.current = true;
    if (!isSameMonth(next, viewMonth)) setViewMonth(startOfMonth(next));
    setFocusedDate(next);
  }

  function selectDate(date: Date) {
    if (isDisabledDate(date)) return;
    onChange(date);
  }

  function handleDayKeyDown(e: KeyboardEvent<HTMLButtonElement>, date: Date) {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        moveFocus(addDays(date, -1));
        break;
      case 'ArrowRight':
        e.preventDefault();
        moveFocus(addDays(date, 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveFocus(addDays(date, -7));
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveFocus(addDays(date, 7));
        break;
      case 'Home':
        e.preventDefault();
        moveFocus(addDays(date, -date.getDay()));
        break;
      case 'End':
        e.preventDefault();
        moveFocus(addDays(date, 6 - date.getDay()));
        break;
      case 'PageUp':
        e.preventDefault();
        moveFocus(clampDayOfMonth(addMonths(date, -1), date.getDate()));
        break;
      case 'PageDown':
        e.preventDefault();
        moveFocus(clampDayOfMonth(addMonths(date, 1), date.getDate()));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        selectDate(date);
        break;
    }
  }

  return (
    <div className={['bg-surface flex w-full flex-col gap-4', className].filter(Boolean).join(' ')}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="이전 달"
          disabled={!canGoPrev}
          onClick={() => goToMonth(-1)}
          className={NAV_BUTTON}
        >
          <span className={NAV_CIRCLE}>
            <Icon name="arrow-left" size={16} aria-hidden />
          </span>
        </button>
        <div id={captionId} aria-live="polite" className="text-heading-2 text-fg">
          {viewMonth.getFullYear()}년 {viewMonth.getMonth() + 1}월
        </div>
        <button
          type="button"
          aria-label="다음 달"
          disabled={!canGoNext}
          onClick={() => goToMonth(1)}
          className={NAV_BUTTON}
        >
          <span className={NAV_CIRCLE}>
            <Icon name="arrow-right" size={16} aria-hidden />
          </span>
        </button>
      </div>

      <div role="grid" aria-labelledby={captionId} className="flex flex-col gap-2">
        <div role="row" className="grid grid-cols-7 justify-items-center">
          {WEEKDAYS.map((day, i) => (
            <span
              key={day}
              role="columnheader"
              aria-label={WEEKDAY_LABELS[i]}
              className={`text-label-m flex size-11 items-center justify-center ${
                i === 0 ? 'text-fg-danger' : 'text-fg-tertiary'
              }`}
            >
              {day}
            </span>
          ))}
        </div>

        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} role="row" className="grid grid-cols-7 justify-items-center">
            {week.map((date, i) => {
              if (!date) return <span key={i} role="gridcell" className="size-11" />;

              const isSelected = value != null && isSameDay(date, value);
              const isDisabled = isDisabledDate(date);
              const isHighlighted =
                !isSelected && !isDisabled && (isDateHighlighted?.(date) ?? false);
              const isFocusTarget = isSameDay(date, focusedDate);

              return (
                <span key={i} role="gridcell" aria-selected={isSelected}>
                  <button
                    ref={(el) => {
                      const key = dayKey(date);
                      if (el) dayRefs.current.set(key, el);
                      else dayRefs.current.delete(key);
                    }}
                    type="button"
                    tabIndex={isFocusTarget ? 0 : -1}
                    aria-label={DATE_LABEL_FORMAT.format(date)}
                    aria-disabled={isDisabled || undefined}
                    aria-current={isSameDay(date, today) ? 'date' : undefined}
                    onClick={() => selectDate(date)}
                    onKeyDown={(e) => handleDayKeyDown(e, date)}
                    className={[
                      DAY_BASE,
                      isSelected
                        ? 'text-fg-inverse bg-neutral-950'
                        : isDisabled
                          ? 'text-fg-disabled cursor-not-allowed'
                          : isHighlighted
                            ? 'text-fg bg-surface-secondary'
                            : 'text-fg hover:bg-surface-secondary',
                    ].join(' ')}
                  >
                    {date.getDate()}
                  </button>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

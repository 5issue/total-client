'use client';

import { Accordion } from '@/components/molecules/shared/Accordion';

/**
 * 필터 카테고리 아코디언 (molecule).
 * Figma "5팀 디자인 시스템" — node 2415-5383 "Accordion_Filter".
 *
 * `Accordion` 셸 + 체크박스 목록. 옵션·선택 상태는 props(상위 필터 상태가 소유).
 */
export interface AccordionFilterOption {
  value: string;
  label: string;
}

export interface AccordionFilterProps {
  /** 카테고리명 (헤더). */
  title: string;
  options: AccordionFilterOption[];
  /** 선택된 value 목록. */
  value: string[];
  onChange: (value: string[]) => void;
  defaultOpen?: boolean;
  className?: string;
}

export function AccordionFilter({
  title,
  options,
  value,
  onChange,
  defaultOpen = false,
  className,
}: AccordionFilterProps) {
  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  }

  return (
    <Accordion
      header={title}
      defaultOpen={defaultOpen}
      className={className}
      headerClassName="min-h-12 pl-4 pr-3"
    >
      <ul className="flex flex-col gap-2 py-1">
        {options.map((opt) => (
          <li key={opt.value}>
            <label className="text-heading-4 text-fg flex h-10 cursor-pointer items-center gap-3 px-8">
              <input
                type="checkbox"
                className="accent-primary size-6 shrink-0"
                checked={value.includes(opt.value)}
                onChange={() => toggle(opt.value)}
              />
              {opt.label}
            </label>
          </li>
        ))}
      </ul>
    </Accordion>
  );
}

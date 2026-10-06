'use client';

import { Icon } from '@/components/atoms/Icon';
import { Dropdown, type DropdownOption } from '@/components/molecules/shared/Dropdown';

/**
 * 상품 리스트 상단 툴바 — 개수 + 정렬 + 필터 (organism).
 * Figma "5팀 디자인 시스템" — node 2523-5605 "List_Header".
 *
 * 정렬은 `Dropdown`(molecule) `text` variant 를 그대로 조립한다. 필터는 트리거만 두고
 * (`onFilterClick`) 실제 시트/패널은 상위가 소유한다(`AccordionFilter` 와 같은 정책).
 * 정렬 선택값·개수 등 데이터는 전부 props — 이 컴포넌트는 상태를 갖지 않는다.
 *
 * 토큰(`get_variable_defs` node 2523-5605): 개수 `Body/Body_S_Regular` + `Text/Primary`
 * → `text-body-s text-fg`, 정렬·필터 트리거 `Body/Body_M_Medium` → `text-body-m`,
 * 여백 `Margin/Default` 16 → `px-4`, 트리거 간격 `Gap/2XS` 4 → `gap-1`.
 */
export interface ListHeaderProps {
  /** 목록 총 개수. "총 N개" 로 표시한다. */
  count: number;
  /** 정렬 옵션 목록. */
  sortOptions: DropdownOption[];
  /** 선택된 정렬 값. `null` 이면 placeholder. */
  sortValue: string | null;
  onSortChange: (value: string) => void;
  /** 필터 트리거 클릭 — 상위가 필터 시트를 연다. 없으면 필터 버튼 미렌더. */
  onFilterClick?: () => void;
  className?: string;
}

const FILTER_TRIGGER = 'text-body-m text-fg flex items-center gap-1 py-3 whitespace-nowrap';

export function ListHeader({
  count,
  sortOptions,
  sortValue,
  onSortChange,
  onFilterClick,
  className,
}: ListHeaderProps) {
  return (
    <div
      className={['flex items-center justify-between px-4', className].filter(Boolean).join(' ')}
    >
      <p className="text-body-s text-fg">총 {count.toLocaleString('ko-KR')}개</p>

      <div className="flex items-center gap-1">
        <Dropdown
          label="정렬 기준"
          variant="text"
          options={sortOptions}
          value={sortValue}
          onChange={onSortChange}
        />
        {onFilterClick ? (
          <button type="button" onClick={onFilterClick} className={FILTER_TRIGGER}>
            필터
            <Icon name="filter" size={20} aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}

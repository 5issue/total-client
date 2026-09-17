'use client';

import { Checkbox } from '@/components/atoms/Checkbox';
import { FilterChip } from '@/components/atoms/FilterChip';

import { FRIDGE_FILTERS, type FridgeFilterId } from './model';

/**
 * 필터 칩 행 (organism). Figma node 1120-56214.
 *
 * 헤더+탭바와 함께 스크롤 중에도 붙어 있어야 해서(#111 QA) `MyFridgeView`가 이걸
 * 헤더+탭바와 같은 `sticky` 컨테이너 안에 두지만, 뒤 배경은 없다(사용자 요청) — 칩
 * 자체의 배경(`FilterChip`)만 보이고 행 컨테이너는 투명해 스크롤되는 그리드가 칩
 * 사이로 그대로 비친다. "전체선택/선택삭제" 툴바(`FridgeSelectionToolbar`)는 이
 * 스크롤 고정 대상이 아니라 별도 컴포넌트로 뺐다.
 */
export interface FridgeFilterBarProps {
  activeFilter: FridgeFilterId;
  onFilterChange: (id: FridgeFilterId) => void;
  className?: string;
}

export function FridgeFilterBar({ activeFilter, onFilterChange, className }: FridgeFilterBarProps) {
  return (
    <div
      className={[
        'scrollbar-hide flex items-center gap-3 overflow-x-auto px-4 pt-3 pb-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {FRIDGE_FILTERS.map((filter) => (
        <FilterChip
          key={filter.id}
          tone="neutral"
          showTrailingIcon={false}
          selected={activeFilter === filter.id}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
        </FilterChip>
      ))}
    </div>
  );
}

/**
 * "전체선택(n/총계)" + "선택삭제" 툴바 (organism). Figma node 1120-56176.
 * 별도 "선택 모드" 진입 없이 항상 선택 가능한 상태다(Figma 전 화면 상태에 공통).
 * `FridgeFilterBar`(칩 행)와 달리 스크롤 시 같이 붙어 있지 않아도 된다(사용자 요청) —
 * 그리드와 함께 정상적으로 스크롤된다.
 */
export interface FridgeSelectionToolbarProps {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  onToggleSelectAll: (checked: boolean) => void;
  onDeleteSelected: () => void;
  className?: string;
}

export function FridgeSelectionToolbar({
  selectedCount,
  totalCount,
  allSelected,
  onToggleSelectAll,
  onDeleteSelected,
  className,
}: FridgeSelectionToolbarProps) {
  return (
    <div
      className={['flex items-center justify-between px-4 py-3', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex h-8 items-center">
        {/* `Checkbox` 의 `<label>` 은 항상 44px 터치 타깃(size-11)인데 Figma 실측
            체크박스 자리는 32px 뿐이라, 감싸는 요소를 `-m-1.5`(-6px×4변=-12px)만큼
            당겨 44-12=32px 로 맞춘다 — 그래야 "전체선택" 글자가 Figma와 같은
            간격으로 붙는다(이미지 위 체크박스와 같은 보정 원칙). */}
        <span className="-m-1.5 inline-flex">
          <Checkbox
            variant="filled"
            label="전체선택"
            checked={allSelected}
            onChange={(e) => onToggleSelectAll(e.target.checked)}
          />
        </span>
        <span className="text-heading-5 text-fg">전체선택</span>
        <span className="text-body-s text-fg-tertiary ml-1">
          ({selectedCount}/{totalCount})
        </span>
      </div>
      {/* Figma(node 1120-56183)는 선택 개수와 무관하게 항상 활성 스타일 — 선택 없이
          눌러도 삭제할 게 없어 조용히 아무 일도 안 한다(모달을 열 필요 없음). 크기는
          실측 그대로 74×32, 테두리는 `Border/Outline_B_Default`(#c9d5df) — 프로젝트
          공용 `border-border`(#dde4ed, Border/200)와는 다른 색이라 `border-neutral-400`
          로 직접 지정한다. */}
      <button
        type="button"
        onClick={onDeleteSelected}
        className="text-label-l text-fg flex h-8 w-18.5 shrink-0 items-center justify-center gap-1 rounded-sm border border-neutral-400 px-1 py-2"
      >
        선택삭제
      </button>
    </div>
  );
}

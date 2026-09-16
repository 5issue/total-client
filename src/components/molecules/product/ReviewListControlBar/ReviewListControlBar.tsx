'use client';

import { Icon } from '@/components/atoms/Icon';

/**
 * 후기 목록 상단 정렬/필터 바 (molecule). Figma "5팀 UI 공유용" `ListControlBar`
 * (node 665:43659) — "총 N개" + 정렬(추천순)/필터 드롭다운 트리거 2개.
 *
 * 두 트리거 모두 Figma 컴포넌트명이 동일한 `TextDropdown`(node 2523:5608/5609)이라
 * 열었을 때 나올 메뉴 콘텐츠는 이 노드에 없다 — 임의로 드롭다운을 만들지 않고, 클릭
 * 핸들러만 옵션으로 받는 정적 트리거 버튼까지만 구현한다(실제 메뉴 스펙 받으면 연결).
 *
 * "추천순" 아이콘은 실제 SVG 경로 실측 결과 caret-up(채워진 삼각형)이 아니라 `arrow-up`
 * (20px, 얇은 스트로크 쉐브론)과 픽셀 단위로 동일해 교체했다. "필터" 아이콘은 처음부터
 * `filter`(슬라이더)가 맞다는 사용자 확인(2026-09-16) — 한 번 `arrow-down`으로 잘못
 * 고쳤다가 되돌렸다.
 */
export type ReviewListControlBarProps = {
  /** 예: "총 30,042개". */
  totalCountLabel: string;
  /** 예: "추천순". */
  sortLabel: string;
  onSortClick?: () => void;
  onFilterClick?: () => void;
  className?: string;
};

export function ReviewListControlBar({
  totalCountLabel,
  sortLabel,
  onSortClick,
  onFilterClick,
  className,
}: ReviewListControlBarProps) {
  return (
    <div
      className={['bg-surface flex w-full items-center justify-between px-4', className]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="text-body-m text-fg">{totalCountLabel}</p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onSortClick}
          className="text-body-m text-fg flex items-center gap-1 py-3"
        >
          {sortLabel}
          <Icon name="arrow-up" size={20} aria-hidden />
        </button>
        <button
          type="button"
          onClick={onFilterClick}
          className="text-body-m text-fg flex items-center gap-1 py-3"
        >
          필터
          <Icon name="filter" size={20} aria-hidden />
        </button>
      </div>
    </div>
  );
}

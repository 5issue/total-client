'use client';

/**
 * 급상승 검색어 순위 1개 — 순위 번호 + 키워드, 하단 구분선 (molecule).
 * Figma "5팀 UI 공유용" node 194-10033 "ListTrendingSearchItem".
 * 순위 번호(고정폭 18px, 중앙정렬, Brand/Primary)와 키워드(Text/Primary)는
 * 둘 다 Body/Body_L_Bold 스케일 — `text-body-l`이 이미 weight 700 을 포함한다.
 */
export interface TrendingKeywordItemProps {
  rank: number;
  keyword: string;
  onClick?: (keyword: string) => void;
  className?: string;
}

export function TrendingKeywordItem({
  rank,
  keyword,
  onClick,
  className,
}: TrendingKeywordItemProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(keyword)}
      className={[
        'border-overlay-blue flex h-12 min-w-0 flex-1 items-center gap-4 border-b px-1',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="text-body-l text-primary w-4.5 shrink-0 text-center">{rank}</span>
      <span className="text-body-l text-fg truncate">{keyword}</span>
    </button>
  );
}

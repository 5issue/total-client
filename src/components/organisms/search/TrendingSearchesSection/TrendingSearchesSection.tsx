import { TrendingKeywordItem } from '@/components/molecules/search/TrendingKeywordItem';
import { HomeSectionHeader } from '@/components/molecules/shared/HomeSectionHeader';

/**
 * 검색 화면 "급상승 검색어" 섹션 (organism).
 * Figma "5팀 UI 공유용" node 577-13761, 순위 1~10 을 2열로 배치(node 577-13764).
 * 실시간 급상승 검색어 API 는 범위 밖 — 이번 퍼블리싱 패스는 목업 목록을 그대로 쓴다.
 */
const TRENDING_KEYWORDS = [
  '원피스',
  '디카페인',
  '제습제',
  '치즈케이크',
  '디델리',
  '종가집',
  '체리',
  '립밤',
  '야채',
  '콩나물',
];

export function TrendingSearchesSection() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <HomeSectionHeader
        title="급상승 검색어"
        subtitle="최근 1시간 동안 검색 횟수가 급상승했어요"
      />
      <div className="grid grid-cols-2 gap-x-3">
        {TRENDING_KEYWORDS.map((keyword, i) => (
          <TrendingKeywordItem key={keyword} rank={i + 1} keyword={keyword} />
        ))}
      </div>
    </div>
  );
}

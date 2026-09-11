'use client';

import { RecommendedKeywordItem } from '@/components/molecules/search/RecommendedKeywordItem';
import { HomeSectionHeader } from '@/components/molecules/shared/HomeSectionHeader';

/**
 * 검색 화면 "추천 검색어" 섹션 (organism).
 * Figma "5팀 UI 공유용" node 577-13750, 가로 스크롤 이미지 키워드 7개(node 577-13752).
 * 이미지는 API 없이(퍼블리싱 범위) `public/recommended-keywords/*.png` 정적 에셋을 쓴다
 * — 기존 `ImageFrameContainer` 스토리(#63)에서 이미 같은 경로 규칙으로 3장이 있었고,
 * 이번에 나머지 4장(아침식사/제철 수산물/사계절채소/유기농 곡물)을 추가했다.
 *
 * 가로 스크롤 자체 터치를 `SwipeTabShell`(화면 전체 좌우 스와이프 탭 전환)이 같이 가로채
 * 스크롤하려다 탭이 넘어가 버린다 — 그 컴포넌트 문서 주석이 안내한 대로 여기서
 * `stopPropagation` 으로 이 영역만 전역 스와이프 핸들러에서 제외한다.
 */
const RECOMMENDED_KEYWORDS = [
  { keyword: '신상 밀키트', imageSrc: '/recommended-keywords/kit.png' },
  { keyword: '신선회', imageSrc: '/recommended-keywords/fish.png' },
  { keyword: '납작 복숭아', imageSrc: '/recommended-keywords/peach.png' },
  { keyword: '아침식사', imageSrc: '/recommended-keywords/breakfast.png' },
  { keyword: '제철 수산물', imageSrc: '/recommended-keywords/seafood.png' },
  { keyword: '사계절채소', imageSrc: '/recommended-keywords/vegetable.png' },
  { keyword: '유기농 곡물', imageSrc: '/recommended-keywords/grain.png' },
] as const;

export function RecommendedKeywordsSection() {
  return (
    <div className="flex flex-col gap-3 py-4">
      <HomeSectionHeader title="추천 검색어" titleSize="h2" titleClassName="font-bold!" />
      <div
        className="scrollbar-hide flex gap-7 overflow-x-auto px-5"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onTouchCancel={(e) => e.stopPropagation()}
      >
        {RECOMMENDED_KEYWORDS.map((item) => (
          <RecommendedKeywordItem key={item.keyword} {...item} />
        ))}
      </div>
    </div>
  );
}

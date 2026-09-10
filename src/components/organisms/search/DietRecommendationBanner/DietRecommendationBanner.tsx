'use client';

import { RecommendedKeywordsContainer } from '@/components/molecules/ai/RecommendedKeywordsContainer';

const DIET_KEYWORDS = [
  '과일과 채소 위주의 비건식',
  '단백질 중심의 다이어트 식단',
  '육류 중심의 든든한 식단',
  '밀키트·레토르트 위주의 간편식',
];

/**
 * 검색 화면 상단 AI 식단 추천 배너 (organism).
 * Figma "5팀 UI 공유용" node 577-12772, `molecules/ai/RecommendedKeywordsContainer`
 * 그대로 재사용하고 이 화면 카피만 연결한다.
 *
 * "다시 추천 받기"(`onReset`)는 실제로는 추천 로직 재호출이 필요하지만 해당 훅이
 * 아직 없다 — 이번 퍼블리싱 패스는 정적 UI 범위라 칩 노출을 위한 스텁 핸들러만
 * 둔다(카트 이슈 #64 "스텁" 패턴과 동일). 키워드 선택(`onSelectKeyword`)도 같은 이유로
 * 아직 연결하지 않는다.
 */
export function DietRecommendationBanner() {
  return (
    <RecommendedKeywordsContainer
      title="어떤 식단을 선호하세요?"
      description="선택하신 선호 식단과 인기상품, 구매이력을 기반으로 AI가 맞춤 상품과 레시피를 추천해드려요!"
      promptLabel="선호하는 식단을 선택해주세요"
      keywords={DIET_KEYWORDS}
      onReset={() => {}}
    />
  );
}

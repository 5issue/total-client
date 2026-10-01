import type { Metadata } from 'next';

import { LikedRecipesViewContainer } from '@/components/organisms/mypage/MyRecipeView/LikedRecipesViewContainer';

export const metadata: Metadata = { title: '찜한 레시피' };

/**
 * 찜한 레시피 전체보기(`/mypage/fridge/recipes/liked`, 이슈 #113, Figma
 * node 666-32087). MY 레시피 메인 "찜한 레시피" 섹션의 전체보기 진입점.
 * AI 파트 FAV-01~03 연동(이슈 #152) — 조회·로딩·에러는 `LikedRecipesViewContainer`가 맡는다.
 */
export default function LikedRecipesPage() {
  return <LikedRecipesViewContainer />;
}

import type { Metadata } from 'next';

import { RecentRecipesViewContainer } from '@/components/organisms/mypage/MyRecipeView/RecentRecipesViewContainer';

export const metadata: Metadata = { title: '최근 본 레시피' };

/**
 * 최근 본 레시피 전체보기(`/mypage/fridge/recipes/recent`, 이슈 #113, Figma
 * node 666-31937). MY 레시피 메인 "최근 본 레시피" 섹션의 전체보기 진입점.
 * AI 파트 RECENT-01~02 연동(이슈 #153) — 조회·로딩·에러는 `RecentRecipesViewContainer`가 맡는다.
 */
export default function RecentRecipesPage() {
  return <RecentRecipesViewContainer />;
}

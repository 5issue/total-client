import type { Metadata } from 'next';

import { LikedRecipesView } from '@/components/organisms/mypage/MyRecipeView/LikedRecipesView';

export const metadata: Metadata = { title: '찜한 레시피' };

/**
 * 찜한 레시피 전체보기(`/mypage/fridge/recipes/liked`, 이슈 #113, Figma
 * node 666-32087). MY 레시피 메인 "찜한 레시피" 섹션의 전체보기 진입점.
 */
export default function LikedRecipesPage() {
  return <LikedRecipesView />;
}

import type { Metadata } from 'next';

import { RecentRecipesView } from '@/components/organisms/mypage/MyRecipeView/RecentRecipesView';

export const metadata: Metadata = { title: '최근 본 레시피' };

/**
 * 최근 본 레시피 전체보기(`/mypage/fridge/recipes/recent`, 이슈 #113, Figma
 * node 666-31937). MY 레시피 메인 "최근 본 레시피" 섹션의 전체보기 진입점.
 */
export default function RecentRecipesPage() {
  return <RecentRecipesView />;
}

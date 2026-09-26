import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { findRecipe } from '@/components/organisms/mypage/MyRecipeView/mock';
import { RecipeDetailView } from '@/components/organisms/mypage/MyRecipeView/RecipeDetailView';

export const metadata: Metadata = { title: '레시피 상세' };

/**
 * 레시피 상세(`/mypage/fridge/recipes/[recipeId]`, 이슈 #113) — MY 레시피의 AI 추천
 * 캐러셀·최근 본 레시피·찜한 레시피 카드 공통 진입점(Figma node 666-31653 등).
 * `(chromeless)`: fridge 라우트와 동일 그룹, 미들웨어 `/mypage/:path*` 매처로 보호.
 * API 연동 전, mock 데이터 기반 UI 퍼블리싱만.
 */
export default async function RecipeDetailPage({
  params,
}: PageProps<'/mypage/fridge/recipes/[recipeId]'>) {
  const { recipeId } = await params;
  const recipe = findRecipe(recipeId);

  if (!recipe) notFound();

  return <RecipeDetailView recipe={recipe} />;
}

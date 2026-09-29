import type { Metadata } from 'next';

import { RecipeDetailContainer } from '@/components/organisms/mypage/MyRecipeView/RecipeDetailContainer';

export const metadata: Metadata = { title: '레시피 상세' };

/**
 * 레시피 상세(`/mypage/fridge/recipes/[recipeId]`, 이슈 #113) — MY 레시피의 AI 추천
 * 캐러셀·최근 본 레시피·찜한 레시피 카드 공통 진입점(Figma node 666-31653 등).
 * `(chromeless)`: fridge 라우트와 동일 그룹, 미들웨어 `/mypage/:path*` 매처로 보호.
 * AI 파트 RECIPE-01/03 연동(이슈 #140) — 조회·로딩·"레시피 없음" 처리는
 * `RecipeDetailContainer`(클라이언트 컴포넌트)가 맡는다.
 */
export default async function RecipeDetailPage({
  params,
}: PageProps<'/mypage/fridge/recipes/[recipeId]'>) {
  const { recipeId } = await params;

  return <RecipeDetailContainer recipeId={recipeId} />;
}

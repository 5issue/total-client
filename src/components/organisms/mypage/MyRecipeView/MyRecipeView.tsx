'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { RecipeCardM } from '@/components/molecules/mypage/RecipeCardM';
import { HomeSectionHeader } from '@/components/molecules/shared/HomeSectionHeader';

import { MOCK_AI_RECOMMENDED_RECIPE_IDS, MOCK_RECENT_RECIPE_IDS, MOCK_RECIPES } from './mock';
import { RecipeAiLoadingView } from './RecipeAiLoadingView';
import { RecipeAiRecommendSection } from './RecipeAiRecommendSection';

const NICKNAME = '준호';
// 실제 AI 생성 연동 전 mock 딜레이 — 연동 후에는 고정 시간이 아니라 응답이 올 때까지
// `RecipeAiLoadingView`를 띄워 두는 형태로 바뀐다(무한 로딩, 아래 주석 참고).
const AI_LOADING_DELAY_MS = 1200;

/**
 * `MyFridgeView`의 "MY 레시피" 탭 콘텐츠(node 1281-210501, 이슈 #113).
 * AI 추천 캐러셀 + 최근 본 레시피 + 찜한 레시피 가로 스크롤로 구성된다.
 *
 * `RecipeAiLoadingView`(node 1343-109131)는 탭 진입 화면이 아니라 "AI 추천 레시피"
 * 캐러셀에서 상세로 들어갈 때만 거치는 전환 화면이다("최근 본"/"찜한" 카드는 즉시
 * 이동) — 실제로는 레시피가 뜰 때까지 무한 로딩이지만, mock 단계라 고정 딜레이 후
 * 라우팅한다.
 */
export function MyRecipeView() {
  const router = useRouter();
  const [loadingRecipeId, setLoadingRecipeId] = useState<string | null>(null);

  const aiRecommendedRecipes = MOCK_AI_RECOMMENDED_RECIPE_IDS.map((id) =>
    MOCK_RECIPES.find((recipe) => recipe.id === id)!,
  );
  const recentRecipes = MOCK_RECENT_RECIPE_IDS.map((id) =>
    MOCK_RECIPES.find((recipe) => recipe.id === id)!,
  );
  const likedRecipes = recentRecipes.filter((recipe) => recipe.liked);

  function handleSelectAiRecipe(recipeId: string) {
    setLoadingRecipeId(recipeId);
    setTimeout(() => router.push(`/mypage/fridge/recipes/${recipeId}`), AI_LOADING_DELAY_MS);
  }

  if (loadingRecipeId) return <RecipeAiLoadingView nickname={NICKNAME} />;

  return (
    <div className="flex flex-col">
      <RecipeAiRecommendSection
        nickname={NICKNAME}
        recipes={aiRecommendedRecipes}
        onSelectRecipe={handleSelectAiRecipe}
      />

      <div className="flex flex-col gap-2 py-4">
        <HomeSectionHeader
          title="최근 본 레시피"
          titleSize="h4"
          href="/mypage/fridge/recipes/recent"
        />
        <div className="scrollbar-hide flex gap-2 overflow-x-auto px-4">
          {recentRecipes.map((recipe) => (
            <RecipeCardM key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 py-4">
        <HomeSectionHeader title="찜한 레시피" titleSize="h4" href="/mypage/fridge/recipes/liked" />
        <div className="scrollbar-hide flex gap-2 overflow-x-auto px-4">
          {likedRecipes.map((recipe) => (
            <RecipeCardM key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
    </div>
  );
}

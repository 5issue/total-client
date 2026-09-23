import { RecipeCardM } from '@/components/molecules/mypage/RecipeCardM';
import { HomeSectionHeader } from '@/components/molecules/shared/HomeSectionHeader';

import {
  findRecipe,
  MOCK_AI_RECOMMENDED_RECIPE_IDS,
  MOCK_RECENT_RECIPE_IDS,
  NICKNAME,
} from './mock';
import { RecipeAiRecommendSection } from './RecipeAiRecommendSection';

/**
 * `MyFridgeView`의 "MY 레시피" 탭 콘텐츠(node 1281-210501, 이슈 #113).
 * AI 추천 캐러셀 + 최근 본 레시피 + 찜한 레시피 가로 스크롤로 구성된다.
 *
 * "MY 레시피 제작 중" 로딩(`RecipeAiLoadingView`, node 1343-109131)은 이 컴포넌트가
 * 아니라 `MyFridgeView`가 MY냉장고→MY레시피 탭 전환 시 거치는 화면이다 — AI 추천
 * 카드를 포함해 모든 카드는 여기서 상세로 즉시 이동한다.
 */
export function MyRecipeView() {
  const aiRecommendedRecipes = MOCK_AI_RECOMMENDED_RECIPE_IDS.map((id) => findRecipe(id)!);
  const recentRecipes = MOCK_RECENT_RECIPE_IDS.map((id) => findRecipe(id)!);
  const likedRecipes = recentRecipes.filter((recipe) => recipe.liked);

  return (
    <div className="flex flex-col">
      <RecipeAiRecommendSection nickname={NICKNAME} recipes={aiRecommendedRecipes} />

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

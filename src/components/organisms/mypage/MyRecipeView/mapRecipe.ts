import { formatPrice } from '@/lib/formatters';
import type { MissingProductsResponse, RecipeDetail } from '@/types/recipe';

import { PLACEHOLDER_DETAIL } from './mock';
import type { Recipe, RecipeIngredient, RecipeNeededProduct } from './model';

/** 실 API에 이미지가 없는 동안 쓰는 중립 플레이스홀더(리포 전역에서 같은 경로를 씀,
 *  MyFridgeView/mock.ts·mocks/handlers/product.ts 참고). */
const PLACEHOLDER_IMAGE = '/placeholders/product-thumbnail.webp';

/** difficulty 원본 값 → 태그 한글 라벨. AI 레포 소스(data_pipeline/schemas.py의
 *  `Difficulty = Literal["EASY", "MEDIUM", "HARD"]`) 확인 결과 이 3종이 전부다
 *  (2026-09-26). 그래도 모르는 값이 오면 태그를 만들지 않는다(잘못된 라벨보다 안전). */
function difficultyToTag(difficulty: string | null | undefined): string | null {
  if (!difficulty) return null;
  const normalized = difficulty.toUpperCase();
  if (normalized === 'EASY') return '간단해요';
  if (normalized === 'MEDIUM') return '보통이에요';
  if (normalized === 'HARD') return '조금 어려워요';
  return null;
}

function toIngredient(apiIngredient: RecipeDetail['ingredients'][number]): RecipeIngredient {
  const amount =
    apiIngredient.quantity != null
      ? `${apiIngredient.quantity}${apiIngredient.unit ?? ''}`
      : (apiIngredient.unit ?? '');
  return { name: apiIngredient.name, amount };
}

/** `step_no` 순으로 정렬한 조리 지시문. AI 레포 소스 확인 결과 실제로 있는 필드라
 *  (명세 문서엔 없음, types/recipe.ts 참고) mock 대신 이걸 쓴다. */
function toSteps(detail: RecipeDetail): string[] {
  return [...detail.steps].sort((a, b) => a.step_no - b.step_no).map((step) => step.instruction);
}

function toNeededProducts(missing: MissingProductsResponse): RecipeNeededProduct[] {
  const seen = new Set<string>();
  const products: RecipeNeededProduct[] = [];
  for (const ingredient of missing.missing_ingredients) {
    for (const product of ingredient.products) {
      if (seen.has(product.product_id)) continue;
      seen.add(product.product_id);
      products.push({
        id: product.product_id,
        // 필드 자체가 없다(컬럼 마이그레이션 전, AI팀 확인·레포 소스 확인 2026-09-26).
        imageSrc: PLACEHOLDER_IMAGE,
        name: product.name,
        price: product.price,
        priceLabel: formatPrice(product.price),
      });
    }
  }
  return products;
}

/**
 * 레시피 상세(RECIPE-01) + 부족 재료 상품 추천(RECIPE-03) 응답을 화면 표시 모델
 * (`Recipe`)로 합성한다(이슈 #140). 보유/부족 재료 개수는 전체 재료 수 − 부족
 * 재료 수로 계산해, my-recipes 추천 경유 없이도 "최근 본"/"찜한"에서 동일하게
 * 구한다. mock으로 남는 건 `ownedItems`(냉장고 실물 썸네일·유통기한 배지)뿐 —
 * 두 엔드포인트 어디에도 없다. `liked`는 서버에 없는 로컬 전용 토글이라 초기값만 시드.
 */
export function toRecipeViewModel(
  detail: RecipeDetail,
  missingProducts: MissingProductsResponse,
): Recipe {
  const missingCount = missingProducts.missing_ingredients.length;
  const totalCount = Math.max(detail.ingredients.length, missingCount);
  const ownedCount = Math.max(totalCount - missingCount, 0);

  const cheapestPricePerIngredient = missingProducts.missing_ingredients.map((ingredient) => {
    return ingredient.products.reduce<number | null>((min, product) => {
      return min === null || product.price < min ? product.price : min;
    }, null);
  });
  const missingIngredientsPriceLabel = formatPrice(
    cheapestPricePerIngredient.reduce<number>((sum, price) => sum + (price ?? 0), 0),
  );

  const tags = [
    detail.servings != null ? `${detail.servings}인분` : null,
    difficultyToTag(detail.difficulty),
  ].filter((tag): tag is string => tag !== null);

  const steps = toSteps(detail);

  return {
    id: detail.recipe_id,
    name: detail.name,
    imageSrc: detail.image_url ?? PLACEHOLDER_IMAGE,
    ownedIngredientCount: ownedCount,
    neededIngredientCount: missingCount,
    liked: false,
    description: detail.description ?? '',
    tags: tags.length > 0 ? tags : ['간단해요'],
    ownedItems: PLACEHOLDER_DETAIL.ownedItems,
    ingredients:
      detail.ingredients.length > 0
        ? detail.ingredients.map(toIngredient)
        : PLACEHOLDER_DETAIL.ingredients,
    steps: steps.length > 0 ? steps : PLACEHOLDER_DETAIL.steps,
    neededProducts: toNeededProducts(missingProducts),
    missingIngredientsPriceLabel,
  };
}

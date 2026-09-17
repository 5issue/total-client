import type { IconName } from '@/components/atoms/Icon';

/**
 * MY 레시피 화면(이슈 #113, Figma node 1281-210501 등) 표시 모델.
 * 퍼블리싱 단계라 서버 계약(Zod 스키마)이 아니라 화면용 타입만 둔다. 데이터 연결 시
 * `hooks/recipe` 등에서 내려오는 스키마로 교체.
 */

export interface RecipeIngredient {
  name: string;
  amount: string;
}

/** 아코디언 "보유 중" 목록 한 줄 — `AccordionRecipe` 의 `AccordionRecipeOwnedItem` 과 동일 모양. */
export interface RecipeOwnedItem {
  name: string;
  /** 유통기한 배지(예: "D-4"). */
  badge?: string;
  /** 보관 방법 아이콘(`refrigerated`/`frozen`) — `MyFridgeView`의 `FridgeItem.storageType`과 동일 값. */
  badgeIcon?: IconName;
  thumbnailUrl?: string;
}

/**
 * "필요한 재료 구매하기" 카드 — `ProductMiniCard` props 와 동일 모양.
 * `price`는 `priceLabel`의 숫자값(원) — "장바구니 담기" 바텀시트가 수량별 합계를
 * 실시간으로 계산할 때 쓴다(`formatPrice`로 다시 포맷).
 */
export interface RecipeNeededProduct {
  id: string;
  imageSrc: string;
  name: string;
  price: number;
  priceLabel: string;
  discountLabel?: string;
  originalPriceLabel?: string;
}

export interface RecipeCardSummary {
  id: string;
  name: string;
  imageSrc: string;
  ownedIngredientCount: number;
  neededIngredientCount: number;
  liked: boolean;
}

/**
 * 레시피 상세(자세히보기, node 666-31653). `ownedItems`/`ingredients`/`steps`/
 * `neededProducts` 는 Figma 상세 스펙이 있는 레시피("떡갈비 두부 그라탕")만 실제
 * 값이고, 나머지는 카드 정보(이름·이미지·보유/필요 개수)만 디자인돼 있어 상세
 * 진입 시 같은 형태의 자리표시 데이터로 채운다(mock.ts 주석 참고, 디자인 확인 필요).
 */
export interface Recipe extends RecipeCardSummary {
  description: string;
  /** 예: ['1인분', '간단해요']. */
  tags: string[];
  ownedItems: RecipeOwnedItem[];
  ingredients: RecipeIngredient[];
  steps: string[];
  neededProducts: RecipeNeededProduct[];
  /** 아코디언·카드에 쓰는 "부족 재료 담기 {N}원"의 금액 부분(node 1281-210205). */
  missingIngredientsPriceLabel: string;
}

export function toCardSummary(recipe: Recipe): RecipeCardSummary {
  return {
    id: recipe.id,
    name: recipe.name,
    imageSrc: recipe.imageSrc,
    ownedIngredientCount: recipe.ownedIngredientCount,
    neededIngredientCount: recipe.neededIngredientCount,
    liked: recipe.liked,
  };
}

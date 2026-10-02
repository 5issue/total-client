'use client';

import { useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Icon } from '@/components/atoms/Icon';
import { ProductMiniCard } from '@/components/molecules/product/ProductMiniCard';
import { AccordionRecipe } from '@/components/molecules/shared/AccordionRecipe';
import { ErrorToastBanner } from '@/components/molecules/shared/ErrorToastBanner';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useAddCartItems } from '@/hooks/cart/useAddCartItems';
import { useTimedToast } from '@/hooks/useTimedToast';
import { fetchProductsByAi } from '@/lib/apiClient';

import type { Recipe } from './model';
import { RecipeCartAddedBottomSheet } from './RecipeCartAddedBottomSheet';
import { RecipeCartBottomSheet, type RecipeCartSubmitItem } from './RecipeCartBottomSheet';

const ADD_TO_CART_ERROR_TOAST_DURATION_MS = 3000;
const ADD_TO_CART_ERROR_MESSAGE = '장바구니 담기에 실패했어요. 다시 시도해주세요.';

/**
 * 레시피 상세 화면(자세히보기, node 666-31653 등). 진입 경로가 AI 추천 캐러셀·최근
 * 본 레시피·찜한 레시피로 다양해 `MyFridgeView`의 `leadingHref` 고정 패턴 대신
 * `router.back()`을 쓴다(검색 화면과 같은 이유, MyFridgeView.tsx 주석 참고).
 *
 * 재료 구매 카드의 개별 "담기"·하단 "장바구니에 한번에 담기" 모두 `useAddCartItems`로
 * 실제 `POST /api/cart/items`를 호출한다(이슈 #145). `product.id`는 AI 추천 응답의
 * `product_id`라 BE 상품 PK와 값 공간이 다르다 — `GET /products/by-ai`로 변환한 뒤
 * (UNIT 타입 쪽 id만 취함) 장바구니에 담는다(이슈 #203, 실제 값으로 검증 완료 —
 * 예전엔 "product-service UNIT id와 같은 값"이라는 미검증 전제로 그대로 썼는데 틀렸다).
 * 매핑이 없는 품목은 조용히 제외하고 나머지만 담는다. 성공해야만
 * `RecipeCartAddedBottomSheet`를 띄운다.
 *
 * 하트(찜)는 `RecipeCardL`과 동일하게 로컬 상태 없이 `recipe.liked`+`onToggleLike`로만
 * 제어한다(이슈 #152) — 실제 반영은 `RecipeDetailContainer`의 FAV-02/03 뮤테이션.
 */
export interface RecipeDetailViewProps {
  recipe: Recipe;
  onToggleLike: (liked: boolean) => void;
}

export function RecipeDetailView({ recipe, onToggleLike }: RecipeDetailViewProps) {
  const router = useRouter();
  const [cartSheetOpen, setCartSheetOpen] = useState(false);
  const [cartAddedOpen, setCartAddedOpen] = useState(false);
  const addCartItems = useAddCartItems();
  const { visible: errorToastVisible, trigger: triggerErrorToast } = useTimedToast(
    ADD_TO_CART_ERROR_TOAST_DURATION_MS,
  );

  async function addToCart(items: RecipeCartSubmitItem[]) {
    if (items.length === 0) return;

    let byAi;
    try {
      byAi = await fetchProductsByAi(items.map(({ productId }) => productId));
    } catch {
      triggerErrorToast();
      return;
    }

    // 같은 product_id에 GROUP(대표상품)·UNIT(실제 구매단위) 두 항목이 같이 올 수 있어
    // UNIT 쪽만 쓴다(이슈 #203). 매핑이 없는 품목(notFoundAiProductIds)은 조용히 뺀다.
    const unitIdByAiProductId = new Map(
      byAi.items.filter((p) => p.type === 'UNIT').map((p) => [String(p.aiProductId), p.id]),
    );
    const resolvedItems = items
      .map(({ productId, quantity }) => {
        const unitId = unitIdByAiProductId.get(productId);
        return unitId === undefined ? null : { productId: unitId, quantity };
      })
      .filter((item) => item !== null);

    if (resolvedItems.length === 0) {
      triggerErrorToast();
      return;
    }

    addCartItems.mutate(
      { items: resolvedItems },
      {
        onSuccess: () => {
          setCartSheetOpen(false);
          setCartAddedOpen(true);
        },
        onError: () => {
          triggerErrorToast();
        },
      },
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SectionHeader leading="back" onLeadingClick={() => router.back()} title="My 레시피" />

      <div className="relative h-62.75 w-full shrink-0">
        <Image
          src={recipe.imageSrc}
          alt={recipe.name}
          fill
          sizes="402px"
          priority
          className="object-cover"
        />
      </div>

      <div className="flex flex-col gap-7 px-4 pb-8">
        <div className="flex flex-col gap-2 pt-3">
          <div className="flex items-center justify-between">
            <h1 className="text-heading-0 text-fg">{recipe.name}</h1>
            <button
              type="button"
              onClick={() => onToggleLike(!recipe.liked)}
              aria-label={recipe.liked ? `${recipe.name} 찜 해제` : `${recipe.name} 찜하기`}
              className="relative inline-flex size-10 items-center justify-center before:absolute before:-inset-0.5 before:content-['']"
            >
              <Icon
                name={recipe.liked ? 'heart-filled' : 'heart'}
                size={28}
                aria-hidden
                className="[--color-brand-500:var(--color-brand-300)]"
              />
            </button>
          </div>
          <div className="flex items-center gap-1">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="bg-surface-secondary text-label-m text-fg-secondary inline-flex h-8 items-center rounded-full px-3"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 아코디언 제목의 "N개"는 Figma 원문("4개")이 아래 보유/구매 개수 합(3+4=7)과
            어긋나 있어(디자인 확인 필요), 보유 개수 기준으로 다시 계산해 붙인다. */}
        <AccordionRecipe
          title={`냉장고 속 재료 ${recipe.ownedIngredientCount}개로 요리를 할 수 있어요`}
          ownedCount={recipe.ownedIngredientCount}
          neededCount={recipe.neededIngredientCount}
          ownedItems={recipe.ownedItems}
          ingredients={recipe.ingredients}
        />

        <div className="flex flex-col gap-2">
          <h2 className="text-heading-1 text-fg">만드는 법</h2>
          <ol className="flex flex-col">
            {recipe.steps.map((step, index) => (
              <li key={step} className="flex items-start gap-2 py-2">
                <span className="flex h-7 shrink-0 items-center">
                  <span className="text-caption-m text-fg-inverse bg-surface-tertiary flex size-5 items-center justify-center rounded-full">
                    {index + 1}
                  </span>
                </span>
                <p className="text-label-m text-fg-secondary flex-1 pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-heading-1 text-fg">필요한 재료 구매하기</h2>
          <div className="scrollbar-hide flex gap-3 overflow-x-auto py-3">
            {recipe.neededProducts.map((product) => (
              <ProductMiniCard
                key={product.id}
                imageSrc={product.imageSrc}
                name={product.name}
                priceLabel={product.priceLabel}
                discountLabel={product.discountLabel}
                originalPriceLabel={product.originalPriceLabel}
                onAddToCart={() => addToCart([{ productId: product.id, quantity: 1 }])}
              />
            ))}
          </div>
          <p className="text-label-m text-fg-secondary py-2.5">
            추가 재료를 한번에 장바구니에 담아드릴까요?
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCartSheetOpen(true)}
          className="rounded-m bg-primary text-heading-1 text-fg-inverse flex h-14 w-full items-center justify-center"
        >
          장바구니에 한번에 담기
        </button>
      </div>

      <RecipeCartBottomSheet
        open={cartSheetOpen}
        items={recipe.neededProducts}
        onClose={() => setCartSheetOpen(false)}
        onSubmit={addToCart}
      />
      <RecipeCartAddedBottomSheet open={cartAddedOpen} onClose={() => setCartAddedOpen(false)} />
      <ErrorToastBanner visible={errorToastVisible}>{ADD_TO_CART_ERROR_MESSAGE}</ErrorToastBanner>
    </div>
  );
}

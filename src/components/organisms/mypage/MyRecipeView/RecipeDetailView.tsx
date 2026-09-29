'use client';

import { useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Icon } from '@/components/atoms/Icon';
import { ProductMiniCard } from '@/components/molecules/product/ProductMiniCard';
import { AccordionRecipe } from '@/components/molecules/shared/AccordionRecipe';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';

import type { Recipe } from './model';
import { RecipeCartAddedBottomSheet } from './RecipeCartAddedBottomSheet';
import { RecipeCartBottomSheet } from './RecipeCartBottomSheet';

/**
 * 레시피 상세 화면(자세히보기, node 666-31653 등). 진입 경로가 AI 추천 캐러셀·최근
 * 본 레시피·찜한 레시피로 다양해 `MyFridgeView`의 `leadingHref` 고정 패턴 대신
 * `router.back()`을 쓴다(검색 화면과 같은 이유, MyFridgeView.tsx 주석 참고).
 *
 * 재료 구매 카드의 개별 "담기" 버튼(node 666-31896)은 Figma 스펙대로 활성 상태다 —
 * 클릭하면 하단 "장바구니에 한번에 담기"와 같은 `RecipeCartAddedBottomSheet` 담기
 * 완료 시트를 띄운다(mock 단계라 실제 수량·품목 반영 없이 공용 확인 UI만 재사용).
 */
export interface RecipeDetailViewProps {
  recipe: Recipe;
}

export function RecipeDetailView({ recipe }: RecipeDetailViewProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(recipe.liked);
  const [cartSheetOpen, setCartSheetOpen] = useState(false);
  const [cartAddedOpen, setCartAddedOpen] = useState(false);

  function handleSubmitCart() {
    setCartSheetOpen(false);
    setCartAddedOpen(true);
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
              onClick={() => setLiked((prev) => !prev)}
              aria-label={liked ? `${recipe.name} 찜 해제` : `${recipe.name} 찜하기`}
              className="relative inline-flex size-10 items-center justify-center before:absolute before:-inset-0.5 before:content-['']"
            >
              <Icon
                name={liked ? 'heart-filled' : 'heart'}
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
                onAddToCart={() => setCartAddedOpen(true)}
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
        onSubmit={handleSubmitCart}
      />
      <RecipeCartAddedBottomSheet open={cartAddedOpen} onClose={() => setCartAddedOpen(false)} />
    </div>
  );
}

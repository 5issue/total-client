'use client';

import { useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Icon } from '@/components/atoms/Icon';

import type { Recipe } from './model';

/**
 * "OO님을 위한 AI 추천 레시피" 가로 캐러셀(node 1281-210506/210511, 카드 컴포넌트
 * `CardRecipeRecommend` size=L/M — 디자인 시스템 node 3681-3518/3538). 화면 가운데에
 * 걸린 카드만 L(300×225, 42px CTA)로 커지고 양옆은 M(272×204, 38px CTA)으로 줄어드는
 * "포커스 캐러셀"이다 — 좌우 카드가 화면 가장자리에 살짝 걸쳐 보이도록 앞뒤에 여백
 * 스페이서를 둔다.
 *
 * 카드 폭이 L/M로 계속 바뀌어 고정폭 스냅 계산이 안 맞으므로, 각 카드의 실제
 * DOM 위치(`offsetLeft`)를 읽어 스크롤 컨테이너 중앙에 가장 가까운 카드를
 * `activeIndex`로 잡는다(고정폭 나눗셈 대신).
 *
 * 배경은 이 섹션(제목+캐러셀) 전체를 감싸는 옅은 보라 방사형 그라데이션(node
 * 1281-210506 raw SVG radial-gradient) — 정확한 SVG 대신 근사 CSS
 * `radial-gradient`로 재현했다(디자인 확인 필요, 아이콘/이미지 자산이 아니라 장식용
 * 배경이라 스킬의 "아이콘은 자산 그대로" 규칙 대상이 아님).
 *
 * 카드 자체와 카드 안 "부족 재료 담기" 버튼 모두 상세 화면
 * (`/mypage/fridge/recipes/[recipeId]`)으로 이동한다 — 상세 화면에 이미 같은 목적의
 * 장바구니 담기 흐름이 있어, 이 버튼만 따로 담기를 처리하는 스펙은 Figma에 없다
 * (디자인 확인 필요, 우선 상세 이동으로 간주).
 *
 * 클릭 시 바로 이동하지 않고 `onSelectRecipe`로 알린다 — 이 캐러셀(AI 추천)에서
 * 들어갈 때만 `RecipeAiLoadingView`(node 1343-109131)를 거친다(부모 `MyRecipeView`가
 * 그 로딩 화면을 띄우고 실제 라우팅을 담당). "최근 본"/"찜한" 카드는 그대로 즉시 이동.
 */
export interface RecipeAiRecommendSectionProps {
  nickname: string;
  recipes: Recipe[];
  onSelectRecipe: (recipeId: string) => void;
  className?: string;
}

const CARD_WIDTH_L = 300;
const CARD_WIDTH_M = 272;
const EDGE_SPACE = (402 - CARD_WIDTH_L) / 2;

function IngredientChip({ children }: { children: string }) {
  return (
    <span className="bg-surface-secondary text-caption-m text-fg-secondary inline-flex h-6 items-center rounded-full px-2">
      {children}
    </span>
  );
}

function AiRecommendedRecipeCard({
  recipe,
  active,
  cardRef,
  onSelect,
}: {
  recipe: Recipe;
  active: boolean;
  cardRef: (el: HTMLAnchorElement | null) => void;
  onSelect: () => void;
}) {
  const width = active ? CARD_WIDTH_L : CARD_WIDTH_M;
  const imageHeight = active ? 225 : 204;

  return (
    <Link
      ref={cardRef}
      href={`/mypage/fridge/recipes/${recipe.id}`}
      onClick={(e) => {
        e.preventDefault();
        onSelect();
      }}
      style={{ width }}
      className={`shadow-m flex shrink-0 snap-center flex-col items-start overflow-hidden transition-[width] duration-200 ${active ? 'rounded-lg' : 'rounded-m'}`}
    >
      <div style={{ height: imageHeight }} className="relative w-full shrink-0">
        <Image
          src={recipe.imageSrc}
          alt={recipe.name}
          fill
          sizes={`${CARD_WIDTH_L}px`}
          className="object-cover"
        />
        <div aria-hidden className="bg-fridge-card-scrim pointer-events-none absolute inset-0" />
        <div
          className={`absolute top-5 right-3 left-3 flex items-start justify-between ${active ? 'right-4 left-4' : ''}`}
        >
          <span
            className={
              active
                ? 'bg-overlay text-caption-m inline-flex h-7 items-center rounded-full px-3 text-white opacity-80'
                : 'bg-overlay text-caption-s inline-flex h-6 w-22 items-center justify-center rounded-full text-white opacity-80'
            }
          >
            보유 식재료 {recipe.ownedCount}/{recipe.ownedCount + recipe.neededCount}
          </span>
          <span className="inline-flex size-8 items-center justify-center">
            <Icon name="heart" size={28} aria-hidden className="text-white" />
          </span>
        </div>
      </div>

      <div
        className={`bg-surface flex w-full flex-col ${
          active ? 'gap-4 p-4' : 'items-center gap-5 px-3 pt-3 pb-5'
        }`}
      >
        <div className="flex w-full flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className={`text-fg truncate ${active ? 'text-heading-4' : 'text-label-m'}`}>
              {recipe.name}
            </p>
            <p className="text-caption-m text-fg-secondary line-clamp-2">{recipe.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {recipe.ingredients.slice(0, 4).map((ingredient) => (
              <IngredientChip key={ingredient.name}>{ingredient.name}</IngredientChip>
            ))}
          </div>
        </div>
        <span
          className={`rounded-m bg-primary text-fg-inverse flex w-full items-center justify-center ${
            active ? 'text-heading-4 h-10.5' : 'text-label-m h-9.5'
          }`}
        >
          부족 재료 담기 {recipe.missingIngredientsPriceLabel}
        </span>
      </div>
    </Link>
  );
}

export function RecipeAiRecommendSection({
  nickname,
  recipes,
  onSelectRecipe,
  className,
}: RecipeAiRecommendSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  function handleScroll() {
    const container = scrollRef.current;
    if (!container) return;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;
    cardRefs.current.forEach((el, index) => {
      if (!el) return;
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const distance = Math.abs(cardCenter - containerCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    setActiveIndex(closestIndex);
  }

  return (
    <div
      className={['relative flex flex-col gap-2 overflow-hidden pt-2 pb-5', className]
        .filter(Boolean)
        .join(' ')}
      style={{
        backgroundImage:
          'radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--color-primary) 22%, transparent) 0%, color-mix(in srgb, var(--color-primary) 10%, transparent) 45%, transparent 75%)',
      }}
    >
      {/* 장식용 반짝임 그래픽(node 1281-210502) — 헤더 바로 아래, 그라데이션 우측 상단에
          화면 밖으로 살짝 걸치게 배치(Figma 실측 left:295 in 402px 프레임 → 우측
          기준 역산). 콘텐츠와 무관한 순수 장식이라 `aria-hidden`. */}
      <Image
        src="/mypage/recipe-ai-sparkle.svg"
        alt=""
        aria-hidden
        width={152}
        height={170}
        style={{ top: -5, right: -45 }}
        className="pointer-events-none absolute select-none"
      />

      <div className="flex flex-col gap-2 px-5 pt-8 pb-5">
        <p className="text-display-xs text-fg font-semibold">
          {nickname}님을 위한 <span className="text-primary">AI 추천 레시피</span>
        </p>
        <p className="text-body-m text-fg-secondary">
          보유하신 식재료를 활용해 완성할 수 있는 추천 메뉴입니다.
        </p>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="scrollbar-hide flex snap-x snap-mandatory items-center gap-4 overflow-x-auto"
      >
        <div style={{ width: EDGE_SPACE }} className="shrink-0" aria-hidden />
        {recipes.map((recipe, index) => (
          <AiRecommendedRecipeCard
            key={recipe.id}
            recipe={recipe}
            active={index === activeIndex}
            cardRef={(el) => {
              cardRefs.current[index] = el;
            }}
            onSelect={() => onSelectRecipe(recipe.id)}
          />
        ))}
        <div style={{ width: EDGE_SPACE }} className="shrink-0" aria-hidden />
      </div>

      <div className="flex items-center justify-center gap-2 pt-2">
        {recipes.map((recipe, index) => (
          <span
            key={recipe.id}
            aria-hidden
            className={`size-2 rounded-full ${index === activeIndex ? 'bg-fg' : 'bg-fg/30'}`}
          />
        ))}
      </div>
    </div>
  );
}

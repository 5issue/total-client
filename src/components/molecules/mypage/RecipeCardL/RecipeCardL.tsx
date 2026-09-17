'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Checkbox } from '@/components/atoms/Checkbox';
import { Icon } from '@/components/atoms/Icon';
import type { RecipeCardSummary } from '@/components/organisms/mypage/MyRecipeView/model';

/**
 * "최근 본 레시피"/"찜한 레시피" 전체보기 그리드 카드(180px, Figma "RecipeCardL"
 * node 666-32111 등). 체크박스 오버레이는 `selectable`일 때만(최근 본 레시피 —
 * 선택삭제), 찜한 레시피 목록은 하트만 있고 체크박스가 없다.
 *
 * 체크박스는 Figma 카드 오버레이 스펙(32px 히트박스, 24px 프레임, node 666-31940)
 * 기준 — `Checkbox` `size={28}`(프레임 28, 실 박스 22px)를 44px 터치 타깃 그대로
 * 이미지 좌상단에 놓으면 글리프가 (11,11) 부근에 온다(레드라인 실측). 추가 보정 불필요.
 */
export interface RecipeCardLProps {
  recipe: RecipeCardSummary;
  selectable?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onToggleLike: (liked: boolean) => void;
  className?: string;
}

export function RecipeCardL({
  recipe,
  selectable = false,
  checked = false,
  onCheckedChange,
  onToggleLike,
  className,
}: RecipeCardLProps) {
  return (
    <div className={['flex w-45 flex-col items-start gap-1', className].filter(Boolean).join(' ')}>
      <div className="relative size-45 shrink-0">
        <div className="absolute inset-0 overflow-hidden rounded-sm">
          <Link href={`/mypage/fridge/recipes/${recipe.id}`} className="absolute inset-0">
            <Image
              src={recipe.imageSrc}
              alt={recipe.name}
              fill
              sizes="180px"
              className="object-cover"
            />
          </Link>
          {/* 체크박스(unchecked)·하트 아이콘이 어떤 사진 위에서도 보이도록 스크림을
              둔다 — `KitchenInventoryCard`와 같은 이유(#111 QA, 체크박스 filled
              unchecked 배경이 카드 배경과 같은 색이라 스크림 없이는 실사용 색상
              대비를 보장 못 함). 토큰명은 "fridge"지만 사진 위 범용 스크림이라 그대로 재사용. */}
          <div aria-hidden className="bg-fridge-card-scrim pointer-events-none absolute inset-0" />
        </div>
        {selectable ? (
          <span className="absolute top-0 left-0">
            <Checkbox
              variant="filled"
              size={28}
              label={`${recipe.name} 선택`}
              checked={checked}
              onChange={(e) => onCheckedChange?.(e.target.checked)}
            />
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => onToggleLike(!recipe.liked)}
          aria-label={recipe.liked ? `${recipe.name} 찜 해제` : `${recipe.name} 찜하기`}
          className="absolute top-2 right-2 inline-flex size-8 items-center justify-center"
        >
          {/* 찜 색상 Brand/Medium(#c16edd = brand-300) — `heart-filled`는 themable:false로
              SVG에 `var(--color-brand-500)`가 박혀 있어, `AddToCartActions`와 같은 방법으로
              이 서브트리에서만 그 커스텀 프로퍼티를 brand-300으로 지역 재정의한다. */}
          <Icon
            name={recipe.liked ? 'heart-filled' : 'heart'}
            size={28}
            aria-hidden
            className="[--color-brand-500:var(--color-brand-300)]"
          />
        </button>
      </div>

      <div className="flex w-full flex-col items-start justify-center gap-2 pt-1">
        <div className="flex w-full flex-col items-start">
          <p className="text-label-m text-fg w-full truncate">{recipe.name}</p>
          <div className="flex h-5 items-center gap-1">
            <span className="text-caption-m text-fg-secondary">
              보유재료 {recipe.ownedIngredientCount}개
            </span>
            <span aria-hidden className="bg-border h-3 w-px" />
            <span className="text-caption-m text-fg-secondary">
              필요재료 {recipe.neededIngredientCount}개
            </span>
          </div>
        </div>
        <Link
          href={`/mypage/fridge/recipes/${recipe.id}`}
          className="text-label-m text-primary flex h-9 items-center gap-1"
        >
          레시피 보기
          <Icon name="right" size={20} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

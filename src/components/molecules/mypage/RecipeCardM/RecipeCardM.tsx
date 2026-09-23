import Image from 'next/image';
import Link from 'next/link';

import { RecipeIngredientCounts } from '@/components/molecules/mypage/RecipeIngredientCounts';
import type { RecipeCardSummary } from '@/components/organisms/mypage/MyRecipeView/model';

/**
 * MY 레시피 메인의 가로 스크롤 카드(144px, Figma "RecipeCardM" node 1281-210539).
 * "최근 본 레시피"/"찜한 레시피" 섹션에서 공유한다.
 */
export interface RecipeCardMProps {
  recipe: RecipeCardSummary;
  className?: string;
}

export function RecipeCardM({ recipe, className }: RecipeCardMProps) {
  return (
    <Link
      href={`/mypage/fridge/recipes/${recipe.id}`}
      className={['flex w-36 shrink-0 flex-col items-start', className].filter(Boolean).join(' ')}
    >
      <div className="relative size-36 shrink-0 overflow-hidden rounded-sm">
        <Image
          src={recipe.imageSrc}
          alt={recipe.name}
          fill
          sizes="144px"
          className="object-cover"
        />
      </div>
      <div className="flex w-full flex-col items-start justify-center pt-1">
        <p className="text-label-m text-fg w-full truncate">{recipe.name}</p>
        <RecipeIngredientCounts
          ownedCount={recipe.ownedIngredientCount}
          neededCount={recipe.neededIngredientCount}
        />
      </div>
    </Link>
  );
}

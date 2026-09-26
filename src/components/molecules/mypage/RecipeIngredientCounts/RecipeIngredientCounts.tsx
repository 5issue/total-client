/** "보유재료 N개 | 필요재료 M개" 행 — `RecipeCardM`/`RecipeCardL`가 공유한다. */
export interface RecipeIngredientCountsProps {
  ownedCount: number;
  neededCount: number;
}

export function RecipeIngredientCounts({ ownedCount, neededCount }: RecipeIngredientCountsProps) {
  return (
    <div className="flex h-5 items-center gap-1">
      <span className="text-caption-m text-fg-secondary">보유재료 {ownedCount}개</span>
      <span aria-hidden className="bg-border h-3 w-px" />
      <span className="text-caption-m text-fg-secondary">필요재료 {neededCount}개</span>
    </div>
  );
}

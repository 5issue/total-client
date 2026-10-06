import {
  ProductIngredientsList,
  type ProductIngredientsListProps,
} from '@/components/molecules/product/ProductIngredientsList';

/**
 * "Check Point" 섹션 (organism). Figma "5팀 UI 공유용" `Frame 2117906248`
 * (node 665:43705) — `ProductCheckPointHeader` + `ProductIngredientsList` 반복.
 * 상품마다 소제목·불릿 개수가 다른 데이터라 배열로 받는다.
 */
export type ProductCheckPointSectionProps = {
  groups: Omit<ProductIngredientsListProps, 'className'>[];
  className?: string;
};

export function ProductCheckPointSection({ groups, className }: ProductCheckPointSectionProps) {
  return (
    <div
      className={['flex w-full flex-col items-start gap-4', className].filter(Boolean).join(' ')}
    >
      <p className="text-display-xs text-fg flex h-10 items-center px-4">Check Point</p>
      {groups.map((group) => (
        <ProductIngredientsList key={group.title} title={group.title} items={group.items} />
      ))}
    </div>
  );
}

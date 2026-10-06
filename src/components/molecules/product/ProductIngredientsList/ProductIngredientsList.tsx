import { Icon } from '@/components/atoms/Icon';

/**
 * "Check Point" 섹션의 소제목 + 불릿 목록 한 묶음 (molecule). Figma "5팀 UI 공유용"
 * `ProductIngredientsList`(node 1233:114195) — "재료와 성분"/"생산 유통 과정"/
 * "활용법"/"브랜드와 생산자" 등 상품마다 다른 개수로 반복된다.
 *
 * 불릿(Figma "Dot", node 665:42415)은 16×24 비정사각 전용 에셋이라 `Icon` atom에 그대로
 * 넣으면(`size`가 width/height를 동일하게 그려서) 찌그러진다(이 세션에서 반복 확인된
 * 함정) — 새 에셋을 받는 대신 단순 텍스트 불릿으로 대체했다.
 */
export type ProductIngredientsListProps = {
  title: string;
  items: string[];
  className?: string;
};

export function ProductIngredientsList({ title, items, className }: ProductIngredientsListProps) {
  return (
    <div
      className={['flex w-full flex-col items-start gap-2', className].filter(Boolean).join(' ')}
    >
      <div className="flex items-center gap-1 px-4">
        <Icon name="check" size={20} aria-hidden />
        <p className="text-heading-2 text-fg">{title}</p>
      </div>
      {items.map((item) => (
        <div key={item} className="flex w-full items-start gap-1 px-3">
          <span aria-hidden className="text-fg flex h-6 w-4 shrink-0 items-center justify-center">
            •
          </span>
          {/* body-s(15/400) — Figma Body_S_Regular. body-m 은 프로젝트 토큰이 500(Medium)
              이라 이 항목(Regular)과 안 맞는다. */}
          <p className="text-body-s text-fg">{item}</p>
        </div>
      ))}
    </div>
  );
}

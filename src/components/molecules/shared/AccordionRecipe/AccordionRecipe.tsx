import Image from 'next/image';

import { Accordion } from '@/components/molecules/shared/Accordion';

/**
 * 보유 재료 기반 레시피 추천 아코디언 (molecule).
 * Figma "5팀 디자인 시스템" — node 2415-5383 "Accordion_Recipe".
 *
 * `Accordion` 셸을 쓰되 컨테이너가 컬러 카드(`surface-secondary`)이고, 펼치면
 * "보유 중" 상품 블록 + "사용 재료" 2열 표를 보여준다. 데이터는 props.
 */
export interface AccordionRecipeIngredient {
  name: string;
  amount: string;
}

export interface AccordionRecipeOwnedItem {
  name: string;
  badge?: string;
  /**
   * 썸네일 이미지. `public/` 기준 내부 절대 경로(`/…`)만 지원한다.
   * 외부 URL 은 `next.config` `images.remotePatterns` 설정이 필요해 렌더하지 않고
   * placeholder 로 대체된다.
   */
  thumbnailUrl?: string;
}

export interface AccordionRecipeProps {
  title: string;
  ownedCount: number;
  neededCount: number;
  ownedItems: AccordionRecipeOwnedItem[];
  ingredients: AccordionRecipeIngredient[];
  defaultOpen?: boolean;
  className?: string;
}

function IngredientColumn({ rows }: { rows: AccordionRecipeIngredient[] }) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      {rows.map((ing) => (
        <div key={ing.name} className="flex items-center justify-between">
          <span className="text-label-xs text-fg-tertiary">{ing.name}</span>
          <span className="text-label-m text-fg-secondary">{ing.amount}</span>
        </div>
      ))}
    </div>
  );
}

export function AccordionRecipe({
  title,
  ownedCount,
  neededCount,
  ownedItems,
  ingredients,
  defaultOpen = false,
  className,
}: AccordionRecipeProps) {
  const half = Math.ceil(ingredients.length / 2);
  const left = ingredients.slice(0, half);
  const right = ingredients.slice(half);

  return (
    <Accordion
      defaultOpen={defaultOpen}
      className={['bg-surface-secondary rounded-xl p-4', className].filter(Boolean).join(' ')}
      headerClassName="items-start gap-3"
      header={
        <span className="flex flex-col">
          <span className="text-heading-1 text-fg">{title}</span>
          <span className="text-heading-6 flex items-center gap-1">
            <span className="text-fg-tertiary">보유 중</span>
            <span className="text-fg-secondary">{ownedCount}개</span>
            <span className="text-fg-quaternary mx-0.5">|</span>
            <span className="text-fg-tertiary">구매 필요</span>
            <span className="text-fg-secondary">{neededCount}개</span>
          </span>
        </span>
      }
    >
      <div className="flex flex-col gap-3 pt-3">
        <section className="flex flex-col gap-1">
          <p className="text-heading-6 text-fg-tertiary">보유 중</p>
          {ownedItems.map((item, i) => (
            <div
              key={`${item.name}-${i}`}
              className="border-border bg-surface rounded-m flex items-center gap-2 border px-3 py-2"
            >
              <div className="bg-fg-disabled relative size-15 shrink-0 overflow-hidden rounded-s">
                {item.thumbnailUrl?.startsWith('/') ? (
                  <Image
                    src={item.thumbnailUrl}
                    alt=""
                    fill
                    sizes="60px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                {item.badge ? (
                  <span className="bg-surface-secondary text-caption-m text-fg-secondary inline-flex h-6 items-center self-start rounded-full px-2">
                    {item.badge}
                  </span>
                ) : null}
                <p className="text-body-m text-fg truncate">{item.name}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-1">
          <p className="text-heading-6 text-fg-tertiary">사용 재료</p>
          <div className="bg-surface flex gap-3 rounded-l px-3 py-2.5">
            <IngredientColumn rows={left} />
            {right.length > 0 ? <div className="bg-border w-px shrink-0 self-stretch" /> : null}
            {right.length > 0 ? <IngredientColumn rows={right} /> : null}
          </div>
        </section>
      </div>
    </Accordion>
  );
}

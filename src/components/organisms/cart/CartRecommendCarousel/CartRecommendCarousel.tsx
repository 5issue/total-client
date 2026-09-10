'use client';

import { useState } from 'react';

import { Button } from '@/components/atoms/Button';
import { Pagination } from '@/components/molecules/shared/Pagination';
import type { RecommendProductView } from '@/components/organisms/cart/model';

/**
 * "지금 장바구니에 많이 담기는 상품" 캐러셀 (organism).
 * Figma "5팀 UI 공유용" — `Card_Cart_Reccomend` (node 188-9499). 3×2 그리드 페이지네이션.
 *
 * 토큰(node 188-9499): 카드 `Surface/Base` `Radius/XL`16 `px-4 py-5` `gap-6`,
 * 제목 `Heading/H4_SemiBold` → `text-heading-4 text-fg`, 부제·상품명 `Label/XS_Regular`
 * → `text-label-xs`, 가격 `Caption/L`(12/600) → `text-caption-l`.
 * `Item_V_XS` 카드마다 이미지와 상품명 사이에 담기 버튼(Button xs/outlineBlack, h-32).
 * 페이지네이션은 `molecules/shared/Pagination` — 화살표 글리프가 이동 가능 여부에 따라
 * 진하게(#222)/연하게 바뀐다(node 188-9652: 비활성 prev 는 연한 톤, 활성 next 는 Text/Primary).
 */
export interface CartRecommendCarouselProps {
  items: RecommendProductView[];
  onAdd: (id: string) => void;
  className?: string;
}

const PAGE_SIZE = 6;

export function CartRecommendCarousel({ items, onAdd, className }: CartRecommendCarouselProps) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const visible = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <section
      className={['bg-surface flex flex-col gap-6 rounded-xl px-4 py-5', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex flex-col">
        <h2 className="text-heading-4 text-fg">지금 장바구니에 많이 담기는 상품</h2>
        <p className="text-label-xs text-fg-tertiary">
          실시간 고객들이 많이 담는 상품을 모아봤어요
        </p>
      </div>

      <ul className="grid grid-cols-3 gap-x-3 gap-y-5">
        {visible.map((item) => (
          <li key={item.id} className="flex flex-col gap-1">
            {/* 퍼블리싱 단계 — 실제 썸네일은 데이터 연동 시 next/image 로 교체 */}
            <div aria-hidden className="bg-surface-secondary aspect-square w-full rounded-sm" />
            <Button
              size="xs"
              variant="outlineBlack"
              leadingIcon="cart"
              onClick={() => onAdd(item.id)}
              aria-label={`${item.name} 담기`}
              className="w-full"
            >
              담기
            </Button>
            <p className="text-label-xs text-fg line-clamp-2">{item.name}</p>
            <p className="text-caption-l flex items-center gap-1">
              {item.discountPercent !== undefined ? (
                <span className="text-orange">{item.discountPercent}%</span>
              ) : null}
              <span className="text-fg">{item.price.toLocaleString('ko-KR')}원</span>
            </p>
          </li>
        ))}
      </ul>

      {pageCount > 1 ? (
        <Pagination
          className="justify-center"
          current={page + 1}
          total={pageCount}
          onPrevious={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
        />
      ) : null}
    </section>
  );
}

'use client';

import { useState } from 'react';

import { CarouselArrow } from '@/components/atoms/CarouselArrow';
import type { RecommendProductView } from '@/components/organisms/cart/model';

/**
 * "지금 장바구니에 많이 담기는 상품" 캐러셀 (organism).
 * Figma "5팀 UI 공유용" — `Card_Cart_Reccomend` (node 2636-2800). 3×2 그리드 페이지네이션.
 * 표시·페이지 이동만 — 상품 클릭 동작은 이번 퍼블리싱 범위 밖.
 */
export interface CartRecommendCarouselProps {
  items: RecommendProductView[];
  className?: string;
}

const PAGE_SIZE = 6;

export function CartRecommendCarousel({ items, className }: CartRecommendCarouselProps) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const visible = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <section
      className={[
        'bg-surface border-border flex flex-col gap-5 rounded-xl border px-4 py-5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-heading-4 text-fg">지금 장바구니에 많이 담기는 상품</h2>
        <p className="text-label-m text-fg-tertiary">실시간 고객들이 많이 담는 상품을 모아봤어요</p>
      </div>

      <ul className="grid grid-cols-3 gap-x-2 gap-y-4">
        {visible.map((item) => (
          <li key={item.id} className="flex flex-col gap-1">
            {/* 퍼블리싱 단계 — 실제 썸네일은 데이터 연동 시 next/image 로 교체 */}
            <div aria-hidden className="bg-surface-secondary aspect-square w-full rounded-s" />
            <p className="text-label-xs text-fg line-clamp-2">{item.name}</p>
            <p className="text-label-xl flex items-center gap-1">
              {item.discountPercent !== undefined ? (
                <span className="text-orange">{item.discountPercent}%</span>
              ) : null}
              <span className="text-fg">{item.price.toLocaleString('ko-KR')}원</span>
            </p>
          </li>
        ))}
      </ul>

      {pageCount > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="이전 상품"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="disabled:opacity-30"
          >
            <CarouselArrow direction="left" aria-hidden />
          </button>
          <span className="text-label-m text-fg-tertiary tabular-nums">
            {page + 1} / {pageCount}
          </span>
          <button
            type="button"
            aria-label="다음 상품"
            disabled={page === pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className="disabled:opacity-30"
          >
            <CarouselArrow direction="right" aria-hidden />
          </button>
        </div>
      ) : null}
    </section>
  );
}

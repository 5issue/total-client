'use client';

import { useState } from 'react';

import { Button } from '@/components/atoms/Button';
import { PageIndicator } from '@/components/atoms/PageIndicator';
import type { RecommendProductView } from '@/components/organisms/cart/model';

/**
 * 빈 장바구니 아래 "자주 구매하는 상품 · 담기 쉬운 상품" 그리드 (organism).
 * Figma "5팀 UI 공유용" — 빈 장바구니(node 188-8824)의 추천 그리드.
 * 3열 그리드 + 점 페이지네이션. 담기 동작만 알린다.
 */
export interface CartFrequentProductsProps {
  items: RecommendProductView[];
  onAdd: (id: string) => void;
  className?: string;
}

const PAGE_SIZE = 6;

export function CartFrequentProducts({ items, onAdd, className }: CartFrequentProductsProps) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const visible = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <section className={['flex flex-col gap-4 px-4 py-5', className].filter(Boolean).join(' ')}>
      <h2 className="text-heading-4 text-fg">자주 구매하는 상품 · 담기 쉬운 상품</h2>

      <ul className="grid grid-cols-3 gap-x-2 gap-y-5">
        {visible.map((item) => (
          <li key={item.id} className="flex flex-col gap-1">
            <div aria-hidden className="bg-surface-secondary aspect-square w-full rounded-s" />
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
            <p className="text-label-l flex items-center gap-1">
              {item.discountPercent !== undefined ? (
                <span className="text-orange">{item.discountPercent}%</span>
              ) : null}
              <span className="text-fg">{item.price.toLocaleString('ko-KR')}원</span>
            </p>
          </li>
        ))}
      </ul>

      {pageCount > 1 ? (
        <PageIndicator
          count={pageCount}
          activeIndex={page}
          aria-label={`추천 상품 ${pageCount}쪽 중 ${page + 1}쪽`}
          className="mx-auto"
        />
      ) : null}

      {/* 점 인디케이터는 표시 전용이라 페이지 이동 컨트롤을 따로 둔다(스와이프는 데이터 연동 시) */}
      {pageCount > 1 ? (
        <div className="flex justify-center gap-4">
          <button
            type="button"
            aria-label="이전"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="text-label-m text-fg-tertiary disabled:opacity-30"
          >
            이전
          </button>
          <button
            type="button"
            aria-label="다음"
            disabled={page === pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className="text-label-m text-fg-tertiary disabled:opacity-30"
          >
            다음
          </button>
        </div>
      ) : null}
    </section>
  );
}

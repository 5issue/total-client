'use client';

import { useState } from 'react';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Pagination } from '@/components/molecules/shared/Pagination';

/**
 * 주문 완료 화면의 추천 상품 캐러셀 (organism).
 * Figma "5팀 UI 공유용" — `Card_Cart_Reccomend`(node 666-26314), 3×2 그리드 페이지네이션.
 *
 * 장바구니의 `organisms/cart/CartRecommendCarousel` 과 Figma 상 같은 컴포넌트 계열이지만
 * 하나로 합치지 않았다 — 장바구니 쪽 원본 노드(188-9499)가 파일에서 삭제돼 두 인스턴스의
 * 간격 차이(제목↔그리드 24px vs 16px)가 의도인지 확인할 수 없어서다. 이미 머지된 장바구니
 * 화면의 여백을 검증 없이 바꾸는 대신, 공용 조각(`Pagination`·`Button`)만 재사용한다.
 * 장바구니 노드가 복구되면 그때 하나로 합치는 게 맞다.
 *
 * 토큰(node 666-26314 실측): 카드 `Surface/Base`·`Radius/XL`16·`px-4 py-5`·`gap-6`,
 * 제목 `Heading/H4_SemiBold` → `text-heading-4 text-fg`, 제목↔그리드 `Gap/M`16,
 * 그리드 행 간격 `Gap/L`20, 카드 폭 108(= (370−32−7×2)/3)이라 열 간격은 `gap-x-[7px]`.
 * 상품명 `Label/XS_Regular` → `text-label-xs`, 가격 `Caption/L`(12/600) → `text-caption-l`,
 * 할인율 `Custom/orange`(#fa622f) → `text-orange`.
 */
export interface OrderRecommendProductView {
  id: string;
  name: string;
  /** 판매가 표기 — Figma 에 `4,100원~` 처럼 물결이 붙는 항목이 있어 숫자가 아니라 문자열이다. */
  priceLabel: string;
  /** 할인율 표기(예: `20%`). 없으면 가격만 보여준다. */
  discountLabel?: string;
}

export interface OrderRecommendCarouselProps {
  items: OrderRecommendProductView[];
  className?: string;
}

const PAGE_SIZE = 6;

export function OrderRecommendCarousel({ items, className }: OrderRecommendCarouselProps) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const visible = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <section
      className={['bg-surface relative flex flex-col gap-6 rounded-xl px-4 py-5', className]
        .filter(Boolean)
        .join(' ')}
    >
      {/* "전체보기" — Figma 는 카드 우상단에 절대배치(left 278 / top 12, 카드 오른쪽 끝에서 8px).
          목적지가 아직 없어 비배선 표시만 한다(`SectionHeader` 의 action `pending` 과 같은 규칙) —
          동작 없는 <button>/<a> 를 만들지 않으려고 <span> 으로 둔다. 연결은 추천 목록 화면 작업 때. */}
      <span
        aria-hidden
        className="text-label-l text-primary absolute top-3 right-2 inline-flex items-center gap-1 py-2 pl-1"
      >
        전체보기
        <Icon name="arrow-right" size={20} aria-hidden />
      </span>

      <div className="flex flex-col gap-4">
        <h2 className="text-heading-4 text-fg">한 개만 사도 무료배송</h2>

        <ul className="grid grid-cols-3 gap-x-[7px] gap-y-5">
          {visible.map((item) => (
            <li key={item.id} className="flex flex-col gap-1">
              {/* 퍼블리싱 단계 — 실제 썸네일은 데이터 연동 시 next/image 로 교체
                  (장바구니 추천 캐러셀과 같은 처리). */}
              <div aria-hidden className="bg-surface-secondary aspect-square w-full rounded-sm" />
              {/* 담기: 장바구니 연동 전이라 아직 핸들러가 없다(무동작). Figma 에 비활성 상태가
                  없어 시각은 기본형 그대로 두고, 연동은 장바구니 담기 작업 때 배선한다.
                  Button 의 기본 radius 는 8px 이라 Figma `Radius/S`(4px)로 덮어쓴다. */}
              <Button
                size="xs"
                variant="outlineBlack"
                leadingIcon="cart"
                aria-label={`${item.name} 담기`}
                className="w-full rounded-sm!"
              >
                담기
              </Button>
              <p className="text-label-xs text-fg line-clamp-2">{item.name}</p>
              <p className="text-caption-l flex items-center gap-1">
                {item.discountLabel ? (
                  <span className="text-orange">{item.discountLabel}</span>
                ) : null}
                <span className="text-fg">{item.priceLabel}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>

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

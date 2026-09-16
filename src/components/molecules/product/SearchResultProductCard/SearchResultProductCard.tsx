'use client';

import Image from 'next/image';

import { Badge } from '@/components/atoms/Badge';
import { Icon } from '@/components/atoms/Icon';
import { formatPrice } from '@/lib/formatters';

/**
 * 검색 결과 상품 카드 (Figma "Item_V_XL", node 882-60584 — 402px 프레임 기준 180×428).
 *
 * `molecules/product/ProductCard`(홈 진열 섹션 전용, node 577:20684, 고정폭 150px)와
 * 이름이 겹칠 뻔해 분리했다(#90/#85 병합 시 같은 경로에 서로 다른 카드 두 개가 add/add
 * 충돌 — 폭 전략(고정 vs 그리드 셀)과 prop 형태(포맷된 문자열 vs 원시 숫자)가 달라
 * 하나로 합칠 수 없는 별개 컴포넌트였다, 2026-09-16). 이 카드는 검색 결과 전용.
 *
 * 폭은 고정값이 아니라 `w-full` 이다 — 실제 폭은 `ProductGrid` 의 `grid-cols-2` 가 정하고,
 * 이미지는 `aspect-3/4`(Figma 실측 180:240)로 그에 비례해 늘어난다. `ProductMiniCard`
 * ("Item_V_S")와는 정보량이 달라(리뷰수·쿠폰뱃지·Kurly Only뱃지) 재사용하지 않는다.
 *
 * 쿠폰 뱃지는 `Badge color="cyan" size="medium"` 스펙과 일치해 그대로 쓰지만, "Kurly Only"
 * 뱃지는 overlay-blue 배경 + brand primary 텍스트 조합을 `Badge` 가 지원하지 않아 전용
 * 마크업으로 둔다. 가격 뒤 "~" 는 옵션에 따라 최저가부터라는 표기로, Figma 전 인스턴스에
 * 동일하게 붙어 있어 고정 접미사다.
 */
export type SearchResultProductCardProps = {
  imageSrc: string;
  name: string;
  /** 최종 판매가. */
  price: number;
  /** 할인 전 정가. `discountRate` 와 함께 있을 때만 취소선으로 노출한다. */
  originalPrice?: number | null;
  /** 할인율(예: 25 → "25%"). */
  discountRate?: number | null;
  /** 리뷰 개수. 9999 이상은 "9,999+" 로 표기. */
  reviewCount?: number | null;
  /** 배송 타입 라벨(예: "샛별배송"). */
  deliveryType: string;
  /** 쿠폰 할인 뱃지 텍스트(예: "+25%쿠폰"). 없으면 미노출. */
  couponBadgeLabel?: string | null;
  /** 컬리멤버스 전용 상품 뱃지 노출 여부. */
  kurlyOnly?: boolean;
  onAddToCart?: () => void;
  className?: string;
};

function formatReviewCount(count: number): string {
  return count >= 9999 ? '9,999+' : count.toLocaleString('ko-KR');
}

export function SearchResultProductCard({
  imageSrc,
  name,
  price,
  originalPrice,
  discountRate,
  reviewCount,
  deliveryType,
  couponBadgeLabel,
  kurlyOnly = false,
  onAddToCart,
  className,
}: SearchResultProductCardProps) {
  const hasDiscount = Boolean(discountRate && originalPrice);

  return (
    <div className={['flex w-full flex-col gap-1', className].filter(Boolean).join(' ')}>
      <div className="bg-surface-secondary relative aspect-3/4 w-full overflow-hidden rounded-sm">
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="(max-width: 480px) 45vw, 180px"
          className="object-cover"
        />
        {couponBadgeLabel ? (
          <Badge color="cyan" size="medium" className="absolute top-2 left-2">
            {couponBadgeLabel}
          </Badge>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onAddToCart}
        aria-label={`${name} 장바구니 담기`}
        className="text-label-m text-fg active:bg-surface-secondary border-border flex h-8 w-full items-center justify-center gap-1 rounded-sm border font-semibold"
      >
        <Icon name="cart" size={20} aria-hidden />
        담기
      </button>

      <div className="flex w-full flex-col">
        <p className="text-caption-m text-fg-tertiary w-full">{deliveryType}</p>
        <p className="text-body-m text-fg line-clamp-2 w-full">{name}</p>
        {hasDiscount ? (
          <p className="text-caption-m text-fg-tertiary font-bold line-through">
            {formatPrice(originalPrice as number)}
          </p>
        ) : null}
        <div className="text-numeric-l font-numeric flex items-center gap-1">
          {hasDiscount ? <span className="text-orange">{discountRate}%</span> : null}
          <span className="text-fg">{formatPrice(price)}~</span>
        </div>
        <div className="flex items-center gap-1">
          <Icon name="review" size={16} aria-hidden />
          <span className="text-label-m text-fg-tertiary">
            {formatReviewCount(reviewCount ?? 0)}
          </span>
        </div>
      </div>

      {kurlyOnly ? (
        <span className="bg-overlay-blue text-primary text-caption-s w-fit rounded-sm px-2 py-1 font-bold whitespace-nowrap">
          Kurly Only
        </span>
      ) : null}
    </div>
  );
}

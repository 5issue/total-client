'use client';

import Image from 'next/image';

import { Badge } from '@/components/atoms/Badge';
import { Icon } from '@/components/atoms/Icon';
import { StatusLabel } from '@/components/molecules/shared/StatusLabel';

/**
 * 홈 진열 섹션 상품 카드 (molecule). Figma "HomeScreen" > "Product Item"
 * (node 577:20684, 150~249px 유동폭 × 428px).
 *
 * `molecules/product/ProductMiniCard`(AI 챗용, node 2456-5629)와는 스펙이 달라
 * 재사용하지 않는다 — 이 카드만 쿠폰 배지·리뷰 수·"Kurly Only" 태그를 갖는다.
 * 쿠폰 배지는 `atoms/Badge`(color="cyan" size="medium" — 실측 padding 4px 전방향과
 * 일치), "Kurly Only" 태그는 `molecules/shared/StatusLabel`(type="kurlyOnly")을
 * 그대로 재사용한다.
 *
 * 이 카드에는 찜(하트) 아이콘이 없다 — get_design_context 로 이 노드를 직접
 * 확인한 결과, 쿠폰 배지 자리 외에 위시리스트 토글은 존재하지 않는다(초기 이슈
 * 초안 작성 시의 가정을 역질문 없이 수정 — 실제 스펙 확인 후 정정).
 *
 * `imageSrc` 미지정 시 회색 박스로 대체한다(퍼블리싱 단계 관례, `CartLineItem` 참고).
 */
export type ProductCardProps = {
  imageSrc?: string;
  imageAlt: string;
  /** 배송 타입 라벨(예: "샛별배송"). */
  deliveryLabel: string;
  name: string;
  /** 정가 숫자만(예: "3,400") — "원" 접미사는 컴포넌트가 붙이고, 숫자만 취소선 처리한다(Figma 실측). */
  originalPriceLabel?: string;
  /** 할인율(예: "25%"). */
  discountLabel?: string;
  /** 최종 판매가 표기(예: "2,780원~"). */
  priceLabel: string;
  /** 리뷰 수(예: "9,999+"). */
  reviewCountLabel: string;
  /** 쿠폰 할인율(예: "+25%"). 있으면 이미지 위 좌상단에 쿠폰 배지를 렌더한다. */
  couponPercentLabel?: string;
  kurlyOnly?: boolean;
  onAddToCart?: () => void;
  className?: string;
};

export function ProductCard({
  imageSrc,
  imageAlt,
  deliveryLabel,
  name,
  originalPriceLabel,
  discountLabel,
  priceLabel,
  reviewCountLabel,
  couponPercentLabel,
  kurlyOnly = false,
  onAddToCart,
  className,
}: ProductCardProps) {
  return (
    <div className={['flex w-37.5 shrink-0 flex-col gap-1', className].filter(Boolean).join(' ')}>
      <div className="relative h-60 w-full overflow-hidden rounded-sm">
        {imageSrc ? (
          <Image src={imageSrc} alt={imageAlt} fill sizes="150px" className="object-cover" />
        ) : (
          <div aria-hidden className="bg-surface-secondary absolute inset-0" />
        )}
        {couponPercentLabel ? (
          <Badge color="cyan" size="medium" className="absolute top-2 left-2">
            <span className="font-numeric">{couponPercentLabel}</span>쿠폰
          </Badge>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onAddToCart}
        aria-label={`${name} 장바구니 담기`}
        className="text-label-l text-fg active:bg-surface-secondary flex h-8 w-full items-center justify-center gap-1 rounded-sm border border-neutral-400"
      >
        <Icon name="cart" size={20} aria-hidden />
        담기
      </button>

      <div className="flex w-full flex-col">
        <p className="text-caption-m text-fg-tertiary">{deliveryLabel}</p>
        <p className="text-body-m text-fg line-clamp-2 w-full">{name}</p>
        {originalPriceLabel ? (
          <p className="text-caption-m text-fg-tertiary font-bold">
            <span className="line-through">{originalPriceLabel}</span>원
          </p>
        ) : null}
        <div className="text-numeric-l font-numeric flex items-center gap-1">
          {discountLabel ? <span className="text-orange">{discountLabel}</span> : null}
          <span className="text-fg">{priceLabel}</span>
        </div>
        <div className="flex items-center gap-[3px]">
          <Icon name="review" size={16} aria-hidden />
          <span className="text-label-l text-fg-tertiary">{reviewCountLabel}</span>
        </div>
      </div>

      {kurlyOnly ? <StatusLabel type="kurlyOnly">Kurly Only</StatusLabel> : null}
    </div>
  );
}

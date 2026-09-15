'use client';

import Image from 'next/image';

import { Badge } from '@/components/atoms/Badge';
import { Icon } from '@/components/atoms/Icon';
import { StatusLabel } from '@/components/molecules/shared/StatusLabel';

/**
 * 홈 진열 섹션 상품 카드 (molecule). Figma "HomeScreen" > "Product Item"
 * (node 577:20684, 150~249px 유동폭 × 428px). 찜(하트) 아이콘은 없다(Figma 실측).
 *
 * `molecules/product/ProductMiniCard`(AI 챗용, node 2456-5629)와는 스펙이 달라
 * 재사용하지 않는다 — 이 카드만 쿠폰 배지·리뷰 수·"Kurly Only" 태그를 갖는다.
 * 쿠폰 배지는 `atoms/Badge`(color="cyan" size="medium" — 실측 padding 4px 전방향과
 * 일치), "Kurly Only" 태그는 `molecules/shared/StatusLabel`(type="kurlyOnly")을
 * 그대로 재사용한다. `imageSrc` 미지정 시 회색 박스로 대체한다(`CartLineItem` 참고).
 *
 * `h-product-card`(428px) 고정 필수 — 자연스러운 높이로 두면 1줄/2줄 이름이 섞인 가로
 * 스크롤 행에서(`DisplaySectionList` 의 `items-center`) 카드마다 이미지 시작 높이가
 * 달라진다.
 *
 * 루트 `items-start` 필수 — 없으면 flex-col 기본값(`align-items: stretch`) 때문에
 * 폭을 명시하지 않은 "Kurly Only" 뱃지만 카드 전체 폭으로 늘어난다(이미지/버튼/
 * 메타블록은 각자 `w-full` 이 있어 티가 안 났을 뿐). Figma 원본도 `items-start` 명시.
 *
 * 담기 버튼은 Figma 실측 그대로 32px 높이를 유지하되, `QuantityStepper`(node 2429-3870)와
 * 같은 방식으로 보이지 않는 `::before` 확장 영역을 얹어 터치 타깃만 44px로 넓힌다 —
 * 시각 레이아웃은 그대로 두고 히트 영역만 넓히는 패턴.
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
    <div
      className={['h-product-card flex w-37.5 shrink-0 flex-col items-start gap-1', className]
        .filter(Boolean)
        .join(' ')}
    >
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
        className="text-label-l text-fg active:bg-surface-secondary border-border relative flex h-8 w-full items-center justify-center gap-1 rounded-sm border before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-['']"
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
        <div className="gap-product-card-meta-gap flex items-center">
          <Icon name="review" size={16} aria-hidden />
          <span className="text-label-l text-fg-tertiary">{reviewCountLabel}</span>
        </div>
      </div>

      {kurlyOnly ? <StatusLabel type="kurlyOnly">Kurly Only</StatusLabel> : null}
    </div>
  );
}

'use client';

import Image from 'next/image';

import { Icon } from '@/components/atoms/Icon/Icon';

/**
 * AI 채팅 등에서 상품을 작게 보여주는 미니 카드 (Figma "Item_V_S", node 2456-5629).
 * 이미지 + "담기" 버튼 + 상품명 + (선택) 할인율/정가 + 판매가.
 */
export type ProductMiniCardProps = {
  imageSrc: string;
  name: string;
  /** 최종 판매가 표기(포맷은 호출부 책임, 예: "5,372원~"). */
  priceLabel: string;
  /** 할인율 표기(예: "32%"). discountLabel/originalPriceLabel 은 둘 다 있어야 정가 취소선을 보여준다. */
  discountLabel?: string;
  /** 정가 표기(예: "7,900원"). */
  originalPriceLabel?: string;
  onAddToCart?: () => void;
  className?: string;
};

export function ProductMiniCard({
  imageSrc,
  name,
  priceLabel,
  discountLabel,
  originalPriceLabel,
  onAddToCart,
  className,
}: ProductMiniCardProps) {
  return (
    <div className={['flex w-[124px] flex-col gap-1', className].filter(Boolean).join(' ')}>
      <div className="bg-surface-secondary relative aspect-square w-full overflow-hidden rounded-s">
        <Image src={imageSrc} alt={name} fill sizes="124px" className="object-cover" />
      </div>
      {/* atoms/Button 의 outlineBlack 과 팔레트는 같지만, Button 사이즈는 이 노드의
          고정 32px(h-8) 스펙과 안 맞아(가장 작은 s 사이즈도 36px) 직접 스타일링한다. */}
      <button
        type="button"
        onClick={onAddToCart}
        aria-label={`${name} 장바구니 담기`}
        className="rounded-m text-label-l text-fg active:bg-surface-secondary flex h-8 w-full items-center justify-center gap-1 border border-neutral-400"
      >
        <Icon name="cart" size={20} aria-hidden />
        담기
      </button>
      <div className="flex w-full flex-col">
        <p className="text-body-m text-fg w-full truncate">{name}</p>
        {discountLabel && originalPriceLabel ? (
          <p className="text-caption-l text-fg-tertiary line-through">{originalPriceLabel}</p>
        ) : null}
        <div className="text-numeric-l font-numeric flex items-center gap-1">
          {discountLabel ? <span className="text-orange">{discountLabel}</span> : null}
          <span className="text-fg">{priceLabel}</span>
        </div>
      </div>
    </div>
  );
}

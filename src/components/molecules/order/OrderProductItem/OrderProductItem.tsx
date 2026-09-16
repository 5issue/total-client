'use client';

import Image from 'next/image';

import { Icon } from '@/components/atoms/Icon';

/**
 * 주문 내역/상세의 상품 한 줄 (molecule).
 * Figma "5팀 UI 공유용" — `OrderBreakdownItem`(node 2454-4327, 주문 내역 771-106840).
 *
 * 썸네일 + 배송유형·상품명·가격 + 우측 담기 버튼. 장바구니의 `CartLineItem`
 * (`Item_H_Cart`)와는 다른 컴포넌트다 — 체크박스·수량 스테퍼가 없고 수량이 텍스트로만
 * 붙는다. 썸네일 63×84 는 `CartLineItem` 과 같아 `h-21` + `aspect-3/4` 로 크기를
 * 선고정한다(CLS 방지 — structure-convention §5).
 *
 * 토큰(실측 node 771-106840): 배송유형 `Heading/H6_Regular` + `Text/Tertiary` →
 * `text-heading-6 text-fg-tertiary`, 상품명 같은 16/400 + `Text/Primary`. 판매가
 * `Heading/H0_SemiBold`20/600(`text-heading-0`) + 단위 "원" `Heading/H4_SemiBold`,
 * 정가 `Heading/H5_Medium` + `Text/Quaternary` 취소선, 수량 `Heading/H6_Regular` +
 * `Text/Secondary`. 담기 버튼 40×40 `Radius/M` + `Border/Strong`.
 */
export interface OrderProductItemProps {
  /** 배송 유형 라벨(예: `샛별배송`). */
  deliveryType: string;
  name: string;
  /** 판매가(원). */
  price: number;
  /** 정가(원). 있으면 취소선으로 함께 보여준다. */
  originalPrice?: number;
  quantity: number;
  imageSrc?: string;
  /** 장바구니 담기. 아직 연동 전이면 생략한다(버튼은 Figma 대로 노출). */
  onAddToCart?: () => void;
  className?: string;
}

const won = (value: number) => value.toLocaleString('ko-KR');

export function OrderProductItem({
  deliveryType,
  name,
  price,
  originalPrice,
  quantity,
  imageSrc,
  onAddToCart,
  className,
}: OrderProductItemProps) {
  return (
    <div
      className={['flex items-center justify-between gap-3', className].filter(Boolean).join(' ')}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            width={63}
            height={84}
            className="aspect-3/4 h-21 w-auto shrink-0 rounded-sm object-cover"
          />
        ) : (
          <div aria-hidden className="bg-surface-secondary aspect-3/4 h-21 shrink-0 rounded-sm" />
        )}

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <p className="text-heading-6 text-fg-tertiary">{deliveryType}</p>
          <p className="text-heading-6 text-fg truncate">{name}</p>
          <div className="flex items-center gap-1">
            <p className="text-fg">
              <span className="text-heading-0">{won(price)}</span>
              <span className="text-heading-4">원</span>
            </p>
            {originalPrice !== undefined ? (
              <p className="text-heading-5 text-fg-quaternary line-through">
                {won(originalPrice)}원
              </p>
            ) : null}
            <span aria-hidden className="bg-border h-3 w-px shrink-0" />
            <p className="text-heading-6 text-fg-secondary">{quantity}개</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onAddToCart}
        aria-label={`${name} 장바구니 담기`}
        className="border-border bg-surface rounded-m text-fg flex size-10 shrink-0 items-center justify-center border"
      >
        <Icon name="cart" size={20} aria-hidden />
      </button>
    </div>
  );
}

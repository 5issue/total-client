'use client';

import Image from 'next/image';

import { Checkbox } from '@/components/atoms/Checkbox';
import { Icon } from '@/components/atoms/Icon';
import { QuantityStepper } from '@/components/molecules/shared/QuantityStepper';

/**
 * 장바구니 한 줄 (molecule). Figma "5팀 UI 공유용" — `Item_H_Cart` (node 2454-4242).
 *
 * 체크박스 + 상품명(우상단 삭제 ✕) / 썸네일 + 가격(판매가·정가) + 수량 스테퍼.
 * `soldOut` 이면 흐리게 표시하고 스테퍼 대신 "품절"만 둔다(Figma 품절 상태 그대로).
 * 표시·핸들러만 받는다 — 선택/수량/삭제 상태는 상위(CartCard/CartView)가 소유.
 * 썸네일은 퍼블리싱 단계라 `imageSrc` 없으면 회색 박스(#61 Image_Frame_Container 도입 시 교체).
 *
 * 토큰(`get_variable_defs` node 188-9589): 상품명 `Heading/H6_Regular`16/400 → `text-heading-6`,
 * 판매가 `Numeric/Numeric_L`(SF PRO Black 16) → `text-numeric-l font-numeric`,
 * 정가 취소선 `Label/M_Medium`14/500 + `Text/Quaternary`#8aa1ab → `text-label-m text-fg-quaternary`,
 * 삭제 아이콘 `Icon/Secondary`#7e8f9b → `text-fg-tertiary`, 썸네일 radius `Radius/S`4 → `rounded-s`,
 * 가격↔스테퍼 간격 `Gap/XXL`28 → `gap-7`.
 *
 * 레이아웃(Figma `Item_H_Cart`): 2번째 줄(썸네일+가격)은 1번째 줄 상품명과 좌측 정렬 —
 * 체크박스 터치타깃(44) + gap(4) 만큼 들여쓴다 → `pl-12`.
 */
export interface CartLineItemProps {
  name: string;
  /** 상품 이미지 URL. 없으면 회색 박스로 대체(퍼블리싱 단계). */
  imageSrc?: string;
  /** 판매가(원). */
  price: number;
  /** 정가(원). 있으면 취소선으로 함께 표시. */
  originalPrice?: number;
  quantity: number;
  checked: boolean;
  soldOut?: boolean;
  onCheckedChange: (checked: boolean) => void;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  className?: string;
}

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

export function CartLineItem({
  name,
  imageSrc,
  price,
  originalPrice,
  quantity,
  checked,
  soldOut = false,
  onCheckedChange,
  onQuantityChange,
  onRemove,
  className,
}: CartLineItemProps) {
  return (
    <div
      className={['relative flex w-full flex-col gap-1', soldOut && 'opacity-40', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start gap-1 py-1 pr-11">
        <Checkbox
          variant="filled"
          label={`${name} 선택`}
          checked={checked}
          disabled={soldOut}
          onChange={(e) => onCheckedChange(e.target.checked)}
        />
        <p className="text-heading-6 text-fg min-w-0 flex-1 py-1">{name}</p>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`${name} 삭제`}
        className="text-fg-tertiary absolute top-0 right-0 inline-flex size-11 items-center justify-center"
      >
        <Icon name="close" size={20} aria-hidden />
      </button>

      <div className="flex items-center gap-4 pl-12">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            width={63}
            height={84}
            className="h-21 w-[63px] shrink-0 rounded-s object-cover"
          />
        ) : (
          <div aria-hidden className="bg-surface-secondary h-21 w-[63px] shrink-0 rounded-s" />
        )}
        <div className="flex min-w-0 flex-1 flex-col items-start gap-7">
          <div className="flex flex-wrap items-baseline gap-1">
            <span className="text-numeric-l font-numeric text-fg">{won(price)}</span>
            {originalPrice !== undefined ? (
              <span className="text-label-m text-fg-quaternary line-through">
                {won(originalPrice)}
              </span>
            ) : null}
          </div>
          {soldOut ? (
            <span className="text-label-m text-fg-quaternary">품절</span>
          ) : (
            <QuantityStepper
              value={quantity}
              min={1}
              onChange={onQuantityChange}
              label={`${name} 수량`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

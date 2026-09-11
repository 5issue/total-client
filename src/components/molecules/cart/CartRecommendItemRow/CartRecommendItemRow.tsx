'use client';

import Image from 'next/image';

import { Button } from '@/components/atoms/Button';

/**
 * 추천 상품 한 줄 (molecule). Figma 디자인시스템 — `Item_H_Bottomsheet` (node 2457-6456).
 * 썸네일 + 상품명 + (할인%) 가격 + 담기 버튼. 추천 바텀시트/캐러셀에서 재사용.
 * 썸네일은 퍼블리싱 단계라 없으면 회색 박스(#61 Image_Frame_Container 도입 시 교체).
 */
export interface CartRecommendItemRowProps {
  name: string;
  imageSrc?: string;
  /** 판매가(원). */
  price: number;
  /** 할인율(%). 있으면 가격 앞에 주황색으로 표시. */
  discountPercent?: number;
  onAdd: () => void;
  className?: string;
}

export function CartRecommendItemRow({
  name,
  imageSrc,
  price,
  discountPercent,
  onAdd,
  className,
}: CartRecommendItemRowProps) {
  return (
    <div
      className={['flex items-center justify-between gap-3', className].filter(Boolean).join(' ')}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
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
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-label-m text-fg line-clamp-2">{name}</p>
          <p className="text-label-xl flex items-center gap-1">
            {discountPercent !== undefined ? (
              <span className="text-orange">{discountPercent}%</span>
            ) : null}
            <span className="text-fg">{price.toLocaleString('ko-KR')}원</span>
          </p>
        </div>
      </div>
      <Button
        size="xs"
        variant="outlineBlack"
        leadingIcon="cart"
        onClick={onAdd}
        aria-label={`${name} 담기`}
        className="shrink-0"
      >
        담기
      </Button>
    </div>
  );
}

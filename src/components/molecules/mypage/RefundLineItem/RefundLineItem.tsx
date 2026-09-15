'use client';

import Image from 'next/image';

import { Checkbox } from '@/components/atoms/Checkbox';

/**
 * 반품 접수 상품 한 줄 (molecule). Figma "5팀 UI 공유용" — `RefundItemCard`
 * (node 848-82641 계열).
 *
 * 체크박스 + 상품명 + 썸네일 + `n개 | 판매가`. 수량 스테퍼·삭제 ✕ 는 없다
 * (`CartLineItem` 과 역할이 다름). 선택 상태는 상위(`RefundReturnView`)가 소유.
 *
 * 토큰: 상품명 `text-heading-4 text-fg`, 수량 `text-heading-1`,
 * 판매가 `text-heading-2 text-fg-tertiary`, 구분선 `bg-border`,
 * 썸네일 `w-17.75 h-23.75` · `rounded-sm` (종횡비 선고정, code-style §6).
 * 체크박스 래퍼 `size-10`, 박스 자체는 filled Checkbox atom.
 */
export interface RefundLineItemProps {
  name: string;
  imageSrc?: string;
  price: number;
  quantity: number;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

export function RefundLineItem({
  name,
  imageSrc,
  price,
  quantity,
  checked,
  onCheckedChange,
  className,
}: RefundLineItemProps) {
  return (
    <div className={['flex w-full items-start', className].filter(Boolean).join(' ')}>
      <span className="flex size-10 shrink-0 items-center justify-center">
        <Checkbox
          variant="filled"
          label={`${name} 선택`}
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
        />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <p className="text-heading-4 text-fg">{name}</p>
        <div className="flex items-start gap-5">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt=""
              width={71}
              height={95}
              className="h-23.75 w-17.75 shrink-0 rounded-sm object-cover"
            />
          ) : (
            <div aria-hidden className="bg-surface-secondary h-23.75 w-17.75 shrink-0 rounded-sm" />
          )}
          <div className="flex items-center gap-2">
            <span className="text-heading-1 text-fg">{quantity}개</span>
            <span aria-hidden className="bg-border h-3 w-px shrink-0" />
            <span className="text-heading-2 text-fg-tertiary">{won(price)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

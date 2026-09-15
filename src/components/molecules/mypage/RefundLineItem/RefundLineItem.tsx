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
 * 상품명 `text-heading-4` 와 체크박스는 같은 행에서 `items-center` 로 수직 정렬한다.
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
    <div className={['flex w-full flex-col gap-5', className].filter(Boolean).join(' ')}>
      <div className="flex items-center">
        <Checkbox
          variant="filled"
          label={`${name} 선택`}
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
        />
        <p className="text-heading-4 text-fg min-w-0 flex-1">{name}</p>
      </div>
      <div className="flex items-start gap-5 pl-11">
        {imageSrc ? (
          <div className="relative h-23.75 w-17.75 shrink-0 overflow-hidden rounded-sm">
            <Image src={imageSrc} alt="" fill className="object-cover" />
          </div>
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
  );
}

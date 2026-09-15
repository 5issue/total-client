'use client';

import Image from 'next/image';

import { Checkbox } from '@/components/atoms/Checkbox';

/**
 * 반품 접수 상품 한 줄 (molecule). Figma node 848-82641 `RefundItemCard`
 * (체크박스 위치는 848-82764 로 재확인).
 *
 * 체크박스(40px 터치 영역)는 상품명과 같은 행에서 `items-center` 로 짝지어 y축을
 * 맞춘다 — `RefundSelectAllBar` 의 "전체선택" 행과 동일 패턴. 체크박스를 상품명·
 * 썸네일 전체 열의 형제로 두고 `items-start` 로만 정렬하면, 체크박스 자체 터치
 * 영역(40px) 안에서 아이콘이 중앙 정렬되어 상품명 한 줄(24px)의 중심보다 아래로
 * 처지는 문제가 있었다(2026-09-15 재확인). 썸네일·수량·가격 행은 체크박스 열
 * 너비(40px)만큼 `pl-10` 으로 들여써 상품명과 시작선을 맞춘다.
 * 수량 `text-heading-1`, 판매가 `text-heading-2 text-fg-tertiary`.
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
        <span className="flex size-10 shrink-0 items-center justify-center">
          <Checkbox
            variant="filled"
            label={`${name} 선택`}
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
            className="size-10"
          />
        </span>
        <p className="text-heading-4 text-fg min-w-0 flex-1">{name}</p>
      </div>
      <div className="flex items-start gap-5 pl-10">
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

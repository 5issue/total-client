'use client';

import { Button } from '@/components/atoms/Button';
import { CartItemPreview } from '@/components/molecules/product/CartItemPreview';
import { BottomSheet } from '@/components/molecules/shared/BottomSheet';

import type { FridgeItem } from './model';

/**
 * "보관 TIP" 바텀시트 (organism). Figma "5팀 UI 공유용" `ProductTipBottomSheet`
 * (node 666-31314) — 상품 미리보기 + 번호가 붙은 보관법 목록 + 닫기 버튼.
 *
 * 상품 미리보기는 `CartItemPreview` 를 그대로 쓴다(썸네일+상품명+한 줄 소개 구성이
 * Figma `OrderItemCard` 와 동일) — `tagline` 만 이 화면에는 없는 상품 소개 카피 대신
 * 수량 표기로 대신 채운다.
 */
export interface FridgeStorageTipBottomSheetProps {
  open: boolean;
  item: FridgeItem | null;
  onClose: () => void;
}

export function FridgeStorageTipBottomSheet({
  open,
  item,
  onClose,
}: FridgeStorageTipBottomSheetProps) {
  if (!item) return null;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel="보관 TIP"
      footer={
        <div className="px-4 py-3">
          <Button variant="black" size="l" onClick={onClose} className="h-14 w-full">
            닫기
          </Button>
        </div>
      }
    >
      <div className="px-4 py-3">
        <p className="text-heading-0 text-fg">
          컬리가 알려주는 <span className="text-primary">보관 TIP</span>
        </p>
      </div>
      <CartItemPreview
        imageSrc={item.imageSrc}
        imageAlt=""
        name={item.name}
        tagline={item.tagline}
      />
      <div className="border-border mx-4 border-t" />
      <div className="flex flex-col">
        {item.storageTip.steps.map((step, i) => (
          <div key={step} className="flex items-start gap-2 px-4 py-2">
            <span className="text-caption-m text-fg-inverse mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-neutral-950">
              {i + 1}
            </span>
            <p className="text-label-m text-fg-secondary pt-0.5">{step}</p>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}

'use client';

import { Button } from '@/components/atoms/Button';
import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';
import { CartItemPreview } from '@/components/molecules/product/CartItemPreview';
import { BottomSheet } from '@/components/molecules/shared/BottomSheet';
import { useStorageGuide } from '@/hooks/product/useStorageGuide';
import type { StorageGuideItem } from '@/types/storageGuide';

import type { FridgeItem } from './model';

/** 여러 (보관장소×상황) 줄 중 화면에 하나만 고른다 — 구매후 우선, 없으면 일반,
 *  그마저 없으면 첫 줄(AI팀 확정 우선순위, 이슈 #142). */
function pickStorageGuideItem(items: StorageGuideItem[]): StorageGuideItem | undefined {
  return (
    items.find((item) => item.storage_context === '구매후') ??
    items.find((item) => item.storage_context === '일반') ??
    items[0]
  );
}

/**
 * "보관 TIP" 바텀시트 (organism). Figma "5팀 UI 공유용" `ProductTipBottomSheet`
 * (node 666-31314) — 상품 미리보기 + 번호가 붙은 보관법 목록 + 닫기 버튼.
 *
 * 상품 미리보기는 `CartItemPreview` 를 그대로 쓴다(썸네일+상품명+한 줄 소개 구성이
 * Figma `OrderItemCard` 와 동일) — `tagline` 만 이 화면에는 없는 상품 소개 카피 대신
 * 수량 표기로 대신 채운다.
 *
 * 제목/상품 미리보기/구분선/보관법 목록/CTA 다섯 블록은 Figma 최상위 컨테이너의
 * `gap-[Gap/S(12px)]` 로 서로 떨어져 있다 — 각 블록 자체의 내부 패딩과는 별개로
 * 블록 사이에도 이 12px 간격이 추가로 들어간다(팀원 리뷰 반영, #111). `footer` 는
 * `BottomSheet` 가 본문과 별도 영역에 붙여서 그 gap 이 안 생기므로, CTA 자체 상단
 * 패딩(12px)에 그 몫을 더해(`pt-6`=24px) 대신 맞춘다.
 *
 * 보관법 목록은 이 컴포넌트가 열릴 때만 온디맨드로 조회한다(PROD-03, 이슈 #142) —
 * 냉장고 품목 전체의 보관 가이드를 미리 다 불러오지 않는다. Figma 디자인(666-31268)
 * 자체가 장소·상황 구분 없는 단일 목록이라, 실제 API가 주는 여러 줄 중 하나만 골라
 * (`pickStorageGuideItem`) 그대로 넣는다 — 새 레이아웃이 필요하지 않다.
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
  const guideQuery = useStorageGuide(item?.productId ?? '', { enabled: open && item !== null });

  if (!item) return null;

  const picked = guideQuery.data ? pickStorageGuideItem(guideQuery.data.items) : undefined;
  const tip = picked?.tips;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel="보관 TIP"
      footer={
        <div className="px-4 pt-6 pb-3">
          <Button variant="black" size="l" onClick={onClose} className="h-14 w-full">
            닫기
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
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
        {guideQuery.isPending ? (
          <LoadingIndicator label="보관 정보를 불러오는 중이에요" />
        ) : tip ? (
          <div className="flex flex-col">
            <div className="flex items-start gap-2 px-4 py-2">
              <span className="text-caption-m text-fg-inverse mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-neutral-950">
                1
              </span>
              <p className="text-label-m text-fg-secondary pt-0.5">{tip}</p>
            </div>
          </div>
        ) : (
          <p className="text-label-m text-fg-tertiary px-4 py-6 text-center">
            아직 보관 정보가 없어요
          </p>
        )}
      </div>
    </BottomSheet>
  );
}

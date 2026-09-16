'use client';

import { Button } from '@/components/atoms/Button';
import { BottomSheet } from '@/components/molecules/shared/BottomSheet';

/**
 * PromoBannerBottomSheet(node 1233-114124) — 혜택 알림(마케팅 수신) 동의 유도 바텀시트.
 * `molecules/shared/BottomSheet` 가 포커스 트랩·body 스크롤 잠금·Esc/백드롭 닫기·드래그
 * 닫기를 전부 이미 구현하고 있어 그대로 재사용한다.
 *
 * Figma CTA 버튼 라벨이 "장바구니 담기"인데, 이 시트의 맥락(광고성 정보 수신 동의)과
 * 맞지 않아 다른 컴포넌트를 재사용하며 복붙된 것으로 보인다(issue #106 추가 내용에 기록,
 * 디자인 확인 전까지 원문 그대로 유지 — structure-convention §6-1). 실제 동의 처리는
 * API 연동 전이라 두 버튼 모두 시트를 닫는 것 외 동작이 없다.
 */
export interface BenefitPromoBottomSheetProps {
  open: boolean;
  onClose: () => void;
}

export function BenefitPromoBottomSheet({ open, onClose }: BenefitPromoBottomSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel="혜택 알림 받고 저렴하게 구매하세요"
      footer={
        <div className="flex flex-col items-center px-4 pb-4">
          <Button variant="primary" size="l" className="h-14 w-full" onClick={onClose}>
            장바구니 담기
          </Button>
          <button
            type="button"
            className="text-label-xl text-fg-secondary flex h-12.5 w-full items-center justify-center"
            onClick={onClose}
          >
            30일 동안 보지 않기
          </button>
        </div>
      }
    >
      {/* px-6: Figma "Banner Content"(node 1233-114126)가 시트 기본 여백(px-4, margin/default
          16px) 위에 gap/xs(8px)를 더 얹는다 — 텍스트만 CTA 버튼보다 8px 더 안쪽. */}
      <div className="flex flex-col gap-3 px-6 pt-2 pb-3">
        <div className="text-heading-1 text-fg">
          <p>혜택 알림 받고</p>
          <p>저렴하게 구매하세요!</p>
        </div>
        <div className="text-label-m text-fg-secondary">
          <p>지금 광고성 정보 수신에 동의하시면, 새로운 할인 쿠폰 및 특가</p>
          <p>소식 등을 누구보다 빠르게 받아볼 수 있어요.</p>
        </div>
      </div>
    </BottomSheet>
  );
}

'use client';

import { Button } from '@/components/atoms/Button';
import { BottomSheet } from '@/components/molecules/shared/BottomSheet';

/**
 * PromoBannerBottomSheet(node 1233-114124) — 혜택 알림(마케팅 수신) 동의 유도 바텀시트.
 * `molecules/shared/BottomSheet`가 포커스 트랩·스크롤 잠금·닫기 동작을 이미 구현해 그대로 재사용.
 *
 * Figma CTA 라벨은 "장바구니 담기"인데 이 시트 맥락(광고성 정보 수신 동의)과 전혀
 * 안 맞아 다른 컴포넌트 재사용 중 복붙된 것으로 보여 "혜택 알림 동의하기"로 바꿨다
 * (코드래빗 리뷰 — 최종 문구는 디자인 확인 후 Figma 코멘트로 갱신 예정, issue #106).
 * API 연동 전이라 두 버튼 다 시트를 닫기만 한다.
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
            혜택 알림 동의하기
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
      {/* px-6: 텍스트만 CTA 버튼보다 8px 더 안쪽 여백(Figma 실측). */}
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

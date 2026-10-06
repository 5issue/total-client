'use client';

import { Button } from '@/components/atoms/Button';

/**
 * 하단 주문 CTA 바 (organism). Figma "5팀 UI 공유용" — `CTA_Horizontal` (node 563-15818 / 2483-3766).
 *
 * 흰 배경 위 풀폭 버튼. 위치(메인 화면 sticky / 바텀시트 하단)는 상위가 정한다.
 * - `empty`: 비활성 "상품을 담아주세요" (담은 상품 없음)
 * - `no-address`: 비활성 "배송지를 입력해주세요"
 * - `order`(할인 없음): "{total}원 주문하기"
 * - `order`(할인 있음): 혜택가(outline) + 혜택없이(filled) 2줄
 *
 * 버튼은 `atoms/Button` 을 그대로 쓴다 — `primary` 의 비활성 스타일
 * (`disabled:bg-brand-50 disabled:text-brand-200`)이 `CTA_Horizontal` 실측
 * (`Brand/Bright`#f8eefb 바탕 + `Brand/Light`#d8a5e9 텍스트)과 일치하고, 앱 공통
 * focus-visible 링(`focus-visible:outline-border-active`)도 함께 얻는다.
 *
 * 컨테이너 여백은 `CTA_Horizontal` 프레임 실측: 좌우 16(`px-4`) · 상 12(`pt-3`) ·
 * 하 44(`pb-11`, 홈 인디케이터 여유). 버튼 높이 56(`h-14`) · 풀폭.
 */
export interface CartOrderBarProps {
  state?: 'no-address' | 'order' | 'empty';
  /** 주문 금액(원). */
  totalPrice: number;
  /** 혜택 적용가(원). 있으면 2줄 버튼. */
  discountedPrice?: number;
  onOrder: () => void;
  className?: string;
}

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;
/** CTA_Horizontal 버튼: 높이 56 · 풀폭. */
const CTA_BUTTON = 'h-14 w-full';

const DISABLED_LABEL: Record<'empty' | 'no-address', string> = {
  empty: '상품을 담아주세요',
  'no-address': '배송지를 입력해주세요',
};

export function CartOrderBar({
  state = 'order',
  totalPrice,
  discountedPrice,
  onOrder,
  className,
}: CartOrderBarProps) {
  return (
    <div
      className={['bg-surface flex flex-col px-4 pt-3 pb-11', className].filter(Boolean).join(' ')}
    >
      {state === 'empty' || state === 'no-address' ? (
        <Button variant="primary" size="l" disabled className={CTA_BUTTON}>
          {DISABLED_LABEL[state]}
        </Button>
      ) : discountedPrice !== undefined ? (
        <div className="flex flex-col gap-3">
          <Button variant="outlinePrimary" size="l" onClick={onOrder} className={CTA_BUTTON}>
            {won(discountedPrice)} 주문하기
          </Button>
          <Button variant="primary" size="l" onClick={onOrder} className={CTA_BUTTON}>
            혜택없이 {won(totalPrice)} 주문하기
          </Button>
        </div>
      ) : (
        <Button variant="primary" size="l" onClick={onOrder} className={CTA_BUTTON}>
          {won(totalPrice)} 주문하기
        </Button>
      )}
    </div>
  );
}

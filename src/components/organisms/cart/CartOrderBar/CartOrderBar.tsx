'use client';

/**
 * 하단 주문 CTA 바 (organism). Figma "5팀 UI 공유용" — `CTA_Horizontal` (node 563-15818 / 2483-3766).
 *
 * 흰 배경 위 풀폭 버튼. 위치(메인 화면 sticky / 바텀시트 하단)는 상위가 정한다.
 * - `empty`: 비활성 "상품을 담아주세요" (담은 상품 없음)
 * - `no-address`: 비활성 "배송지를 입력해주세요"
 * - `order`(할인 없음): "{total}원 주문하기"
 * - `order`(할인 있음): 혜택가(outline) + 혜택없이(filled) 2줄
 *
 * 비활성 스타일은 `CTA_Horizontal` 실측 그대로 `Brand/Bright`(#f8eefb) 바탕 + `Brand/Light`(#d8a5e9) 텍스트.
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
const PRIMARY_BTN = 'flex h-14 w-full items-center justify-center rounded-m text-heading-1';
const DISABLED_BTN = `${PRIMARY_BTN} bg-brand-50 text-brand-200`;

export function CartOrderBar({
  state = 'order',
  totalPrice,
  discountedPrice,
  onOrder,
  className,
}: CartOrderBarProps) {
  return (
    <div className={['bg-surface flex flex-col px-4 py-3', className].filter(Boolean).join(' ')}>
      {state === 'empty' ? (
        <button type="button" disabled className={DISABLED_BTN}>
          상품을 담아주세요
        </button>
      ) : state === 'no-address' ? (
        <button type="button" disabled className={DISABLED_BTN}>
          배송지를 입력해주세요
        </button>
      ) : discountedPrice !== undefined ? (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onOrder}
            className={`${PRIMARY_BTN} border-primary text-primary border`}
          >
            {won(discountedPrice)} 주문하기
          </button>
          <button
            type="button"
            onClick={onOrder}
            className={`${PRIMARY_BTN} bg-primary text-fg-inverse`}
          >
            혜택없이 {won(totalPrice)} 주문하기
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOrder}
          className={`${PRIMARY_BTN} bg-primary text-fg-inverse`}
        >
          {won(totalPrice)} 주문하기
        </button>
      )}
    </div>
  );
}

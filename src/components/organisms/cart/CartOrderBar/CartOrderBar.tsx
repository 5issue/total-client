'use client';

/**
 * 하단 주문 CTA 바 (organism). Figma "5팀 UI 공유용" — `CTA_Horizontal` (node 2483-3766).
 *
 * 흰 배경 위 풀폭 버튼 + 약관 안내 캡션. 위치(메인 화면 sticky / 바텀시트 하단)는 상위가 정한다.
 * - `no-address`: 비활성 "배송지를 입력해주세요"
 * - `order`(할인 없음): "{total}원 주문하기"
 * - `order`(할인 있음): 혜택가(outline) + 혜택없이(filled) 2줄
 */
export interface CartOrderBarProps {
  state?: 'no-address' | 'order';
  /** 주문 금액(원). */
  totalPrice: number;
  /** 혜택 적용가(원). 있으면 2줄 버튼. */
  discountedPrice?: number;
  onOrder: () => void;
  className?: string;
}

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;
const PRIMARY_BTN =
  'flex h-14 w-full items-center justify-center rounded-m text-heading-1 disabled:opacity-40';

export function CartOrderBar({
  state = 'order',
  totalPrice,
  discountedPrice,
  onOrder,
  className,
}: CartOrderBarProps) {
  return (
    <div
      className={['bg-surface flex flex-col gap-2 px-4 pt-3 pb-4', className]
        .filter(Boolean)
        .join(' ')}
    >
      {state === 'no-address' ? (
        <button type="button" disabled className={`${PRIMARY_BTN} bg-primary text-fg-inverse`}>
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

      <p className="text-caption-m text-fg-tertiary text-center">
        결제 전 <span className="underline">이용약관 및 정보제공</span> 동의를 확인해 주세요
      </p>
    </div>
  );
}

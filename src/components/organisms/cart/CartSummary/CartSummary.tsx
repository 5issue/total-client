import { InfoBox } from '@/components/atoms/InfoBox';
import { CartAmountRow } from '@/components/molecules/cart/CartAmountRow';
import type { CartAmounts } from '@/components/organisms/cart/model';

/**
 * 결제 예정 금액 요약 (organism). Figma "5팀 UI 공유용" — `Frame 1430106819` + `Info Box`.
 * 금액만 받아 표시(RSC). 계산은 상위 책임.
 */
export interface CartSummaryProps {
  amounts: CartAmounts;
  className?: string;
}

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

export function CartSummary({ amounts, className }: CartSummaryProps) {
  return (
    <div className={['flex flex-col gap-5 px-4 py-5', className].filter(Boolean).join(' ')}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <CartAmountRow label="상품 금액" value={won(amounts.productPrice)} />
          <CartAmountRow
            label="상품할인 금액"
            tone="discount"
            value={`-${won(amounts.productDiscount)}`}
          />
          <CartAmountRow
            label="배송비"
            value={amounts.shippingFee === 0 ? '무료' : won(amounts.shippingFee)}
          />
        </div>
        <hr className="border-neutral-200" />
        <CartAmountRow label="결제예정금액" value={won(amounts.total)} emphasis />
      </div>
      <InfoBox variant="bar">적립·쿠폰은 주문서에서 확인 및 적용 가능합니다</InfoBox>
    </div>
  );
}

import { Icon } from '@/components/atoms/Icon';
import { InfoBox } from '@/components/atoms/InfoBox';
import { CartAmountRow } from '@/components/molecules/cart/CartAmountRow';
import type { CartAmounts } from '@/components/organisms/cart/model';

/**
 * 결제 예정 금액 요약 (organism). Figma "5팀 UI 공유용" — `Frame 1430106819` (node 188-9639) + `Info Box`.
 * 금액만 받아 표시(RSC). 계산은 상위(CartView) 책임.
 *
 * 상품 금액 / 상품할인 금액 / 쿠폰 할인 금액(+ 상품·장바구니 쿠폰 상세) / 배송비 → 구분선 → 결제예정금액 → 안내.
 * 토큰(node 188-9639): 컨테이너 `px-4 pt-5 pb-7`(Gap/M·L·XXL), 행 묶음 `gap-4` / 행 `gap-2`,
 * 쿠폰 상세행 라벨 `Text/Secondary`#515e69 + `corner-bottom-left` 아이콘, 구분선 → `border-border`,
 * 안내 박스 `Info Box`(bar) — `bg-info` `border-border` `rounded-m`, 문구 `text-label-l text-fg-quaternary`.
 */
export interface CartSummaryProps {
  amounts: CartAmounts;
  className?: string;
}

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;
/** 할인 줄: 0 이면 "0원", 그 외 "-n원". */
const discountWon = (n: number) => (n > 0 ? `-${won(n)}` : won(0));

function CouponDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-fg-secondary flex items-center">
        <Icon name="corner-bottom-left" size={20} aria-hidden />
        <span className="text-label-xs">{label}</span>
      </span>
      <span className="text-label-l text-fg-secondary">{value}</span>
    </div>
  );
}

export function CartSummary({ amounts, className }: CartSummaryProps) {
  return (
    <div className={['flex flex-col gap-1 px-4 pt-5 pb-7', className].filter(Boolean).join(' ')}>
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-2">
          <CartAmountRow label="상품 금액" value={won(amounts.productPrice)} />
          <CartAmountRow
            label="상품할인 금액"
            tone="discount"
            value={discountWon(amounts.productDiscount)}
          />
          <div className="flex flex-col gap-2">
            <CartAmountRow
              label="쿠폰 할인 금액"
              tone="discount"
              value={discountWon(amounts.couponDiscount)}
            />
            <div className="flex flex-col gap-2">
              <CouponDetailRow label="상품 쿠폰" value={won(amounts.productCouponDiscount)} />
              <CouponDetailRow label="장바구니 쿠폰" value={won(amounts.cartCouponDiscount)} />
            </div>
          </div>
          <CartAmountRow label="배송비" tone="muted" value={won(amounts.shippingFee)} />
        </div>

        <hr className="border-border w-full" />

        <div className="py-3">
          <CartAmountRow
            label="결제예정금액"
            value={won(amounts.total)}
            emphasis
            className="px-1"
          />
        </div>
      </div>

      <InfoBox variant="bar" className="w-full">
        적립금은 주문서에서 적용할 수 있어요
      </InfoBox>
    </div>
  );
}

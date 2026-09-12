import Image from 'next/image';

/**
 * 주문상품 한 줄, 표시 전용 (molecule). Figma "5팀 UI 공유용" — `Item_H_Order` (node 666-23237).
 *
 * `molecules/cart/CartLineItem` 과 달리 체크박스·수량 스테퍼·삭제가 없다 — 주문서는
 * 이미 확정된 상품을 "리뷰"만 하는 화면이라 상호작용 없이 이미지+이름+가격+수량 텍스트만
 * 보여준다(바로구매 흐름이라 항상 1건, 이 컴포넌트 자체는 여러 건이어도 그대로 반복 가능).
 *
 * 토큰은 `CartLineItem` 과 동일 근거(`get_variable_defs` node 188-9589 계열) — 썸네일
 * 63×84(3:4) `next/image` + `aspect-3/4`로 로드 전 크기 선고정(CLS 방지, code-style §6).
 */
export interface OrderLineItemProps {
  name: string;
  imageSrc?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  className?: string;
}

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

export function OrderLineItem({
  name,
  imageSrc,
  price,
  originalPrice,
  quantity,
  className,
}: OrderLineItemProps) {
  return (
    <div className={['flex items-center gap-3', className].filter(Boolean).join(' ')}>
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt=""
          width={54}
          height={72}
          className="aspect-3/4 h-18 w-auto shrink-0 rounded-sm object-cover"
        />
      ) : (
        <div aria-hidden className="bg-surface-secondary aspect-3/4 h-18 shrink-0 rounded-sm" />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-heading-4 text-fg">{name}</p>
        <div className="flex flex-wrap items-baseline gap-1">
          <span className="text-heading-4 text-fg font-numeric">{won(price)}</span>
          {originalPrice !== undefined ? (
            <span className="text-label-m text-fg-quaternary line-through">
              {won(originalPrice)}
            </span>
          ) : null}
          <span className="text-heading-6 text-fg-secondary">{quantity}개</span>
        </div>
      </div>
    </div>
  );
}

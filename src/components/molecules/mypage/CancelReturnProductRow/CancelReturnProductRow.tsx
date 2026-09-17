import Image from 'next/image';

/**
 * 취소·반품·교환 내역 카드 안 상품 한 줄 (molecule). Figma "5팀 UI 공유용" —
 * `OrderBreakdownItem`(node 1233-115033 등). 표시 전용 — 담기/삭제 버튼 없음
 * (주문 내역 상세의 `OrderProductItem` 과 달리 이 화면은 상태 조회만 한다).
 *
 * 토큰(실측): 썸네일 63×84 `radius-s`, 배송타입 `Heading/H6_Regular`16/400 →
 * `text-heading-6 text-fg-tertiary`, 상품명 동일 스케일 `text-fg`, 판매가
 * `Heading/H0_SemiBold`20/600 → `text-heading-0` + "원" `Heading/H6_Regular` →
 * `text-heading-6`, 정가 취소선 `Heading/H5_Medium`16/500 + `Text/Quaternary` →
 * `text-heading-5 text-fg-quaternary`, 수량 `text-fg-secondary`.
 */
export interface CancelReturnProductRowProps {
  deliveryType: string;
  name: string;
  imageSrc?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  className?: string;
}

const won = (n: number) => n.toLocaleString('ko-KR');

export function CancelReturnProductRow({
  deliveryType,
  name,
  imageSrc,
  price,
  originalPrice,
  quantity,
  className,
}: CancelReturnProductRowProps) {
  return (
    <div className={['flex w-full items-start gap-3', className].filter(Boolean).join(' ')}>
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt=""
          width={63}
          height={84}
          className="aspect-3/4 h-21 w-auto shrink-0 rounded-sm object-cover"
        />
      ) : (
        <div aria-hidden className="bg-surface-secondary aspect-3/4 h-21 shrink-0 rounded-sm" />
      )}
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <p className="text-heading-6 text-fg-tertiary">{deliveryType}</p>
        <p className="text-heading-6 text-fg w-full truncate">{name}</p>
        <div className="flex flex-wrap items-center gap-1">
          <p className="text-fg">
            <span className="text-heading-0">{won(price)}</span>
            <span className="text-heading-6">원</span>
          </p>
          {originalPrice !== undefined ? (
            <span className="text-heading-5 text-fg-quaternary line-through">
              {won(originalPrice)}원
            </span>
          ) : null}
          <span aria-hidden className="bg-border h-3 w-px" />
          <span className="text-heading-6 text-fg-secondary">{quantity}개</span>
        </div>
      </div>
    </div>
  );
}

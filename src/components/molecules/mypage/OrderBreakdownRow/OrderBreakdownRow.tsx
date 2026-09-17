import { Icon } from '@/components/atoms/Icon';

/**
 * 결제/환불 정보의 key-value 한 줄 (molecule). Figma "5팀 UI 공유용" —
 * `OrderBreakdownHeader`(node 1233-113358 등) + 하위 `OrderBreakdownDetailItem`.
 *
 * 기본(`tone="tertiary"`)은 라벨·값 모두 `Text/Tertiary` — 상품 할인 금액·배송비 등
 * 구성 항목. `tone="primary"`는 `Text/Primary`(검정)로, 환불 수단·환불 차감금액처럼
 * 최종 확정값을 강조할 때 쓴다(Figma 실측: 이 두 항목만 검정, 나머지는 회색).
 *
 * `details` 가 있으면(쿠폰할인 금액→상품 쿠폰/장바구니 쿠폰 등) `corner-bottom-left`
 * 아이콘을 단 들여쓰기 행을 그 아래 붙인다(`Text/Quaternary`, Figma
 * `OrderBreakdownDetailItem`).
 */
export interface OrderBreakdownDetail {
  label: string;
  value: string;
}

export interface OrderBreakdownRowProps {
  label: string;
  value: string;
  /** 기본 tertiary(회색). primary 는 검정 — 환불 수단·환불 차감금액 등 확정값. */
  tone?: 'tertiary' | 'primary';
  /** 하위 상세 내역(쿠폰·적립금 등). */
  details?: OrderBreakdownDetail[];
  className?: string;
}

const TONE_CLASSNAME: Record<NonNullable<OrderBreakdownRowProps['tone']>, string> = {
  tertiary: 'text-fg-tertiary',
  primary: 'text-fg',
};

export function OrderBreakdownRow({
  label,
  value,
  tone = 'tertiary',
  details,
  className,
}: OrderBreakdownRowProps) {
  return (
    <div className={['flex w-full flex-col gap-1', className].filter(Boolean).join(' ')}>
      <div className={['flex w-full items-center justify-between', TONE_CLASSNAME[tone]].join(' ')}>
        <p className="text-heading-6">{label}</p>
        <p className="text-heading-5">{value}</p>
      </div>

      {details?.length ? (
        <div className="flex w-full flex-col gap-2">
          {details.map((detail) => (
            <div key={detail.label} className="text-fg-quaternary flex w-full items-center gap-1">
              <Icon name="corner-bottom-left" size={20} aria-hidden className="shrink-0" />
              <p className="text-label-m flex-1">{detail.label}</p>
              <p className="text-label-m">{detail.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

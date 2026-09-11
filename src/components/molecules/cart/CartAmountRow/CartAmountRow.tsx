import type { ReactNode } from 'react';

/**
 * 결제 예정 금액 표의 한 줄 (molecule).
 * Figma "5팀 UI 공유용" — `List_Cart_Amount` / `List_Cart_Amount_Header` (node 188-9639).
 * 표시 전용(RSC). label + value 만. 값 포맷(원/무료/취소선)은 호출부 책임.
 *
 * 토큰: 라벨 `Heading/H6_Regular`16/400 → `text-heading-6`, 값 `Heading/H4_SemiBold`16/600
 * → `text-heading-4`. `tone='discount'` 값은 `Custom/Orange`#fa622f, `tone='muted'`(배송비) 값은
 * `Text/Quaternary`#8aa1ab. `emphasis`(결제예정금액) 라벨 `text-heading-4`, 값 `Heading/H0_SemiBold`20/600.
 */
export interface CartAmountRowProps {
  label: string;
  value: ReactNode;
  /** 값 색: 기본 / 할인(주황) / 흐리게(배송비 등). */
  tone?: 'default' | 'discount' | 'muted';
  /** 합계 줄(결제예정금액 등) — 굵고 크게. */
  emphasis?: boolean;
  className?: string;
}

const VALUE_TONE: Record<'default' | 'discount' | 'muted', string> = {
  default: 'text-fg',
  discount: 'text-orange',
  muted: 'text-fg-quaternary',
};

export function CartAmountRow({
  label,
  value,
  tone = 'default',
  emphasis = false,
  className,
}: CartAmountRowProps) {
  const valueClass = emphasis ? 'text-heading-0 text-fg' : `text-heading-4 ${VALUE_TONE[tone]}`;
  return (
    <div className={['flex items-center justify-between', className].filter(Boolean).join(' ')}>
      <span className={emphasis ? 'text-heading-4 text-fg' : 'text-heading-6 text-fg'}>
        {label}
      </span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

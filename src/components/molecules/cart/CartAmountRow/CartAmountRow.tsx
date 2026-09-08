import type { ReactNode } from 'react';

/**
 * 결제 예정 금액 표의 한 줄 (molecule).
 * Figma "5팀 UI 공유용" — `List_Cart_Amount` / `List_Cart_Amount_Header`.
 * 표시 전용(RSC). label + value 만. 값 포맷(원/무료/취소선)은 호출부 책임.
 */
export interface CartAmountRowProps {
  label: string;
  value: ReactNode;
  /** 할인 줄이면 강조색. */
  tone?: 'default' | 'discount';
  /** 합계 줄(결제예정금액 등) — 굵고 크게. */
  emphasis?: boolean;
  className?: string;
}

export function CartAmountRow({
  label,
  value,
  tone = 'default',
  emphasis = false,
  className,
}: CartAmountRowProps) {
  const valueClass = emphasis
    ? 'text-heading-4 text-fg'
    : tone === 'discount'
      ? 'text-label-l text-orange'
      : 'text-label-l text-fg';
  return (
    <div className={['flex items-center justify-between', className].filter(Boolean).join(' ')}>
      <span className={emphasis ? 'text-heading-4 text-fg' : 'text-label-l text-fg-tertiary'}>
        {label}
      </span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

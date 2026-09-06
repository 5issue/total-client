'use client';

import { Logo, type LogoName } from '@/components/atoms/Logo/Logo';

/**
 * 결제수단 선택 버튼 (Figma "Button_Payment", node 2867-2672 / 2880-3236).
 * 로고형(카카오페이 등)과 텍스트형(신용카드 등) 두 타입이 있고, 결제수단 목록에서
 * radiogroup 의 radio 하나로 쓰인다. "혜택" 배지는 해당 결제수단의 진행 중인 혜택 유무를
 * 나타내는 고정 속성이라 선택 여부와 무관하게 표시한다(2026-09-06 확인).
 */
export type PaymentMethodButtonProps = {
  /** 로고형은 시각 콘텐츠가 로고뿐이라 접근 가능한 이름으로 필수(예: "카카오페이"). 텍스트형은 화면에 보이는 라벨. */
  label: string;
  selected?: boolean;
  disabled?: boolean;
  /** 로고형에서만 의미가 있다. */
  showBenefitBadge?: boolean;
  onClick?: () => void;
  className?: string;
} & ({ type: 'logo'; logo: LogoName } | { type: 'text' });

export function PaymentMethodButton(props: PaymentMethodButtonProps) {
  const {
    selected = false,
    disabled = false,
    showBenefitBadge = false,
    label,
    onClick,
    className,
  } = props;
  const showBadge = props.type === 'logo' && showBenefitBadge && !disabled;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={props.type === 'logo' ? label : undefined}
      disabled={disabled}
      onClick={onClick}
      className={[
        'rounded-m relative flex h-10 w-40 items-center justify-center gap-1 border p-1 transition-colors disabled:pointer-events-none motion-reduce:transition-none',
        disabled
          ? 'bg-surface-secondary border-border text-fg-disabled'
          : selected
            ? 'bg-surface border-border-active text-fg'
            : 'bg-surface active:bg-surface-secondary text-fg border-neutral-400',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {props.type === 'logo' ? (
        <Logo name={props.logo} height={14} aria-hidden />
      ) : (
        <span className="text-heading-4">{label}</span>
      )}
      {showBadge && (
        <span className="bg-error text-orange text-caption-l absolute -top-2 right-2.5 flex h-5 w-[39px] items-center justify-center rounded-full">
          혜택
        </span>
      )}
    </button>
  );
}

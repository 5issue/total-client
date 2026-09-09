'use client';

import Image from 'next/image';

import { Logo, type LogoName } from '@/components/atoms/Logo/Logo';

/**
 * 결제수단 선택 버튼 (Figma "Button_Payment", node 2867-2672 / 2880-3236).
 * 로고형(카카오페이 등)과 텍스트형(신용카드 등) 두 타입이 있고, 결제수단 목록에서
 * radiogroup 의 radio 하나로 쓰인다. "혜택" 배지는 해당 결제수단의 진행 중인 혜택 유무를
 * 나타내는 고정 속성이라 선택 여부와 무관하게 표시한다(2026-09-06 확인).
 *
 * `type="logo-image"`(토스페이, node 2867-2535)는 Figma에 벡터 데이터가 없는 raster
 * 전용 로고라 `Logo` atom(`LogoName`)이 아니라 `public/payment-logos/*.webp` 를
 * `next/image` 로 그린다(Toast/ErrorState 와 동일 패턴).
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
} & (
  { type: 'logo'; logo: LogoName } | { type: 'logo-image'; logo: 'toss-pay' } | { type: 'text' }
);

const LOGO_IMAGE_SRC: Record<'toss-pay', string> = {
  'toss-pay': '/payment-logos/toss-pay.webp',
};
/** raw 에셋 원본 비율(249×48) — height 14 기준 width 를 계산한다. */
const LOGO_IMAGE_ASPECT_RATIO = 249 / 48;

function containerClassName(disabled: boolean, selected: boolean): string {
  if (disabled) return 'bg-surface-secondary border-border text-fg-disabled';
  if (selected) return 'bg-surface border-border-active text-fg';
  return 'bg-surface active:bg-surface-secondary text-fg border-neutral-400';
}

export function PaymentMethodButton(props: PaymentMethodButtonProps) {
  const {
    selected = false,
    disabled = false,
    showBenefitBadge = false,
    label,
    onClick,
    className,
  } = props;
  const showBadge = props.type !== 'text' && showBenefitBadge && !disabled;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={props.type !== 'text' ? label : undefined}
      disabled={disabled}
      onClick={onClick}
      className={[
        'rounded-m relative flex h-10 w-40 items-center justify-center gap-1 border p-1 transition-colors disabled:pointer-events-none motion-reduce:transition-none',
        containerClassName(disabled, selected),
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {props.type === 'logo' ? (
        <Logo name={props.logo} height={14} aria-hidden />
      ) : props.type === 'logo-image' ? (
        <Image
          src={LOGO_IMAGE_SRC[props.logo]}
          alt=""
          width={Math.round(14 * LOGO_IMAGE_ASPECT_RATIO)}
          height={14}
        />
      ) : (
        <span className="text-heading-4">{label}</span>
      )}
      {/* atoms/Badge 는 항상 rounded-s(4px) 라 이 노드의 완전한 원형(rounded-full) 배지와
          모양 자체가 다르다 — 재사용 대신 이 컴포넌트 전용 스타일로 둔다. */}
      {showBadge && (
        <span className="bg-error text-orange text-caption-l absolute -top-2 right-2.5 flex h-5 w-9.75 items-center justify-center rounded-full">
          혜택
        </span>
      )}
    </button>
  );
}

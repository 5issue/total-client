'use client';

import { Icon } from '@/components/atoms/Icon/Icon';

/**
 * 수량 증감 스테퍼 (Figma "Stepper", node 2429-3870). min 에 도달하면 감소 버튼이,
 * max 에 도달하면 증가 버튼이 disabled 된다(Figma "Disabled" variant 는 count=0 예시).
 */
export type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** 스크린리더용 그룹 라벨(예: "수량", 상품명과 함께 쓰려면 "샐러드 수량" 처럼 전달). */
  label?: string;
  className?: string;
};

function glyphColorClassName(enabled: boolean): string {
  return enabled ? 'text-fg' : 'text-fg-disabled';
}

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = Infinity,
  label = '수량',
  className,
}: QuantityStepperProps) {
  const canDecrease = value > min;
  const canIncrease = value < max;

  return (
    <div
      role="group"
      aria-label={label}
      className={[
        'bg-surface-secondary flex h-8 w-[84px] items-center justify-center gap-2 rounded-full',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        aria-label={`${label} 감소`}
        disabled={!canDecrease}
        onClick={() => onChange(value - 1)}
        className={`flex items-center transition-colors ${glyphColorClassName(canDecrease)}`}
      >
        <Icon name="minus" size={14} aria-hidden />
      </button>
      <span className="text-numeric-l font-numeric text-fg w-[18px] text-center">{value}</span>
      <button
        type="button"
        aria-label={`${label} 증가`}
        disabled={!canIncrease}
        onClick={() => onChange(value + 1)}
        className={`flex items-center transition-colors ${glyphColorClassName(canIncrease)}`}
      >
        <Icon name="add" size={14} aria-hidden />
      </button>
    </div>
  );
}

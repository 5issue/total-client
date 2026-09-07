'use client';

import { Icon } from '@/components/atoms/Icon/Icon';

/**
 * 수량 증감 스테퍼 (Figma "Stepper", node 2429-3870). min 에 도달하면 감소 버튼이,
 * max 에 도달하면 증가 버튼이 disabled 된다(Figma "Disabled" variant 는 count=0 예시).
 *
 * 시각적 pill(전체 84px)은 Figma 실측대로 고정하되, 각 버튼에 보이지 않는
 * `::before` 확장 영역(-inset-3.75, 14px 아이콘 기준 44px)을 얹어 터치 타깃을
 * 44×44px 로 채운다 — pill 이 overflow 를 클립하지 않아 hit area 만 밖으로
 * 넓어지고 시각 레이아웃(아이콘 위치·pill 크기)은 그대로다.
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
        'bg-surface-secondary flex h-8 w-21 items-center justify-center gap-2 rounded-full',
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
        className={`relative flex items-center justify-center transition-colors before:absolute before:-inset-3.75 before:content-[''] ${glyphColorClassName(canDecrease)}`}
      >
        <Icon name="minus" size={14} aria-hidden />
      </button>
      <span className="text-numeric-l font-numeric text-fg w-4.5 text-center">{value}</span>
      <button
        type="button"
        aria-label={`${label} 증가`}
        disabled={!canIncrease}
        onClick={() => onChange(value + 1)}
        className={`relative flex items-center justify-center transition-colors before:absolute before:-inset-3.75 before:content-[''] ${glyphColorClassName(canIncrease)}`}
      >
        <Icon name="add" size={14} aria-hidden />
      </button>
    </div>
  );
}

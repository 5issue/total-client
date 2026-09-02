'use client';

import { useId } from 'react';

import { ICONS, type IconName } from './icons.generated';

export type { IconName };

type IconVariant = (typeof ICONS)[IconName][number];

/**
 * `aria-label` 은 아이콘이 유일한 콘텐츠인 상호작용 요소(아이콘 전용 버튼 등)에 필수다.
 * 텍스트 옆의 장식용 아이콘은 `aria-hidden` 을 명시한다.
 * (code-style-convention §5)
 */
export type IconProps = {
  name: IconName;
  /** px 단위. 해당 이름에 여러 사이즈 컷이 있으면 가장 가까운 컷을 쓰고, 없으면 뷰박스를 그대로 스케일한다. 기본 20 */
  size?: number;
  className?: string;
} & (
  { 'aria-label': string; 'aria-hidden'?: never } | { 'aria-label'?: never; 'aria-hidden'?: true }
);

export function Icon({ name, size = 20, className, ...aria }: IconProps) {
  const uid = useId();
  const variant = pickVariant(ICONS[name], size);
  const idFor = (raw: string) => `icon-${uid}-${raw}`;

  const hasLabel = 'aria-label' in aria && Boolean(aria['aria-label']);

  return (
    <svg
      width={size}
      height={size}
      viewBox={variant.viewBox}
      fill="none"
      className={className}
      aria-label={hasLabel ? aria['aria-label'] : undefined}
      aria-hidden={hasLabel ? undefined : (aria['aria-hidden'] ?? true)}
      role={hasLabel ? 'img' : undefined}
    >
      {variant.render(idFor)}
    </svg>
  );
}

function pickVariant(variants: readonly IconVariant[], size: number): IconVariant {
  return variants.reduce((closest, v) =>
    Math.abs(viewBoxSize(v) - size) < Math.abs(viewBoxSize(closest) - size) ? v : closest,
  );
}

function viewBoxSize(variant: IconVariant): number {
  const parts = variant.viewBox.split(' ');
  return Number(parts[2]) || 0;
}

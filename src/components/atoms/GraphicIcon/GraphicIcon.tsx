import { useId } from 'react';

import { GRAPHIC_ICONS, type GraphicIconName } from './graphic-icons.generated';

export type { GraphicIconName };

/**
 * 배지/뱃지형 마케팅 그래픽(44px 안팎, 아이콘별 색 고정). Icon 과 달리 단순 glyph
 * 가 아니라 각각 고유한 그래픽이라 사이즈 variant 없이 이름당 하나만 가진다.
 * `aria-label` 은 아이콘이 유일한 콘텐츠인 상호작용 요소에 필수, 장식용이면
 * `aria-hidden` 을 명시한다. (code-style-convention §5)
 */
export type GraphicIconProps = {
  name: GraphicIconName;
  /** px 단위. 지정하지 않으면 원본 뷰박스 크기 그대로 */
  size?: number;
  className?: string;
} & (
  { 'aria-label': string; 'aria-hidden'?: never } | { 'aria-label'?: never; 'aria-hidden'?: true }
);

export function GraphicIcon({ name, size, className, ...aria }: GraphicIconProps) {
  const uid = useId();
  const variant = GRAPHIC_ICONS[name];
  const idFor = (raw: string) => `graphic-icon-${uid}-${raw}`;
  const resolvedSize = size ?? viewBoxSize(variant.viewBox);

  const hasLabel = 'aria-label' in aria && Boolean(aria['aria-label']);

  return (
    <svg
      width={resolvedSize}
      height={resolvedSize}
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

function viewBoxSize(viewBox: string): number {
  const parts = viewBox.split(' ');
  return Number(parts[2]) || 0;
}

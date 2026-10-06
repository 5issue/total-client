'use client';

import { useId } from 'react';

import {
  CAROUSEL_ARROWS,
  type CarouselArrowDirection,
  type CarouselArrowVariant,
} from './carousel-arrow-icons.generated';

export type { CarouselArrowDirection, CarouselArrowVariant };

const DEFAULT_SIZE: Record<CarouselArrowVariant, number> = {
  outline: 40,
  filled: 36,
};

/**
 * 이미지 캐러셀 이전/다음 버튼 글리프. outline 은 이미지 위 오버레이용(연한 테두리),
 * filled 는 흰 배경 원형 버튼용. 색이 고정이라 currentColor 로 바꾸지 않는다.
 * 보통 `<button aria-label="이전">` 안에서 장식용(aria-hidden)으로 쓴다. 아이콘 자체가
 * 유일한 콘텐츠인 상호작용 요소라면 `aria-label` 을 직접 준다. (code-style-convention §5)
 */
export type CarouselArrowProps = {
  direction: CarouselArrowDirection;
  variant?: CarouselArrowVariant;
  /** px 단위. 지정하지 않으면 variant별 기본 사이즈(outline 40 / filled 36) */
  size?: number;
  className?: string;
} & (
  { 'aria-label': string; 'aria-hidden'?: never } | { 'aria-label'?: never; 'aria-hidden'?: true }
);

export function CarouselArrow({
  direction,
  variant = 'outline',
  size,
  className,
  ...aria
}: CarouselArrowProps) {
  const uid = useId();
  const def = CAROUSEL_ARROWS[variant][direction];
  const idFor = (raw: string) => `carousel-arrow-${uid}-${raw}`;
  const resolvedSize = size ?? DEFAULT_SIZE[variant];

  const hasLabel = 'aria-label' in aria && Boolean(aria['aria-label']);

  return (
    <svg
      width={resolvedSize}
      height={resolvedSize}
      viewBox={def.viewBox}
      fill="none"
      className={className}
      aria-label={hasLabel ? aria['aria-label'] : undefined}
      aria-hidden={hasLabel ? undefined : (aria['aria-hidden'] ?? true)}
      role={hasLabel ? 'img' : undefined}
    >
      {def.render(idFor)}
    </svg>
  );
}

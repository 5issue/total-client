'use client';

import { Icon, type IconName } from '@/components/atoms/Icon/Icon';

/**
 * 이전/다음 화살표 + "현재/전체" 카운터 페이지네이션 (Figma node 2482-3601).
 * 상품 이미지 갤러리처럼 페이지 단위 콘텐츠를 넘기는 곳에 쓴다.
 *
 * 화살표는 `atoms/CarouselArrow` 대신 themable 한 `Icon`(arrow-left/right) 을 쓴다.
 * CarouselArrow 는 색이 고정(neutral-300)이라, 이동 가능 여부에 따라 진하게/연하게
 * 바뀌어야 하는 이 컴포넌트의 요구(Figma 실측: 원 테두리는 항상 연함, 화살표 글리프만
 * 활성 시 text/primary(#222), 비활성 시 연한 톤)에 맞지 않는다.
 */
export type PaginationProps = {
  /** 1-based 현재 페이지 */
  current: number;
  total: number;
  onPrevious?: () => void;
  onNext?: () => void;
  className?: string;
};

function glyphColorClassName(enabled: boolean): string {
  return enabled ? 'text-fg' : 'text-fg-disabled';
}

function ArrowButton({
  icon,
  label,
  enabled,
  onClick,
}: {
  icon: IconName;
  label: string;
  enabled: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={!enabled}
      onClick={onClick}
      className="flex size-10 items-center justify-center"
    >
      <span
        className={`border-border flex size-9 items-center justify-center rounded-full border ${glyphColorClassName(enabled)}`}
      >
        <Icon name={icon} size={14} aria-hidden />
      </span>
    </button>
  );
}

export function Pagination({ current, total, onPrevious, onNext, className }: PaginationProps) {
  const canGoPrevious = current > 1 && Boolean(onPrevious);
  const canGoNext = current < total && Boolean(onNext);

  return (
    <div className={['flex items-center gap-4', className].filter(Boolean).join(' ')}>
      <ArrowButton
        icon="arrow-left"
        label="이전 페이지"
        enabled={canGoPrevious}
        onClick={onPrevious}
      />
      <span className="text-label-xs flex items-center gap-2 whitespace-nowrap">
        <span className="text-fg">{current}</span>
        <span className="text-fg-quaternary">/</span>
        <span className="text-fg-quaternary">{total}</span>
      </span>
      <ArrowButton icon="arrow-right" label="다음 페이지" enabled={canGoNext} onClick={onNext} />
    </div>
  );
}

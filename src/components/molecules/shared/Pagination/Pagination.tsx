'use client';

/**
 * 이전/다음 화살표 + "현재/전체" 카운터 페이지네이션 (Figma node 2482-3601 / 카트 캐러셀 node 188-9652).
 * 상품 이미지 갤러리처럼 페이지 단위 콘텐츠를 넘기는 곳에 쓴다.
 *
 * 화살표는 `atoms/CarouselArrow`(색 고정) 대신 자체 chevron 을 그린다 — 원 테두리는 항상
 * 연한 톤(`border-border`), 화살표 글리프만 이동 가능 시 `text/primary`(#222), 비활성 시
 * `text/disabled`. 글리프 크기는 node 188-9652 실측(약 8×10) 기준으로 `w-2.5 h-3`.
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

function ChevronGlyph({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 8 10" className="h-3 w-2.5" fill="none" aria-hidden>
      <path
        d={direction === 'left' ? 'M6 0.5 2 5 6 9.5' : 'M2 0.5 6 5 2 9.5'}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowButton({
  direction,
  label,
  enabled,
  onClick,
}: {
  direction: 'left' | 'right';
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
        <ChevronGlyph direction={direction} />
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
        direction="left"
        label="이전 페이지"
        enabled={canGoPrevious}
        onClick={onPrevious}
      />
      <span className="text-label-xs flex items-center gap-2 whitespace-nowrap">
        <span className="text-fg">{current}</span>
        <span className="text-fg-quaternary">/</span>
        <span className="text-fg-quaternary">{total}</span>
      </span>
      <ArrowButton direction="right" label="다음 페이지" enabled={canGoNext} onClick={onNext} />
    </div>
  );
}

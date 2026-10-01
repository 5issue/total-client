/**
 * 홈 진열 `ProductCard`(default)와 동일 외곽 크기의 로딩 스켈레톤 (molecule).
 * Figma node 577:20684 — `w-37.5` · `h-product-card` · `aspect-product-card`.
 */
export type ProductCardSkeletonProps = {
  className?: string;
};

const PULSE_BLOCK = 'bg-surface-secondary animate-pulse rounded-sm';

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div
      aria-hidden
      className={['h-product-card flex w-37.5 shrink-0 flex-col items-start gap-1', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={`aspect-product-card w-full ${PULSE_BLOCK}`} />
      <div className={`h-8 w-full ${PULSE_BLOCK}`} />
      <div className="flex w-full flex-col gap-1.5 pt-0.5">
        <div className={`h-3.5 w-12 ${PULSE_BLOCK}`} />
        <div className={`h-4 w-full ${PULSE_BLOCK}`} />
        <div className={`h-4 w-4/5 ${PULSE_BLOCK}`} />
        <div className={`h-5 w-20 ${PULSE_BLOCK}`} />
        <div className={`h-4 w-16 ${PULSE_BLOCK}`} />
      </div>
      <div className={`mt-0.5 h-5 w-18.5 rounded-full ${PULSE_BLOCK}`} />
    </div>
  );
}

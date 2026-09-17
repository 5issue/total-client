import { Icon } from '@/components/atoms/Icon';

/**
 * 공통 로딩 인디케이터 (atom) — Figma 665-60896 "LoadingDots". 점 3개가 순서대로
 * 살짝 떠올랐다 가라앉는다. 표시 전용(RSC 유지), `role="status"` + `sr-only` 라벨로
 * 접근 가능한 이름을 보강한다(화면엔 점만 보이므로).
 */
export interface LoadingIndicatorProps {
  /** 스크린리더 전용 안내 문구. */
  label?: string;
  className?: string;
}

const DOT_ANIMATION_CLASSNAME = [
  'animate-loading-dot-1',
  'animate-loading-dot-2',
  'animate-loading-dot-3',
];

export function LoadingIndicator({ label = '불러오는 중', className }: LoadingIndicatorProps) {
  return (
    <div
      role="status"
      className={['flex w-full items-center justify-center py-10', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center">
        {DOT_ANIMATION_CLASSNAME.map((animationClassName, i) => (
          <Icon
            key={i}
            name="loading"
            size={12}
            aria-hidden
            className={`${animationClassName} motion-reduce:animate-none`}
          />
        ))}
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

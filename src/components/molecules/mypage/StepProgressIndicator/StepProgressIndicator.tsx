import { Icon } from '@/components/atoms/Icon';

/**
 * 취소·반품·교환 진행 단계 표시 (molecule). Figma "5팀 UI 공유용" —
 * `StepProgressIndicator`(node 1233-115024, 취소 2단계 node 3312-4334).
 *
 * 단계 사이 연결선은 Figma 가 세그먼트별로 다른 SVG 애셋을 쓰지만(첫/마지막 단계는
 * 반쪽 스텁, 중간은 전체 선), 실제로는 전부 같은 회색 선이다(에셋이 위치별로만
 * 나뉜 것) — `border-border` 단색 선으로 통일했다. 점 아이콘은 공용 `Icon` 세트의
 * `dot`/`dot-active` 를 그대로 쓴다(Figma "Dot"/"Dot_Active" 와 이름이 일치).
 *
 * 라벨 타이포(실측): 활성 `Label/M_Medium`14/500 + `Brand/Primary` → `text-label-m
 * text-primary`, 비활성은 `Label/XS_Regular`14/400 + `Text/Primary`(Figma 원본은
 * letter-spacing -1px 이지만 대응하는 정식 유틸리티가 없어 임의값 대신 가장 가까운
 * 생성 유틸리티 `text-label-xs` 를 쓴다, code-style §6-1).
 */
export interface StepProgressIndicatorProps {
  /** 왼쪽부터 순서대로. */
  steps: string[];
  /** 현재 단계의 인덱스(0-based). */
  activeIndex: number;
  className?: string;
}

export function StepProgressIndicator({
  steps,
  activeIndex,
  className,
}: StepProgressIndicatorProps) {
  return (
    <div className={['flex w-full items-start', className].filter(Boolean).join(' ')}>
      {steps.map((step, index) => {
        const isActive = index === activeIndex;
        return (
          <div key={step} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-center gap-2">
              <div className={['h-px flex-1', index === 0 ? '' : 'bg-border'].join(' ')} />
              <Icon name={isActive ? 'dot-active' : 'dot'} size={20} aria-hidden />
              <div
                className={['h-px flex-1', index === steps.length - 1 ? '' : 'bg-border'].join(' ')}
              />
            </div>
            <p className={isActive ? 'text-label-m text-primary' : 'text-label-xs text-fg'}>
              {step}
            </p>
          </div>
        );
      })}
    </div>
  );
}

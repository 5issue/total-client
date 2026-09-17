import { Icon } from '@/components/atoms/Icon';

/**
 * 짧은 데이터 요청·화면 전환 대기(3초 이내) 구간에 쓰는 공통 로딩 인디케이터 (atom).
 * Figma "5팀 UI 공유용" node 665-60896 "LoadingDots" — `Icon/화면/12/Loading` 점 3개가
 * 12px 간격 없이 붙어 나열되고, 순서대로 하나씩 살짝 떠오르며 진해진다(node 메타데이터상
 * 첫 점만 2px 위로 올라간 좌표로 캡처돼 있어 그 오프셋을 그대로 애니메이션 진폭으로 썼다).
 * 헤더/BottomNav 는 그대로 두고 콘텐츠 영역에만 이 인디케이터를 띄운다(안내 문구·CTA 없음).
 *
 * 표시 전용, 상호작용 없음(RSC 유지). 동적으로 나타나는 대기 상태이므로 `role="status"`
 * (Toast/ErrorState 와 동일 패턴, code-style §5) — 화면에는 점만 보이므로 접근 가능한
 * 이름은 스크린리더 전용 텍스트(`sr-only`)로 보강한다.
 */
export interface LoadingIndicatorProps {
  /** 스크린리더 전용 안내 문구. */
  label?: string;
  className?: string;
}

const DOT_DELAY_CLASSNAME = ['', '[animation-delay:150ms]', '[animation-delay:300ms]'];

export function LoadingIndicator({ label = '불러오는 중', className }: LoadingIndicatorProps) {
  return (
    <div
      role="status"
      className={['flex w-full items-center justify-center py-10', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center">
        {DOT_DELAY_CLASSNAME.map((delayClassName, i) => (
          <Icon
            key={i}
            name="loading"
            size={12}
            aria-hidden
            className={['animate-loading-dot motion-reduce:animate-none', delayClassName]
              .filter(Boolean)
              .join(' ')}
          />
        ))}
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

import type { ReactNode } from 'react';

/**
 * 짧은 안내 메시지를 보여주는 pill/배너 (atom). Figma "5팀 디자인 시스템" —
 * `default`는 node 2428-1581 "Toast"(아이콘 + 한 줄 텍스트), `error`는 node
 * 2949-2915 "Error Toast"(텍스트만, 카드형)로 서로 완전히 다른 모양이다.
 *
 * - 표시 전용, 상호작용 없음(RSC 유지). 동적으로 나타나는 안내이므로
 *   `role="status"`(code-style §5 "동적 영역 알림").
 * - 실제 배치(화면 하단 고정 등)와 등장/퇴장 애니메이션은 이 atom의 책임이 아니다 —
 *   사용하는 organism/컨테이너가 위치를 잡는다.
 * - `default`의 아이콘(node 3050:2865)은 Figma에 벡터 데이터가 없는 raster 전용
 *   에셋이라 `public/graphic-icons/toast-card.webp`로 받아 `next/image`로 그린다 —
 *   그래서 `icon` prop은 `IconName`이 아니라 `ReactNode`로 받는다(Card atom과 동일
 *   패턴).
 * - `default` 텍스트는 Figma에서 Bold 굵기라 `font-bold`로 덮어쓴다(`text-label-l`
 *   자체 굵기는 600). 문구 일부를 다른 색으로 강조하는 건 컴포넌트가 강제하지 않고
 *   `children`을 통해 호출부가 구성한다(Card의 title/subtitle과 동일한 원칙).
 * - `error`는 아이콘이 없고 pill이 아니라 카드형(`rounded-m`, 균등 패딩, `shadow-m`)
 *   이라 `default`와 클래스를 공유하지 않는다. 폭은 hug-contents가 아니라 Figma
 *   실측 고정폭(385px → `w-96`)이다.
 */
export type ToastVariant = 'default' | 'error';

export interface ToastProps {
  variant?: ToastVariant;
  /** 장식용 아이콘(aria-hidden) — `variant="default"`에서만 쓴다. 접근 가능한 이름은 항상 children 텍스트가 담당. */
  icon?: ReactNode;
  /** 메시지. */
  children: ReactNode;
  className?: string;
}

export function Toast({ variant = 'default', icon, children, className }: ToastProps) {
  if (variant === 'error') {
    return (
      <div
        role="status"
        className={[
          'text-fg-danger bg-error shadow-m rounded-m inline-flex w-96 items-center p-3',
          'text-heading-4',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      role="status"
      className={[
        'text-fg-inverse inline-flex items-center gap-3 rounded-full bg-neutral-950 px-4 py-2',
        'text-label-l font-bold',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
      {children}
    </div>
  );
}

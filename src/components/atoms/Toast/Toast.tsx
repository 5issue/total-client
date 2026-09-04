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
 * - `default`의 아이콘("Icon/Ic/20/Card", node 3050:2865)은 Figma에 vector 데이터가
 *   없는 raster 전용 에셋이라(`download_assets` 확인 결과 `svgAssets: []`) 기존
 *   `Icon` 아톰(SVG 레지스트리) 대신 `public/graphic-icons/toast-card.webp` 로 받아
 *   `next/image` 로 그린다 — 그래서 `icon` prop 은 `IconName` 이 아니라 `ReactNode`로
 *   받는다(Card atom의 `icon` prop 과 동일한 이유·패턴).
 * - `default` 텍스트는 Figma에 `Pretendard:Bold`로 바인딩돼 있어(프로젝트
 *   `text-label-l` 자체는 600) `font-bold` 로 굵기만 덮어씀. 예시 카피가 두 색(흰색
 *   + `#F8EEFB`/brand-50 옅은 보라)으로 나뉘어 있었는데, 이건 특정 문구의 강조
 *   표현이라 컴포넌트가 강제하지 않고 `children` 을 통해 호출부가 구성한다(Card 의
 *   title/subtitle 과 동일한 원칙).
 * - `error` 는 아이콘이 없고, 모양 자체가 pill 이 아니라 카드형(`rounded-m`, 상하좌우
 *   균등 패딩, `shadow-m`)이라 `default` 와 클래스를 공유하지 않고 완전히 분리했다.
 * - `error` 는 hug-contents 가 아니라 실측 고정폭이다 — Figma 프레임이 385px 인데
 *   안쪽 텍스트("배송 상세정보를 입력해주세요.")보다 뚜렷하게 넓어서(내용에 딱
 *   맞췄다면 남는 여백이 없어야 함) 의도된 고정폭으로 판단, `w-96`(384px, 가장
 *   가까운 Tailwind 표준값)을 적용함.
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
      {icon ? <span className="shrink-0">{icon}</span> : null}
      {children}
    </div>
  );
}

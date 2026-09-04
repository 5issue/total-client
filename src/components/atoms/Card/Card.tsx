'use client';

import type { ReactNode } from 'react';

/**
 * 아이콘/타이틀/서브텍스트를 조합하는 소형 정보 행 (atom). Figma "5팀 디자인 시스템" —
 * node 2428-1556 "Card" 섹션 중 3가지 형태를 하나로 통합:
 *
 * - `Card`("컬리 큐레이터", 아이콘+타이틀+CTA) → `variant="surface"`(기본), `icon` 사용
 * - `Promo_Banner`("친구초대", 배지+링크텍스트) → `variant="plain"`, `title`/`subtitle`에
 *   배지·강조색은 호출부에서 JSX로 직접 구성(예: `title={<>친구초대 <Badge>N</Badge></>}`)
 * - `Menu_Card_Text`("앱 버전", 라벨+값+상태) → `variant="plain"`
 *
 * 세 형태가 레이아웃·타이포가 서로 달라 `title`/`subtitle`을 문자열이 아니라
 * `ReactNode`로 받는다 — Card는 공통 컨테이너(간격·기본 색)만 책임지고, 형태별
 * 세부 조판(굵기·배지·링크색)은 호출부가 구성한다.
 * `onClick`이 있으면 실제 `<button>`, 없으면 `<div>`로 렌더 — 가짜 role="button"
 * div 대신 네이티브 시맨틱을 쓴다(다른 atom과 동일한 원칙).
 *
 * - surface 타이틀은 Label 계열(14px), plain(Invite Friends/App Version)은 둘 다
 *   Heading/H4_SemiBold(16px)라 `TITLE_CLASSNAME`으로 variant 별로 분리했다.
 * - subtitle 기본 색은 `text-fg`(검정) — Figma 실제 subtitle 예시("시작하기")가
 *   title 과 동일한 검정이다. plain variant 의 두 실제 Figma 예시는 애초에 부제
 *   행이 없다(라벨+값이 한 줄) — Storybook 의 subtitle 예시 카피는 실제 노드에
 *   없는 임의 텍스트다.
 * - surface 타이틀의 -1px 자간은 Figma에 토큰 바인딩이 없는 raw 값이라(프로젝트
 *   자간 토큰은 0/0.01em 뿐) 임의값 추가 없이 보류(디자인 확인 필요).
 * - 컨테이너는 `inline-flex`(hug-contents) — Figma 3개 심볼 모두 내용 크기에 딱
 *   맞고 넓은 컨테이너에 놓인 사용 예가 없어, 기본은 내용 크기만큼만 차지하게
 *   하고 필요하면 호출부가 `className="w-full"`로 늘릴 수 있게 했다.
 */
export type CardVariant = 'surface' | 'plain';

export interface CardProps {
  variant?: CardVariant;
  /** `variant="surface"`에서만 쓰는 우측 아이콘 슬롯(36×36 권장). */
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  onClick?: () => void;
  className?: string;
}

const CONTAINER_CLASSNAME: Record<CardVariant, string> = {
  surface: 'items-center justify-between gap-2 rounded-m bg-surface-secondary px-4 py-3',
  plain: 'flex-col gap-1',
};

// surface(Card)는 Label 계열(14px), plain(Invite Friends/App Version)은 두 예시
// 모두 Heading/H4_SemiBold(16px)로 바인딩돼 있어 variant 별로 다르다.
const TITLE_CLASSNAME: Record<CardVariant, string> = {
  surface: 'text-label-l',
  plain: 'text-heading-4',
};

export function Card({
  variant = 'surface',
  icon,
  title,
  subtitle,
  onClick,
  className,
}: CardProps) {
  const Container = onClick ? 'button' : 'div';

  const content = (
    <>
      <div className="flex flex-col gap-1">
        <p className={[TITLE_CLASSNAME[variant], 'text-fg'].join(' ')}>{title}</p>
        {subtitle ? <p className="text-caption-m text-fg">{subtitle}</p> : null}
      </div>
      {variant === 'surface' && icon ? <span className="shrink-0">{icon}</span> : null}
    </>
  );

  return (
    <Container
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={['inline-flex text-left', CONTAINER_CLASSNAME[variant], className]
        .filter(Boolean)
        .join(' ')}
    >
      {content}
    </Container>
  );
}

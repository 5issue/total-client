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
 * 3개 노드(2428:1535 Card / 2581:3072 Invite Friends / 2581:3078 App Version)를
 * 직접 대조해 재검증함(2026-09-04):
 * - `surface`(Card) 타이틀은 Label 계열(14px) 이 맞는데, `plain` 두 예시(Invite
 *   Friends "친구초대", App Version "앱 버전")는 둘 다 `Heading/H4_SemiBold`
 *   (16px/600/24px) 로 바인딩돼 있다 — variant 공통으로 `text-label-l`(14px) 하나만
 *   쓰던 걸 `TITLE_CLASSNAME` 으로 분리해 `plain` 은 `text-heading-4`(16px) 쓰도록
 *   수정.
 * - subtitle 색: "시작하기" 는 Figma에 `Static/Black`(#222, title 과 동일한 검정)으로
 *   바인딩돼 있고 스크린샷 픽셀 샘플링(제목 행 최빈값 #222 vs 부제 행 최빈값도 채도
 *   없는 짙은 회색 — `fg-tertiary`(#7E8F9B, 청회색)라면 블렌드 픽셀에 파란기가
 *   섞여야 하는데 없음)으로 재확인했다 — 처음엔 `text-fg-tertiary`(옅은 회색)였는데
 *   틀림, `text-fg` 로 수정. `plain` variant 의 두 실제 Figma 예시는 애초에 진짜
 *   "부제" 행이 없다(둘 다 라벨+값이 같은 한 줄) — Storybook 의 PromoBanner/
 *   MenuCardText 예시가 넣은 subtitle 텍스트("친구 찾고 5천원 받기", "최신버전")는
 *   실제 노드에 없는 임의 예시 카피이니 참고만 할 것.
 * - `surface` 타이틀의 -1px 자간은 Figma 변수 바인딩이 없는 raw 값이라(프로젝트
 *   자간 토큰은 0/0.01em 뿐) 임의값 추가 없이 보류 — 디자인 확인 필요.
 * - 가로 크기: Figma 3개 심볼(149~150px) 모두 auto-layout 이 "hug contents"(내용에
 *   딱 맞춤)이고 별도의 "예시" 섹션(FloatingButton 처럼 넓은 컨테이너에 놓인 사용
 *   예)이 없다 — 즉 Figma 근거로는 고정폭이 맞다. 그런데 컨테이너에 `flex`(block
 *   레벨이라 부모 폭을 꽉 채움)를 써서 실제로는 옆으로 늘리면 같이 늘어났다 —
 *   `inline-flex` 로 수정해 기본은 내용 크기만큼만 차지하게 함(필요하면 호출부가
 *   `className="w-full"` 등으로 여전히 늘릴 수 있음).
 * - 컨테이너 `justify-between` 은 위 hug-contents 수정 이후에는 기본 상태에서 영향이
 *   없다(콘텐츠 크기 = 컨테이너 크기라 남는 공간이 없음) — 호출부가 폭을 넓히는
 *   경우에만 의미가 생기는데, 그 경우 아이콘이 우측 끝에 붙는 게 일반적인 카드
 *   패턴이라 그대로 둠(Figma엔 넓은 사용 예가 없어 확정 근거는 없음).
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

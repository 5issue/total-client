import type { ReactNode } from 'react';

import Link from 'next/link';

import { Card } from '@/components/atoms/Card';
import { Icon } from '@/components/atoms/Icon';

import type { LinkItem, LinkSectionData } from './model';

/**
 * "쇼핑" / "혜택" / "내 정보관리" / "서비스 안내" / "고객 지원" / "법적정보 및 기타" /
 * "계정" — 제목 + flex-wrap 링크 목록 패턴이 Shopping Section(node 910-110918) 안에서
 * 8번 반복돼 하나로 통합했다(structure-convention §3, 도메인 공용 패턴).
 *
 * 각 링크는 `atoms/Card`의 `variant="plain"`을 그대로 쓴다 — 이 화면의 `Promo_Banner`
 * ("친구초대", 배지+보라 부제)·`Menu_Card_Text`("앱 버전", 라벨+회색 부제) 둘 다 Card 의
 * plain 레이아웃(title 16px SemiBold + 선택 부제)과 실측이 같고, 부제 색만 서로 달라
 * `subtitle`을 ReactNode로 직접 구성해 넘긴다(Card 문서의 의도된 확장 지점).
 *
 * `href` 가 없는 링크는 목적지 화면이 아직 없다는 뜻이라 `Link` 로 감싸지 않는다 — Card 는
 * `onClick` 이 없으면 `<div>` 로 렌더돼 자연히 비상호작용이 된다(가짜 링크로 404 유도 금지).
 *
 * Figma 실측 행 높이는 32px 이지만 최소 터치 타깃 44px(code-style §5)에 못 미쳐 `li`에
 * `min-h-11`을 얹어 히트 영역만 넓힌다(`OrderDetailView`의 복사 버튼 38→44px 승격과
 * 같은 원칙 — 비상호작용(`href` 없음) 카드도 열 높이를 맞추려 동일하게 둔다).
 */
function LinkCard({ link }: { link: LinkItem }) {
  const card = (
    <Card
      variant="plain"
      title={
        <span className="inline-flex items-center gap-1">
          {link.label}
          {link.badge === 'new' ? <Icon name="new" size={14} aria-hidden /> : null}
        </span>
      }
      subtitle={
        link.subtitle ? (
          <span className="text-body-m text-primary">{link.subtitle}</span>
        ) : undefined
      }
      className="w-full"
    />
  );

  return (
    <li className="flex min-h-11 w-37.5 items-center">
      {link.href ? (
        <Link href={link.href} className="w-full">
          {card}
        </Link>
      ) : (
        card
      )}
    </li>
  );
}

export interface LinkSectionProps {
  section: LinkSectionData;
  /** App Info 섹션처럼 링크 목록 앞에 추가로 끼워 넣을 카드(앱 버전 등). */
  leadingCard?: ReactNode;
  /** 마지막 섹션(계정)은 Figma 상 하단 구분선이 없다. 기본 true. */
  divider?: boolean;
  className?: string;
}

export function LinkSection({ section, leadingCard, divider = true, className }: LinkSectionProps) {
  return (
    <section
      className={[
        'flex flex-col gap-5 px-1 py-8',
        divider ? 'border-border border-b' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {section.title ? (
        <h2 className="text-label-m text-fg-tertiary font-bold">{section.title}</h2>
      ) : null}
      <ul className="flex flex-wrap gap-x-7 gap-y-3">
        {leadingCard ? <li className="flex min-h-11 w-37.5 items-center">{leadingCard}</li> : null}
        {section.links.map((link) => (
          <LinkCard key={link.label} link={link} />
        ))}
      </ul>
    </section>
  );
}

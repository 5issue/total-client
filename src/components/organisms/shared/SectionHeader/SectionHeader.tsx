'use client';

import type { ReactNode } from 'react';

import Link from 'next/link';

import { Icon, type IconName } from '@/components/atoms/Icon';

/**
 * 화면 상단 네비게이션 헤더 (organism).
 * Figma "5팀 디자인 시스템" — "Indicator/Header Row" (node 2438-1743 / 194-10549 / 188-8908).
 *
 * 3영역 셸: `[leading] [center|title] [actions]`. 화면마다 조합이 달라 각 영역을 유연하게 둔다.
 * - `leading`: 프리셋 `'back'`(‹) / `'close'`(✕). `leadingHref`(링크) 또는 `onLeadingClick`(버튼)
 *   중 하나가 있을 때만 렌더. 없으면 왼쪽 비움.
 * - 가운데: `center` 노드(예: `<SearchBar/>`)가 있으면 그대로, 없고 `title` 이 있으면 `<h1>`.
 * - `actions`: 우측 아이콘 배열. 각 항목은 `label`(aria-label) + `href`/`onClick` 중 하나 필수.
 *   없으면 우측 비움.
 *
 * 홈 섹션 구획 헤더(제목 + 부제 + 전체보기)는 `molecules/shared/HomeSectionHeader` 로 별개다.
 *
 * 토큰(`get_variable_defs` node 2438-1743): 배경 `Bg/default` → `bg-surface`,
 * 제목 `Heading/H0_SemiBold` + `Text/Primary` → `text-heading-0 text-fg`,
 * 아이콘 28 / 터치 타깃 `Icon Height/XL` 44 → `size-11`, 여백 `Gap/XS`·`Margin/Default` → `pl-2 pr-4`.
 */
interface SectionHeaderActionBase {
  icon: IconName;
  /** aria-label — 아이콘 버튼은 목적지/동작을 서술해야 한다 (code-style §5). */
  label: string;
}

/** `href`(링크) 또는 `onClick`(버튼) 중 하나는 필수 — 동작 없는 버튼을 타입에서 막는다. */
export type SectionHeaderAction =
  | (SectionHeaderActionBase & { href: string; onClick?: () => void })
  | (SectionHeaderActionBase & { href?: never; onClick: () => void });

export interface SectionHeaderProps {
  /** 왼쪽 컨트롤 프리셋. `leadingHref`/`onLeadingClick` 중 하나와 함께 써야 렌더된다. */
  leading?: 'back' | 'close';
  /** leading 을 버튼으로 (예: `() => router.back()`). */
  onLeadingClick?: () => void;
  /** leading 을 링크로. `onLeadingClick` 보다 우선. */
  leadingHref?: string;
  /** leading 접근성 라벨 override. 기본: back→"뒤로 가기", close→"닫기". */
  leadingLabel?: string;

  /** 가운데 제목 — `<h1>` 로 렌더. `center` 가 있으면 무시. */
  title?: string;
  /** 가운데 커스텀 노드(예: `<SearchBar/>`). `title` 보다 우선. */
  center?: ReactNode;

  /** 오른쪽 액션 아이콘 목록. 생략 시 우측 비움. */
  actions?: SectionHeaderAction[];

  className?: string;
}

const ICON_BUTTON = 'inline-flex size-11 shrink-0 items-center justify-center';

const LEADING_PRESET: Record<'back' | 'close', { icon: IconName; label: string }> = {
  back: { icon: 'arrow-left', label: '뒤로 가기' },
  close: { icon: 'close', label: '닫기' },
};

/** 아이콘 하나짜리 링크 또는 버튼 (44px 터치 타깃). `href` 가 지정되면 링크. */
function IconControl({
  icon,
  label,
  href,
  onClick,
}: {
  icon: IconName;
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const glyph = <Icon name={icon} size={28} aria-hidden />;
  return href !== undefined ? (
    <Link href={href} aria-label={label} className={ICON_BUTTON}>
      {glyph}
    </Link>
  ) : (
    <button type="button" onClick={onClick} aria-label={label} className={ICON_BUTTON}>
      {glyph}
    </button>
  );
}

export function SectionHeader({
  leading,
  onLeadingClick,
  leadingHref,
  leadingLabel,
  title,
  center,
  actions,
  className,
}: SectionHeaderProps) {
  const preset = leading ? LEADING_PRESET[leading] : null;
  const showLeading = preset && (leadingHref || onLeadingClick);

  const centerNode =
    center ?? (title ? <h1 className="text-heading-0 text-fg truncate">{title}</h1> : null);

  return (
    <header
      className={['bg-surface flex items-center py-1 pr-4 pl-2', className]
        .filter(Boolean)
        .join(' ')}
    >
      {showLeading ? (
        <IconControl
          icon={preset.icon}
          label={leadingLabel ?? preset.label}
          href={leadingHref || undefined}
          onClick={onLeadingClick}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 items-center px-2">{centerNode}</div>

      {actions && actions.length > 0 ? (
        <nav aria-label="바로가기" className="flex shrink-0 items-center">
          {actions.map((action, i) => (
            <IconControl key={`${action.icon}-${i}`} {...action} />
          ))}
        </nav>
      ) : null}
    </header>
  );
}

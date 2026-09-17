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
 * 터치 타깃 `Icon Height/XL` 44 → `size-11`, 여백 `Gap/XS`·`Margin/Default` → `pl-2 pr-4`.
 * 아이콘 글리프는 32 — Figma 실측(28)보다 키운 값으로, 모바일에서 back/close 가시성을 높였다.
 *
 * `pt-header-safe-top`(globals.css `--spacing-header-safe-top`): `viewport-fit: cover`
 * (app/layout.tsx)라 콘텐츠가 기기 상단 안전영역(노치·상태바)까지 그려진다 — 이
 * 패딩 없으면 헤더 행(뒤로가기/제목/아이콘)이 상태바와 겹친다(실기기 QA 발견,
 * node 665:43034 TopNavigationBar 를 이 컴포넌트로 구현한 상품 상세에서 재현).
 * `HomeHeader` 가 이미 같은 이유로 쓰던 패턴 — 이 컴포넌트를 쓰는 다른 화면(장바구니/
 * 체크아웃/검색/배송지 등)에도 실기기에서 동일하게 있었을 결함이다.
 */
interface SectionHeaderActionBase {
  icon: IconName;
  /** aria-label — 아이콘 버튼은 목적지/동작을 서술해야 한다 (code-style §5). */
  label: string;
}

/**
 * `href`(링크) / `onClick`(버튼) 중 하나는 필수 — 동작 없는 버튼을 타입에서 막는다.
 * 예외: `pending: true` — 아이콘은 노출하되 아직 목적지가 없어 비배선(비상호작용)인 상태.
 */
export type SectionHeaderAction =
  | (SectionHeaderActionBase & { href: string; onClick?: () => void; pending?: never })
  | (SectionHeaderActionBase & { href?: never; onClick: () => void; pending?: never })
  | (SectionHeaderActionBase & { href?: never; onClick?: never; pending: true });

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
  /** 제목 타이포+색 클래스 override(기본 `text-heading-0 text-fg` 전체를 대체 — 부분
   *  병합이 아니다. `text-heading-*` 는 폰트사이즈/줄높이/자간/굵기를 한 클래스에
   *  묶어 내므로 둘을 같이 주면 캐스케이드 순서에 따라 뒤엉킨다). 화면마다 실제
   *  바인딩된 타입 스타일이 다르다 — 예: 상품 상세 TopNavigationBar(node 665:43034)는
   *  `Heading/H2_Medium`(`text-heading-2`)이라 기본값(H0_SemiBold)과 다르다. */
  titleClassName?: string;
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

/** 아이콘 하나짜리 링크 / 버튼 / (pending) 비배선 표시 (44px 터치 타깃). */
function IconControl({
  icon,
  label,
  href,
  onClick,
  pending,
}: {
  icon: IconName;
  label: string;
  href?: string;
  onClick?: () => void;
  pending?: boolean;
}) {
  const glyph = <Icon name={icon} size={28} aria-hidden />;
  if (pending) {
    // 목적지 화면이 아직 없어 클릭 불가 — 시각적으로만 노출한다(스크린리더 대상 아님).
    return (
      <span aria-hidden className={ICON_BUTTON}>
        {glyph}
      </span>
    );
  }
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
  titleClassName,
  center,
  actions,
  className,
}: SectionHeaderProps) {
  const preset = leading ? LEADING_PRESET[leading] : null;
  const showLeading = preset && (leadingHref || onLeadingClick);

  const centerNode =
    center ??
    (title ? (
      <h1 className={`${titleClassName ?? 'text-heading-0 text-fg'} truncate`}>{title}</h1>
    ) : null);

  return (
    <header
      className={[
        // py-1 대신 pb-1 + pt-header-safe-top 으로 쪼갰다 — py-1 과 pt-* 를 같이 쓰면
        // 같은 우선순위(단일 클래스)라 Tailwind 가 생성한 스타일시트 순서에 따라
        // padding-top 이 뒤엉킨다(DisplaySectionList 의 font-bold! 와 같은 함정).
        'bg-surface pt-header-safe-top flex items-center pr-4 pb-1 pl-2',
        className,
      ]
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

      {/* px-2 는 원본 Figma "Indicator/Header Row"(node 2438-1743, Hl4W114...
          디자인 시스템 파일) 의 "Logo Container" 자체 패딩 — 행의 gap 이 아니라
          center 슬롯 고유 스펙이라 leading/actions 유무와 무관하게 항상 유지한다. */}
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

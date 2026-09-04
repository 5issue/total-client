import Link from 'next/link';

import { Icon } from '@/components/atoms/Icon';

/**
 * 섹션 상단 헤더 — 제목 + 부제 + "전체보기" 링크 (molecule).
 * Figma "5팀 디자인 시스템" — node 2429-2288 "Section_Header".
 *
 * 홈 섹션·추천 캐러셀·리스트 구획 상단에 반복되는 패턴. 상태·핸들러가 없어 서버 컴포넌트다.
 * `href` 가 있을 때만 우측 링크를 렌더한다.
 *
 * 토큰(`get_variable_defs` node 2429-2288): 제목 `Heading/H2_Medium` → `text-heading-2`,
 * 부제 `Label/XL_Bold` → `text-label-xl`, 링크 `Label/L_SemiBold` + `Brand/Primary` → `text-label-l text-primary`.
 * 링크 hover/active/focus 는 `Button` atom 의 `variant="text" size="s"` 와 동일하게 맞춘다
 * (내비게이션이라 `<a>` 여야 해서 `Button` 을 직접 못 쓰고 클래스만 맞춤).
 */
export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** 있으면 우측에 "전체보기" 링크를 렌더한다. Next 경로. */
  href?: string;
  /** 링크 문구. 기본 "전체보기". */
  linkLabel?: string;
  /** 제목 heading 레벨. 페이지 문맥에 맞춘다. 기본 2. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel = '전체보기',
  headingLevel = 2,
  className,
}: SectionHeaderProps) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';

  return (
    <div
      className={['flex items-start justify-between gap-3 pl-4', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Heading className="text-heading-2 text-fg">{title}</Heading>
        {subtitle ? <p className="text-label-xl text-fg-tertiary">{subtitle}</p> : null}
      </div>

      {href ? (
        <Link
          href={href}
          aria-label={`${title} ${linkLabel}`}
          className="text-label-l text-primary rounded-m focus-visible:outline-border-active hover:bg-brand-100 active:bg-brand-200 inline-flex min-h-11 shrink-0 items-center gap-1 py-2 pl-1 whitespace-nowrap outline-offset-2 transition-colors focus-visible:outline-2 motion-reduce:transition-none"
        >
          {linkLabel}
          <Icon name="arrow-right" size={20} aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}

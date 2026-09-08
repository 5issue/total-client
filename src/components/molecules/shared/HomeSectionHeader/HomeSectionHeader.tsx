import Link from 'next/link';

import { Icon } from '@/components/atoms/Icon';

/**
 * 홈 섹션 상단 헤더 — 제목 + (선택) 부제 + (선택) "광고" 라벨 + (선택) "전체보기" 링크 (molecule).
 * Figma "5팀 디자인 시스템". 표준형 `Section_Header`(node 2757-2678, 제목 + 광고 + 링크)와
 * 부제형(node 2429-2288, 제목 + 부제 + 링크)을 한 컴포넌트로 통합했다.
 *
 * 화면 상단 네비게이션 바(뒤로가기 + 로고 + 아이콘)는 별개 컴포넌트다 —
 * `organisms/shared/SectionHeader` 참고.
 *
 * 홈 섹션·추천 캐러셀·리스트 구획 상단에 반복되는 패턴. 상태·핸들러가 없어 서버 컴포넌트다.
 * `href` 가 있을 때만 우측 링크를, `ad` 가 true 일 때만 제목 옆 "광고" 라벨을 렌더한다.
 *
 * 토큰(`get_variable_defs`):
 * - 제목: 부제가 있으면 `Heading/H2_Medium`(node 2429-2288) → `text-heading-2`,
 *   없으면 `Heading/H4_SemiBold`(node 2757-2678) → `text-heading-4`. 색 `Text/Primary` → `text-fg`.
 * - 부제: `Label/XL_Bold` + `Text/Tertiary` → `text-label-xl text-fg-tertiary`.
 * - 링크: `Label/L_SemiBold` + `Brand/Primary` + arrow 20 → `text-label-l text-primary`.
 *   hover/active/focus 는 `Button` atom 의 `variant="text" size="s"` 클래스와 동일하게 맞춘다
 *   (내비게이션이라 `<a>` 여야 해서 `Button` 을 직접 못 쓰고 클래스만 맞춤).
 * - "광고" 라벨: `Ad_Label_M`(node 2838-2230) — `Bg/secondary` `Radius/Full` `Caption/L` `Text/disabled`
 *   → `bg-surface-secondary rounded-full text-caption-l text-fg-disabled`. Figma 에선 Badge 의 변형이지만
 *   코드 `Badge` atom(purple/cyan 전용)에 이 회색 형태가 없어 인라인으로 둔다(링크와 동일 판단).
 */
export interface HomeSectionHeaderProps {
  title: string;
  subtitle?: string;
  /** true 면 제목 옆에 "광고" 라벨을 렌더한다 (node 2757-2678). */
  ad?: boolean;
  /** 있으면 우측에 "전체보기" 링크를 렌더한다. Next 경로. */
  href?: string;
  /** 링크 문구. 기본 "전체보기". */
  linkLabel?: string;
  /** 제목 heading 레벨. 페이지 문맥에 맞춘다. 기본 2. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export function HomeSectionHeader({
  title,
  subtitle,
  ad = false,
  href,
  linkLabel = '전체보기',
  headingLevel = 2,
  className,
}: HomeSectionHeaderProps) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';

  return (
    <div
      className={[
        'flex justify-between gap-3 pl-4',
        subtitle ? 'items-start' : 'items-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <Heading className={`${subtitle ? 'text-heading-2' : 'text-heading-4'} text-fg`}>
            {title}
          </Heading>
          {ad ? (
            /*
             * Figma Ad_Label_M(node 2838-2230)의 회색 pill. 배경·크기·radius 는 Figma 값 그대로.
             * 텍스트 색은 Figma 의 `Text/disabled`(#b5c4cf)가 `bg-surface-secondary`(#f0f5f8) 대비
             * 1.6:1 로 code-style §5 "본문 대비 ≥ 4.5:1" 미달 — "광고"는 화면·스크린리더 모두에
             * 노출되는 고지 텍스트라 승인된 대비 조합 `text-fg-secondary`(#515e69, 5.9:1)로 올린다.
             * 해당 노드에 Figma 코멘트로 색 동기화 요청. (CodeRabbit PR #49 반영)
             */
            <span className="text-caption-l text-fg-secondary bg-surface-secondary inline-flex h-5 shrink-0 items-center rounded-full px-2">
              광고
            </span>
          ) : null}
        </div>
        {subtitle ? <p className="text-label-xl text-fg-tertiary">{subtitle}</p> : null}
      </div>

      {href ? (
        <Link
          href={href}
          aria-label={`${title} ${linkLabel}`}
          className="text-label-l text-primary rounded-m focus-visible:outline-border-active hover:bg-brand-100 active:bg-brand-200 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1 py-2 pl-1 whitespace-nowrap outline-offset-2 transition-colors focus-visible:outline-2 motion-reduce:transition-none"
        >
          {linkLabel}
          <Icon name="arrow-right" size={20} aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}

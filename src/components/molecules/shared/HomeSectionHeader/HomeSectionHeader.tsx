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
 * - 제목: 기본은 부제 유무로 자동 결정 — 있으면 `Heading/H2_Medium`(node 2429-2288)
 *   → `text-heading-2`, 없으면 `Heading/H4_SemiBold`(node 2757-2678) → `text-heading-4`.
 *   ⚠️ 화면마다 항상 맞는 규칙은 아니다 — 검색 화면(577-13977/14028)은 부제가 없어도
 *   Figma CSS 실측 기준 18px/weight 700 을 쓴다. `text-heading-2` 토큰은 이름이 "Medium"
 *   이지만 실제 weight 는 500 이라 그대로 쓰면 더 얇게 나온다. 토큰 자체를 바꾸면
 *   이 컴포넌트를 쓰는 다른 곳(Calendar/Modal/CloseButton/TabItem)에 영향이 가므로,
 *   그런 화면은 `titleSize="h2"` + `titleClassName="font-bold!"` 로 override 한다 — 홈
 *   진열 섹션(node 577:13064 등, 바인딩된 스타일명 H2_Medium=500과 달리 레이어에서
 *   Bold(700)로 수동 오버라이드된 인스턴스)도 같은 방식으로 켠다.
 *   단, 검색 화면(`RecentSearchesSection`/`RecommendedKeywordsSection`/`TrendingSearchesSection`)
 *   은 디자인 QA(#132) 로 700 이 두껍다는 피드백을 받아 `font-semibold!`(600) 로 100 낮췄다 —
 *   위 Figma 실측(700)과 달라진 지점이니 그 화면들을 만질 때는 이 주석의 "700"이 아니라
 *   각 파일의 override 값을 기준으로 볼 것.
 *   색 `Text/Primary` → `text-fg`.
 * - 부제: `Label/XL_Bold` + `Text/Tertiary` → `text-label-xl text-fg-tertiary`.
 * - 링크: `Label/L_SemiBold` + `Brand/Primary` + arrow 20 → `text-label-l text-primary`.
 *   hover/active/focus 는 `Button` atom 의 `variant="text" size="s"` 클래스와 동일하게 맞춘다
 *   (내비게이션이라 `<a>` 여야 해서 `Button` 을 직접 못 쓰고 클래스만 맞춤).
 * - "광고" 라벨: `Ad_Label_M`(node 2838-2230) — `Bg/secondary` `Radius/Full` `Caption/L` `Text/disabled`
 *   → `bg-surface-secondary rounded-full text-caption-l text-fg-disabled`. Figma 에선 Badge 의 변형이지만
 *   코드 `Badge` atom(purple/cyan 전용)에 이 회색 형태가 없어 인라인으로 둔다(링크와 동일 판단).
 *
 * 바깥 행(제목/부제 열 ↔ "전체보기" 링크) 사이에 추가 `gap` 을 주지 않는다 — Figma
 * 원본(예: node 577:20696)도 이 둘 사이에 gap 클래스가 없다. 제목/부제 열이
 * `flex-1` 이라 남는 공간을 전부 가져가므로 gap 을 더하면 그만큼 부제 폭이 줄어
 * 긴 부제("최대 혜택으로 선물하세요! 쿠폰+최대 77% OFF" 등)의 마지막 단어가
 * 다음 줄로 밀려났다(실기기 확인) — gap 제거로 Figma 폭 그대로 복구.
 */
export interface HomeSectionHeaderProps {
  title: string;
  subtitle?: string;
  /** 제목 시각 크기 override. 생략하면 subtitle 유무로 자동 결정(있으면 h2, 없으면
   *  h4) — 디자인 시스템 일반 규칙. 검색 화면처럼 subtitle 없이도 h2 크기가 필요하면
   *  명시로 지정한다. */
  titleSize?: 'h2' | 'h4';
  /** 제목 요소에 추가할 클래스 — font-weight 등 개별 화면 override 용. */
  titleClassName?: string;
  /** 부제 요소에 추가할 클래스 — font-weight 등 개별 화면 override 용(titleClassName 과 동일 용도). */
  subtitleClassName?: string;
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
  titleSize,
  titleClassName,
  subtitleClassName,
  ad = false,
  href,
  linkLabel = '전체보기',
  headingLevel = 2,
  className,
}: HomeSectionHeaderProps) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  const resolvedTitleSize = titleSize ?? (subtitle ? 'h2' : 'h4');

  return (
    <div
      className={['flex justify-between px-4', subtitle ? 'items-start' : 'items-center', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <Heading
            className={[
              resolvedTitleSize === 'h2' ? 'text-heading-2' : 'text-heading-4',
              'text-fg',
              titleClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          >
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
        {subtitle ? (
          <p
            className={['text-label-xl text-fg-tertiary', subtitleClassName]
              .filter(Boolean)
              .join(' ')}
          >
            {subtitle}
          </p>
        ) : null}
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

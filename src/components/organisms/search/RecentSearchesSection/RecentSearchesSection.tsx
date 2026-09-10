'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Chip } from '@/components/atoms/Chip';
import { PageIndicator } from '@/components/atoms/PageIndicator';
import { HomeSectionHeader } from '@/components/molecules/shared/HomeSectionHeader';
import { useRecentSearches } from '@/hooks/search/useRecentSearches';

export interface RecentSearchesSectionProps {
  className?: string;
}

const CHIP_CLASSNAME = 'shrink-0';

/**
 * 검색 화면 "최근 검색어" 섹션 (organism).
 * Figma "5팀 UI 공유용" — 1줄 기본 상태 node 577-13977, 2줄+페이지 컨트롤 상태
 * node 577-13926. 칩은 `atoms/Chip`(onRemove 버전, `fill="none"`)을 재사용 — Figma
 * 실측(Border/Strong #dde4ed, Label_L_SemiBold, Icon/Tertiary, 배경 없음)이 정확히
 * 일치한다. 페이지 점은 `atoms/PageIndicator`(tone="purple").
 *
 * `useRecentSearches`(localStorage 기반)를 직접 호출한다 — 원격 데이터가 아니라
 * 브라우저 로컬 이력이라 hooks/<domain> 의 서버 fetch 금지 규칙(api-convention §1)
 * 대상이 아니라고 판단했다. `SearchPageHeader`도 같은 훅을 호출해 검색 시
 * `addKeyword` 로 기록한다 — 두 컴포넌트는 부모/자식이 아니라 훅 내부의 모듈
 * 캐시(`useSyncExternalStore`)로 동기화된다.
 *
 * ⚠️ 페이지네이션 방식(재설계) — Figma 는 칩을 표준 `flex-wrap`(가로 우선, 왼쪽→
 * 오른쪽으로 채우다 넘치면 다음 줄)으로 배치한다. "2줄 넘으면 다음 페이지를 가로
 * 스와이프로" 요구사항을 그대로 CSS 만으로 만족시킬 방법이 없다 — flex-wrap 은
 * 세로로만 계속 늘어나고, 칩 폭이 텍스트마다 달라 "정확히 2줄만큼 몇 개가 들어가는지"
 * 를 CSS가 미리 알 수 없다. 그래서 보이지 않는 측정용 사본을 실제와 같은 폭으로
 * 렌더해 각 칩의 `offsetTop` 으로 줄을 구분하고, 2줄씩 묶어 "페이지" 배열을 만든
 * 다음, 그 페이지 단위로 실제 가로 스크롤 목록을 렌더한다. (처음 시도했던
 * `flex-col flex-wrap` 2개씩 세로 채움 트릭은 배치 순서가 Figma 의 가로 우선
 * 순서와 달라서 폐기 — 칩이 2개뿐일 때 나란히가 아니라 위아래로 쌓여 보였다.)
 */
export function RecentSearchesSection({ className }: RecentSearchesSectionProps) {
  const { keywords, removeKeyword } = useRecentSearches();
  const measureRef = useRef<HTMLDivElement>(null);
  const chipNodesRef = useRef(new Map<string, HTMLElement>());
  const [pages, setPages] = useState<string[][] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // 1단계: 숨겨둔 측정용 사본의 실제 렌더 결과로 줄 바뀜 지점을 찾아 페이지를 만든다.
  useLayoutEffect(() => {
    const nodes = keywords.map((k) => chipNodesRef.current.get(k));
    if (nodes.length === 0 || nodes.some((n) => !n)) {
      setPages(null);
      return;
    }

    const rows: string[][] = [];
    let lastTop = Number.NaN;
    keywords.forEach((keyword, i) => {
      const top = nodes[i]!.offsetTop;
      if (top !== lastTop) {
        rows.push([]);
        lastTop = top;
      }
      rows.at(-1)!.push(keyword);
    });

    if (rows.length <= 2) {
      setPages(null);
      return;
    }

    const grouped: string[][] = [];
    for (let i = 0; i < rows.length; i += 2) {
      grouped.push(rows.slice(i, i + 2).flat());
    }
    setPages(grouped);
  }, [keywords]);

  // 2단계: 페이지가 여러 개면(가로 스크롤 가능) 스크롤 위치로 현재 페이지를 추적한다.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !pages || pages.length <= 1) {
      setActiveIndex(0);
      return;
    }
    const updateActiveIndex = () => {
      if (el.clientWidth === 0) return;
      const idx = Math.min(pages.length - 1, Math.round(el.scrollLeft / el.clientWidth));
      setActiveIndex((prev) => (prev === idx ? prev : idx));
    };
    updateActiveIndex();
    el.addEventListener('scroll', updateActiveIndex, { passive: true });
    return () => el.removeEventListener('scroll', updateActiveIndex);
  }, [pages]);

  if (keywords.length === 0) return null;

  const setChipNode = (keyword: string) => (node: HTMLElement | null) => {
    if (node) chipNodesRef.current.set(keyword, node);
    else chipNodesRef.current.delete(keyword);
  };

  return (
    <div
      className={['relative flex flex-col gap-3 px-4 py-4', className].filter(Boolean).join(' ')}
    >
      <HomeSectionHeader title="최근 검색어" />

      {/* 측정 전용 사본 — 실제 콘텐츠 폭 그대로, 화면엔 안 보인다. */}
      <div
        ref={measureRef}
        aria-hidden
        className="invisible absolute inset-x-4 top-0 -z-10 flex flex-wrap gap-x-2 gap-y-1"
      >
        {keywords.map((keyword) => (
          <span key={keyword} ref={setChipNode(keyword)}>
            <Chip fill="none" className={CHIP_CLASSNAME} onRemove={() => {}}>
              {keyword}
            </Chip>
          </span>
        ))}
      </div>

      {pages ? (
        <div ref={scrollRef} className="scrollbar-hide flex overflow-x-auto">
          {pages.map((page, i) => (
            <div
              key={i}
              className="flex w-full shrink-0 flex-wrap content-start gap-x-2 gap-y-1"
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              onTouchCancel={(e) => e.stopPropagation()}
            >
              {page.map((keyword) => (
                <Chip
                  key={keyword}
                  fill="none"
                  className={CHIP_CLASSNAME}
                  onRemove={() => removeKeyword(keyword)}
                >
                  {keyword}
                </Chip>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          {keywords.map((keyword) => (
            <Chip
              key={keyword}
              fill="none"
              className={CHIP_CLASSNAME}
              onRemove={() => removeKeyword(keyword)}
            >
              {keyword}
            </Chip>
          ))}
        </div>
      )}

      {pages && pages.length > 1 ? (
        <PageIndicator
          tone="purple"
          count={pages.length}
          activeIndex={activeIndex}
          aria-label={`최근 검색어 ${pages.length}페이지 중 ${activeIndex + 1}번째`}
          className="self-center"
        />
      ) : null}
    </div>
  );
}

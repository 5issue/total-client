'use client';

import { useEffect, useState } from 'react';

import { Icon } from '@/components/atoms/Icon';
import { useProductAutocomplete } from '@/hooks/product/useProducts';
import { useRecentSearches } from '@/hooks/search/useRecentSearches';

export interface SearchSuggestionsSectionProps {
  query: string;
  /** 자동완성 항목 선택 시 호출 — 그 키워드로 검색을 제출한다(결과 화면으로 전환). */
  onSelectKeyword: (keyword: string) => void;
}

/** 타이핑이 멎고 이만큼 지나야 자동완성을 요청한다 — 매 키입력마다 요청을 보내지 않기 위함. */
const AUTOCOMPLETE_DEBOUNCE_MS = 300;

/** `query`가 이 시간 동안 안 바뀌면 그 값을 반환한다(디바운스). */
function useDebouncedValue(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

/**
 * 검색창에 입력 중일 때 기본 콘텐츠(최근 검색어 등) 대신 뜨는 자동완성/연관검색어
 * 드롭다운 (organism). Figma "5팀 UI 공유용" — node 577-13164/13239/13375(리스트
 * 기본·키패드 ON·OFF·긴 검색어), 577-13449/13525(브랜드관 1개·2개 노출),
 * 577-13279(리스트 아이템 pressed).
 *
 * 제안 목록은 `GET /api/v1/products/autocomplete`(백엔드 레포
 * `ProductAutocompleteService.java` 확인) 실데이터다 — 상품명이 아니라 `search_keyword`
 * 테이블에 큐레이션된 정제 키워드라, 용량만 다른 상품명이 중복 제안되지 않는다.
 *
 * 브랜드관 행(0~2개, node 577-13449 vs 577-13525)은 대응 API가 없어 여전히 목데이터다 —
 * 자동완성 응답(`suggestions: string[]`)에 브랜드관 여부를 구분할 필드 자체가 없다.
 * 브랜드관 전용 라우트도 아직 없어(구조 컨벤션에도 미정) 링크가 아니라 비활성 표시로만
 * 둔다 — 동작 없는 버튼/링크를 만들지 않기 위함(code-style 컨벤션).
 *
 * 리스트 아이템 pressed 상태(577-13279, `bg-surface-secondary`)는 별도 state 없이
 * `active:` 로 처리한다.
 */
const MOCK_BRANDS = ['우유니'];

export function SearchSuggestionsSection({
  query,
  onSelectKeyword,
}: SearchSuggestionsSectionProps) {
  const { addKeyword } = useRecentSearches();
  const debouncedQuery = useDebouncedValue(query, AUTOCOMPLETE_DEBOUNCE_MS);
  const { data, isPending } = useProductAutocomplete(debouncedQuery);
  const suggestions = data?.suggestions ?? [];

  if (!query.trim()) return null;

  const handleSelect = (keyword: string) => {
    addKeyword(keyword);
    onSelectKeyword(keyword);
  };

  return (
    <div className="flex flex-1 flex-col">
      {MOCK_BRANDS.length > 0 ? (
        <>
          <div className="flex flex-col gap-2 px-4 pt-4 pb-2">
            {MOCK_BRANDS.map((brand) => (
              <div key={brand} className="flex items-center justify-between py-1">
                <span className="flex items-center gap-3">
                  <span className="text-body-m text-fg">{brand}</span>
                  <span className="text-caption-m text-fg-secondary">브랜드관</span>
                </span>
                <Icon name="arrow-right" size={28} className="text-fg-secondary" aria-hidden />
              </div>
            ))}
          </div>
          <div className="border-border border-t" />
        </>
      ) : null}

      {/* 디바운스 대기 중엔 직전 목록을 그대로 보여주고, 실제 요청이 뜬 뒤 로딩일 때만
          문구로 바꾼다 — 안 그러면 한 글자 칠 때마다 목록이 깜빡인다. */}
      {isPending && debouncedQuery === query ? (
        <p className="text-label-m text-fg-tertiary px-4 py-6">불러오는 중이에요.</p>
      ) : (
        <ul className="flex flex-col py-1">
          {suggestions.map((keyword) => (
            <li key={keyword}>
              <button
                type="button"
                onClick={() => handleSelect(keyword)}
                // h-10(40px)는 Figma 실측 고정값(node 577-13164 "List_Search Item") —
                // 접근성 권장 44px 터치 타깃과 충돌하지만, atoms/Chip 과 같은 이유로
                // 검증된 디자인 치수를 임의로 늘리지 않는다.
                className="active:bg-surface-secondary flex h-10 w-full items-center gap-3 px-4 text-left transition-colors"
              >
                <Icon name="search" size={24} className="text-fg-quaternary shrink-0" aria-hidden />
                <span className="text-body-m text-fg truncate">{keyword}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

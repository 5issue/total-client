'use client';

import { Icon } from '@/components/atoms/Icon';
import { useRecentSearches } from '@/hooks/search/useRecentSearches';

export interface SearchSuggestionsSectionProps {
  query: string;
  /** 자동완성 항목 선택 시 호출 — 검색창 값을 해당 키워드로 채운다. */
  onSelectKeyword: (keyword: string) => void;
}

/**
 * 검색창에 입력 중일 때 기본 콘텐츠(최근 검색어 등) 대신 뜨는 자동완성/연관검색어
 * 드롭다운 (organism). Figma "5팀 UI 공유용" — node 577-13164/13239/13375(리스트
 * 기본·키패드 ON·OFF·긴 검색어), 577-13449/13525(브랜드관 1개·2개 노출),
 * 577-13279(리스트 아이템 pressed).
 *
 * ⚠️ 목데이터 — 자동완성 API 가 아직 없다(스코프2 대기, api-convention §1 은 문서
 * 스펙만 존재). Figma 목업도 "위"/"우유"/긴 텍스트 등 서로 다른 쿼리에 전부 동일한
 * 예시 리스트를 쓴다 — 실제 매칭 로직은 만들지 않았다. API 연동 시 이 컴포넌트를
 * `useSearchSuggestions(query)` 훅 기반으로 교체하면 된다.
 *
 * 브랜드관 행(0~2개, node 577-13449 vs 577-13525)은 매칭되는 브랜드 유무에 따라
 * 달라지는 데이터라 배열 길이로 표현했다 — 지금은 1개 노출 예시를 고정 목데이터로 둔다.
 * 브랜드관 전용 라우트가 아직 없어(구조 컨벤션에도 미정) 링크가 아니라 비활성 표시로만
 * 둔다 — 동작 없는 버튼/링크를 만들지 않기 위함(code-style 컨벤션).
 *
 * 리스트 아이템 pressed 상태(577-13279, `bg-surface-secondary`)는 별도 state 없이
 * `active:` 로 처리한다.
 */
const MOCK_BRANDS = ['우유니'];

const MOCK_SUGGESTIONS = [
  '우유',
  '우유 락토프리',
  '우유 저지방',
  '우유 A2',
  '우유 2.3L',
  '우유 식빵',
  '우유 200ML',
  '우유 500',
  '우유스틱',
  '우육탕면',
];

export function SearchSuggestionsSection({
  query,
  onSelectKeyword,
}: SearchSuggestionsSectionProps) {
  const { addKeyword } = useRecentSearches();

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

      <ul className="flex flex-col py-1">
        {MOCK_SUGGESTIONS.map((keyword) => (
          <li key={keyword}>
            <button
              type="button"
              onClick={() => handleSelect(keyword)}
              className="active:bg-surface-secondary flex h-10 w-full items-center gap-3 px-4 text-left transition-colors"
            >
              <Icon name="search" size={24} className="text-fg-quaternary shrink-0" aria-hidden />
              <span className="text-body-m text-fg truncate">{keyword}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

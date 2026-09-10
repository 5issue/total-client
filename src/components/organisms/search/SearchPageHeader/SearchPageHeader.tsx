'use client';

import { useRouter } from 'next/navigation';

import { SearchBar } from '@/components/atoms/SearchBar';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';

/**
 * 검색 화면(`/search`) 상단 바 — 뒤로가기 + `SearchBar` (organism).
 * Figma "5팀 UI 공유용" node 577-13744, 키패드 비활성화(기본) 상태.
 *
 * `SectionHeader`(뒤로가기 프리셋 + center 커스텀 노드) 조합 그대로 재사용한다.
 * 뒤로가기는 이전 화면(홈 등 진입 지점)이 다양해 고정 링크가 아니라
 * `router.back()` — `SectionHeader` 문서 주석이 안내하는 패턴 그대로.
 * `SearchBar` 자체가 이미 클라이언트 컴포넌트라 이 조합은 어차피 클라 경계이므로,
 * 페이지 전체가 아니라 이 헤더 하나만 잎(leaf)으로 분리했다(code-style §8).
 *
 * SearchBar 폭은 292px 고정(w-73) — Figma 인스턴스 실측(get_metadata 절대좌표 +
 * Dev Mode "Copy as CSS": `width: 292px`, Fill 이 아니라 Fixed)으로 확인된 스펙이다.
 * `SectionHeader` 의 center 슬롯은 flex-1 이라 남는 공간이 있어도, 292px 로 고정된
 * 이 래퍼가 좌측에 붙고 나머지는 Figma 그대로 빈 여백으로 남는다.
 */
export function SearchPageHeader() {
  const router = useRouter();

  return (
    <SectionHeader
      leading="back"
      onLeadingClick={() => router.back()}
      center={
        <div className="w-73">
          <SearchBar label="검색어 입력" />
        </div>
      }
    />
  );
}

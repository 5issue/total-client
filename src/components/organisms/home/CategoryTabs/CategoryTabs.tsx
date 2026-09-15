'use client';

import { useState } from 'react';

import { TabBar, type TabBarItem } from '@/components/molecules/shared/TabBar';

/**
 * 홈 상단 카테고리 탭 — 추천/베스트/단독/멤버스… 가로 스크롤 (organism).
 * Figma "HomeScreen" > "Tab_Item" (node 577:20633), 15개 고정 항목.
 *
 * `molecules/shared/TabBar` 를 그대로 재사용한다(`tone="brand-primary"` = 추천 계열
 * 액티브 컬러, `size="sm"` = Label/M 14px SemiBold — Figma 실측과 일치). TabBar 는
 * roving tabIndex/방향키 이동을 이미 구현하고 있어 새로 만들지 않는다.
 *
 * 탭 선택은 아직 콘텐츠 필터링에 연결되지 않는다(홈 진열 섹션은 API/기획 미확정 —
 * structure-convention §6-2) — 이번 UI 퍼블리싱 단계는 로컬 활성 탭 표시만 한다.
 */
const CATEGORY_ITEMS: TabBarItem[] = [
  { id: 'recommend', label: '추천' },
  { id: 'best', label: '베스트' },
  { id: 'exclusive', label: '단독' },
  { id: 'members', label: '멤버스' },
  { id: 'sale', label: '세일' },
  { id: 'fashion', label: '의류' },
  { id: 'living', label: '리빙' },
  { id: 'new', label: '신상' },
  { id: 'deal', label: '특가/혜택' },
  { id: 'new-product', label: '신상품' },
  { id: 'bestseller', label: '베스트셀러' },
  { id: 'recommend-product', label: '추천 상품' },
  { id: 'coupon', label: '할인 쿠폰' },
  { id: 'member-only', label: '회원 전용 혜택' },
  { id: 'event', label: '이벤트 안내' },
];

export type CategoryTabsProps = {
  className?: string;
};

export function CategoryTabs({ className }: CategoryTabsProps) {
  const [activeId, setActiveId] = useState(CATEGORY_ITEMS[0]!.id);

  return (
    <TabBar
      items={CATEGORY_ITEMS}
      activeId={activeId}
      onChange={setActiveId}
      tone="brand-primary"
      size="sm"
      className={className}
    />
  );
}

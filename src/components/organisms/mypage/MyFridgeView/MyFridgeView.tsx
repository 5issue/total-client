'use client';

import { useMemo, useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { TabBar, type TabBarItem } from '@/components/molecules/shared/TabBar';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';

import { FridgeAiNoticeBanner } from './FridgeAiNoticeBanner';
import { FridgeDeleteConfirmModal } from './FridgeDeleteConfirmModal';
import { FridgeFilterBar, FridgeSelectionToolbar } from './FridgeFilterBar';
import { FridgeInventoryGrid } from './FridgeInventoryGrid';
import { FridgeRefillBottomSheet } from './FridgeRefillBottomSheet';
import { FridgeRefillCompleteBottomSheet } from './FridgeRefillCompleteBottomSheet';
import { FridgeStorageTipBottomSheet } from './FridgeStorageTipBottomSheet';
import { MOCK_FRIDGE_AI_NOTICE, MOCK_FRIDGE_ITEMS } from './mock';
import {
  matchesFridgeFilter,
  type FridgeFilterId,
  type FridgeItem,
  type FridgeTabId,
} from './model';

const TABS: TabBarItem[] = [
  { id: 'fridge', label: 'MY 냉장고' },
  { id: 'recipe', label: 'MY 레시피' },
];

/**
 * 나의 냉장고 화면 루트 (organism). Figma "5팀 UI 공유용" node 1120-56174 등.
 * 마이컬리 홈 "컬리키친 > MY 냉장고" 카드에서 진입한다(`MyKurlyHomeView` mock.ts 참고).
 * 뒤로가기는 항상 그 진입점(마이컬리 홈 `/mypage`)으로 고정 — 진입 경로가 다양한
 * `SearchPageHeader`(그래서 `router.back()`)와 달리 여긴 하나뿐이라 `leadingHref`로
 * 고정 링크를 쓴다(`OrderCompleteView`의 `leadingHref="/"`와 같은 패턴).
 *
 * 탭 선택은 URL 쿼리로 유지한다(취소·반품·교환 내역 탭과 동일 컨벤션, #102).
 * "MY 레시피" 탭은 이번 Figma 범위에 없어 다른 미구현 화면과 같은 스텁으로 둔다.
 *
 * 헤더+탭바+필터 칩(카테고리)은 스크롤 중에도 같이 붙어 있어야 해서(#111 QA) 한
 * `sticky top-0` 컨테이너로 묶는다. 단 배경은 헤더+탭바 구간에만 준다(`bg-surface`
 * 를 두른 안쪽 `div`) — 칩 행(`FridgeFilterBar`)은 사용자 요청대로 뒤 배경 없이
 * 투명하게 떠서, 그리드가 스크롤돼 올라올 때 칩 사이·둘레로 그대로 비친다.
 * "전체선택/선택삭제" 툴바(`FridgeSelectionToolbar`)는 이 sticky 대상이 아니다 —
 * 그리드와 함께 정상적으로 스크롤된다.
 */
export interface MyFridgeViewProps {
  initialTab: FridgeTabId;
}

export function MyFridgeView({ initialTab }: MyFridgeViewProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<FridgeTabId>(initialTab);
  const [items, setItems] = useState<FridgeItem[]>(MOCK_FRIDGE_ITEMS);
  const [activeFilter, setActiveFilter] = useState<FridgeFilterId>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [refillItem, setRefillItem] = useState<FridgeItem | null>(null);
  const [refillOpen, setRefillOpen] = useState(false);
  const [refillCompleteOpen, setRefillCompleteOpen] = useState(false);
  const [tipItem, setTipItem] = useState<FridgeItem | null>(null);
  const [tipOpen, setTipOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const filteredItems = useMemo(
    () => items.filter((item) => matchesFridgeFilter(item, activeFilter)),
    [items, activeFilter],
  );
  const selectedCount = filteredItems.filter((item) => selectedIds.has(item.id)).length;
  const allSelected = filteredItems.length > 0 && selectedCount === filteredItems.length;

  function handleTabChange(id: string) {
    setActiveTab(id as FridgeTabId);
    router.replace(`${pathname}?tab=${id}`, { scroll: false });
  }

  function handleToggleItem(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleToggleSelectAll(checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const item of filteredItems) {
        if (checked) next.add(item.id);
        else next.delete(item.id);
      }
      return next;
    });
  }

  function handleConfirmDelete() {
    setItems((prev) => prev.filter((item) => !selectedIds.has(item.id)));
    setSelectedIds(new Set());
    setDeleteModalOpen(false);
  }

  function handleRefill(item: FridgeItem) {
    setRefillItem(item);
    setRefillOpen(true);
  }

  function handleAddToCart() {
    setRefillOpen(false);
    setRefillCompleteOpen(true);
  }

  function handleShowStorageTip(item: FridgeItem) {
    setTipItem(item);
    setTipOpen(true);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-10">
        <div className="bg-surface">
          <SectionHeader
            leading="back"
            leadingHref="/mypage"
            title="컬리키친"
            iconSize={28}
            actions={[
              { icon: 'home', label: '홈으로 이동', href: '/' },
              { icon: 'cart', label: '장바구니', href: '/cart' },
            ]}
          />
          <TabBar items={TABS} activeId={activeTab} onChange={handleTabChange} fitted />
        </div>
        {activeTab === 'fridge' ? (
          <FridgeFilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        ) : null}
      </div>

      {activeTab === 'fridge' ? (
        <>
          <FridgeSelectionToolbar
            selectedCount={selectedCount}
            totalCount={filteredItems.length}
            allSelected={allSelected}
            onToggleSelectAll={handleToggleSelectAll}
            onDeleteSelected={() => {
              if (selectedCount > 0) setDeleteModalOpen(true);
            }}
          />
          <FridgeAiNoticeBanner
            title={MOCK_FRIDGE_AI_NOTICE.title}
            description={MOCK_FRIDGE_AI_NOTICE.description}
          />
          <FridgeInventoryGrid
            items={filteredItems}
            selectedIds={selectedIds}
            onToggleItem={handleToggleItem}
            onRefill={handleRefill}
            onShowStorageTip={handleShowStorageTip}
            onShopNow={() => router.push('/')}
          />
        </>
      ) : (
        <p className="text-body-m text-fg-tertiary p-8 text-center">MY 레시피 (구현 예정)</p>
      )}

      <FridgeRefillBottomSheet
        open={refillOpen}
        item={refillItem}
        onClose={() => setRefillOpen(false)}
        onAddToCart={handleAddToCart}
      />
      <FridgeRefillCompleteBottomSheet
        open={refillCompleteOpen}
        onClose={() => setRefillCompleteOpen(false)}
      />
      <FridgeStorageTipBottomSheet
        open={tipOpen}
        item={tipItem}
        onClose={() => setTipOpen(false)}
      />
      <FridgeDeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

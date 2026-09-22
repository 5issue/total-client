'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { TabBar, type TabBarItem } from '@/components/molecules/shared/TabBar';
import { MyRecipeView } from '@/components/organisms/mypage/MyRecipeView';
import { NICKNAME } from '@/components/organisms/mypage/MyRecipeView/mock';
import { RecipeAiLoadingView } from '@/components/organisms/mypage/MyRecipeView/RecipeAiLoadingView';
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
 * "MY 레시피" 탭 콘텐츠는 `MyRecipeView`(이슈 #113) 참고.
 *
 * MY냉장고→MY레시피로 탭을 전환하는 그 순간에만 "MY 레시피 제작 중" 풀스크린 로딩
 * (`RecipeAiLoadingView`, node 1343-109131)을 거쳐 실제 콘텐츠를 보여준다 — `initialTab`
 * 으로 레시피 탭에 바로 진입(딥링크)하거나 레시피 탭 안의 카드를 눌러 상세로 이동할
 * 때는 해당하지 않는다(탭 "전환" 자체가 아니므로). 실제로는 AI 가 응답할 때까지
 * 무한 로딩이지만 mock 단계라 고정 딜레이 후 콘텐츠를 보여준다.
 *
 * 이 로딩 화면은 헤더·탭바까지 포함해 전체 화면을 대체한다(Figma 원본에 그 둘이
 * 아예 없다, node 1343-109131) — 그래서 `activeTab`/`FridgeFilterBar` 분기와 같은
 * 레벨이 아니라 그 바깥에서 조기 반환(early return)한다.
 *
 * 헤더+탭바+필터 칩(카테고리)은 스크롤 중에도 같이 붙어 있어야 해서(#111 QA) 한
 * `sticky top-0` 컨테이너로 묶는다. 배경은 헤더+탭바 구간에만 준다(`bg-surface`
 * 를 두른 안쪽 `div`) — 칩 행(`FridgeFilterBar`)은 배경 없이 투명하게 떠서, 그리드가
 * 스크롤돼 올라올 때 칩 사이·둘레로 그대로 비친다. "전체선택/선택삭제" 툴바
 * (`FridgeSelectionToolbar`)는 이 sticky 대상이 아니다 — 그리드와 함께 정상적으로
 * 스크롤된다.
 *
 * `selectedIds` 는 필터가 바뀌어도 유지된다(다른 필터에서 고른 항목이 필터를 되돌리면
 * 다시 선택돼 있어야 함). 그래서 삭제 대상은 `selectedIds` 전체가 아니라 현재
 * `filteredItems` 와의 교집합(`selectedInView`)으로 제한한다 — 안 그러면 필터에 안
 * 보이는 항목까지 "선택삭제"에 같이 삭제된다(코드래빗 리뷰, #111).
 */
// 실제 AI 생성 연동 전 mock 딜레이 — 연동 후에는 고정 시간이 아니라 응답이 올 때까지
// `RecipeAiLoadingView`를 띄워 두는 형태로 바뀐다(무한 로딩, 위 컴포넌트 주석 참고).
const RECIPE_TAB_LOADING_DELAY_MS = 1200;

export interface MyFridgeViewProps {
  initialTab: FridgeTabId;
}

export function MyFridgeView({ initialTab }: MyFridgeViewProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<FridgeTabId>(initialTab);
  const [recipeTabLoading, setRecipeTabLoading] = useState(false);
  const recipeTabLoadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const selectedInView = filteredItems.filter((item) => selectedIds.has(item.id));
  const selectedCount = selectedInView.length;
  const allSelected = filteredItems.length > 0 && selectedCount === filteredItems.length;

  // 언마운트 후 예약된 상태 갱신이 실행되지 않도록 정리한다(#113 코드래빗 리뷰와
  // 동일 이유 — `MyRecipeView`의 과거 라우팅 타이머 정리 패턴 참고).
  useEffect(() => {
    return () => {
      if (recipeTabLoadingTimeoutRef.current) clearTimeout(recipeTabLoadingTimeoutRef.current);
    };
  }, []);

  function handleTabChange(id: string) {
    const nextTab = id as FridgeTabId;
    if (nextTab === 'recipe' && activeTab !== 'recipe') {
      setRecipeTabLoading(true);
      recipeTabLoadingTimeoutRef.current = setTimeout(
        () => setRecipeTabLoading(false),
        RECIPE_TAB_LOADING_DELAY_MS,
      );
    }
    setActiveTab(nextTab);
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
    const idsToDelete = new Set(selectedInView.map((item) => item.id));
    setItems((prev) => prev.filter((item) => !idsToDelete.has(item.id)));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      idsToDelete.forEach((id) => next.delete(id));
      return next;
    });
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

  if (recipeTabLoading) {
    return <RecipeAiLoadingView nickname={NICKNAME} />;
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
        <MyRecipeView />
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

'use client';

import { useEffect, useRef, useState } from 'react';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { InfoBox } from '@/components/atoms/InfoBox';
import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';
import { KitchenInventoryCard } from '@/components/molecules/mypage/KitchenInventoryCard';
import { ErrorState } from '@/components/molecules/shared/ErrorState';

import { MOCK_FRIDGE_EXPIRY_NOTICE } from './mock';
import type { FridgeItem } from './model';

/**
 * 상품 그리드 + 빈 상태 + 만료 안내 (organism). Figma node 1120-56184(그리드),
 * 666-31325(빈 상태), 665-58397(스크롤 최상단 이동 FAB 노출 조건 명세).
 *
 * FAB 노출 조건(디자인 스펙): 최하단 도달 시 또는 위로 스크롤할 때 노출, 아래로
 * 스크롤하거나 맨 위에 도달하면 숨김. 클릭하면 맨 위로 스무스 스크롤 후(스크롤
 * 위치가 0이 되므로 같은 로직으로) 자동으로 숨겨진다.
 * 위치는 우측 16px·하단 80px(이 화면은 하단 CTA 바·BottomNav 가 없는 chromeless
 * 스펙 — 스펙 문서의 "CTA 없을 경우" 값).
 *
 * `isPending`/`isError`는 부모(`MyFridgeViewContainer`, 이슈 #138)가 `useFridgeItems`
 * 조회 상태를 그대로 내려준다 — `ProductGrid`(#90 리뷰)와 동일하게 로딩·에러·빈 상태를
 * 전부 이 표현 컴포넌트가 렌더하되, 상태 자체는 컨테이너가 소유한다.
 */
export interface FridgeInventoryGridProps {
  items: FridgeItem[];
  isPending: boolean;
  isError: boolean;
  selectedIds: Set<string>;
  onToggleItem: (id: string, checked: boolean) => void;
  onRefill: (item: FridgeItem) => void;
  onShowStorageTip: (item: FridgeItem) => void;
  onShopNow: () => void;
  className?: string;
}

function useScrollTopButtonVisible() {
  const [visible, setVisible] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    function handleScroll() {
      const y = window.scrollY;
      const atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 1;
      const scrollingUp = y < lastY.current;

      if (y <= 0) setVisible(false);
      else if (atBottom || scrollingUp) setVisible(true);
      else setVisible(false);

      lastY.current = y;
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return visible;
}

export function FridgeInventoryGrid({
  items,
  isPending,
  isError,
  selectedIds,
  onToggleItem,
  onRefill,
  onShowStorageTip,
  onShopNow,
  className,
}: FridgeInventoryGridProps) {
  const showScrollTop = useScrollTopButtonVisible();

  if (isPending) {
    return (
      <LoadingIndicator
        label="냉장고 품목을 불러오는 중이에요"
        className={['py-16', className].filter(Boolean).join(' ')}
      />
    );
  }

  if (isError) {
    return (
      <div className={['flex justify-center py-16', className].filter(Boolean).join(' ')}>
        <ErrorState
          icon={<Icon name="alert" size={56} aria-hidden />}
          title="상품을 불러오지 못했어요"
          description="잠시 후 다시 시도해주세요"
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={['flex justify-center py-16', className].filter(Boolean).join(' ')}>
        <ErrorState
          icon={<Icon name="alert" size={56} aria-hidden />}
          title="보유중인 상품이 없어요"
          action={<FloatingButton onClick={onShopNow}>구매하러 가기</FloatingButton>}
        />
      </div>
    );
  }

  return (
    // AI 안내 배너 하단(자체 pb-3=12px)부터 그리드 첫 줄까지 실측 28px — 배너 쪽
    // 12px에 여기 pt-4(16px)를 더해 맞춘다(12+16=28, node 1120-56184 실측).
    <div className={['flex flex-col gap-5 px-4 pt-4 pb-3', className].filter(Boolean).join(' ')}>
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-5">
        {items.map((item) => (
          <KitchenInventoryCard
            key={item.id}
            item={item}
            checked={selectedIds.has(item.id)}
            onCheckedChange={(checked) => onToggleItem(item.id, checked)}
            onRefill={() => onRefill(item)}
            onShowStorageTip={() => onShowStorageTip(item)}
          />
        ))}
      </div>

      <InfoBox variant="inline" tone="bright" icon={<Icon name="info-line" aria-hidden />}>
        {MOCK_FRIDGE_EXPIRY_NOTICE}
      </InfoBox>

      {showScrollTop ? (
        <FloatingButton
          shape="icon"
          icon="scroll"
          aria-label="맨 위로 이동"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed right-4 bottom-20 z-10"
        />
      ) : null}
    </div>
  );
}

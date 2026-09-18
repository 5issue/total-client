'use client';

import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { CartDeliveryAddress } from '@/components/molecules/cart/CartDeliveryAddress';
import { CartSelectAllBar } from '@/components/molecules/cart/CartSelectAllBar';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { Modal } from '@/components/molecules/shared/Modal';
import { TabBar } from '@/components/molecules/shared/TabBar';
import { CartList } from '@/components/organisms/cart/CartList';
import { CartOrderBar } from '@/components/organisms/cart/CartOrderBar';
import { CartRecommendCarousel } from '@/components/organisms/cart/CartRecommendCarousel';
import { CartRecommendSheet } from '@/components/organisms/cart/CartRecommendSheet';
import { CartSummary } from '@/components/organisms/cart/CartSummary';
import type { CartAmounts, CartDeliveryGroup } from '@/components/organisms/cart/model';
import { mapAddressToView } from '@/components/organisms/mypage/AddressManageView/mapAddressResponse';
import { addressLineOf } from '@/components/organisms/mypage/model';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useAddresses } from '@/hooks/address/useAddresses';
import { useDeliveryAddressStore } from '@/hooks/useDeliveryAddressStore';

import { MOCK_CART_GROUPS, MOCK_RECOMMEND } from './mock';

/**
 * 장바구니 화면 컨테이너 (organism). 상태(탭·선택·모달·시트)를 소유하고
 * 표현 organism/molecule 을 조립한다. 데이터는 퍼블리싱 단계라 목 데이터(`mock.ts`).
 * page.tsx 는 이 컴포넌트만 렌더한다(RSC 유지).
 *
 * 배송지는 로컬 state 가 아니라 `deliveryAddressStore` 공유 상태를 읽는다 — "추가"/"변경" 은
 * `/mypage/addresses` 로 실제 이동하고, 거기서 고른 배송지가 돌아왔을 때 그대로 보인다.
 *
 * `groups`/`onQuantityChange`/`onRemoveItems` 생략 시(스토리북·직접 진입) mock 데이터 +
 * 로컬 state 로 전과 동일하게 동작한다. `CartContainer` 가 실데이터를 넘기면 그 prop 이
 * 갱신될 때마다 로컬 `groups` 를 다시 동기화한다(렌더 중 비교+setState) — 수량 변경은 쿼리
 * 캐시 낙관적 갱신이 곧바로 새 prop 으로 흘러들어오므로 이 컴포넌트가 따로 낙관 처리하지 않는다.
 */
type DeleteTarget = { kind: 'item'; id: string } | { kind: 'selected' } | null;

function allItemIds(groups: CartDeliveryGroup[]) {
  return groups.flatMap((g) => g.items.filter((i) => !i.soldOut).map((i) => i.id));
}

export interface CartViewProps {
  /** 실제 주문 상품 목록(`CartContainer` 가 `useCart` 로 채운다). 생략 시 목데이터. */
  groups?: CartDeliveryGroup[];
  /** 수량 변경(`useUpdateCartItemQuantity`). 생략 시 로컬 state 로만 반영(스토리북). */
  onQuantityChange?: (itemId: string, quantity: number) => void;
  /** 상품 삭제(단일·다건 공통, `useRemoveCartItems`). 생략 시 로컬 state 로만 반영(스토리북). */
  onRemoveItems?: (itemIds: string[]) => void;
}

export function CartView({
  groups: groupsProp = MOCK_CART_GROUPS,
  onQuantityChange,
  onRemoveItems,
}: CartViewProps = {}) {
  const router = useRouter();

  const [tab, setTab] = useState('items');
  const [groups, setGroups] = useState<CartDeliveryGroup[]>(groupsProp);
  // prop 이 바뀌면(실데이터 갱신) 로컬 state 를 다시 맞춘다 — 렌더 중 비교+setState 로,
  // 이펙트 안에서 곧바로 setState 하지 않는다(react-hooks/set-state-in-effect, React 공식
  // "Adjusting state when a prop changes" 패턴).
  const [prevGroupsProp, setPrevGroupsProp] = useState(groupsProp);
  if (groupsProp !== prevGroupsProp) {
    setPrevGroupsProp(groupsProp);
    setGroups(groupsProp);
  }
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(allItemIds(groupsProp)),
  );
  // 배송지 목록은 useAddresses(TanStack Query) 캐시가 소스 오브 트루스 — AddressManageView 와
  // 같은 쿼리 키를 써서 캐시를 공유한다(이슈 #119). 선택 id 만 계속 Zustand 에서 읽는다.
  const addressesQuery = useAddresses();
  const addresses = addressesQuery.data?.addresses.map(mapAddressToView) ?? [];
  const selectedAddressId = useDeliveryAddressStore((s) => s.selectedId);
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const selectableIds = useMemo(() => allItemIds(groups), [groups]);
  const isEmpty = groups.every((g) => g.items.length === 0);

  // 선택된 아이템이 있는 배송 그룹의 라벨 → 배송지 뱃지("샛별배송" 등)
  const selectedDeliveryBadge = useMemo(
    () => groups.find((g) => g.items.some((i) => selectedIds.has(i.id)))?.deliveryLabel,
    [groups, selectedIds],
  );

  const amounts = useMemo<CartAmounts>(() => {
    let productPrice = 0;
    let productDiscount = 0;
    for (const g of groups) {
      for (const item of g.items) {
        if (!selectedIds.has(item.id)) continue;
        const listPrice = item.originalPrice ?? item.price;
        productPrice += listPrice * item.quantity;
        productDiscount += (listPrice - item.price) * item.quantity;
      }
    }
    // 쿠폰은 아직 미구현(퍼블리싱 단계) — 데이터 연동 시 훅에서 계산해 채운다.
    const productCouponDiscount = 0;
    const cartCouponDiscount = 0;
    const couponDiscount = productCouponDiscount + cartCouponDiscount;
    const shippingFee = 0;
    return {
      productPrice,
      productDiscount,
      couponDiscount,
      productCouponDiscount,
      cartCouponDiscount,
      shippingFee,
      total: productPrice - productDiscount - couponDiscount + shippingFee,
    };
  }, [groups, selectedIds]);

  function setItemChecked(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  // 배송유형(샛별배송) 체크박스 — 상품 선택과 무관하게 그룹의 checked 플래그만 토글한다.
  function setGroupChecked(groupId: string, checked: boolean) {
    setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, checked } : g)));
  }

  function setAllChecked(checked: boolean) {
    setSelectedIds(checked ? new Set(selectableIds) : new Set());
  }

  function changeQuantity(id: string, quantity: number) {
    if (onQuantityChange) {
      onQuantityChange(id, quantity);
      return;
    }
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
      })),
    );
  }

  function removeItems(ids: string[]) {
    if (onRemoveItems) {
      onRemoveItems(ids);
    } else {
      const remove = new Set(ids);
      setGroups((prev) =>
        prev
          .map((g) => ({ ...g, items: g.items.filter((i) => !remove.has(i.id)) }))
          .filter((g) => g.items.length > 0),
      );
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.delete(id);
      return next;
    });
  }

  function confirmDelete() {
    if (deleteTarget?.kind === 'item') removeItems([deleteTarget.id]);
    else if (deleteTarget?.kind === 'selected') removeItems([...selectedIds]);
    setDeleteTarget(null);
  }

  // 빈 상태 — 담은상품이 없을 때 / "자주 산 상품" 탭(미구현). Figma node 188-8841 "Error".
  const emptyState = (
    <>
      <div className="flex min-h-80 flex-col items-center justify-center">
        <ErrorState
          icon={<Icon name="alert" size={56} aria-hidden />}
          title="담은 상품이 없어요"
          action={
            <FloatingButton onClick={() => router.push('/products')}>구매하러 가기</FloatingButton>
          }
        />
      </div>
      <CartRecommendCarousel items={MOCK_RECOMMEND} onAdd={() => undefined} className="mx-4" />
    </>
  );

  return (
    <>
      <SectionHeader
        leading="close"
        leadingLabel="장바구니 닫기"
        onLeadingClick={() => router.back()}
        title="장바구니"
      />

      {/* 섹션은 서로 붙는다(Figma: 배송지·탭·전체선택·회색 카드 영역·결제요약 영역 모두 flush).
          결제요약 → 추천 캐러셀 사이만 16px 회색 밴드(node 188-9378 gap-4). */}
      <div className="bg-surface-secondary flex flex-1 flex-col pb-4">
        <div className="bg-surface">
          <CartDeliveryAddress
            address={selectedAddress ? addressLineOf(selectedAddress) : undefined}
            deliveryBadge={selectedAddress ? selectedDeliveryBadge : undefined}
            onEdit={() => router.push('/mypage/addresses')}
          />
          <TabBar
            fitted
            activeId={tab}
            onChange={setTab}
            items={[
              { id: 'items', label: `담은상품 ${selectableIds.length}` },
              { id: 'frequent', label: '자주 산 상품' },
            ]}
          />
        </div>

        {tab === 'frequent' ? (
          emptyState
        ) : isEmpty ? (
          <>
            <CartSelectAllBar
              className="bg-surface"
              selectedCount={0}
              totalCount={0}
              onToggleAll={setAllChecked}
              onDeleteSelected={() => setDeleteTarget({ kind: 'selected' })}
            />
            {emptyState}
          </>
        ) : (
          <>
            <CartSelectAllBar
              className="bg-surface"
              selectedCount={selectedIds.size}
              totalCount={selectableIds.length}
              onToggleAll={setAllChecked}
              onDeleteSelected={() => setDeleteTarget({ kind: 'selected' })}
            />
            <CartList
              groups={groups}
              selectedIds={selectedIds}
              onItemCheckedChange={setItemChecked}
              onItemQuantityChange={changeQuantity}
              onItemRemove={(id) => setDeleteTarget({ kind: 'item', id })}
              onGroupToggle={setGroupChecked}
            />
            <div className="flex flex-col gap-4">
              <CartSummary amounts={amounts} className="bg-surface" />
              <CartRecommendCarousel
                items={MOCK_RECOMMEND}
                onAdd={() => undefined}
                className="mx-4"
              />
            </div>
          </>
        )}
      </div>

      {/* 하단 주문 바는 두 탭 모두에 뜬다. "자주 산 상품"(미구현·항상 빈 상태)과 빈 장바구니는
          비활성 "상품을 담아주세요"(Figma node 188-9295). */}
      <CartOrderBar
        className="border-border sticky bottom-0 border-t"
        state={tab === 'frequent' || isEmpty ? 'empty' : selectedAddress ? 'order' : 'no-address'}
        totalPrice={amounts.total}
        onOrder={() => setSheetOpen(true)}
      />

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="삭제하시겠어요?"
        description="상품을 삭제하면 장바구니에서 없어집니다."
        footer={
          <>
            <Button variant="outlineBlack" onClick={() => setDeleteTarget(null)}>
              취소
            </Button>
            <Button variant="black" onClick={confirmDelete}>
              확인
            </Button>
          </>
        }
      />

      <CartRecommendSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        items={MOCK_RECOMMEND}
        totalPrice={amounts.total}
        onOrder={() => setSheetOpen(false)}
        onAddItem={() => undefined}
      />
    </>
  );
}

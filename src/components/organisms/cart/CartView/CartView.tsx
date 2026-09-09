'use client';

import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { CartDeliveryAddress } from '@/components/molecules/cart/CartDeliveryAddress';
import { CartSelectAllBar } from '@/components/molecules/cart/CartSelectAllBar';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { Modal } from '@/components/molecules/shared/Modal';
import { TabBar } from '@/components/molecules/shared/TabBar';
import { CartFrequentProducts } from '@/components/organisms/cart/CartFrequentProducts';
import { CartList } from '@/components/organisms/cart/CartList';
import { CartOrderBar } from '@/components/organisms/cart/CartOrderBar';
import { CartRecommendCarousel } from '@/components/organisms/cart/CartRecommendCarousel';
import { CartRecommendSheet } from '@/components/organisms/cart/CartRecommendSheet';
import { CartSummary } from '@/components/organisms/cart/CartSummary';
import type { CartAmounts, CartDeliveryGroup } from '@/components/organisms/cart/model';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';

import { MOCK_CART_GROUPS, MOCK_RECOMMEND } from './mock';

/**
 * 장바구니 화면 컨테이너 (organism). 상태(탭·선택·모달·시트·배송지)를 소유하고
 * 표현 organism/molecule 을 조립한다. 데이터는 퍼블리싱 단계라 목 데이터(`mock.ts`).
 * page.tsx 는 이 컴포넌트만 렌더한다(RSC 유지).
 */
type DeleteTarget = { kind: 'item'; id: string } | { kind: 'selected' } | null;

function allItemIds(groups: CartDeliveryGroup[]) {
  return groups.flatMap((g) => g.items.filter((i) => !i.soldOut).map((i) => i.id));
}

export function CartView() {
  const router = useRouter();

  const [tab, setTab] = useState('items');
  const [groups, setGroups] = useState<CartDeliveryGroup[]>(MOCK_CART_GROUPS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(allItemIds(MOCK_CART_GROUPS)),
  );
  const [address, setAddress] = useState<string | undefined>(undefined);
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
        productPrice += item.price * item.quantity;
        if (item.originalPrice) {
          productDiscount += (item.originalPrice - item.price) * item.quantity;
        }
      }
    }
    return { productPrice, productDiscount, shippingFee: 0, total: productPrice };
  }, [groups, selectedIds]);

  function setItemChecked(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function setGroupChecked(groupId: string, checked: boolean) {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    const ids = group.items.filter((i) => !i.soldOut).map((i) => i.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  function setAllChecked(checked: boolean) {
    setSelectedIds(checked ? new Set(selectableIds) : new Set());
  }

  function changeQuantity(id: string, quantity: number) {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
      })),
    );
  }

  function removeItems(ids: string[]) {
    const remove = new Set(ids);
    setGroups((prev) =>
      prev
        .map((g) => ({ ...g, items: g.items.filter((i) => !remove.has(i.id)) }))
        .filter((g) => g.items.length > 0),
    );
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

  return (
    <>
      <SectionHeader
        leading="close"
        leadingLabel="장바구니 닫기"
        onLeadingClick={() => router.back()}
        title="장바구니"
      />

      <div className="bg-surface-secondary flex flex-1 flex-col gap-2 pb-20">
        <div className="bg-surface">
          <CartDeliveryAddress
            address={address}
            deliveryBadge={address ? selectedDeliveryBadge : undefined}
            onEdit={() =>
              setAddress('서울특별시 강남구 테헤란로 152, 10층 1502호 (역삼동, 강남파이낸스센터)')
            }
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
          <p className="bg-surface text-label-m text-fg-tertiary px-4 py-10 text-center">
            자주 산 상품은 준비 중이에요.
          </p>
        ) : isEmpty ? (
          <div className="bg-surface flex flex-col">
            <ErrorState
              className="py-12"
              icon={<Icon name="info-line" size={40} aria-hidden />}
              title="담은 상품이 없어요"
              action={
                <Button variant="tertiary" size="m" onClick={() => router.push('/products')}>
                  구매하러 가기
                </Button>
              }
            />
            <CartFrequentProducts items={MOCK_RECOMMEND} onAdd={() => undefined} />
          </div>
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
            <CartSummary amounts={amounts} className="bg-surface" />
            <CartRecommendCarousel
              items={MOCK_RECOMMEND}
              onAdd={() => undefined}
              className="mx-4 mb-3"
            />
          </>
        )}
      </div>

      {!isEmpty && tab === 'items' ? (
        <CartOrderBar
          className="border-border sticky bottom-0 border-t"
          state={address ? 'order' : 'no-address'}
          totalPrice={amounts.total}
          onOrder={() => setSheetOpen(true)}
        />
      ) : null}

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

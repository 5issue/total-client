'use client';

import { useRouter } from 'next/navigation';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { mapAddressToView } from '@/components/organisms/mypage/AddressManageView/mapAddressResponse';
import { addressLineOf } from '@/components/organisms/mypage/model';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useAddresses } from '@/hooks/address/useAddresses';
import { useCart } from '@/hooks/cart/useCart';
import { useDeliveryAddressStore } from '@/hooks/useDeliveryAddressStore';

import { CheckoutView } from './CheckoutView';
import { computeOrderAmounts, mapSelectedCartItemsToOrder } from './mapCartItemsToOrder';

/**
 * 주문서 컨테이너 — 장바구니에서 선택한 상품 id(`itemIds`)로 `useCart`를 필터링해
 * 주문상품·결제금액을 채우고, `useAddresses()` + 선택된 배송지 id(Zustand)로 배송지를
 * 채운다(이슈 #120). 결제수단·결제 자체는 `CheckoutView` 로컬 그대로 — 건드리지 않는다.
 */
export function CheckoutContainer({ itemIds }: { itemIds: string[] }) {
  const router = useRouter();
  const cartQuery = useCart();
  const addressesQuery = useAddresses();
  const selectedAddressId = useDeliveryAddressStore((s) => s.selectedId);

  if (cartQuery.isLoading || addressesQuery.isLoading) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col">
        <SectionHeader leading="back" leadingHref="/cart" title="주문서" />
        <LoadingIndicator className="flex-1" />
      </div>
    );
  }

  if (cartQuery.isError || addressesQuery.isError || !cartQuery.data || !addressesQuery.data) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col items-center justify-center">
        <SectionHeader leading="back" leadingHref="/cart" title="주문서" />
        <ErrorState
          icon={<Icon name="alert" size={56} aria-hidden />}
          title="주문 정보를 불러오지 못했어요"
          description="잠시 후 다시 시도해주세요"
          action={
            <FloatingButton
              icon="refresh"
              onClick={() => {
                void cartQuery.refetch();
                void addressesQuery.refetch();
              }}
            >
              다시 시도
            </FloatingButton>
          }
        />
      </div>
    );
  }

  const items = mapSelectedCartItemsToOrder(cartQuery.data, itemIds);

  if (items.length === 0) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col items-center justify-center">
        <SectionHeader leading="back" leadingHref="/cart" title="주문서" />
        <ErrorState
          icon={<Icon name="alert" size={56} aria-hidden />}
          title="선택한 상품을 찾을 수 없어요"
          description="장바구니에서 다시 선택해주세요"
          action={
            <FloatingButton icon="arrow-right" onClick={() => router.push('/cart')}>
              장바구니로 이동
            </FloatingButton>
          }
        />
      </div>
    );
  }

  const addresses = addressesQuery.data.addresses.map(mapAddressToView);
  const selected =
    addresses.find((a) => a.id === selectedAddressId) ?? addresses.find((a) => a.isDefault);
  const deliveryAddress = selected
    ? {
        isDefault: selected.isDefault,
        addressLine: addressLineOf(selected),
        recipient: selected.recipient,
        phone: selected.phone,
      }
    : undefined;

  return (
    <CheckoutView
      items={items}
      amounts={computeOrderAmounts(items)}
      deliveryAddress={deliveryAddress}
    />
  );
}

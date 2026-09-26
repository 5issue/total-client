'use client';

import { useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { mapAddressToView } from '@/components/organisms/mypage/AddressManageView/mapAddressResponse';
import { addressLineOf } from '@/components/organisms/mypage/model';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useAddresses } from '@/hooks/address/useAddresses';
import { useCreateOrder } from '@/hooks/checkout/useCreateOrder';
import { useDeliveryAddressStore } from '@/hooks/useDeliveryAddressStore';

import { CheckoutView } from './CheckoutView';
import { mapCheckoutOrderToView } from './mapCheckoutOrder';

/**
 * 주문서 컨테이너 — 장바구니에서 선택한 상품 id(`itemIds`)로 실제 주문서 생성 API
 * (`POST /api/v1/orders/checkout`, 이슈 #126)를 호출해 `orderId`·주문상품·결제금액을 채우고,
 * `useAddresses()` + 선택된 배송지 id(Zustand)로 배송지를 채운다(이슈 #120).
 * 결제수단·결제 자체는 `CheckoutView` 로컬 그대로 — 건드리지 않는다.
 *
 * 이전(#120)엔 `useCart()` 를 로컬에서 필터링해 상품·금액을 직접 계산했지만, 이제 서버가
 * 재고를 실제로 예약하며 주문을 만들어야 하므로 그 계산은 더 이상 클라가 하지 않는다.
 */
export function CheckoutContainer({ itemIds }: { itemIds: string[] }) {
  const router = useRouter();
  const addressesQuery = useAddresses();
  const selectedAddressId = useDeliveryAddressStore((s) => s.selectedId);
  const createOrder = useCreateOrder();
  const requestedFor = useRef<string | null>(null);

  const cartItemIds = itemIds.map(Number).filter((id) => Number.isInteger(id) && id > 0);
  const cartItemIdsKey = cartItemIds.join(',');

  useEffect(() => {
    if (cartItemIds.length === 0) return;
    if (requestedFor.current === cartItemIdsKey) return;
    requestedFor.current = cartItemIdsKey;
    createOrder.mutate({ cartItemIds });
    // cartItemIds 는 매 렌더 새 배열이라 키(join)만 의존성으로 둔다 — 값이 같으면 재요청 안 함.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItemIdsKey]);

  if (cartItemIds.length === 0) {
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

  if (createOrder.isPending || createOrder.isIdle || addressesQuery.isLoading) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col">
        <SectionHeader leading="back" leadingHref="/cart" title="주문서" />
        <LoadingIndicator className="flex-1" />
      </div>
    );
  }

  if (createOrder.isError || addressesQuery.isError || !addressesQuery.data) {
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
                createOrder.mutate({ cartItemIds });
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

  const order = createOrder.data;
  const { items, amounts } = mapCheckoutOrderToView(order);

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
      orderId={order.orderId}
      orderNo={order.orderNo}
      expiresAt={order.expiresAt}
      items={items}
      amounts={amounts}
      deliveryAddress={deliveryAddress}
    />
  );
}

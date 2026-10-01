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
import { useProductThumbnails } from '@/hooks/product/useProductThumbnails';
import { useDeliveryAddressStore } from '@/hooks/useDeliveryAddressStore';
import { useUserProfile } from '@/hooks/user/useUserProfile';

import { CheckoutView } from './CheckoutView';
import { mapCheckoutOrderToView } from './mapCheckoutOrder';

/**
 * 주문서 컨테이너 — 장바구니에서 선택한 상품 id(`itemIds`)로 실제 주문서 생성 API
 * (`POST /api/v1/orders/checkout`, 이슈 #126)를 호출해 `orderId`·주문상품·결제금액을 채우고,
 * `useAddresses()` + 선택된 배송지 id(Zustand)로 배송지를 채운다(이슈 #120).
 * "주문자 정보"의 이름은 `useUserProfile()` 로 채운다 — 그 외(결제수단·결제 자체)는
 * `CheckoutView` 로컬 그대로 건드리지 않는다.
 *
 * 이전(#120)엔 `useCart()` 를 로컬에서 필터링해 상품·금액을 직접 계산했지만, 이제 서버가
 * 재고를 실제로 예약하며 주문을 만들어야 하므로 그 계산은 더 이상 클라가 하지 않는다.
 *
 * "주문상품" 이미지 — 주문서 생성 응답엔 이미지가 없지만 `productId`는 있어(`CheckoutOrderItem`)
 * `useProductThumbnails`로 상품 상세를 따로 조회해 썸네일만 뽑아 합친다(`mapCheckoutOrder.ts`).
 *
 * 주문서 생성(`createOrder`) 자체가 실패하면(재고 소진 등, 이미 만들어진 주문을 이어서
 * 보여줄 방법이 없다) 이 화면에 붙잡아두지 않고 `/cart`로 돌려보낸다 — 장바구니 조회
 * 실패(`addressesQuery`와 별개로 다루던 기존 "다시 시도" 화면)와 달리 재시도로 복구될
 * 문제가 아니라서다. 에러 메시지는 쿼리스트링으로 넘겨 `CartContainer`가 토스트로 보여준다.
 */
export function CheckoutContainer({ itemIds }: { itemIds: string[] }) {
  const router = useRouter();
  const addressesQuery = useAddresses();
  const selectedAddressId = useDeliveryAddressStore((s) => s.selectedId);
  const createOrder = useCreateOrder();
  const userProfileQuery = useUserProfile();
  const requestedFor = useRef<string | null>(null);

  // 주문서 응답엔 이미지가 없어(mapCheckoutOrder.ts 참고) productId로 썸네일을 따로
  // 조회한다 — 아직 order.data 가 없는 렌더(로딩/에러)에도 훅은 항상 호출돼야 하므로
  // 빈 배열로 안전하게 둔다.
  const orderItemProductIds = createOrder.data
    ? Array.from(new Set(createOrder.data.items.map((item) => String(item.productId))))
    : [];
  const thumbnails = useProductThumbnails(orderItemProductIds);

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

  useEffect(() => {
    if (!createOrder.isError) return;
    const message =
      createOrder.error instanceof Error
        ? createOrder.error.message
        : '주문을 생성하지 못했어요. 장바구니에서 다시 시도해주세요.';
    router.replace(`/cart?orderError=${encodeURIComponent(message)}`);
  }, [createOrder.isError, createOrder.error, router]);

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

  if (
    createOrder.isPending ||
    createOrder.isIdle ||
    createOrder.isError ||
    addressesQuery.isLoading
  ) {
    // createOrder.isError 도 여기 포함 — 위 useEffect 가 /cart로 돌려보내는 동안
    // 에러 화면이 잠깐 보였다 사라지지 않도록 로딩 상태로 둔다.
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col">
        <SectionHeader leading="back" leadingHref="/cart" title="주문서" />
        <LoadingIndicator className="flex-1" />
      </div>
    );
  }

  if (addressesQuery.isError || !addressesQuery.data) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col items-center justify-center">
        <SectionHeader leading="back" leadingHref="/cart" title="주문서" />
        <ErrorState
          icon={<Icon name="alert" size={56} aria-hidden />}
          title="주문 정보를 불러오지 못했어요"
          description="잠시 후 다시 시도해주세요"
          action={
            <FloatingButton icon="refresh" onClick={() => void addressesQuery.refetch()}>
              다시 시도
            </FloatingButton>
          }
        />
      </div>
    );
  }

  const order = createOrder.data;
  const { items, amounts } = mapCheckoutOrderToView(order, thumbnails);

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
      customerName={userProfileQuery.data?.name ?? undefined}
    />
  );
}

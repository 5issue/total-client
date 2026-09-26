'use client';

import { useEffect } from 'react';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useCart } from '@/hooks/cart/useCart';
import { useRemoveCartItems } from '@/hooks/cart/useRemoveCartItems';
import { useUpdateCartDeliveryAddress } from '@/hooks/cart/useUpdateCartDeliveryAddress';
import { useUpdateCartItemQuantity } from '@/hooks/cart/useUpdateCartItemQuantity';
import { useDeliveryAddressStore } from '@/hooks/useDeliveryAddressStore';

import { CartView } from './CartView';
import { mapCartResponse } from './mapCartResponse';

/**
 * 장바구니 컨테이너 — `useCart` 로 실제 장바구니를 받아 매핑해 내린다.
 * 수량 변경은 `useUpdateCartItemQuantity`(낙관적, api-convention §7 유일 예외),
 * 삭제는 `useRemoveCartItems`(기본 정책 — 성공 후 invalidate)로 실제 API 호출한다.
 *
 * 배송지: `deliveryAddressStore`(공유 UI 상태, `/mypage/addresses`와 공유)가 장바구니가
 * 실제로 저장한 주소(`cart.selectedAddress`)와 달라지면 `PUT /delivery-address`로 반영한다.
 * 스토어는 냉장고·반품 화면도 같이 쓰므로, 여기서 훅 하나로 장바구니 쪽만 이 효과를 낸다.
 */
export function CartContainer() {
  const cartQuery = useCart();
  const updateQuantity = useUpdateCartItemQuantity();
  const removeItems = useRemoveCartItems();
  const { mutate: updateDeliveryAddress } = useUpdateCartDeliveryAddress();
  const selectedAddressId = useDeliveryAddressStore((s) => s.selectedId);
  const setSelectedAddressId = useDeliveryAddressStore((s) => s.setSelectedId);

  const cartSelectedAddressId = cartQuery.data?.selectedAddress?.addressId ?? null;

  useEffect(() => {
    // 스토어가 비어있으면(다른 화면 안 거치고 바로 /cart 진입) 장바구니가 이미 갖고 있는
    // 주소로 초기화한다 — 아직 백엔드에 반영할 게 없으니 여기선 요청을 보내지 않는다.
    if (selectedAddressId === null) {
      if (cartSelectedAddressId !== null) {
        setSelectedAddressId(String(cartSelectedAddressId));
      }
      return;
    }
    const addressIdNum = Number(selectedAddressId);
    if (!Number.isInteger(addressIdNum) || addressIdNum === cartSelectedAddressId) return;

    updateDeliveryAddress(addressIdNum);
  }, [selectedAddressId, cartSelectedAddressId, setSelectedAddressId, updateDeliveryAddress]);

  if (cartQuery.isLoading) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col">
        <SectionHeader
          leading="close"
          leadingHref="/"
          leadingLabel="장바구니 닫기"
          title="장바구니"
        />
        <LoadingIndicator className="flex-1" />
      </div>
    );
  }

  if (cartQuery.isError || !cartQuery.data) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col">
        <SectionHeader
          leading="close"
          leadingHref="/"
          leadingLabel="장바구니 닫기"
          title="장바구니"
        />
        <div className="flex flex-1 flex-col items-center justify-center">
          <ErrorState
            icon={<Icon name="alert" size={56} aria-hidden />}
            title="장바구니를 불러오지 못했어요"
            description="잠시 후 다시 시도해주세요"
            action={
              <FloatingButton icon="refresh" onClick={() => void cartQuery.refetch()}>
                다시 시도
              </FloatingButton>
            }
          />
        </div>
      </div>
    );
  }

  // 화면 아이템 id는 cartItemId(체크아웃 핸드오프용, mapCartResponse.ts 참고)라 수량변경·
  // 삭제 API(productId 필요)를 부르기 전에 여기서 productId로 되돌린다.
  const productIdByCartItemId = new Map(
    cartQuery.data.groups.flatMap((group) =>
      group.items.map((item) => [String(item.cartItemId), item.productId] as const),
    ),
  );

  return (
    <CartView
      groups={mapCartResponse(cartQuery.data)}
      onQuantityChange={(itemId, quantity) => {
        const productId = productIdByCartItemId.get(itemId);
        if (productId === undefined) return;
        updateQuantity.mutate({ productId, quantity });
      }}
      onRemoveItems={(itemIds) => {
        const productIds = itemIds
          .map((itemId) => productIdByCartItemId.get(itemId))
          .filter((productId) => productId !== undefined);
        if (productIds.length === 0) return;
        removeItems.mutate(productIds);
      }}
    />
  );
}

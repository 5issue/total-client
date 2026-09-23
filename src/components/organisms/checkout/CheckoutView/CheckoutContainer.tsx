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
      <div className="bg-surface-secondary flex flex-1 flex-col">
        <SectionHeader leading="back" leadingHref="/cart" title="주문서" />
        <div className="flex flex-1 flex-col items-center justify-center">
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
      </div>
    );
  }

  const items = mapSelectedCartItemsToOrder(cartQuery.data, itemIds);

  if (items.length === 0) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col">
        <SectionHeader leading="back" leadingHref="/cart" title="주문서" />
        <div className="flex flex-1 flex-col items-center justify-center">
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
      </div>
    );
  }

  const addresses = addressesQuery.data.addresses.map(mapAddressToView);

  if (addresses.length === 0) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col">
        <SectionHeader leading="back" leadingHref="/cart" title="주문서" />
        <div className="flex flex-1 flex-col items-center justify-center">
          <ErrorState
            icon={<Icon name="alert" size={56} aria-hidden />}
            title="등록된 배송지가 없어요"
            description="배송지를 먼저 등록해주세요"
            action={
              <FloatingButton icon="arrow-right" onClick={() => router.push('/mypage/addresses')}>
                배송지 등록하기
              </FloatingButton>
            }
          />
        </div>
      </div>
    );
  }

  // 선택된(또는 기본) 배송지가 없으면(예: 기본 배송지 미지정) 첫 배송지로 대체한다 —
  // `undefined`를 넘기면 CheckoutView가 목데이터(MOCK_DEFAULT_ADDRESS)로 대체해
  // 실제 결제 화면에 가짜 주소가 노출된다(CodeRabbit).
  // addresses[0] 은 위 length===0 얼리리턴으로 항상 존재가 보장된다.
  const selected =
    addresses.find((a) => a.id === selectedAddressId) ??
    addresses.find((a) => a.isDefault) ??
    addresses[0]!;
  const deliveryAddress = {
    isDefault: selected.isDefault,
    addressLine: addressLineOf(selected),
    recipient: selected.recipient,
    phone: selected.phone,
  };

  return (
    <CheckoutView
      items={items}
      amounts={computeOrderAmounts(cartQuery.data, itemIds)}
      deliveryAddress={deliveryAddress}
    />
  );
}

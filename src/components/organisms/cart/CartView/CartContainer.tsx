'use client';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useCart } from '@/hooks/cart/useCart';
import { useRemoveCartItems } from '@/hooks/cart/useRemoveCartItems';
import { useUpdateCartItemQuantity } from '@/hooks/cart/useUpdateCartItemQuantity';

import { CartView } from './CartView';
import { mapCartResponse } from './mapCartResponse';

/**
 * 장바구니 컨테이너 — `useCart` 로 실제 장바구니를 받아 매핑해 내린다.
 * 수량 변경은 `useUpdateCartItemQuantity`(낙관적, api-convention §7 유일 예외),
 * 삭제는 `useRemoveCartItems`(기본 정책 — 성공 후 invalidate)로 실제 API 호출한다.
 */
export function CartContainer() {
  const cartQuery = useCart();
  const updateQuantity = useUpdateCartItemQuantity();
  const removeItems = useRemoveCartItems();

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
      <div className="bg-surface-secondary flex flex-1 flex-col items-center justify-center">
        <SectionHeader
          leading="close"
          leadingHref="/"
          leadingLabel="장바구니 닫기"
          title="장바구니"
        />
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
    );
  }

  return (
    <CartView
      groups={mapCartResponse(cartQuery.data)}
      onQuantityChange={(itemId, quantity) =>
        updateQuantity.mutate({ cartItemId: Number(itemId), quantity })
      }
      onRemoveItems={(itemIds) => removeItems.mutate(itemIds.map(Number))}
    />
  );
}

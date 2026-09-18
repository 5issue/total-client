'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { cartKeys } from '@/hooks/cart/queryKeys';
import { updateCartItemQuantity } from '@/lib/apiClient';
import type { CartResponse } from '@/types/cart';

function applyQuantity(cart: CartResponse | undefined, cartItemId: number, quantity: number) {
  if (!cart) return cart;
  return {
    groups: cart.groups.map((group) => ({
      ...group,
      items: group.items.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item,
      ),
    })),
  };
}

/**
 * 장바구니 수량 변경 — api-convention §7 이 명시한 **유일한 Optimistic Update 예외**.
 * 담기/수량조절은 연속적이고 즉시 반영이 기대되는 상호작용이라 낙관적으로 먼저 반영하고,
 * 실패하면 스냅샷으로 롤백, 성공/실패 무관 `onSettled` 에서 반드시 서버 값으로 수렴시킨다
 * (재고·가격처럼 서버가 최종 판정하는 값이 낙관 표시와 어긋날 수 있어서).
 */
export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: number; quantity: number }) =>
      updateCartItemQuantity(cartItemId, { quantity }),
    onMutate: async ({ cartItemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.detail() });
      const prev = queryClient.getQueryData<CartResponse>(cartKeys.detail());
      queryClient.setQueryData<CartResponse>(cartKeys.detail(), (cart) =>
        applyQuantity(cart, cartItemId, quantity),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(cartKeys.detail(), ctx.prev);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
}

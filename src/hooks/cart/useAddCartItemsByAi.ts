'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { cartKeys } from '@/hooks/cart/queryKeys';
import { addCartItems, fetchProductsByAi } from '@/lib/apiClient';

export interface AddCartItemsByAiItem {
  /** AI 응답의 product_id(BE 상품 PK가 아니다) — mutate 전에 `by-ai`로 변환한다. */
  productId: string;
  quantity: number;
}

/**
 * AI product_id로 들어온 품목을 BE 상품 UNIT id로 변환한 뒤 장바구니에 담는다(이슈 #203).
 * `FridgeRefillBottomSheet`의 단건 "채워넣기"와 달리, 레시피 "부족재료 담기"처럼 여러
 * 품목을 한 번에 조회·담아야 하는 호출부가 쓴다 — 변환과 담기를 한 뮤테이션으로 묶어
 * `isPending`이 전체 과정(조회~담기)을 덮게 해서, 호출부가 그 값만 보고 중복 제출을
 * 막을 수 있게 한다(코드래빗 리뷰 — 연타 시 두 번 담기는 문제).
 *
 * 같은 product_id에 GROUP(대표상품)·UNIT(실제 구매단위) 두 항목이 같이 올 수 있어 UNIT
 * 쪽만 쓴다. 매핑이 없는 품목은 조용히 제외하고 나머지만 담는다 — 전부 매핑 실패면
 * 에러로 던져 호출부의 `onError`가 실패를 알리게 한다.
 */
export function useAddCartItemsByAi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: AddCartItemsByAiItem[]) => {
      const byAi = await fetchProductsByAi(items.map(({ productId }) => productId));
      const unitIdByAiProductId = new Map(
        byAi.items.filter((p) => p.type === 'UNIT').map((p) => [String(p.aiProductId), p.id]),
      );
      const resolvedItems = items
        .map(({ productId, quantity }) => {
          const unitId = unitIdByAiProductId.get(productId);
          return unitId === undefined ? null : { productId: unitId, quantity };
        })
        .filter((resolved) => resolved !== null);

      if (resolvedItems.length === 0) {
        throw new Error('장바구니에 담을 수 있는 상품이 없습니다.');
      }

      return addCartItems({ items: resolvedItems });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
}

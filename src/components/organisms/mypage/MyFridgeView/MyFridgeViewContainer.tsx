'use client';

import { useCartItemCount } from '@/hooks/cart/useCartItemCount';
import { useDeleteFridgeItem } from '@/hooks/fridge/useDeleteFridgeItem';
import { useFridgeItems } from '@/hooks/fridge/useFridgeItems';
import { useProductsByAi } from '@/hooks/product/useProductsByAi';

import { toFridgeItemViewModel } from './mapFridgeItem';
import type { FridgeTabId } from './model';
import { MyFridgeView } from './MyFridgeView';

export interface MyFridgeViewContainerProps {
  initialTab: FridgeTabId;
}

/**
 * `MyFridgeView`(표현 컴포넌트) 컨테이너 — `useFridgeItems`/`useDeleteFridgeItem`(AI 파트
 * FRIDGE-01/04, 이슈 #138)을 소비하고 로딩·에러는 그대로 아래로 흘려보낸다(api-convention
 * §8, `OrderCompleteContainer`/`ProductGrid` 소비부와 동일 패턴).
 *
 * 다건 선택삭제는 백엔드에 배치 API가 없어(명세 §05-3) 품목별로 개별 DELETE를 발화한다 —
 * 부분 실패해도 성공한 품목은 `invalidateQueries`로 목록에 반영되고, 실패한 품목은
 * 다음 목록 갱신에서 다시 보이므로 별도 롤백 처리가 필요 없다(Optimistic Update 미사용, §7).
 *
 * 목록의 AI product_id 전체를 `GET /products/by-ai`로 한 번에 변환해 상세 페이지 링크에
 * 쓴다(이슈 #203) — 품목마다 따로 조회하지 않고 배치 하나로 묶는다. `KitchenInventoryCard`가
 * 예전엔 AI product_id를 BE 상품 id인 것처럼 그대로 링크에 써서, 누른 상품과 다른 상품의
 * 상세가 뜨는 버그가 있었다(냉장고 담기만 고치고 이 링크는 놓쳤던 부분).
 */
export function MyFridgeViewContainer({ initialTab }: MyFridgeViewContainerProps) {
  const fridgeItemsQuery = useFridgeItems();
  const deleteFridgeItem = useDeleteFridgeItem();
  const cartCount = useCartItemCount();

  const aiProductIds = (fridgeItemsQuery.data?.items ?? []).map((item) => item.product.product_id);
  const { data: byAi } = useProductsByAi(aiProductIds, aiProductIds.length > 0);
  // by-ai 응답은 같은 product_id에 대해 GROUP이 UNIT보다 먼저 온다(BE 계약) — 먼저
  // 만난 값만 채택하면 자연히 GROUP 우선, GROUP이 없으면 UNIT으로 떨어진다.
  const detailProductIdByAiId = new Map<string, string>();
  for (const p of byAi?.items ?? []) {
    const key = String(p.aiProductId);
    if (!detailProductIdByAiId.has(key)) detailProductIdByAiId.set(key, String(p.id));
  }

  const fridgeItems = (fridgeItemsQuery.data?.items ?? []).map((item, index) =>
    toFridgeItemViewModel(item, index, detailProductIdByAiId),
  );

  function handleDeleteItems(productIds: string[]) {
    productIds.forEach((productId) => deleteFridgeItem.mutate(productId));
  }

  return (
    <MyFridgeView
      initialTab={initialTab}
      fridgeItems={fridgeItems}
      fridgeItemsPending={fridgeItemsQuery.isPending}
      fridgeItemsError={fridgeItemsQuery.isError}
      onDeleteItems={handleDeleteItems}
      cartCount={cartCount}
    />
  );
}

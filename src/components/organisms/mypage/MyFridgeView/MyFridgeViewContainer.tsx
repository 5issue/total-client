'use client';

import { useDeleteFridgeItem } from '@/hooks/fridge/useDeleteFridgeItem';
import { useFridgeItems } from '@/hooks/fridge/useFridgeItems';

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
 */
export function MyFridgeViewContainer({ initialTab }: MyFridgeViewContainerProps) {
  const fridgeItemsQuery = useFridgeItems();
  const deleteFridgeItem = useDeleteFridgeItem();

  const fridgeItems = (fridgeItemsQuery.data?.items ?? []).map(toFridgeItemViewModel);

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
    />
  );
}

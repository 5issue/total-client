import type { Metadata } from 'next';

import { MyFridgeViewContainer } from '@/components/organisms/mypage/MyFridgeView';
import type { FridgeTabId } from '@/components/organisms/mypage/MyFridgeView/model';

export const metadata: Metadata = { title: '나의 냉장고' };

/**
 * 나의 냉장고 (`/mypage/fridge`) — 마이컬리 홈 "컬리키친 > MY 냉장고" 카드 진입점.
 * `(chromeless)`: 자체 헤더(뒤로가기+컬리키친+홈+장바구니)만 있고 BottomNav 없음 —
 * cart/addresses와 동일 그룹. MY냉장고 탭은 `MyFridgeViewContainer`가 실 데이터(AI 파트
 * FRIDGE-01/04, 이슈 #138)를 공급한다. MY레시피 탭은 아직 mock(`MyRecipeView` 내부).
 * `?tab=` 으로 MY 냉장고/MY 레시피 탭 상태를 유지한다(취소·반품·교환 내역과 동일 컨벤션).
 */
export default async function FridgePage({ searchParams }: PageProps<'/mypage/fridge'>) {
  const { tab } = await searchParams;
  const initialTab: FridgeTabId = tab === 'recipe' ? 'recipe' : 'fridge';

  return <MyFridgeViewContainer initialTab={initialTab} />;
}

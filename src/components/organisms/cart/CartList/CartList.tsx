'use client';

import { CartCard } from '@/components/organisms/cart/CartCard';
import type { CartDeliveryGroup } from '@/components/organisms/cart/model';

/**
 * 배송 유형별 장바구니 카드 목록 (organism). Figma "5팀 UI 공유용" — `Frame 1430106812` (node 188-9483).
 * 회색 컨테이너(`Bg/secondary`#f0f5f8, `px-4 py-3`) 안에 흰색 `CartCard` 블록들이 놓인다.
 * 그룹 배열을 받아 `CartCard` 로 편다. 선택/수량/삭제 핸들러는 그대로 통과시킨다.
 */
export interface CartListProps {
  groups: CartDeliveryGroup[];
  selectedIds: ReadonlySet<string>;
  onItemCheckedChange: (id: string, checked: boolean) => void;
  onItemQuantityChange: (id: string, quantity: number) => void;
  onItemRemove: (id: string) => void;
  onGroupToggle: (groupId: string, checked: boolean) => void;
  className?: string;
}

export function CartList({ groups, className, ...handlers }: CartListProps) {
  return (
    <div
      className={['bg-surface-secondary flex flex-col gap-3 px-4 py-3', className]
        .filter(Boolean)
        .join(' ')}
    >
      {groups.map((group) => (
        <CartCard key={group.id} group={group} {...handlers} />
      ))}
    </div>
  );
}

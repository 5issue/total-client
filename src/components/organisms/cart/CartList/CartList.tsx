'use client';

import { CartCard } from '@/components/organisms/cart/CartCard';
import type { CartDeliveryGroup } from '@/components/organisms/cart/model';

/**
 * 배송 유형별 장바구니 카드 목록 (organism). Figma "5팀 UI 공유용" — `Frame 1430106812` (node 188-8927).
 * 회색 컨테이너(`Bg/secondary`#f0f5f8) 패딩: `pt-2` `pb-5` `px-4`(Gap/M 16), 카드 간격 `gap-4`.
 * (Figma 원본은 pt-3/pb-7 이나 디자인 협의로 위·아래를 살짝 줄임 — round 5 피드백.)
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
      className={['bg-surface-secondary flex flex-col gap-4 px-4 pt-2 pb-5', className]
        .filter(Boolean)
        .join(' ')}
    >
      {groups.map((group) => (
        <CartCard key={group.id} group={group} {...handlers} />
      ))}
    </div>
  );
}

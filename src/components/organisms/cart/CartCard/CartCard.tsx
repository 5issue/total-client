'use client';

import { Checkbox } from '@/components/atoms/Checkbox';
import { CartLineItem } from '@/components/molecules/cart/CartLineItem';
import { CartTemperatureSectionHeader } from '@/components/molecules/cart/CartTemperatureSectionHeader';
import type { CartDeliveryGroup } from '@/components/organisms/cart/model';

/**
 * 배송 유형 하나의 장바구니 카드 (organism). Figma "5팀 UI 공유용" — `Card_Cart` (node 2600-1933).
 *
 * [배송유형 체크박스 + 라벨] / 온도대 섹션(냉장·냉동)별 `CartLineItem` 목록 / 카드 푸터(소계).
 * 데이터·핸들러는 상위(CartList/CartView)가 주입 — 상품 선택은 id Set(`selectedIds`),
 * 배송유형 체크는 `group.checked`(별개 상태, API 값). 배송유형 체크박스는 상품을 건드리지 않는다.
 *
 * 토큰(`get_variable_defs` node 188-9589): 카드 `Surface/Base` → `bg-surface`(회색 컨테이너 위 흰 블록),
 * 구분선 `Border/Strong`#dde4ed → `border-border`, radius `Radius/XL`16 → `rounded-xl`,
 * 라벨 `Heading/H1_SemiBold`18/600 → `text-heading-1`, 소계문구 `Label/M_Medium`14/500 + `Text/Quaternary`#8aa1ab
 * → `text-label-m text-fg-quaternary`, 소계금액 `Heading/H0_SemiBold`20/600 → `text-heading-0`,
 * 소계박스 `Surface/Secondary`#f0f5f8 `Radius/L`12(네 모서리) → `bg-surface-secondary rounded-[var(--radius-l)]`
 * (`rounded-l` 은 Tailwind 코어의 방향형(왼쪽만) 유틸리티와 충돌해 좌우 비대칭이 됨 — 명시 토큰 사용).
 * 온도 아이콘은 체크박스 글리프(44px 타깃 중앙 = +10px)와 맞추려 `pl-2.5`.
 */
export interface CartCardProps {
  group: CartDeliveryGroup;
  selectedIds: ReadonlySet<string>;
  onItemCheckedChange: (id: string, checked: boolean) => void;
  onItemQuantityChange: (id: string, quantity: number) => void;
  onItemRemove: (id: string) => void;
  onGroupToggle: (groupId: string, checked: boolean) => void;
  className?: string;
}

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;
const TEMPERATURE_ORDER = ['refrigerated', 'frozen'] as const;

export function CartCard({
  group,
  selectedIds,
  onItemCheckedChange,
  onItemQuantityChange,
  onItemRemove,
  onGroupToggle,
  className,
}: CartCardProps) {
  const sections = TEMPERATURE_ORDER.map((temp) => ({
    temp,
    items: group.items.filter((i) => i.temperature === temp),
  })).filter((s) => s.items.length > 0);

  return (
    <div
      className={['bg-surface flex flex-col gap-3 rounded-xl pt-3 pr-2 pb-5 pl-3', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="border-border flex items-center border-b pb-2">
        <span className="flex size-8 shrink-0 items-center justify-center">
          <Checkbox
            variant="filled"
            label={`${group.deliveryLabel} 선택`}
            checked={group.checked}
            onChange={(e) => onGroupToggle(group.id, e.target.checked)}
          />
        </span>
        <span className="text-heading-1 text-fg">{group.deliveryLabel}</span>
      </div>

      <div className="flex flex-col">
        {sections.map(({ temp, items }, i) => (
          <div
            key={temp}
            className={['flex flex-col gap-3', i > 0 && 'border-border mt-5 border-t pt-5']
              .filter(Boolean)
              .join(' ')}
          >
            <CartTemperatureSectionHeader temperature={temp} className="pl-2.5" />
            {items.map((item) => (
              <CartLineItem
                key={item.id}
                name={item.name}
                imageSrc={item.imageSrc}
                price={item.price}
                originalPrice={item.originalPrice}
                quantity={item.quantity}
                soldOut={item.soldOut}
                checked={selectedIds.has(item.id)}
                onCheckedChange={(checked) => onItemCheckedChange(item.id, checked)}
                onQuantityChange={(qty) => onItemQuantityChange(item.id, qty)}
                onRemove={() => onItemRemove(item.id)}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="bg-surface-secondary flex flex-col items-center rounded-[var(--radius-l)] px-2.5 pt-3 pb-4 text-center">
        <p className="text-label-m text-fg-quaternary">
          상품 {won(group.subtotalPrice)} + 배송비{' '}
          {group.shippingFee === 0 ? '무료' : won(group.shippingFee)}
        </p>
        <p className="text-heading-0 text-fg">{won(group.subtotalPrice + group.shippingFee)}</p>
      </div>
    </div>
  );
}

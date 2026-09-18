import type { OrderListEntry } from '@/types/order';

import type { OrderHistoryOrder, OrderHistoryPeriod, OrderHistoryStatus } from './model';

/**
 * Spring `OrderListEntry` → 화면 `OrderHistoryOrder` 매핑.
 *
 * API 는 `orderStatus`/`fulfillmentStatus`/`deliveryStatus` 세 축으로 상태를 내려주는데
 * 화면은 하나의 `OrderHistoryStatus` 로 뭉뚱그린다(퍼블리싱 당시 확정된 Figma 상태 목록이
 * 이 하나였기 때문) — 아래 파생 규칙은 근사치다. 취소·부분반품처럼 화면에 이미 있는
 * `반품완료`/일부반품(`extraGroups`) 세부 분기는 API 가 별도 필드로 안 내려줘서 아직
 * 반영 못 했다 — 백엔드 필드 확정되면 다시 손볼 것.
 */
function deriveHistoryStatus(entry: OrderListEntry): OrderHistoryStatus {
  if (entry.orderStatus === 'REFUNDED' || entry.orderStatus === 'RETURN_REQUESTED') {
    return '반품완료';
  }
  if (entry.deliveryStatus === 'DELIVERED') return '배송완료';
  if (entry.deliveryStatus === 'IN_TRANSIT') return '배송중';
  if (entry.fulfillmentStatus === 'RELEASE_INSTRUCTED' || entry.fulfillmentStatus === 'RELEASED') {
    return '배송준비';
  }
  return '주문완료';
}

/** `YYYY-MM-DDTHH:mm:ss+09:00` → 화면 표기(`YYYY.MM.DD`). */
function formatOrderedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

export function mapOrderListEntry(entry: OrderListEntry): OrderHistoryOrder {
  return {
    id: String(entry.orderId),
    orderNumber: entry.orderNo,
    orderedAt: formatOrderedAt(entry.orderedAt),
    status: deriveHistoryStatus(entry),
    arrival: entry.deliveredAt
      ? formatOrderedAt(entry.deliveredAt)
      : (entry.expectedDeliveryAt ?? ''),
    returnPeriodEnded: false,
    products: entry.items.map((item) => ({
      id: String(item.orderItemId),
      deliveryType: item.deliveryType,
      name: item.title,
      price: item.unitPrice,
      originalPrice: item.unitPrice,
      quantity: item.quantity,
      imageSrc: item.thumbnailUrl ?? undefined,
    })),
  };
}

/** 화면 소문자 기간 값(`3m`) → Spring 대문자(`3M`). */
export function toSpringPeriod(period: OrderHistoryPeriod): '3M' | '6M' | '1Y' | '3Y' {
  return period.toUpperCase() as '3M' | '6M' | '1Y' | '3Y';
}

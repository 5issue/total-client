import type { OrderDetailResponse } from '@/types/order';

import type { MockOrderProduct } from './mock';
import type { OrderDetailSummary, OrderStatus } from './OrderDetailView';

/**
 * Spring `OrderDetailResponse` → 화면 props 매핑.
 *
 * 깔끔히 매핑되는 것: 주문 요약, 상품 목록, `selfCancelable` → 취소 가능 여부.
 * 배송지/수령인/전화번호는 백엔드 `getById()`가 아예 조회하지 않아 소스가 없다
 * (2026-09-23 확인) — 빈 문자열로 채운다(화면에서 조건부로 숨겨지는 자리는 자동으로
 * 비고, 그 외는 빈 줄로 보인다. 백엔드에 배송지 조회가 추가되면 다시 채울 것).
 * API 에 없는 세부 항목(결제 상세 브레이크다운의 쿠폰/적립금 항목별 금액, 배송 요청사항의
 * 메시지 전송 시점 등)은 이 매퍼가 만들지 않는다 — 컨테이너가 그 부분만 mock 기본값을
 * 계속 쓰도록 둔다(README 격 주석: 이슈 #116, 백엔드 필드 확정되면 다시 손볼 것).
 */
function formatDateTime(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${d} ${hh}:${mm}`;
}

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

/** 주문/배송 상태 조합 → 화면 `OrderStatus`. API 는 취소·반품 상세 사유를 안 구분해 근사치다. */
export function mapOrderStatus(detail: OrderDetailResponse): OrderStatus {
  if (
    detail.order.orderStatus === 'CANCELLED' ||
    detail.order.orderStatus === 'CANCEL_PROCESSING'
  ) {
    return '주문취소';
  }
  if (detail.order.orderStatus === 'RETURN_REQUESTED') return '반품접수';
  if (detail.order.orderStatus === 'REFUNDED') return '반품완료';
  if (detail.deliveryStatus === 'DELIVERED') return '배송완료';
  if (detail.deliveryStatus === 'IN_TRANSIT') return '배송중';
  return '주문완료';
}

export function mapOrderDetailSummary(detail: OrderDetailResponse): OrderDetailSummary {
  return {
    orderNumber: detail.order.orderNo,
    paidAt: formatDateTime(detail.order.orderedAt),
    // 백엔드가 배송지를 아예 조회하지 않는다(2026-09-23 확인) — 빈 문자열이면 화면에서 숨겨진다.
    address: '',
    status: mapOrderStatus(detail),
    arrival: detail.order.expectedDeliveryAt ? formatDateTime(detail.order.expectedDeliveryAt) : '',
    deliveredAt: detail.order.deliveredAt ? formatDateTime(detail.order.deliveredAt) : '',
    receiver: '',
    phone: '',
  };
}

export function mapOrderDetailProducts(detail: OrderDetailResponse): MockOrderProduct[] {
  return detail.order.items.map((item) => ({
    id: String(item.orderItemId),
    // 백엔드가 아직 배송 타입을 안 내려준다(2026-09-23 확인) — 빈 문자열이면 화면에서 숨겨진다.
    deliveryType: item.deliveryType ?? '',
    name: item.title,
    price: item.unitPrice,
    // API 는 정가를 따로 안 내려준다 — 취소선 비교가 필요 없는 화면이라 같은 값으로 채운다.
    originalPrice: item.unitPrice,
    quantity: item.quantity,
  }));
}

export function formatPaymentTotal(detail: OrderDetailResponse): string {
  return won(detail.order.paymentAmount);
}

import type { OrderDetailResponse } from '@/types/order';

import type { MockOrderProduct } from './mock';
import type { OrderDetailSummary, OrderStatus } from './OrderDetailView';

/**
 * Spring `OrderDetailResponse` → 화면 props 매핑.
 *
 * 깔끔히 매핑되는 것: 주문 요약, 상품 목록, 배송 정보, `selfCancelable` → 취소 가능 여부.
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
    detail.orderInfo.orderStatus === 'CANCELLED' ||
    detail.orderInfo.orderStatus === 'CANCEL_PROCESSING'
  ) {
    return '주문취소';
  }
  if (detail.orderInfo.orderStatus === 'RETURN_REQUESTED') return '반품접수';
  if (detail.orderInfo.orderStatus === 'REFUNDED') return '반품완료';
  if (detail.deliveryInfo.deliveryStatus === 'DELIVERED') return '배송완료';
  if (detail.deliveryInfo.deliveryStatus === 'IN_TRANSIT') return '배송중';
  return '주문완료';
}

export function mapOrderDetailSummary(detail: OrderDetailResponse): OrderDetailSummary {
  const { address } = detail.deliveryInfo;
  return {
    orderNumber: detail.orderInfo.orderNo,
    paidAt: formatDateTime(detail.orderInfo.orderedAt),
    address: [address.roadAddress, address.detailAddress].filter(Boolean).join(' '),
    status: mapOrderStatus(detail),
    arrival: detail.deliveryInfo.expectedDeliveryAt
      ? formatDateTime(detail.deliveryInfo.expectedDeliveryAt)
      : '',
    deliveredAt: detail.deliveryInfo.deliveredAt
      ? formatDateTime(detail.deliveryInfo.deliveredAt)
      : '',
    receiver: detail.deliveryInfo.receiver.name,
    phone: detail.deliveryInfo.receiver.phoneNumber,
  };
}

export function mapOrderDetailProducts(detail: OrderDetailResponse): MockOrderProduct[] {
  return detail.items.map((item) => ({
    id: String(item.orderItemId),
    deliveryType: item.deliveryType,
    name: item.title,
    price: item.unitPrice,
    // API 는 정가를 따로 안 내려준다 — 취소선 비교가 필요 없는 화면이라 같은 값으로 채운다.
    originalPrice: item.unitPrice,
    quantity: item.quantity,
  }));
}

export function formatPaymentTotal(detail: OrderDetailResponse): string {
  return won(detail.paymentSummary.paymentAmount);
}

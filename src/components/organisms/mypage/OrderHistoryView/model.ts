export type OrderProgressStatus = '주문완료' | '배송준비' | '배송중' | '배송완료';

export type OrderHistoryStatus = OrderProgressStatus | '반품완료';

export type OrderHistoryPeriod = '3m' | '6m' | '1y' | '3y';

export interface OrderHistoryProduct {
  id: string;
  deliveryType: string;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  imageSrc?: string;
}

export interface OrderHistoryGroup {
  id: string;
  status: OrderHistoryStatus;
  arrival?: string;
  products: OrderHistoryProduct[];
}

export interface OrderHistoryOrder {
  id: string;
  orderNumber: string;
  orderedAt: string;
  status: OrderHistoryStatus;
  arrival: string;
  products: OrderHistoryProduct[];
  /** 배송완료 후 반품 접수 기간이 지났으면 true. 기간 종료 화면은 후기 작성만 둔다. */
  returnPeriodEnded?: boolean;
  /** false 면 단계 인디케이터를 숨긴다(일부 반품 node 771-107724). */
  showIndicator?: boolean;
  /** 같은 주문 안의 추가 상태 그룹(반품완료 등). */
  extraGroups?: OrderHistoryGroup[];
}

export function getOrderGroups(order: OrderHistoryOrder): OrderHistoryGroup[] {
  const primary: OrderHistoryGroup = {
    id: `${order.id}-primary`,
    status: order.status,
    arrival: order.arrival,
    products: order.products,
  };
  return order.extraGroups ? [primary, ...order.extraGroups] : [primary];
}

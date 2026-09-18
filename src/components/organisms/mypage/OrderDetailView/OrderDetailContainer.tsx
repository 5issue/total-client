'use client';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useCancelOrder } from '@/hooks/order/useCancelOrder';
import { useOrderDetail } from '@/hooks/order/useOrderDetail';

import {
  formatPaymentTotal,
  mapOrderDetailProducts,
  mapOrderDetailSummary,
  mapOrderStatus,
} from './mapOrderDetailResponse';
import { OrderDetailView } from './OrderDetailView';

/**
 * 주문 상세(주문 추적) 컨테이너 — `useOrderDetail` 로 실데이터를 받아 매핑해 내린다.
 * 취소는 `useCancelOrder` 로 실제 API 호출, 사유는 화면에 별도 입력 UI가 없어 "단순 변심"
 * (CNL01)으로 고정 보낸다 — 세분화된 사유 선택 UI 필요하면 후속 이슈.
 */
export function OrderDetailContainer({ orderId }: { orderId: number }) {
  const detailQuery = useOrderDetail(orderId);
  const cancelMutation = useCancelOrder(orderId);

  if (detailQuery.isLoading) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col">
        <SectionHeader leading="back" leadingHref="/mypage/orders" title="주문 내역 상세" />
        <LoadingIndicator className="flex-1" />
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col items-center justify-center">
        <SectionHeader leading="back" leadingHref="/mypage/orders" title="주문 내역 상세" />
        <ErrorState
          icon={<Icon name="alert" size={56} aria-hidden />}
          title="주문 정보를 불러오지 못했어요"
          description="잠시 후 다시 시도해주세요"
          action={
            <FloatingButton icon="refresh" onClick={() => void detailQuery.refetch()}>
              다시 시도
            </FloatingButton>
          }
        />
      </div>
    );
  }

  const detail = detailQuery.data;

  return (
    <OrderDetailView
      initialStatus={mapOrderStatus(detail)}
      orderDetail={mapOrderDetailSummary(detail)}
      products={mapOrderDetailProducts(detail)}
      paymentTotal={formatPaymentTotal(detail)}
      onCancelConfirm={
        detail.selfCancelable ? () => cancelMutation.mutate({ reasonCode: 'CNL01' }) : undefined
      }
    />
  );
}

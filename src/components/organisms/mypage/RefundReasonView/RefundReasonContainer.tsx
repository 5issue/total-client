'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { mapOrderItemToRefundItem } from '@/components/organisms/mypage/RefundReturnView/mapReturnItems';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useOrderDetail } from '@/hooks/order/useOrderDetail';
import { useReturnPreview } from '@/hooks/order/useReturnPreview';

import { mapReasonOptions } from './mapReasonOptions';
import { RefundReasonView } from './RefundReasonView';

/**
 * 반품 사유 컨테이너 — 주문 상세(`useOrderDetail`)에서 선택된 상품을,
 * 반품 사전조회(`useReturnPreview`)에서 실제 사유 목록을 받아 합쳐 내린다.
 */
export function RefundReasonContainer({
  orderId,
  itemIds,
}: {
  orderId: number;
  itemIds: string[];
}) {
  const router = useRouter();
  const detailQuery = useOrderDetail(orderId);
  const previewQuery = useReturnPreview(orderId);

  const isLoading = detailQuery.isLoading || previewQuery.isLoading;
  const isError =
    detailQuery.isError || previewQuery.isError || !detailQuery.data || !previewQuery.data;

  const selectedItems = detailQuery.data
    ? detailQuery.data.items
        .map(mapOrderItemToRefundItem)
        .filter((item) => itemIds.includes(item.id))
    : [];
  const hasNoValidItems = !isLoading && !isError && selectedItems.length === 0;

  useEffect(() => {
    if (hasNoValidItems) {
      router.replace(`/mypage/orders/return?orderId=${orderId}`);
    }
  }, [hasNoValidItems, orderId, router]);

  if (isLoading || hasNoValidItems) {
    return (
      <div className="bg-surface flex flex-1 flex-col">
        <SectionHeader leading="back" leadingHref="/mypage/orders" title="반품사유" />
        <LoadingIndicator className="flex-1" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-surface flex flex-1 flex-col items-center justify-center">
        <SectionHeader leading="back" leadingHref="/mypage/orders" title="반품사유" />
        <ErrorState
          icon={<Icon name="alert" size={56} aria-hidden />}
          title="주문 정보를 불러오지 못했어요"
          description="잠시 후 다시 시도해주세요"
          action={
            <FloatingButton
              icon="refresh"
              onClick={() => {
                void detailQuery.refetch();
                void previewQuery.refetch();
              }}
            >
              다시 시도
            </FloatingButton>
          }
        />
      </div>
    );
  }

  return (
    <RefundReasonView
      orderId={orderId}
      items={selectedItems}
      reasonOptions={mapReasonOptions(previewQuery.data.reasonOptions)}
    />
  );
}

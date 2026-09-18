'use client';

import { useRouter } from 'next/navigation';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useOrderDetail } from '@/hooks/order/useOrderDetail';
import { useReturnPreview } from '@/hooks/order/useReturnPreview';

import { mapReturnItems } from './mapReturnItems';
import { RefundReturnView } from './RefundReturnView';

/**
 * 반품 접수 컨테이너 — `useOrderDetail` 로 실제 주문 상품을, `useReturnPreview` 로 반품
 * 가능 여부를 받는다. `returnable=false` 면 3단계 흐름을 다 채우고서야 막히지 않도록
 * 첫 화면에서 바로 안내한다.
 */
export function RefundReturnContainer({ orderId }: { orderId: number }) {
  const router = useRouter();
  const detailQuery = useOrderDetail(orderId);
  const previewQuery = useReturnPreview(orderId);

  if (detailQuery.isLoading || previewQuery.isLoading) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col">
        <SectionHeader leading="back" leadingHref="/mypage/orders" title="반품 접수" />
        <LoadingIndicator className="flex-1" />
      </div>
    );
  }

  if (detailQuery.isError || previewQuery.isError || !detailQuery.data || !previewQuery.data) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col items-center justify-center">
        <SectionHeader leading="back" leadingHref="/mypage/orders" title="반품 접수" />
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

  if (!previewQuery.data.returnable) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col items-center justify-center">
        <SectionHeader leading="back" leadingHref="/mypage/orders" title="반품 접수" />
        <ErrorState
          icon={<Icon name="alert" size={56} aria-hidden />}
          title="반품할 수 없는 주문이에요"
          description={previewQuery.data.returnPolicy.guideMessage}
          action={
            <FloatingButton
              icon="arrow-right"
              onClick={() => router.push(`/mypage/orders/${orderId}`)}
            >
              주문 상세로 이동
            </FloatingButton>
          }
        />
      </div>
    );
  }

  return <RefundReturnView orderId={orderId} items={mapReturnItems(detailQuery.data)} />;
}

'use client';

import { useRouter } from 'next/navigation';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useReturnPreview } from '@/hooks/order/useReturnPreview';
import { useSubmitReturn } from '@/hooks/order/useSubmitReturn';
import type { OrderReturnRequest } from '@/types/order';

import { RefundDetailView } from './RefundDetailView';

/**
 * 반품 상세(최종 확인) 컨테이너 — `useReturnPreview` 로 실제 환불 예상액을 받고,
 * [반품 접수] 클릭 시 `useSubmitReturn` 으로 실제 제출한다. `reasonCode`/`reasonDetail` 은
 * `/mypage/orders/return/reason` 에서 쿼리로 넘어온 대표 사유(알려진 제약 — RefundReasonView 참고).
 */
export function RefundDetailContainer({
  orderId,
  reasonCode,
  reasonDetail,
}: {
  orderId: number;
  reasonCode: string;
  reasonDetail: string;
}) {
  const router = useRouter();
  const previewQuery = useReturnPreview(orderId);
  const submitMutation = useSubmitReturn(orderId);

  if (previewQuery.isLoading) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col">
        <SectionHeader leading="back" leadingHref="/mypage/orders" title="반품 내역 상세" />
        <LoadingIndicator className="flex-1" />
      </div>
    );
  }

  if (previewQuery.isError || !previewQuery.data) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col items-center justify-center">
        <SectionHeader leading="back" leadingHref="/mypage/orders" title="반품 내역 상세" />
        <ErrorState
          icon={<Icon name="alert" size={56} aria-hidden />}
          title="반품 정보를 불러오지 못했어요"
          description="잠시 후 다시 시도해주세요"
          action={
            <FloatingButton icon="refresh" onClick={() => void previewQuery.refetch()}>
              다시 시도
            </FloatingButton>
          }
        />
      </div>
    );
  }

  function handleSubmit() {
    submitMutation.mutate(
      {
        reasonCode: reasonCode as OrderReturnRequest['reasonCode'],
        reasonDetail: reasonDetail || undefined,
      },
      { onSuccess: () => router.push('/mypage/orders') },
    );
  }

  return (
    <RefundDetailView
      refundPreview={previewQuery.data.refundPreview}
      onSubmit={handleSubmit}
      isSubmitting={submitMutation.isPending}
      submitError={submitMutation.isError}
    />
  );
}

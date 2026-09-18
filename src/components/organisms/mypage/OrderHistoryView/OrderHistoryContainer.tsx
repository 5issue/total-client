'use client';

import { useState } from 'react';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useOrders } from '@/hooks/order/useOrders';

import { mapOrderListEntry, toSpringPeriod } from './mapOrderResponse';
import type { OrderHistoryPeriod } from './model';
import { OrderHistoryView } from './OrderHistoryView';

/** 주문 내역 목록 컨테이너 — `useOrders` 로 실데이터를 받아 `OrderHistoryView` 에 매핑해 내린다. */
export function OrderHistoryContainer() {
  const [period, setPeriod] = useState<OrderHistoryPeriod>('3m');
  const ordersQuery = useOrders({ range: toSpringPeriod(period) });

  if (ordersQuery.isLoading) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col">
        <SectionHeader leading="back" leadingHref="/mypage" title="주문 내역" />
        <LoadingIndicator className="flex-1" />
      </div>
    );
  }

  if (ordersQuery.isError || !ordersQuery.data) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col items-center justify-center">
        <SectionHeader leading="back" leadingHref="/mypage" title="주문 내역" />
        <ErrorState
          icon={<Icon name="alert" size={56} aria-hidden />}
          title="주문 내역을 불러오지 못했어요"
          description="잠시 후 다시 시도해주세요"
          action={
            <FloatingButton icon="refresh" onClick={() => void ordersQuery.refetch()}>
              다시 시도
            </FloatingButton>
          }
        />
      </div>
    );
  }

  return (
    <OrderHistoryView
      orders={ordersQuery.data.orders.map(mapOrderListEntry)}
      period={period}
      onPeriodChange={setPeriod}
    />
  );
}

'use client';

import { notFound } from 'next/navigation';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { mapCancellationReturnEntry } from '@/components/organisms/mypage/CancelReturnExchangeHistoryView/mapCancellationReturnResponse';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useCancellationsReturns } from '@/hooks/order/useCancellationsReturns';

import { CancelReturnExchangeDetailView } from './CancelReturnExchangeDetailView';

/**
 * 취소·반품 상세 내역 컨테이너 — order-service엔 단건 조회 엔드포인트가 따로 없어,
 * 목록 화면과 동일한 `GET /api/v1/orders/cancellations-returns`(`useCancellationsReturns`)
 * 데이터에서 `requestId`(=`id`)로 찾는다. 목록 화면(`CancelReturnExchangeHistoryContainer`)과
 * 같은 쿼리 키라 TanStack Query가 캐시를 공유한다 — 목록에서 들어오면 재요청 없이 즉시 표시된다.
 * API에 "교환"이 없어(취소/반품만) 못 찾으면(교환이든 오타 id든) 404 처리(이슈 #148).
 */
export function CancelReturnExchangeDetailContainer({ id }: { id: string }) {
  const historyQuery = useCancellationsReturns({});

  if (historyQuery.isLoading) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col">
        <SectionHeader leading="back" leadingHref="/mypage/orders" title="취소·반품 상세 내역" />
        <LoadingIndicator className="flex-1" />
      </div>
    );
  }

  if (historyQuery.isError || !historyQuery.data) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col">
        <SectionHeader leading="back" leadingHref="/mypage/orders" title="취소·반품 상세 내역" />
        <ErrorState
          className="flex-1"
          icon={<Icon name="alert" size={56} aria-hidden />}
          title="내역을 불러오지 못했어요"
          description="잠시 후 다시 시도해주세요"
          action={
            <FloatingButton icon="refresh" onClick={() => void historyQuery.refetch()}>
              다시 시도
            </FloatingButton>
          }
        />
      </div>
    );
  }

  const entry = historyQuery.data.histories.find((candidate) => String(candidate.requestId) === id);
  if (!entry) notFound();

  return <CancelReturnExchangeDetailView item={mapCancellationReturnEntry(entry)} />;
}

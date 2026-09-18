'use client';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useCancellationsReturns } from '@/hooks/order/useCancellationsReturns';

import { CancelReturnExchangeHistoryView } from './CancelReturnExchangeHistoryView';
import { mapCancellationReturnEntry } from './mapCancellationReturnResponse';

/** 취소·반품·교환 내역 컨테이너 — `useCancellationsReturns` 로 실데이터를 받아 매핑해 내린다. */
export function CancelReturnExchangeHistoryContainer() {
  const historyQuery = useCancellationsReturns({});

  if (historyQuery.isLoading) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col">
        <SectionHeader leading="back" leadingHref="/mypage" title="취소·반품·교환 내역" />
        <LoadingIndicator className="flex-1" />
      </div>
    );
  }

  if (historyQuery.isError || !historyQuery.data) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col items-center justify-center">
        <SectionHeader leading="back" leadingHref="/mypage" title="취소·반품·교환 내역" />
        <ErrorState
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

  return (
    <CancelReturnExchangeHistoryView
      items={historyQuery.data.histories.map(mapCancellationReturnEntry)}
    />
  );
}

'use client';

import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { OrderRefundStatusCard } from '@/components/molecules/mypage/OrderRefundStatusCard';
import { TabBar } from '@/components/molecules/shared/TabBar';
import type { TabBarItem } from '@/components/molecules/shared/TabBar';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';

import {
  MOCK_CANCEL_RETURN_EXCHANGE_ITEMS,
  REFERENCE_TODAY,
  STEP_LABELS,
  shouldShowStepIndicator,
  type CancelReturnExchangeType,
} from './mock';

/**
 * 취소·반품·교환 내역 화면 (organism) — Figma node 666-30339(전체) / 666-30389
 * (5일 경과) / 666-30892(상품 4개 이상). `/mypage/orders/cancel-return-exchange`.
 *
 * 탭(전체/취소/반품/교환) 전환은 로컬 state — 서버 필터링 없이 이미 받아온 목록을
 * 클라에서 타입으로 거른다(BE 연동 전 단계라 목록 자체가 mock).
 *
 * 이번 작업 범위는 **퍼블리싱만**이다:
 * - 교환은 Figma 예시 화면에 실제 항목이 없어 mock 데이터가 없다 — "교환" 탭을 누르면
 *   빈 상태 문구만 보인다(임의로 지어낸 단계 라벨을 넣지 않기 위함).
 * - 카드 우측 상단 "2026.08.26 / 주문번호... →" 미니헤더(Figma `showDetail`)는 실제
 *   보여줄 두 예시(반품/취소) 모두 꺼진 상태라 구현하지 않았다.
 * - Figma `showButton1`("반품 내역" 버튼)도 두 예시 모두 꺼져 있어 구현하지 않았다.
 *
 * 진행 단계 인디케이터 표시 여부는 `shouldShowStepIndicator`(mock.ts) 로 계산한다 —
 * "완료" 상태 도달 후 5일 경과 시 인디케이터가 사라진다(사용자 확인 사항).
 */
const TAB_ITEMS: TabBarItem[] = [
  { id: '전체', label: '전체' },
  { id: '취소', label: '취소' },
  { id: '반품', label: '반품' },
  { id: '교환', label: '교환' },
];

export function CancelReturnExchangeHistoryView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'전체' | CancelReturnExchangeType>('전체');

  const items = useMemo(
    () =>
      MOCK_CANCEL_RETURN_EXCHANGE_ITEMS.filter(
        (item) => activeTab === '전체' || item.type === activeTab,
      ),
    [activeTab],
  );

  return (
    <div className="bg-surface-secondary flex flex-1 flex-col">
      <SectionHeader
        leading="back"
        onLeadingClick={() => router.back()}
        title="취소·반품·교환 내역"
      />
      {/* Figma(node 666-30388): 탭 바 배경은 흰색(Bg/default) — 아래 목록의 회색
          배경(Bg/secondary)과 다르다. */}
      <TabBar
        items={TAB_ITEMS}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as '전체' | CancelReturnExchangeType)}
        tone="brand-secondary"
        size="md"
        className="bg-surface"
      />

      <div className="flex flex-1 flex-col gap-5 px-4 pt-5 pb-10">
        {items.length === 0 ? (
          <p className="text-heading-5 text-fg-quaternary py-10 text-center">
            {activeTab} 내역이 없어요
          </p>
        ) : (
          items.map((item) => {
            const steps = item.type === '교환' ? undefined : STEP_LABELS[item.type];
            const activeStepIndex = steps?.indexOf(item.status) ?? 0;
            const showIndicator = shouldShowStepIndicator(item, REFERENCE_TODAY);

            return (
              <OrderRefundStatusCard
                key={item.id}
                steps={showIndicator ? steps : undefined}
                activeStepIndex={activeStepIndex}
                indicatorLabel={`${item.type} 진행 상태`}
                status={item.status}
                receivedDateLabel={item.receivedDateLabel}
                products={item.products}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

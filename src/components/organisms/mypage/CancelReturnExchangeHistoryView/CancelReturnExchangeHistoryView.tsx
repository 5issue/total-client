'use client';

import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { OrderRefundStatusCard } from '@/components/molecules/mypage/OrderRefundStatusCard';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
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
 * 빈 상태(node 779-61022/61066/61110/61154, 탭별 4종)는 공용 `ErrorState` +
 * `FloatingButton` 조합으로 그대로 재사용한다(`CartView`·`AddressManageView` 와 동일
 * 패턴) — 아이콘·문구 톤·버튼 스타일이 전부 일치해 새 컴포넌트를 만들 이유가 없다.
 * "1:1 문의 가기" 버튼은 클릭해도 화면 이동이 없다(사용자 확인 사항) — 문의 채널이
 * 아직 없어 `onClick` 없이 버튼만 둔다.
 *
 * 진행 단계 인디케이터 표시 여부는 `shouldShowStepIndicator`(mock.ts) 로 계산한다 —
 * "완료" 상태 도달 후 5일 경과 시 인디케이터가 사라진다(사용자 확인 사항).
 *
 * 카드를 누르면 상세 화면(`/mypage/orders/cancel-return-exchange/[id]`)으로 이동한다
 * (사용자 확인 사항). Figma 목록 카드엔 별도 화살표 표시가 없어(showDetail 꺼짐)
 * 새로 그리지 않고 카드 전체를 눌림 영역으로 둔다 — 안에 "총 N건 펼쳐보기" 버튼이
 * 있어 `<a>`/`<button>` 으로 통째로 감싸면 인터랙티브 요소 중첩이라, `role="button"`
 * div 로 만들고 그 버튼 쪽 클릭만 `stopPropagation` 으로 막는다
 * (`AccordionBreakdown` 참고).
 */
const TAB_ITEMS: TabBarItem[] = [
  { id: '전체', label: '전체' },
  { id: '취소', label: '취소' },
  { id: '반품', label: '반품' },
  { id: '교환', label: '교환' },
];

const EMPTY_STATE_TITLE: Record<'전체' | CancelReturnExchangeType, string> = {
  전체: '취소·반품·교환 내역이 없어요',
  취소: '취소 내역이 없어요',
  반품: '반품 내역이 없어요',
  교환: '교환 내역이 없어요',
};

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
          <div className="flex flex-1 flex-col items-center justify-center">
            <ErrorState
              icon={<Icon name="alert" size={56} aria-hidden />}
              title={EMPTY_STATE_TITLE[activeTab]}
              action={<FloatingButton>1:1 문의 가기</FloatingButton>}
            />
          </div>
        ) : (
          items.map((item) => {
            const steps = item.type === '교환' ? undefined : STEP_LABELS[item.type];
            const activeStepIndex = steps?.indexOf(item.status) ?? 0;
            const showIndicator = shouldShowStepIndicator(item, REFERENCE_TODAY);

            const detailHref = `/mypage/orders/cancel-return-exchange/${item.id}`;

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                aria-label={`${item.status} 상세보기`}
                onClick={() => router.push(detailHref)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  router.push(detailHref);
                }}
                className="focus-visible:outline-border-active cursor-pointer rounded-xl outline-offset-2 focus-visible:outline-2"
              >
                <OrderRefundStatusCard
                  steps={showIndicator ? steps : undefined}
                  activeStepIndex={activeStepIndex}
                  indicatorLabel={`${item.type} 진행 상태`}
                  status={item.status}
                  receivedDateLabel={item.receivedDateLabel}
                  products={item.products}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

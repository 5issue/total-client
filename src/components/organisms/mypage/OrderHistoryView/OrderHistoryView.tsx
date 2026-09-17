'use client';

import { useMemo, useRef, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { Indicator } from '@/components/atoms/Indicator';
import { SearchBar } from '@/components/atoms/SearchBar';
import { Toast } from '@/components/atoms/Toast';
import { OrderProductItem } from '@/components/molecules/order/OrderProductItem';
import { AccordionBreakdown } from '@/components/molecules/shared/AccordionBreakdown';
import { Dropdown } from '@/components/molecules/shared/Dropdown';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { Modal } from '@/components/molecules/shared/Modal';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useTimedToast } from '@/hooks/useTimedToast';

import {
  MOCK_DELIVERED_AT,
  MOCK_ORDER,
  ORDER_STEPS,
  PERIOD_OPTIONS,
  RETURN_DETAIL_HREF,
  TOAST_ADD_AGAIN,
  TOAST_ADD_ONCE,
} from './mock';
import {
  getOrderGroups,
  type OrderHistoryGroup,
  type OrderHistoryOrder,
  type OrderHistoryPeriod,
  type OrderHistoryProduct,
  type OrderHistoryStatus,
  type OrderProgressStatus,
} from './model';

/**
 * 주문 내역 목록 화면 (organism). Figma "5팀 UI 공유용" —
 * 주문완료 771-106840, 기간 드롭다운 848-86298, 담기 토스트 848-86139, 배송중 771-106998,
 * 배송완료(반품 기간 종료) 848-86519, 주문 2건 771-107323, 4건 펼쳐보기 771-107381,
 * 일부 반품 771-107724, 빈 내역 848-86771, 검색 없음 848-86401.
 *
 * 퍼블리싱 단계: 값은 `mock.ts` 스텁. 장바구니/주문취소/배송조회/후기 API 는 연동 전이라
 * 담기는 토스트만, 취소는 모달만, 배송조회·후기 작성은 라벨만, 반품 접수만 반품 상세로 보낸다.
 *
 * 빈 상태는 공용 `ErrorState` + `FloatingButton`(CartView 빈 장바구니와 같은 조립).
 * 토큰(실측): 배경 `Bg/secondary` → `bg-surface-secondary`, 필터 행 `Gap/S`12 +
 * 드롭다운 80×40 `Radius/S`, 카드 `Surface/Base` `Radius/XL`16 `px-4 pt-4 pb-5`,
 * 헤더↔본문 28px → `pt-7`. 상태 `Heading/H2_Medium` + `Brand/Primary`, 도착 예정
 * `Body/Body_S_Regular` + `Brand/Medium`(#c16edd). 빈 상태 문구 `Heading/H5_Medium` +
 * `Text/Quaternary`, CTA `Floating Button` Primary(`Brand/Secondary` #50006b, h-44).
 */
const STEP_INDEX: Record<OrderProgressStatus, number> = {
  주문완료: 0,
  배송준비: 1,
  배송중: 2,
  배송완료: 3,
};

const CTA_CLASS = 'h-14 w-full';
const CTA_ROW_CLASS = 'h-14 min-w-0 flex-1';

function isProgressStatus(status: OrderHistoryStatus): status is OrderProgressStatus {
  return status in STEP_INDEX;
}

function OrderStatusActions({
  status,
  returnPeriodEnded,
  onCancel,
  onReturn,
}: {
  status: OrderHistoryStatus;
  returnPeriodEnded: boolean;
  onCancel: () => void;
  onReturn: () => void;
}) {
  if (status === '반품완료') return null;

  if (status === '주문완료' || status === '배송준비') {
    return (
      <Button variant="tertiary" size="l" className={CTA_CLASS} onClick={onCancel}>
        주문 취소
      </Button>
    );
  }

  if (status === '배송중') {
    return (
      <div className="flex w-full flex-col gap-2">
        <Button variant="tertiary" size="l" className={CTA_CLASS}>
          배송조회
        </Button>
        <Button variant="tertiary" size="l" className={CTA_CLASS} onClick={onCancel}>
          주문 취소
        </Button>
      </div>
    );
  }

  if (returnPeriodEnded) {
    return (
      <Button variant="secondary" size="l" className={CTA_CLASS}>
        후기 작성
      </Button>
    );
  }

  return (
    <div className="flex w-full gap-2">
      <Button variant="tertiary" size="l" className={CTA_ROW_CLASS} onClick={onReturn}>
        반품 접수
      </Button>
      <Button variant="secondary" size="l" className={CTA_ROW_CLASS}>
        후기 작성
      </Button>
    </div>
  );
}

function OrderCard({
  order,
  groups,
  onAddToCart,
  onCancel,
  onReturn,
}: {
  order: OrderHistoryOrder;
  groups: OrderHistoryGroup[];
  onAddToCart: (productId: string) => void;
  onCancel: () => void;
  onReturn: () => void;
}) {
  const progressStatus = isProgressStatus(order.status) ? order.status : null;
  const showIndicator = order.showIndicator !== false && progressStatus !== null;

  return (
    <article className="bg-surface flex w-full flex-col gap-4 rounded-xl px-4 pt-4 pb-5">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-heading-0 text-fg">{order.orderedAt}</p>
          <p className="text-heading-6 text-fg-tertiary">주문번호 {order.orderNumber}</p>
        </div>
        <Link
          href={`/mypage/orders/${order.orderNumber}`}
          aria-label="주문 상세 내역 보기"
          className="flex size-10 shrink-0 items-center justify-center"
        >
          <Icon name="arrow-right" size={28} aria-hidden />
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {showIndicator && progressStatus ? (
          <Indicator
            steps={[...ORDER_STEPS]}
            current={STEP_INDEX[progressStatus]}
            aria-label="주문 진행 상태"
          />
        ) : null}
        <hr className="border-border -mx-px" />

        <div className={groups.length > 1 ? 'flex flex-col gap-6' : 'flex flex-col gap-4'}>
          {groups.map((group) => (
            <div key={group.id} className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-heading-2 text-primary">{group.status}</p>
                {group.arrival ? (
                  <p className="text-body-s text-brand-300">{group.arrival}</p>
                ) : null}
              </div>

              <AccordionBreakdown>
                {group.products.map((product) => (
                  <OrderProductItem
                    key={product.id}
                    deliveryType={product.deliveryType}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    quantity={product.quantity}
                    imageSrc={product.imageSrc}
                    onAddToCart={() => onAddToCart(product.id)}
                  />
                ))}
              </AccordionBreakdown>

              <OrderStatusActions
                status={group.status}
                returnPeriodEnded={order.returnPeriodEnded ?? false}
                onCancel={onCancel}
                onReturn={onReturn}
              />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export interface OrderHistoryViewProps {
  /** 스토리·QA 용 초기 주문 상태. 생략 시 주문완료(node 771-106840). */
  initialStatus?: OrderHistoryStatus;
  /** 스토리용 상품 덮어쓰기. 생략 시 목데이터 3건. */
  products?: OrderHistoryProduct[];
  /** 스토리용 주문 목록. 빈 배열이면 주문 없음 상태(node 848-86771). */
  orders?: OrderHistoryOrder[];
  /** 스토리용 검색어 초기값. */
  defaultQuery?: string;
  /** 배송완료에서 반품 접수 기간이 끝났으면 true(node 848-86519). */
  returnPeriodEnded?: boolean;
}

export function OrderHistoryView({
  initialStatus = MOCK_ORDER.status,
  products = MOCK_ORDER.products,
  orders,
  defaultQuery = '',
  returnPeriodEnded = false,
}: OrderHistoryViewProps) {
  const router = useRouter();
  const [period, setPeriod] = useState<OrderHistoryPeriod>('3m');
  const [query, setQuery] = useState(defaultQuery);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(TOAST_ADD_ONCE);
  const { visible: toastVisible, trigger: showToast } = useTimedToast(2000);
  const addedIdsRef = useRef(new Set<string>());

  const orderList = orders ?? [
    {
      ...MOCK_ORDER,
      status: initialStatus,
      products,
      arrival: initialStatus === '배송완료' ? MOCK_DELIVERED_AT : MOCK_ORDER.arrival,
      returnPeriodEnded,
    },
  ];

  const visibleOrders = useMemo(() => {
    const keyword = query.trim();
    return orderList
      .map((order) => ({
        order,
        groups: getOrderGroups(order)
          .map((group) => ({
            ...group,
            products: keyword
              ? group.products.filter((product) => product.name.includes(keyword))
              : group.products,
          }))
          .filter((group) => group.products.length > 0),
      }))
      .filter((entry) => entry.groups.length > 0);
  }, [orderList, query]);

  const hasOrders = orderList.length > 0;
  const showEmptyOrders = !hasOrders;
  const showEmptySearch = hasOrders && visibleOrders.length === 0;

  function handleAddToCart(productId: string) {
    const again = addedIdsRef.current.has(productId);
    addedIdsRef.current.add(productId);
    setToastMessage(again ? TOAST_ADD_AGAIN : TOAST_ADD_ONCE);
    showToast();
  }

  return (
    <div className="bg-surface-secondary flex flex-1 flex-col">
      <div className="bg-surface sticky top-0 z-10">
        <SectionHeader leading="back" leadingHref="/mypage" title="주문 내역" />
        <div className="flex items-center gap-2 py-3 pr-3 pl-4">
          <Dropdown
            label="조회 기간"
            options={[...PERIOD_OPTIONS]}
            value={period}
            onChange={(value) => setPeriod(value as OrderHistoryPeriod)}
            className="w-20"
          />
          <div className="min-w-0 flex-1">
            <SearchBar
              label="주문 내역 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery('')}
            />
          </div>
        </div>
      </div>

      {showEmptyOrders ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <ErrorState
            icon={<Icon name="alert" size={56} aria-hidden />}
            title="주문 내역이 없습니다."
            action={
              <FloatingButton onClick={() => router.push('/products')}>
                베스트 상품 보기
              </FloatingButton>
            }
          />
        </div>
      ) : showEmptySearch ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <ErrorState
            icon={<Icon name="alert" size={56} aria-hidden />}
            title="해당 조건에 맞는 주문내역이 없습니다."
            action={
              <FloatingButton icon="refresh" onClick={() => setQuery('')}>
                초기화하기
              </FloatingButton>
            }
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-5 px-4 pt-7 pb-10">
          {visibleOrders.map(({ order, groups }) => (
            <OrderCard
              key={order.id}
              order={order}
              groups={groups}
              onAddToCart={handleAddToCart}
              onCancel={() => setCancelOpen(true)}
              onReturn={() => router.push(RETURN_DETAIL_HREF)}
            />
          ))}
        </div>
      )}

      <div
        aria-hidden={!toastVisible}
        className={[
          'pointer-events-none fixed inset-x-4 bottom-15 z-50 flex justify-center',
          'transition-[translate] duration-300 ease-out motion-reduce:transition-none',
          toastVisible ? 'translate-y-0' : 'translate-y-28',
        ].join(' ')}
      >
        <Toast variant="action">{toastMessage}</Toast>
      </div>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="주문을 취소하시겠어요?"
        description="상품이 품절되면 다시 구매할 수 없어요."
        footer={
          <>
            <Button
              variant="tertiary"
              size="s"
              className="h-11"
              onClick={() => setCancelOpen(false)}
            >
              닫기
            </Button>
            <Button variant="black" size="s" className="h-11" onClick={() => setCancelOpen(false)}>
              주문 취소
            </Button>
          </>
        }
      />
    </div>
  );
}

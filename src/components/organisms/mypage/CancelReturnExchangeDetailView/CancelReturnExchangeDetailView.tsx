'use client';

import { useRouter } from 'next/navigation';

import { Indicator } from '@/components/atoms/Indicator';
import { CancelReturnProductRow } from '@/components/molecules/mypage/CancelReturnProductRow';
import { OrderBreakdownRow } from '@/components/molecules/mypage/OrderBreakdownRow';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';

import {
  MOCK_REFUND_EXPECTED_AMOUNT,
  MOCK_REFUND_EXPECTED_POINTS_LABEL,
  MOCK_REFUND_EXPECTED_POINTS_VALUE,
  MOCK_REFUND_PRODUCT_TOTAL,
  MOCK_REFUND_ROWS,
  REFERENCE_TODAY,
  STEP_LABELS,
  shouldShowStepIndicator,
  type CancelReturnExchangeItem,
} from '../CancelReturnExchangeHistoryView/mock';

/**
 * 취소·반품 상세 내역 화면 (organism) — Figma node 848-83792(반품, 상품 1개) /
 * 666-30712(반품, 상품 2개 이상) / 666-30539(취소, 상품 4개). 목록(node 666-30339)의
 * 카드를 클릭하면 이 화면으로 들어온다. `/mypage/orders/cancel-return-exchange/[id]`.
 *
 * 진행 단계 인디케이터는 목록과 같은 규칙을 그대로 적용한다(`shouldShowStepIndicator`)
 * — Figma 에 "완료 후 5일 경과" 상세 화면 예시는 따로 없지만, 같은 상태값을 다루는
 * 같은 화면군이라 목록과 다르게 둘 이유가 없다고 판단해 일관되게 적용했다.
 *
 * "접수 내역" 카드는 타입에 따라 다르다(Figma 실측):
 * - 반품: 상품마다 자기 사진 증빙("상품불량" + 사진 3장)이 따로 붙는다 — 상품이
 *   여러 개면 그 쌍이 그만큼 반복된다(666-30712 는 상품 2개, 각각 사진 3장).
 * - 취소: 상품을 사진 증빙 없이 그냥 나열한다(취소는 사유가 개별 상품이 아니라
 *   주문 단위라 항목별 증빙이 필요 없다).
 *
 * "환불 정보"는 반품/취소 두 예시 화면의 값이 완전히 같아 `MOCK_REFUND_ROWS` 하나를
 * 공유한다(mock.ts). 사진은 실제 파일이 없어 회색 박스로 대체한다(퍼블리싱 단계,
 * `CancelReturnProductRow`의 `imageSrc` 없을 때와 같은 규칙).
 */
const TITLE: Record<'취소' | '반품', string> = {
  취소: '취소 상세 내역',
  반품: '반품 상세 내역',
};

export interface CancelReturnExchangeDetailViewProps {
  item: CancelReturnExchangeItem;
}

export function CancelReturnExchangeDetailView({ item }: CancelReturnExchangeDetailViewProps) {
  const router = useRouter();

  // 교환은 Figma 예시/mock 데이터가 없다 — 라우트(page.tsx)에서 notFound() 로 걸러
  // 여기까지 오지 않는다. 타입을 좁혀 아래에서 STEP_LABELS[item.type] 를 안전하게 쓴다.
  if (item.type === '교환') return null;

  const steps = STEP_LABELS[item.type];
  const activeStepIndex = steps.indexOf(item.status);
  const showIndicator = shouldShowStepIndicator(item, REFERENCE_TODAY);
  const isReturn = item.type === '반품';

  return (
    <div className="bg-surface-secondary flex flex-1 flex-col">
      <SectionHeader leading="back" onLeadingClick={() => router.back()} title={TITLE[item.type]} />

      {showIndicator ? (
        <div className="bg-surface flex w-full items-center px-4 py-3">
          <Indicator
            steps={steps}
            current={activeStepIndex}
            aria-label={`${item.type} 진행 상태`}
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-6 px-4 pt-5 pb-10">
        <section className="flex flex-col gap-4">
          <h2 className="text-heading-0 text-fg">접수 내역</h2>
          <div className="bg-surface flex flex-col gap-4 rounded-xl px-4 pt-4 pb-5">
            <div className="flex flex-col gap-1">
              <p className="text-heading-2 text-primary">{item.status}</p>
              <p className="text-body-s text-fg-tertiary">{item.receivedDateLabel}</p>
            </div>

            <ul className="flex flex-col gap-4">
              {item.products.map((product) => (
                <li key={product.name} className="flex flex-col gap-2">
                  <CancelReturnProductRow {...product} />
                  {isReturn ? (
                    <div className="bg-surface-secondary rounded-m flex flex-col gap-2 p-2">
                      <p className="text-label-xs text-fg-tertiary">상품불량</p>
                      <div className="flex gap-1">
                        {Array.from({ length: 3 }, (_, index) => (
                          <div key={index} aria-hidden className="bg-surface size-13 rounded-sm" />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-heading-0 text-fg">환불 정보</h2>
          <div className="bg-surface flex flex-col gap-3 rounded-xl px-4 pt-4 pb-5">
            <div className="flex items-center justify-between">
              <p className="text-heading-2 text-fg">상품 금액</p>
              <p className="text-heading-2 text-fg">{MOCK_REFUND_PRODUCT_TOTAL}</p>
            </div>
            <div className="flex flex-col gap-3">
              {MOCK_REFUND_ROWS.map((row) => (
                <OrderBreakdownRow key={row.label} {...row} />
              ))}
            </div>

            <hr className="border-border -mx-px" />

            <div className="flex flex-col gap-1">
              <div className="text-primary flex items-center justify-between">
                <p className="text-heading-4">환불 예정 금액</p>
                <p className="text-display-xs">{MOCK_REFUND_EXPECTED_AMOUNT}</p>
              </div>
              <div className="text-fg-quaternary flex items-center justify-between">
                <p className="text-heading-6">{MOCK_REFUND_EXPECTED_POINTS_LABEL}</p>
                <p className="text-heading-6">{MOCK_REFUND_EXPECTED_POINTS_VALUE}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

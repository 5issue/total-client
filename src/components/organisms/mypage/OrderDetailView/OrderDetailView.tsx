'use client';

import { Fragment, useState } from 'react';
import type { ReactNode } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { Toast } from '@/components/atoms/Toast';
import { OrderBreakdownRow } from '@/components/molecules/order/OrderBreakdownRow';
import { OrderProductItem } from '@/components/molecules/order/OrderProductItem';
import { Modal } from '@/components/molecules/shared/Modal';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useCopyToast } from '@/hooks/useCopyToast';
import { useTimedToast } from '@/hooks/useTimedToast';

import {
  MOCK_CANCEL_NOTICE,
  MOCK_DELIVERY_INFO_ROWS,
  MOCK_DELIVERY_REQUEST_ROWS,
  MOCK_ORDER_DETAIL,
  MOCK_ORDER_INFO_ROWS,
  MOCK_ORDER_PRODUCTS,
  MOCK_PARTIAL_RETURN_GROUPS,
  MOCK_PAYMENT_ROWS,
  MOCK_PAYMENT_TOTAL,
} from './mock';

/**
 * 주문 내역 상세 화면 (organism) — Figma node 666-28077(화면 + 주문 취소 모달).
 *
 * 주문 완료 화면의 "주문 상세보기" 로 진입한다. 주문 취소 모달 상태 때문에 클라 경계다.
 *
 * 이번 작업 범위는 **퍼블리싱만**이다 — 값은 전부 `mock.ts` 스텁이고(BE 주문 API 연동 전),
 * 아래 동작은 의도적으로 비워 뒀다:
 * - 주문 취소 실제 처리(BE 호출) — 모달에서 "주문 취소" 를 확정하면 화면은 즉시 취소 상태로
 *   바뀌지만(클라 상태만), 실제 취소 API 연동은 없다.
 * - 상품 "담기", "전체 상품 다시 담기" — 무동작(장바구니 연동 전). "다시 담기" 는 결과
 *   토스트만 보여준다(node 666-27349).
 *
 * 주문번호 복사는 `OrderCompleteView` 와 같은 `useCopyToast` 를 쓴다(같은 문구 "주문 번호를
 * 복사했어요", 3초). "다시 담기" 토스트는 노출 시간이 2초로 달라(사용자 지정) 범용
 * `useTimedToast` 를 쓴다. 이 화면은 하단 고정 CTA 바가 없어 토스트를 그 위에 얹는 방식을
 * 못 써서, 두 토스트 모두 화면 최하단에 고정한다 — `CheckoutView` 의 상단 고정 에러
 * 토스트와 같은 원리(항상 마운트, opacity/translate 만 토글)를 뒤집은 형태.
 *
 * 주문 상태(node 666-27472/782-61437/782-61559/848-82244/848-82363/848-82482)는 모두
 * 같은 화면의 파생 상태다 — 별도 라우트가 아니라 `OrderStatus` 로 분기한다(`initialStatus`
 * prop 은 스토리·QA 용, `RefundReturnView` 의 `defaultSelectedIds` 와 같은 패턴 — 실제
 * 라이브 페이지는 BE 연동 전이라 기본값 "주문완료"만 보여준다). 취소 가능 여부(맨 아래
 * "전체 상품 주문 취소" 버튼 활성/비활성)는 `CANCEL_ALLOWED_STATUSES` 로 한 곳에서 관리한다:
 * - 주문취소: 상태 라벨 단독(도착 예정 문구 없음), 카드 안 액션 버튼 없음, 맨 아래 버튼이
 *   비활성 "…완료" 라벨로 바뀐다(테두리는 그대로, 글자색만 `disabled:text-fg-disabled` =
 *   Figma `text/disabled_button` #b5c4cf 와 일치).
 * - 배송중: 도착 예정 문구는 그대로, 액션 버튼만 "주문 취소" → "배송 조회"(무동작 — 배송
 *   조회 페이지 없음). 맨 아래 버튼은 Figma 그대로 활성 유지(주문완료와 동일).
 * - 배송완료: 도착 예정 문구가 실제 배송 일시로 바뀌고, 액션 버튼이 "반품 접수"(tertiary)
 *   + "후기 작성"(secondary, 무동작) 2개로 나뉜다. "반품 접수"는 issue #97 라우트
 *   (`/mypage/orders/return`)로 연결 — 그 화면 구현은 #97 범위라 여기서는 라우팅만 건다.
 * - 반품접수 / 반품완료: 주문취소와 같은 레이아웃(액션 버튼 없음, 맨 아래 비활성 "…완료")
 *   이고 상태 라벨만 다르다.
 * - 일부반품완료: 상품이 배송완료/반품완료 두 그룹으로 나뉘는 유일한 상태라 렌더 분기
 *   자체가 다르다 — `MOCK_PARTIAL_RETURN_GROUPS` 를 순회해 그룹마다 라벨+상품+(있으면)
 *   "후기 작성" 버튼을 그리고, 그룹 사이에만 `CardDivider` 를 끼운다(Figma 실측: 각 그룹
 *   상단엔 구분선이 없다). "전체 상품 다시 담기" 는 그룹과 무관하게 항상 맨 끝에 하나.
 *
 * Figma 는 결제 정보 아래 카드 3개의 제목이 모두 `주문 정보` 지만 내용이 서로 달라
 * 복붙 아티팩트다 — `주문 정보`/`배송 정보`/`배송 요청사항` 으로 확정했다(사용자 확인,
 * 2026-09-15).
 *
 * 토큰(실측): 배경 `Bg/secondary`(#f0f5f8) → `bg-surface-secondary`, 카드 `Surface/Base`
 * `Radius/XL`16 + `px-4 pt-4 pb-5`, 섹션 제목 `Heading/H0_SemiBold`20/600 → `text-heading-0`,
 * 섹션 간격 `Gap/XL`24 → `gap-6`, 제목↔카드 `Gap/M`16 → `gap-4`, 헤더 아래 28px → `pt-7`.
 */
function SectionCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={['bg-surface rounded-xl px-4 pt-4 pb-5', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-heading-0 text-fg">{title}</h2>
      <SectionCard>{children}</SectionCard>
    </section>
  );
}

/** 카드 안 구분선 — Figma 는 카드 좌우 패딩(16)을 넘어 340px 로 그어진다(카드 370 − 좌우 15). */
function CardDivider() {
  return <hr className="border-border -mx-px" />;
}

export type OrderStatus =
  '주문완료' | '배송중' | '배송완료' | '주문취소' | '반품접수' | '반품완료' | '일부반품완료';

/**
 * 이 상태에서만 맨 아래 "전체 상품 주문 취소" 버튼이 활성이다(782-61437/782-61559 Figma
 * 실측 — 두 화면 모두 버튼이 비활성 스타일 없이 그대로 활성 상태로 그려져 있다).
 *
 * `MOCK_CANCEL_NOTICE`("[주문완료] 또는 [배송준비중] 상태에서만 취소 가능")와 문구가 어긋난다
 * (CodeRabbit 리뷰로 확인) — Figma 가 여러 상태 화면에 같은 안내 카드를 복붙하면서 문구를
 * 안 고친 것으로 보인다. 인터랙션(버튼 활성/비활성)은 각 화면에서 개별 실측한 값이라 더
 * 신뢰할 수 있어 그대로 두고, 안내 카드 문구 자체는 디자인 쪽 확인 없이 이 목록에 맞춰
 * 임의로 고치지 않는다(structure-convention §6-1: 변경은 Figma 코멘트로 통지).
 */
const CANCEL_ALLOWED_STATUSES: OrderStatus[] = ['주문완료', '배송중', '배송완료'];

export interface OrderDetailViewProps {
  /** 스토리·QA 용 초기 주문 상태. 생략 시 `MOCK_ORDER_DETAIL.status`(node 666-28077). */
  initialStatus?: OrderStatus;
}

export function OrderDetailView({
  initialStatus = MOCK_ORDER_DETAIL.status,
}: OrderDetailViewProps) {
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const { visible: copyToastVisible, copy: copyOrderNumber } = useCopyToast();
  const { visible: refillToastVisible, trigger: showRefillToast } = useTimedToast(2000);

  const isDelivered = status === '배송완료';
  const isPartialReturn = status === '일부반품완료';
  const canCancel = CANCEL_ALLOWED_STATUSES.includes(status);
  const rightText =
    status === '배송완료'
      ? MOCK_ORDER_DETAIL.deliveredAt
      : status === '주문완료' || status === '배송중'
        ? MOCK_ORDER_DETAIL.arrival
        : null;

  return (
    <div className="bg-surface-secondary flex flex-1 flex-col">
      <SectionHeader leading="back" onLeadingClick={() => router.back()} title="주문 내역 상세" />

      <div className="flex flex-1 flex-col gap-6 px-4 pt-7 pb-10">
        {/* 주문 요약 */}
        <SectionCard>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <p className="text-heading-6 text-fg-tertiary">{MOCK_ORDER_DETAIL.paidAt}</p>
                <p className="text-heading-0 text-fg">주문번호 {MOCK_ORDER_DETAIL.orderNumber}</p>
              </div>
              {/* Figma 고정 높이는 38px 지만 최소 터치 타깃 44px(code-style §5) 에 못 미쳐
                  44px(`h-11`)로 올린다(CodeRabbit 리뷰로 발견, OrderCompleteView 와 동일). */}
              <Button
                size="s"
                variant="outlineBlack"
                className="h-11 w-13 shrink-0"
                onClick={() => copyOrderNumber(MOCK_ORDER_DETAIL.orderNumber)}
              >
                복사
              </Button>
            </div>
            <CardDivider />
            <p className="text-heading-3 text-fg-tertiary">{MOCK_ORDER_DETAIL.address}</p>
          </div>
        </SectionCard>

        {/* 주문 상품 */}
        <Section title="주문 상품">
          <div className="flex flex-col gap-3">
            {isPartialReturn ? (
              MOCK_PARTIAL_RETURN_GROUPS.map((group, index) => (
                <Fragment key={group.label}>
                  {index > 0 ? <CardDivider /> : null}
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-heading-2 text-primary">{group.label}</p>
                    {group.rightText ? (
                      <p className="text-body-s text-brand-300">{group.rightText}</p>
                    ) : null}
                  </div>
                  <ul className="flex flex-col gap-4">
                    {group.products.map((product) => (
                      <li key={product.id}>
                        <OrderProductItem
                          deliveryType={product.deliveryType}
                          name={product.name}
                          price={product.price}
                          originalPrice={product.originalPrice}
                          quantity={product.quantity}
                        />
                      </li>
                    ))}
                  </ul>
                  {group.hasReview ? (
                    // 후기 작성 화면이 아직 없어 무동작.
                    <Button variant="secondary" size="l" className="h-14 w-full">
                      후기 작성
                    </Button>
                  ) : null}
                </Fragment>
              ))
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-heading-2 text-primary">{status}</p>
                  {rightText ? <p className="text-body-s text-brand-300">{rightText}</p> : null}
                </div>
                <CardDivider />

                <ul className="flex flex-col gap-4">
                  {MOCK_ORDER_PRODUCTS.map((product) => (
                    <li key={product.id}>
                      <OrderProductItem
                        deliveryType={product.deliveryType}
                        name={product.name}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        quantity={product.quantity}
                      />
                    </li>
                  ))}
                </ul>

                {status === '주문완료' ? (
                  <>
                    <Button
                      variant="tertiary"
                      size="l"
                      className="h-14 w-full"
                      onClick={() => setCancelOpen(true)}
                    >
                      주문 취소
                    </Button>
                    <CardDivider />
                  </>
                ) : null}
                {status === '배송중' ? (
                  <>
                    {/* 배송 조회 페이지가 아직 없어 무동작 — 라벨만 바뀐 버튼. */}
                    <Button variant="tertiary" size="l" className="h-14 w-full">
                      배송 조회
                    </Button>
                    <CardDivider />
                  </>
                ) : null}
                {isDelivered ? (
                  <>
                    <div className="flex w-full gap-2">
                      {/* 반품 접수 화면 구현은 issue #97 범위 — 여기서는 라우팅만 건다. */}
                      <Button
                        variant="tertiary"
                        size="l"
                        className="h-14 flex-1"
                        onClick={() => router.push('/mypage/orders/return')}
                      >
                        반품 접수
                      </Button>
                      {/* 후기 작성 화면이 아직 없어 무동작. */}
                      <Button variant="secondary" size="l" className="h-14 flex-1">
                        후기 작성
                      </Button>
                    </div>
                    <CardDivider />
                  </>
                ) : null}
              </>
            )}
            {/* 장바구니 연동 전이라 실제로 담지는 않고 결과 토스트만 보여준다. */}
            <Button
              variant="outlineBlack"
              size="l"
              className="h-14 w-full"
              onClick={showRefillToast}
            >
              전체 상품 다시 담기
            </Button>
          </div>
        </Section>

        {/* 결제 정보 */}
        <Section title="결제 정보">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-heading-2 text-fg">상품 금액</p>
              <p className="text-heading-2 text-fg">{MOCK_PAYMENT_TOTAL}</p>
            </div>
            <div className="flex flex-col gap-3">
              {MOCK_PAYMENT_ROWS.map((row) => (
                <OrderBreakdownRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  valueTone={row.valueTone}
                  details={row.details}
                />
              ))}
            </div>
          </div>
        </Section>

        {/* 주문 정보 */}
        <Section title="주문 정보">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-heading-2 text-fg">주문 번호</p>
              <p className="text-heading-2 text-fg">{MOCK_ORDER_DETAIL.orderNumber}</p>
            </div>
            <div className="flex flex-col gap-3">
              {MOCK_ORDER_INFO_ROWS.map((row) => (
                <OrderBreakdownRow key={row.label} label={row.label} value={row.value} />
              ))}
            </div>
          </div>
        </Section>

        {/* 배송 정보 */}
        <Section title="배송 정보">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-heading-2 text-fg">{MOCK_ORDER_DETAIL.receiver}</p>
              <p className="text-heading-5 text-fg-quaternary">{MOCK_ORDER_DETAIL.phone}</p>
              <p className="text-heading-3 text-fg-tertiary">{MOCK_ORDER_DETAIL.address}</p>
            </div>
            <div className="flex flex-col gap-3">
              {MOCK_DELIVERY_INFO_ROWS.map((row) => (
                <OrderBreakdownRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  valueTone="secondary"
                />
              ))}
            </div>
          </div>
        </Section>

        {/* 배송 요청사항 */}
        <Section title="배송 요청사항">
          <div className="flex flex-col gap-3">
            {MOCK_DELIVERY_REQUEST_ROWS.map((row) => (
              <OrderBreakdownRow
                key={row.label}
                label={row.label}
                value={row.value}
                valueTone="secondary"
              />
            ))}
          </div>
        </Section>

        {/* 취소 안내 + 전체 취소 */}
        <SectionCard>
          <div className="flex flex-col gap-3">
            <ul className="text-label-m text-fg-tertiary list-disc pl-5">
              {MOCK_CANCEL_NOTICE.map((notice) => (
                <li key={notice}>{notice}</li>
              ))}
            </ul>
            <Button
              variant="outlineBlack"
              size="l"
              className="h-14 w-full"
              disabled={!canCancel}
              onClick={() => setCancelOpen(true)}
            >
              {canCancel ? '전체 상품 주문 취소' : '전체 상품 주문 취소 완료'}
            </Button>
          </div>
        </SectionCard>
      </div>

      {/* 복사 토스트 — 화면 하단 고정, 항상 마운트해두고 opacity/translate 만 토글한다
          (`CheckoutView` 상단 에러 토스트와 같은 원칙: 마운트/언마운트로 트랜지션을 걸면
          사라질 때 안 걸린다). Tailwind v4 의 `translate-y-*` 는 `transform` 이 아니라
          별도 `translate` 속성이라 `transition-[opacity,transform]` 로는 이동이 트랜지션
          안 걸린다 — opacity 만 실제로 애니메이션되고 있었다("다시 담기" 토스트 피드백으로
          발견한 것과 같은 문제). `translate` 로 바꿔 이동도 같이 걸리게 한다. */}
      <div
        aria-hidden={!copyToastVisible}
        className={[
          'pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center',
          'transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none',
          copyToastVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        ].join(' ')}
      >
        <Toast variant="action" className="w-full">
          주문 번호를 복사했어요
        </Toast>
      </div>

      {/* "다시 담기" 토스트(node 666-27349) — 사용자 지정 애니메이션: 아래에서 위로
          올라왔다 2초 뒤 아래로 내려간다. opacity 를 같이 트랜지션하면 이동이 fade 에
          묻혀 "서서히 나타나는" 것처럼 보인다(사용자 피드백) — transform 단독으로
          두어 스와이프가 분명히 보이게 한다. 복사 토스트는 별개(옅은 fade 유지).
          `translate-y-*` 는 Tailwind v4 에서 `transform` 이 아니라 별도 `translate`
          속성을 쓴다 — `transition-transform`(= `transition-property: transform`) 은
          이 속성 변화를 트랜지션 대상에 안 잡아 실제로는 순간 이동이었다(피드백으로
          발견). `transition-[translate]` 로 명시해야 애니메이션이 실제로 걸린다.
          `translate-y-full` 은 자기 높이만큼만 내려가 컨테이너의 `bottom-4`(16px) 만큼은
          여전히 화면 안에 남는다(둥근 위쪽 모서리가 하단에 계속 비쳐 보임) — 그 여백까지
          더해 완전히 화면 밖으로 내린다. */}
      <div
        aria-hidden={!refillToastVisible}
        className={[
          'pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center',
          'transition-[translate] duration-300 ease-out motion-reduce:transition-none',
          refillToastVisible ? 'translate-y-0' : 'translate-y-[calc(100%+1rem)]',
        ].join(' ')}
      >
        <Toast variant="action" className="w-full">
          장바구니에 전체 상품을 다시 담았어요
        </Toast>
      </div>

      {/* 주문 취소 모달(node 666-28213). "주문 취소" 확정 시 `status` 를 "주문취소" 로 켠다 —
          실제 취소 API 연동은 BE 완료 후.
          Figma 폭 302px 은 Modal 기본 max-w-xs(320)와 달라 `widthClassName` 으로 교체하고,
          버튼 높이 44px 도 Button `s`(콘텐츠 높이)와 달라 실측값으로 덮어쓴다. */}
      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        widthClassName="w-full max-w-[302px]"
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
            <Button
              variant="black"
              size="s"
              className="h-11"
              onClick={() => {
                setCancelOpen(false);
                setStatus('주문취소');
              }}
            >
              주문 취소
            </Button>
          </>
        }
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Modal } from '@/components/molecules/shared/Modal';
import {
  SectionHeader,
  type SectionHeaderAction,
} from '@/components/organisms/shared/SectionHeader';

import { MOCK_AMOUNTS, MOCK_PICKUP } from './mock';

/** 원 단위 금액 표시. */
const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;
/** 할인액은 양수일 때만 마이너스 접두. */
const discountWon = (n: number) => (n > 0 ? `-${won(n)}` : won(0));

const HEADER_ACTIONS: SectionHeaderAction[] = [{ icon: 'home', label: '홈으로 이동', href: '/' }];

type TermsModal = 'privacy' | 'payment' | null;

/**
 * 반품 내역 상세 (organism). Figma "5팀 UI 공유용" —
 * "반품 사유 다음 화면"(node 795-64058) + 하단 sticky CTA(node 795-64232 `HorizontalCtaBar`).
 *
 * `/mypage/orders/return/reason` 에서 [다음] 클릭 후 도착하는 확인 화면 — 수거 방법 · 수거지
 * 정보 · 환불 정보(금액 breakdown) · 신청 조건/처리 일정/환불 비용/유의사항 · 약관 링크를
 * 검토하고 [반품 접수]로 최종 제출한다.
 *
 * node 795-64058 원본엔 "주문자 정보"/"배송지"/"배송 요청사항" 레이어가 프레임 밖(y<0, 최상단
 * `top:-367px`~`-120px`)에 남아있다 — `get_screenshot` 대조 결과 실제 화면엔 노출되지 않는
 * 잔여 레이어라 옮기지 않았다. 실제 보이는 콘텐츠는 헤더 다음 "수거 방법"부터다.
 *
 * 백엔드 미연동(퍼블리싱 단계) — 수거지·금액은 전부 목데이터(`mock.ts`), 실제 선택 상품에
 * 따른 계산은 훅 연동 시 교체.
 *
 * 본문이 뷰포트보다 길어질 수 있어 CTA(node 795-64232)는 `sticky bottom-0` — CheckoutView/
 * RefundReasonView 의 하단 CTA 바와 동일 패턴(크롬리스 풀스크린 뷰, 문서 자체가 스크롤).
 * [반품 접수] 다음 화면은 미정(완료 화면 백엔드 명세 대기) — 임시로 마이컬리 홈으로 이동.
 */
export function RefundDetailView() {
  const router = useRouter();
  const [termsModal, setTermsModal] = useState<TermsModal>(null);

  return (
    <>
      <SectionHeader
        leading="back"
        onLeadingClick={() => router.back()}
        title="반품 내역 상세"
        actions={HEADER_ACTIONS}
      />

      <div className="bg-surface-secondary flex min-h-0 flex-1 flex-col">
        <div className="flex flex-col gap-6 px-4 py-4">
          <Section title="수거 방법">
            <div className="bg-surface rounded-xl px-4 pt-4 pb-5">
              <p className="text-heading-0">
                <span className="text-primary">택배사가 수거지로 방문</span>
                <span className="text-fg">할 예정입니다</span>
              </p>
            </div>
          </Section>

          <Section title="수거지 정보">
            <div className="flex flex-col gap-2.5">
              <div className="bg-surface flex flex-col gap-2.5 rounded-xl px-4 pt-4 pb-6">
                <p className="text-heading-1 text-fg py-2">수거지</p>
                <p className="text-heading-5 text-fg-secondary">{MOCK_PICKUP.addressLine}</p>
              </div>
              <div className="bg-surface flex flex-col gap-2.5 rounded-xl px-4 pt-4 pb-6">
                <p className="text-heading-1 text-fg py-2">수거 상세 정보</p>
                <div className="flex flex-col gap-1">
                  <p className="text-label-m text-fg-tertiary">수거 요청 장소</p>
                  <p className="text-heading-4 text-fg">{MOCK_PICKUP.requestedLocation}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-label-m text-fg-tertiary">구매자 정보</p>
                  <p className="text-heading-4 text-fg">
                    {MOCK_PICKUP.buyerName}, {MOCK_PICKUP.buyerPhone}
                  </p>
                </div>
              </div>
            </div>
          </Section>

          <Section title="환불 정보">
            <div className="bg-surface flex flex-col gap-3 rounded-xl px-4 pt-4 pb-5">
              <div className="flex items-center justify-between">
                <span className="text-heading-2 text-fg">상품 금액</span>
                <span className="text-heading-2 text-fg">{won(MOCK_AMOUNTS.productPrice)}</span>
              </div>

              <div className="flex flex-col gap-3">
                <AmountRow
                  label="상품 할인 금액"
                  value={discountWon(MOCK_AMOUNTS.productDiscount)}
                />
                <AmountRow label="배송비" value={won(MOCK_AMOUNTS.shippingFee)} />
                <AmountRow label="카드즉시할인" value={won(MOCK_AMOUNTS.cardInstantDiscount)} />

                <div className="flex flex-col gap-2">
                  <AmountRow label="쿠폰할인 금액" value={won(MOCK_AMOUNTS.couponDiscount)} />
                  <AmountDetailRow
                    label="상품 쿠폰"
                    value={won(MOCK_AMOUNTS.productCouponDiscount)}
                  />
                  <AmountDetailRow
                    label="장바구니 쿠폰"
                    value={won(MOCK_AMOUNTS.cartCouponDiscount)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <AmountRow label="적립금 · 컬리캐시" value={won(MOCK_AMOUNTS.pointsCashUsed)} />
                  <AmountDetailRow label="적립금" value={won(MOCK_AMOUNTS.pointsUsed)} />
                  <AmountDetailRow label="컬리캐시" value={won(MOCK_AMOUNTS.cashUsed)} />
                </div>

                <AmountRow emphasis label="결제금액" value={won(MOCK_AMOUNTS.paymentAmount)} />
                <AmountRow emphasis label="환불 수단" value={MOCK_AMOUNTS.refundMethod} />
                <AmountRow
                  emphasis
                  label="환불 차감금액"
                  value={won(MOCK_AMOUNTS.refundDeduction)}
                />
              </div>

              <hr className="border-border" />

              <div className="flex flex-col gap-1">
                <div className="text-primary flex items-center justify-between">
                  <span className="text-heading-4">환불 예정 금액</span>
                  <span className="text-display-xs">{won(MOCK_AMOUNTS.refundExpected)}</span>
                </div>
                <div className="text-fg-quaternary flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Icon name="receipt" size={16} aria-hidden />
                    <span className="text-heading-6">잔환 예정 적립금 · 캐시 · 상품권</span>
                  </span>
                  <span className="text-heading-6">
                    {won(MOCK_AMOUNTS.refundPointsCashGiftCard)}
                  </span>
                </div>
              </div>
            </div>
          </Section>

          <div className="bg-surface flex flex-col gap-5 rounded-xl px-4 pt-4 pb-6">
            <PolicyGroup title="신청 조건">
              <PolicyBullet>상품 수령 후 7일 이내 신청 가능해요.</PolicyBullet>
              <PolicyBullet>훼손·사용 흔적이 없는 상품만 반품할 수 있어요.</PolicyBullet>
              <PolicyBullet>
                증정품이 있다면 상품과 함께 보내주셔야 해요. 누락 시 반품이 제한될 수 있어요.
              </PolicyBullet>
            </PolicyGroup>

            <hr className="border-border" />

            <PolicyGroup title="처리 일정">
              <ol className="flex items-start justify-center">
                <TimelineStep label="반품접수" first muted />
                <TimelineStep label="택배회수" caption="영업일 3일 이내" />
                <TimelineStep label="상품 검수" />
                <TimelineStep label="반품 완료" caption="입고 후 3일 이내" last />
              </ol>
            </PolicyGroup>

            <hr className="border-border" />

            <PolicyGroup title="환불 비용">
              <div className="bg-surface-secondary flex flex-col gap-2 rounded-lg px-3 py-2.5">
                <CostRow label="단순 변심 시" value="왕복 배송비 부과" />
                <CostRow label="환불 차감 목록" value="왕복 배송비 + 수수료" />
                <CostRow label="최종 환불 금액" value="검수 결과에 따라 변동" />
              </div>
            </PolicyGroup>

            <PolicyGroup title="유의사항">
              <PolicyBullet>
                회수 후 검수에서 문제가 발견되면 반품이 거부되거나 환불이 지연될 수 있어요.
              </PolicyBullet>
              <PolicyBullet>
                반품 시 해당 상품에 작성한 후기는 삭제되고, 후기 적립금은 회수돼요.
              </PolicyBullet>
            </PolicyGroup>
          </div>

          <div className="flex flex-col">
            <TermsLinkRow
              label="개인정보 수집 · 이용 및 처리 동의"
              onView={() => setTermsModal('privacy')}
            />
            <TermsLinkRow
              label="전자금융거래 이용약관 동의"
              onView={() => setTermsModal('payment')}
            />
          </div>
        </div>

        <div className="bg-surface sticky bottom-0 mt-auto px-4 py-3">
          <Button
            variant="black"
            size="l"
            className="h-14 w-full"
            onClick={() => router.push('/mypage')}
          >
            반품 접수
          </Button>
        </div>
      </div>

      <Modal
        open={termsModal !== null}
        onClose={() => setTermsModal(null)}
        title={
          termsModal === 'privacy'
            ? '개인정보 수집·이용 및 처리 동의'
            : '전자금융거래 이용약관 동의'
        }
        description="약관 전문은 데이터 연동 시 연결됩니다(퍼블리싱 단계)."
        footer={
          <Button variant="black" onClick={() => setTermsModal(null)}>
            확인
          </Button>
        }
      />
    </>
  );
}

/** 타이틀(20px SemiBold) + 카드(들)을 묶는 섹션 래퍼. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-heading-0 text-fg">{title}</p>
      {children}
    </div>
  );
}

/** 환불 정보 카드의 일반 금액 줄 — `emphasis` 는 결제금액/환불 수단/환불 차감금액(text-fg),
 * 기본은 상품 할인 금액 등 파생 항목(text-fg-tertiary). */
function AmountRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  const color = emphasis ? 'text-fg' : 'text-fg-tertiary';
  return (
    <div className="flex items-center justify-between">
      <span className={`text-heading-6 ${color}`}>{label}</span>
      <span className={`text-heading-5 ${color}`}>{value}</span>
    </div>
  );
}

/** 금액 줄의 들여쓰기 상세 항목(상품 쿠폰/장바구니 쿠폰 등) — `corner-bottom-left` 아이콘. */
function AmountDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-fg-quaternary text-label-xs flex items-center">
        <Icon name="corner-bottom-left" size={20} aria-hidden />
        {label}
      </span>
      <span className="text-label-m text-fg-quaternary">{value}</span>
    </div>
  );
}

/** 정책 카드 내부 소제목(16px SemiBold, secondary) + 본문 그룹. */
function PolicyGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-heading-4 text-fg-secondary">{title}</p>
      {children}
    </div>
  );
}

/** 신청 조건/유의사항의 불릿 한 줄 — Figma 원문에 "• " 가 텍스트로 포함돼 그대로 옮긴다. */
function PolicyBullet({ children }: { children: ReactNode }) {
  return <p className="text-label-m text-fg-tertiary">• {children}</p>;
}

/** 환불 비용 박스의 라벨-값 줄. */
function CostRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-label-xs text-fg-tertiary">{label}</span>
      <span className="text-label-m text-fg-secondary">{value}</span>
    </div>
  );
}

/** 처리 일정 4단계 중 한 칸 — 좌우 연결선 + 점 아이콘 + 라벨(+ 캡션).
 * Figma node 848-87348 실측: 점은 4단계 모두 `Icon/Disabled`(#c9d5df = `neutral-400`).
 * 진행 상태 인디케이터(`dot-active` 퍼플)가 아니라 안내 타임라인이라 비활성 점만 쓴다.
 * 라벨은 1단계(반품접수)만 tertiary, 나머지 3단계는 primary(#222). */
function TimelineStep({
  label,
  caption,
  muted = false,
  first = false,
  last = false,
}: {
  label: string;
  caption?: string;
  muted?: boolean;
  first?: boolean;
  last?: boolean;
}) {
  return (
    <li className="flex flex-1 flex-col items-center gap-2">
      <div className="flex w-full items-center gap-2">
        <span aria-hidden className={first ? 'h-px flex-1' : 'bg-border h-px flex-1'} />
        <Icon name="dot" size={20} className="text-neutral-400" aria-hidden />
        <span aria-hidden className={last ? 'h-px flex-1' : 'bg-border h-px flex-1'} />
      </div>
      <div className="flex flex-col items-center text-center">
        <p className={`text-label-xs ${muted ? 'text-fg-tertiary' : 'text-fg'}`}>{label}</p>
        {caption ? <p className="text-caption-m text-fg-tertiary">{caption}</p> : null}
      </div>
    </li>
  );
}

/** 하단 약관 동의 링크 한 줄 — CheckoutView 약관 목록과 동일 패턴. */
function TermsLinkRow({ label, onView }: { label: string; onView: () => void }) {
  return (
    <div className="flex items-center justify-between py-3">
      <p className="text-label-m text-fg">{label}</p>
      <button type="button" onClick={onView} className="text-label-m text-fg-tertiary underline">
        보기
      </button>
    </div>
  );
}

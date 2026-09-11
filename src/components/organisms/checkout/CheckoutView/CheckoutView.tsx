'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { InfoBox } from '@/components/atoms/InfoBox';
import { Textarea } from '@/components/atoms/Textarea';
import { CartAmountRow } from '@/components/molecules/cart/CartAmountRow';
import { OrderLineItem } from '@/components/molecules/checkout/OrderLineItem';
import { Modal } from '@/components/molecules/shared/Modal';
import { StatusLabel } from '@/components/molecules/shared/StatusLabel';
import type { OtherPaymentMethodId, PaymentMethodId } from '@/components/organisms/checkout/model';
import { PaymentMethodAccordion } from '@/components/organisms/checkout/PaymentMethodAccordion';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';

import { MOCK_AMOUNTS, MOCK_CUSTOMER, MOCK_DEFAULT_ADDRESS, MOCK_ORDER_ITEM } from './mock';

/**
 * 주문서(체크아웃) 화면 컨테이너 (organism). Figma "5팀 UI 공유용" —
 * "주문서 상세정보 입력 전 1개 구매" (node 666-23208) + "결제수단 아코디언" (node 666-22301).
 * page.tsx 는 이 컴포넌트만 렌더한다(RSC 유지).
 *
 * 바로구매(1개) 흐름 — 장바구니를 거치지 않고 상품 1건을 바로 주문서로 들여온다.
 * 데이터는 퍼블리싱 단계라 목 데이터(`mock.ts`). 백엔드 미연동 — 배송지·결제수단·약관동의는
 * 전부 이 컴포넌트 로컬 state, 새로고침하면 초기화된다.
 *
 * 배송지는 `feat/#72`(배송지 관리 화면) 의 공유 스토어(`deliveryAddressStore`)가 develop 에
 * 머지되기 전이라 이 화면만의 로컬 목데이터를 쓴다 — 머지 후 그 스토어로 교체 예정(이슈 #82).
 *
 * "주문상품"은 Figma 상 아코디언이 아니라(단일 상품이라 접을 이유가 없음) 평범한 목록이다 —
 * `AccordionOrder`(장바구니용, 항상 헤더 chevron 노출)를 그대로 쓰면 없는 토글을 만드는
 * 셈이라 재사용하지 않았다.
 */
type DeliveryDetailModal = 'edit' | null;
type TermsModal = 'privacy' | 'payment' | null;

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

export function CheckoutView() {
  const router = useRouter();

  // 기본값은 "다른 결제수단" 선택 상태 — Figma 스크린샷 그대로(사용자 확인, 2026-09-11).
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId | null>('other');
  const [otherPaymentMethod, setOtherPaymentMethod] = useState<OtherPaymentMethodId>('card');
  const [cardIssuer, setCardIssuer] = useState<string | null>(null);

  const [deliveryDetail, setDeliveryDetail] = useState<string | null>(null);
  const [deliveryDetailDraft, setDeliveryDetailDraft] = useState('');
  const [deliveryModal, setDeliveryModal] = useState<DeliveryDetailModal>(null);
  const [termsModal, setTermsModal] = useState<TermsModal>(null);

  const canPay = deliveryDetail != null && deliveryDetail.trim() !== '' && paymentMethod != null;

  function openDeliveryModal() {
    setDeliveryDetailDraft(deliveryDetail ?? '');
    setDeliveryModal('edit');
  }

  function saveDeliveryDetail() {
    setDeliveryDetail(deliveryDetailDraft.trim());
    setDeliveryModal(null);
  }

  return (
    <>
      <SectionHeader leading="back" onLeadingClick={() => router.back()} title="주문서" />

      <div className="bg-surface-secondary flex flex-1 flex-col gap-2">
        {/* 주문자 정보 — Figma "Accordion_Orderinfo"(property1=off) 는 펼침 콘텐츠가 없어
            토글 없는 정적 헤더로 둔다. 수정은 마이컬리 프로필로 이동. */}
        <div className="bg-surface flex items-center justify-between px-4 py-3">
          <p className="text-heading-4 text-fg">주문자 정보</p>
          <button
            type="button"
            onClick={() => router.push('/mypage/profile')}
            className="text-heading-6 text-fg flex items-center gap-2"
          >
            {MOCK_CUSTOMER.name}, {MOCK_CUSTOMER.phone}
            <Icon name="arrow-down" size={24} aria-hidden />
          </button>
        </div>

        {/* 배송정보 */}
        <div className="bg-surface flex flex-col gap-6 p-4">
          <div className="flex items-center justify-between">
            <p className="text-heading-4 text-fg">배송정보</p>
            <span className="text-label-m text-fg-tertiary flex items-center gap-1">
              배송지 변경 안내
              <Icon name="help-circle" size={20} aria-hidden />
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-label-m text-fg-secondary">배송지</p>
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col items-start gap-2">
                {MOCK_DEFAULT_ADDRESS.isDefault ? (
                  <StatusLabel type="defaultAddress">기본배송지</StatusLabel>
                ) : null}
                <p className="text-heading-4 text-fg">{MOCK_DEFAULT_ADDRESS.addressLine}</p>
              </div>
              <Button
                size="s"
                variant="outlineBlack"
                className="shrink-0"
                onClick={() => router.push('/mypage/addresses')}
              >
                변경
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-label-m text-fg-secondary">
              배송 상세정보<span className="text-primary">*</span>
            </p>
            <div className="flex items-center justify-between gap-2">
              {deliveryDetail ? (
                <p className="text-heading-4 text-fg min-w-0 flex-1 truncate">{deliveryDetail}</p>
              ) : (
                <span className="text-primary flex items-center gap-1">
                  <span className="text-heading-4">배송 상세 정보를 입력해주세요</span>
                  <Icon name="arrow-right" size={20} aria-hidden />
                </span>
              )}
              <Button
                size="s"
                variant="outlineBlack"
                className="shrink-0"
                onClick={openDeliveryModal}
              >
                수정
              </Button>
            </div>
          </div>
        </div>

        {/* 주문상품 (바로구매 1건) */}
        <div className="bg-surface flex flex-col gap-4 p-4">
          <p className="text-heading-4 text-fg">주문상품</p>
          <div className="flex flex-col gap-2">
            <p className="text-label-m text-fg-secondary">샛별배송</p>
            <OrderLineItem
              name={MOCK_ORDER_ITEM.name}
              imageSrc={MOCK_ORDER_ITEM.imageSrc}
              price={MOCK_ORDER_ITEM.price}
              originalPrice={MOCK_ORDER_ITEM.originalPrice}
              quantity={MOCK_ORDER_ITEM.quantity}
            />
          </div>
        </div>

        {/* 쿠폰 */}
        <div className="bg-surface flex flex-col gap-4 p-4">
          <span className="flex items-center gap-1">
            <p className="text-heading-4 text-fg">쿠폰</p>
            <Icon name="help-circle" size={20} aria-hidden />
          </span>
          <InfoBox variant="bar" className="w-full">
            사용할 수 있는 쿠폰이 없어요
          </InfoBox>
          {/* 인터렉션 미정 — 지금은 시각만(Figma node 666-23238). "컬리멤버스"만 SemiBold,
              나머지 안내문은 Regular — 하나로 묶어 text-heading-4 를 주면 둘 다 굵어진다. */}
          <p className="flex items-center gap-1">
            <span className="text-heading-4 text-cyan">컬리멤버스</span>
            <span className="text-heading-6 text-fg-tertiary">
              컬리멤버스 월 100원으로 무료배송
            </span>
            {/* Figma 실측 색(#7E8F9B)이 text-fg-tertiary — Icon 은 색 지정 없으면 상속(검정)
                이라 옆 안내문과 안 어울렸다. */}
            <Icon name="arrow-right" size={20} className="text-fg-tertiary" aria-hidden />
          </p>
        </div>

        {/* 적립금·컬리캐시 — 백엔드 미연동, 전부 0/비활성 표시 */}
        <div className="bg-surface flex flex-col gap-3 p-4">
          <span className="flex items-center gap-1">
            <p className="text-heading-4 text-fg">적립금·컬리캐시</p>
            <Icon name="help-circle" size={20} aria-hidden />
          </span>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-end gap-2">
              <div className="text-body-m text-fg-disabled flex w-full items-center justify-between">
                <span>잔액</span>
                <span>0 원</span>
              </div>
              <div className="text-body-m text-fg-disabled flex w-full items-center justify-between">
                <span className="flex items-center gap-1">
                  <Icon name="corner-bottom-left" size={20} aria-hidden />
                  적립금
                </span>
                <span>0 원</span>
              </div>
              <div className="text-body-m text-fg-disabled flex w-full items-center justify-between">
                <span className="flex items-center gap-1">
                  <Icon name="corner-bottom-left" size={20} aria-hidden />
                  컬리캐시
                </span>
                <span>0 원</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div
                aria-hidden
                className="bg-surface-secondary border-border text-body-m text-fg-disabled flex-1 rounded-sm border px-4 py-3.25"
              >
                0
              </div>
              {/* Figma node 666-23248/23273: h-48·w-92·radius/s(4px) — Button "s" 는 높이가
                  고정이 아니고(패딩+콘텐츠로 자연 높이 48px 미달) 모서리도 자체 클래스에
                  rounded-m(8px) 이 박혀있어 실측(4px)과 다르다. h-12/w-23 로 크기, `rounded-sm!`
                  로 Button 의 고정 rounded-m 을 확실히 덮어쓴다(className 병합 순서에 기대지
                  않는 안전한 방법 — Tailwind v4 important 접미사). */}
              <Button size="s" variant="outlineBlack" disabled className="h-12 w-23 rounded-sm!">
                모두사용
              </Button>
            </div>

            <ul className="flex flex-col gap-1">
              <li className="text-label-m text-fg-tertiary">
                · 적립금이 컬리캐시보다 먼저 사용돼요.
              </li>
              <li className="text-label-m text-fg-tertiary">
                · 컬리캐시는 컬리페이 가입 후 사용할 수 있어요.
              </li>
            </ul>
          </div>
        </div>

        {/* 결제수단 */}
        <div className="bg-surface">
          <PaymentMethodAccordion
            method={paymentMethod}
            onMethodChange={setPaymentMethod}
            otherMethod={otherPaymentMethod}
            onOtherMethodChange={setOtherPaymentMethod}
            cardIssuer={cardIssuer}
            onCardIssuerChange={setCardIssuer}
          />
        </div>

        {/* 결제금액 */}
        <div className="bg-surface flex flex-col gap-4 p-4">
          <p className="text-heading-4 text-fg">결제금액</p>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <CartAmountRow label="주문 금액" value={won(MOCK_AMOUNTS.productPrice)} />
              <AmountDetailRow label="상품금액" value={won(MOCK_AMOUNTS.productPrice)} />
              <AmountDetailRow
                label="상품할인금액"
                value={`-${won(MOCK_AMOUNTS.productDiscount)}`}
              />
            </div>

            <CartAmountRow label="배송비" value={won(MOCK_AMOUNTS.shippingFee)} />

            <div className="flex flex-col gap-2">
              <CartAmountRow label="쿠폰할인" value={won(MOCK_AMOUNTS.couponDiscount)} />
              <AmountDetailRow label="상품 쿠폰" value={won(MOCK_AMOUNTS.productCouponDiscount)} />
              <AmountDetailRow label="장바구니 쿠폰" value={won(MOCK_AMOUNTS.cartCouponDiscount)} />
            </div>

            <CartAmountRow label="카드즉시할인" value={won(MOCK_AMOUNTS.cardInstantDiscount)} />

            <div className="flex flex-col gap-2">
              <CartAmountRow label="적립금·컬리캐시" value={won(MOCK_AMOUNTS.pointsCashUsed)} />
              <AmountDetailRow label="적립금" value={won(MOCK_AMOUNTS.pointsUsed)} />
              <AmountDetailRow label="컬리캐시" value={won(MOCK_AMOUNTS.cashUsed)} />
            </div>

            <hr className="border-border" />

            {/* Figma node 666-23385: 값이 CartAmountRow 의 emphasis(text-heading-0, Pretendard
                SemiBold)와 달리 SF Pro Black(`text-numeric-xl font-numeric`) + "원"만 별도
                Regular 18px(`text-heading-3`) — 이 화면 전용이라 CartAmountRow 를 손대지
                않고 직접 그린다. */}
            <div className="flex items-center justify-between px-1">
              <span className="text-heading-4 text-fg">최종 결제금액</span>
              <span className="text-fg">
                <span className="text-numeric-xl font-numeric">
                  {MOCK_AMOUNTS.total.toLocaleString('ko-KR')}
                </span>{' '}
                <span className="text-heading-3">원</span>
              </span>
            </div>
          </div>
        </div>

        {/* 샛별배송 안내 */}
        <div className="bg-surface flex flex-col px-4 py-5">
          <p className="text-label-m text-fg-secondary">샛별배송</p>
          <p className="text-body-m text-fg">
            지금 결제하면
            <br />
            <span className="text-fg-secondary">내일 아침 7시 전</span>에 받아요!
          </p>
        </div>

        {/* 약관동의 */}
        <div className="bg-surface flex flex-col">
          {/* Figma node 666-23393: 바깥 px-3 py-5(gap/s·gap/l) 안에서 `<ul>` 자체엔 여백이
              없고 각 `<li>` 가 ms-5(≈21px) 를 진다 — 브라우저 기본 list-disc 들여쓰기(40px)에
              기대면 실측보다 훨씬 오른쪽으로 밀린다. */}
          <div className="px-3 py-5">
            <ul className="text-label-m text-fg-quaternary list-disc">
              <li className="ms-5">
                [주문완료], [배송준비중] 상태일 경우에만 주문 취소가 가능하며, 상품 미배송 시
                결제하신 수단으로 환불 됩니다.
              </li>
              <li className="ms-5">
                컬리 내 개별 판매자 등록 상품의 경우 컬리는 통신판매중개자로서 주문, 품질, 교환·환불
                등의 의무·책임을 부담하지 않습니다.
              </li>
            </ul>
          </div>

          <div className="flex flex-col px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-label-m text-fg">개인정보 수집·이용 및 처리 동의</p>
              <button
                type="button"
                onClick={() => setTermsModal('privacy')}
                className="text-label-m text-fg-tertiary underline"
              >
                보기
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-label-m text-fg">전자금융거래 이용약관 동의</p>
              <button
                type="button"
                onClick={() => setTermsModal('payment')}
                className="text-label-m text-fg-tertiary underline"
              >
                보기
              </button>
            </div>
          </div>

          {/* Figma 원본엔 체크박스가 없다(node 666-23404, 텍스트 한 줄만) — 결제 동의는
              하단 "결제하기" 버튼 누르는 행위 자체가 갈음한다. */}
          <p className="text-body-m text-fg px-4 pt-3 pb-8">
            위 내용을 확인하였으며 결제에 동의합니다.
          </p>
        </div>
      </div>

      {/* Figma "CTA_Horizontal"(node 972-111861) — 버튼 아래 약관 동의 리마인드 문구가
          있다(체크박스를 없앤 대신 여기서 상기시킴, 위 결제 동의 절 참고). 홈 인디케이터
          여유(pb-11)는 CartOrderBar 와 같은 이유로 유지 — 정적 프레임엔 안 드러나는
          실제 기기 세이프에어리어다. */}
      <div className="bg-surface sticky bottom-0 flex flex-col gap-3 px-4 pt-3 pb-3">
        <Button
          variant="primary"
          size="l"
          className="h-14 w-full"
          disabled={!canPay}
          onClick={() => router.push('/checkout/complete')}
        >
          {won(MOCK_AMOUNTS.total)} 결제하기
        </Button>
        <p className="text-caption-m text-fg-tertiary text-center">
          결제 전 <span className="underline">이용약관 및 정보제공</span> 동의를 확인해 주세요
        </p>
      </div>

      <Modal
        open={deliveryModal === 'edit'}
        onClose={() => setDeliveryModal(null)}
        title="배송 상세정보"
        description="공동현관 비밀번호, 부재 시 요청사항 등을 입력해주세요."
        footer={
          <>
            <Button variant="outlineBlack" onClick={() => setDeliveryModal(null)}>
              취소
            </Button>
            <Button variant="black" onClick={saveDeliveryDetail}>
              저장
            </Button>
          </>
        }
      >
        <Textarea
          label="배송 상세정보"
          value={deliveryDetailDraft}
          onChange={(e) => setDeliveryDetailDraft(e.target.value)}
          maxLength={200}
          rows={4}
        />
      </Modal>

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

/** 결제금액 세부 항목(상품금액/상품할인금액 등) — `corner-bottom-left` 들여쓰기 아이콘 + 라벨 + 값. */
function AmountDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-fg-quaternary text-label-m flex items-center">
        <Icon name="corner-bottom-left" size={20} aria-hidden />
        {label}
      </span>
      <span className="text-label-m text-fg-quaternary">{value}</span>
    </div>
  );
}

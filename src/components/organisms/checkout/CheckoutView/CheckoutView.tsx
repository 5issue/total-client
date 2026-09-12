'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { InfoBox } from '@/components/atoms/InfoBox';
import { Input } from '@/components/atoms/Input';
import { Toast } from '@/components/atoms/Toast';
import { CartAmountRow } from '@/components/molecules/cart/CartAmountRow';
import { Accordion } from '@/components/molecules/shared/Accordion';
import { Modal } from '@/components/molecules/shared/Modal';
import { StatusLabel } from '@/components/molecules/shared/StatusLabel';
import type { OtherPaymentMethodId, PaymentMethodId } from '@/components/organisms/checkout/model';
import { OrderItemsSection } from '@/components/organisms/checkout/OrderItemsSection';
import { PaymentMethodAccordion } from '@/components/organisms/checkout/PaymentMethodAccordion';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';

import { MOCK_AMOUNTS, MOCK_CUSTOMER, MOCK_DEFAULT_ADDRESS, MOCK_ORDER_ITEMS } from './mock';

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
 * "주문상품"은 상품 개수에 따라 모양이 바뀐다(node 666-23208 1건 / 666-23446·666-25396
 * 2건 이상) — 그 분기와 두 상태의 마크업은 `OrderItemsSection` 에 위임한다.
 *
 * "주문자 정보"는 node 666-25643 기준 펼치면 받는 분/휴대폰/이메일 + 변경 방법 안내가
 * 나온다 — 공용 `Accordion` 셸을 쓰되, 헤더 오른쪽 요약("이름, 전화번호")은 펼쳤을 때
 * 사라지므로(Figma 원본 확인) `open` 값에 따라 이 컴포넌트가 직접 헤더를 갈아끼운다.
 *
 * 필수값 미입력 시 [주문하기] 안내(node 666-23688): 버튼은 `disabled` 로 막지 않는다 —
 * Figma 스크린샷에서 버튼이 항상 활성(purple) 색이고, 눌렀을 때 상단에 에러 토스트
 * ("배송 상세정보를 입력해주세요.")가 뜬다. 네이티브 `disabled` 버튼은 클릭 이벤트 자체가
 * 발생하지 않아 토스트를 못 띄우므로, 유효성 검사는 클릭 핸들러 안에서 직접 한다.
 *
 * "주문시간 초과" 모달(node 666-24671)은 실제 서버 세션 만료 신호가 아직 없어(백엔드
 * 미연동) 클라이언트 타이머로 흉내만 낸다 — `ORDER_TIME_LIMIT_MS` 는 실제 정책값이 아니라
 * 임시 추정치, 서버 세션 만료 API 나오면 그걸로 교체.
 */
type DeliveryDetailModal = 'edit' | null;
/** 배송 상세정보 — node 666-24922: "{위치} | 공동현관 비밀번호({코드})" + "{받는분}, {전화번호}". */
interface DeliveryDetail {
  location: string;
  passcode: string;
}
type TermsModal = 'privacy' | 'payment' | null;

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

/** 주문서 진입 후 결제를 완료해야 하는 유효시간 — 서버 세션 만료 정책 확정 전 임시값(node 666-24671). */
const ORDER_TIME_LIMIT_MS = 15 * 60 * 1000;
/** [주문하기] 오류 토스트 노출 시간(node 666-23688, Toast atom 은 자동 소멸을 책임지지 않음). */
const VALIDATION_TOAST_DURATION_MS = 5000;

export function CheckoutView() {
  const router = useRouter();

  // 기본값은 "다른 결제수단" 선택 상태 — Figma 스크린샷 그대로(사용자 확인, 2026-09-11).
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId | null>('other');
  const [otherPaymentMethod, setOtherPaymentMethod] = useState<OtherPaymentMethodId>('card');
  const [cardIssuer, setCardIssuer] = useState<string | null>(null);

  const [deliveryDetail, setDeliveryDetail] = useState<DeliveryDetail | null>(null);
  const [locationDraft, setLocationDraft] = useState('');
  const [passcodeDraft, setPasscodeDraft] = useState('');
  const [deliveryModal, setDeliveryModal] = useState<DeliveryDetailModal>(null);
  const [termsModal, setTermsModal] = useState<TermsModal>(null);
  const [ordererOpen, setOrdererOpen] = useState(false);

  const [addressChangeInfoOpen, setAddressChangeInfoOpen] = useState(false);
  const [couponInfoOpen, setCouponInfoOpen] = useState(false);
  const [pointsInfoOpen, setPointsInfoOpen] = useState(false);
  const [orderExpired, setOrderExpired] = useState(false);
  const [showValidationToast, setShowValidationToast] = useState(false);
  const validationToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canPay = deliveryDetail != null && deliveryDetail.location !== '' && paymentMethod != null;

  useEffect(() => {
    const timer = setTimeout(() => setOrderExpired(true), ORDER_TIME_LIMIT_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (validationToastTimer.current) clearTimeout(validationToastTimer.current);
    };
  }, []);

  function openDeliveryModal() {
    setLocationDraft(deliveryDetail?.location ?? '');
    setPasscodeDraft(deliveryDetail?.passcode ?? '');
    setDeliveryModal('edit');
  }

  function saveDeliveryDetail() {
    const location = locationDraft.trim();
    const passcode = passcodeDraft.trim();
    setDeliveryDetail(location ? { location, passcode } : null);
    setDeliveryModal(null);
  }

  function handleSubmitOrder() {
    if (!canPay) {
      // 피드백: 토스트가 뜰 때 화면이 자동으로 맨 위로 스크롤된다 — 놓친 필드(배송
      // 상세정보)가 화면 위쪽에 있어서다.
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setShowValidationToast(true);
      if (validationToastTimer.current) clearTimeout(validationToastTimer.current);
      validationToastTimer.current = setTimeout(
        () => setShowValidationToast(false),
        VALIDATION_TOAST_DURATION_MS,
      );
      return;
    }
    router.push('/checkout/complete');
  }

  return (
    <>
      <SectionHeader leading="back" onLeadingClick={() => router.back()} title="주문서" />

      {/* node 666-23688: [주문하기] 눌렀는데 필수값이 비어있을 때 상단에 뜨는 에러 토스트.
          화면 스크롤과 무관하게 계속 보이도록 fixed, 화면 상단과의 간격은 실측 84px(top-[84px]).
          피드백: 위에서 아래로 슬라이드해 내려오고 5초 뒤 다시 위로 슬라이드해 사라진다 —
          `{cond ? <Toast/> : null}` 로 마운트/언마운트하면 사라질 때 트랜지션이 안 걸리므로,
          항상 마운트해두고 translate-y 만 토글한다(OrderItemsSection 과 같은 원칙). */}
      <div
        aria-hidden={!showValidationToast}
        className={[
          'pointer-events-none fixed inset-x-0 top-[84px] z-50 flex justify-center px-4',
          'transition-transform duration-300 ease-out motion-reduce:transition-none',
          showValidationToast ? 'translate-y-0' : '-translate-y-[200px]',
        ].join(' ')}
      >
        <Toast variant="error">배송 상세정보를 입력해주세요.</Toast>
      </div>

      <div className="bg-surface-secondary flex flex-1 flex-col gap-2">
        {/* 주문자 정보 — Figma "Accordion_Orderinfo"(node 666-25643, property1=on). 접힘일
            땐 헤더 오른쪽에 "이름, 전화번호" 요약이 붙지만 펼치면 그 요약이 사라지고
            패널에 받는 분/휴대폰/이메일 + 변경 방법 안내가 나온다(원본 확인) — 그래서
            헤더를 `open` 값으로 직접 분기해 넣는다. */}
        <Accordion
          className="bg-surface"
          headerClassName="px-4 py-3"
          open={ordererOpen}
          onToggle={setOrdererOpen}
          header={
            ordererOpen ? (
              '주문자 정보'
            ) : (
              <span className="flex items-center justify-between gap-2">
                주문자 정보
                <span className="text-heading-6 text-fg">
                  {MOCK_CUSTOMER.name}, {MOCK_CUSTOMER.phone}
                </span>
              </span>
            )
          }
        >
          <div className="flex flex-col gap-3 px-4 pb-4">
            <dl className="flex flex-col gap-2">
              <OrdererInfoRow label="받는 분" value={MOCK_CUSTOMER.name} />
              <OrdererInfoRow label="휴대폰" value={MOCK_CUSTOMER.phone} />
              <OrdererInfoRow label="이메일" value={MOCK_CUSTOMER.email} />
            </dl>
            <p className="text-label-xs text-fg-tertiary">
              주문자 정보 변경 방법: 마이컬리 &gt; 개인정보 수정
            </p>
          </div>
        </Accordion>

        {/* 배송정보 */}
        <div className="bg-surface flex flex-col gap-6 p-4">
          <div className="flex items-center justify-between">
            <p className="text-heading-4 text-fg">배송정보</p>
            {/* node 666-25154: 눌렀을 때 "배송지 변경" 확인 모달 — 이 화면(바로구매)엔
                배송지를 직접 바꾸는 UI가 없어 장바구니로 이동해야 함을 안내한다. */}
            <button
              type="button"
              onClick={() => setAddressChangeInfoOpen(true)}
              className="text-label-m text-fg-tertiary flex items-center gap-1"
            >
              배송지 변경 안내
              <Icon name="help-circle" size={20} aria-hidden />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-label-m text-fg-secondary">배송지</p>
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col items-start gap-2">
                {MOCK_DEFAULT_ADDRESS.isDefault ? (
                  <StatusLabel type="defaultAddress">기본배송지</StatusLabel>
                ) : null}
                {/* 피드백: 이 주소 텍스트는 폰트 굵기 400(Regular) — text-heading-4(600)
                    가 아니라 text-heading-6(같은 16px, 400)이 맞다. */}
                <p className="text-heading-6 text-fg">{MOCK_DEFAULT_ADDRESS.addressLine}</p>
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
                // node 666-24922: "{위치} | 공동현관 비밀번호({코드})" 한 줄 + "{받는분}, {전화번호}"
                // 한 줄. 위치↔안내문 사이 세로선은 실측(문 앞 끝 32px→선 40px→안내문 시작
                // 48px, 즉 선 좌우 8px씩)대로 h-3 보더 스팬으로 그린다(텍스트 "|" 아님).
                <div className="min-w-0 flex-1">
                  {/* "문 앞"/"공동현관 비밀번호"/"(코드)"는 SemiBold(text-heading-4) 그대로 —
                      Figma 확인. 아래 받는분·전화번호 줄만 Regular(text-heading-6) +
                      text-fg-secondary. */}
                  <p className="text-heading-4 text-fg flex items-center gap-2 truncate">
                    <span className="shrink-0">{deliveryDetail.location}</span>
                    {deliveryDetail.passcode ? (
                      <>
                        <span aria-hidden className="border-border h-3 shrink-0 border-l" />
                        <span className="truncate">
                          공동현관 비밀번호(
                          <span className="text-primary">{deliveryDetail.passcode}</span>)
                        </span>
                      </>
                    ) : null}
                  </p>
                  <p className="text-heading-6 text-fg-secondary truncate">
                    {MOCK_DEFAULT_ADDRESS.recipient}, {MOCK_DEFAULT_ADDRESS.phone}
                  </p>
                </div>
              ) : (
                <span className="text-primary flex items-center gap-1">
                  {/* 피드백: 폰트 굵기 400(Regular) — text-heading-6. */}
                  <span className="text-heading-6">배송 상세 정보를 입력해주세요</span>
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

        {/* 주문상품 — 1건/2건 이상 분기는 OrderItemsSection 이 담당(node 666-23208 · 666-23446 · 666-25396). */}
        <OrderItemsSection items={MOCK_ORDER_ITEMS} />

        {/* 쿠폰 */}
        <div className="bg-surface flex flex-col gap-4 p-4">
          <span className="flex items-center gap-1">
            <p className="text-heading-4 text-fg">쿠폰</p>
            {/* node 666-23931: "최대 할인 적용이란?" 안내 모달. */}
            <button type="button" onClick={() => setCouponInfoOpen(true)} aria-label="쿠폰 안내">
              <Icon name="help-circle" size={20} aria-hidden />
            </button>
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
            {/* node 666-24420: "적립금·컬리캐시 사용 전 확인해주세요" 안내 모달. */}
            <button
              type="button"
              onClick={() => setPointsInfoOpen(true)}
              aria-label="적립금·컬리캐시 안내"
            >
              <Icon name="help-circle" size={20} aria-hidden />
            </button>
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

          <div className="flex flex-col gap-1 px-4 py-3">
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
        <Button variant="primary" size="l" className="h-14 w-full" onClick={handleSubmitOrder}>
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
            <Button variant="black" disabled={!locationDraft.trim()} onClick={saveDeliveryDetail}>
              저장
            </Button>
          </>
        }
      >
        {/* node 666-24922 표시 형식("{위치} | 공동현관 비밀번호({코드})")에 맞춰 위치·비밀번호를
            분리 입력받는다 — 자유 서술 Textarea 한 칸이던 이전 버전은 이 구조화된 값을
            만들 수 없어 두 개의 Input 으로 바꿨다. */}
        <div className="flex flex-col gap-4">
          <Input
            label="배송 위치"
            labelVisible
            placeholder="예: 문 앞, 경비실"
            value={locationDraft}
            onChange={(e) => setLocationDraft(e.target.value)}
            maxLength={20}
          />
          <Input
            label="공동현관 비밀번호"
            labelVisible
            placeholder="공동현관 비밀번호(선택)"
            value={passcodeDraft}
            onChange={(e) => setPasscodeDraft(e.target.value)}
            maxLength={20}
          />
        </div>
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

      {/* node 666-25154: "배송지 변경 안내" 아이콘 — 이 화면은 배송지를 직접 못 바꾸니
          장바구니로 이동해야 함을 확인받는다(2-버튼: 취소는 fill-surface-secondary, Button
          "tertiary" 가 그 색과 일치). */}
      <Modal
        open={addressChangeInfoOpen}
        onClose={() => setAddressChangeInfoOpen(false)}
        title="배송지 변경"
        description="장바구니로 이동하여 다른 배송지로 변경하시겠습니까?"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setAddressChangeInfoOpen(false)}>
              취소
            </Button>
            <Button variant="black" onClick={() => router.push('/cart')}>
              확인
            </Button>
          </>
        }
      />

      {/* node 666-23931: 쿠폰 옆 help-circle 아이콘. */}
      <Modal
        open={couponInfoOpen}
        onClose={() => setCouponInfoOpen(false)}
        title="최대 할인 적용이란?"
        description="보유한 쿠폰 중 적용할 수 있는 가장 큰 혜택을 자동 적용해드려요. 단, 최저가와는 다를 수 있어요."
        footer={
          <Button variant="black" onClick={() => setCouponInfoOpen(false)}>
            확인
          </Button>
        }
      />

      {/* node 666-24420: 적립금·컬리캐시 옆 help-circle 아이콘. 불릿 아이콘은 Figma 실측
          지름 3px 원 — 우리 아이콘 세트로는 못 재현해(이전 라운드에도 같은 이유로 "·"
          문자 사용) 여기도 동일 패턴. */}
      <Modal
        open={pointsInfoOpen}
        onClose={() => setPointsInfoOpen(false)}
        title="적립금·컬리캐시 사용 전 확인해주세요"
        footer={
          <Button variant="black" onClick={() => setPointsInfoOpen(false)}>
            확인
          </Button>
        }
      >
        <ul className="flex flex-col gap-2">
          <InfoBullet>컬리캐시는 계좌를 통해 충전하는 결제수단이에요.</InfoBullet>
          <InfoBullet>잔액은 적립금과 컬리캐시를 합한 금액이에요.</InfoBullet>
          <InfoBullet>컬리캐시 결제 적립 혜택은 계좌로 충전한 캐시에만 적용돼요.</InfoBullet>
        </ul>
      </Modal>

      {/* node 666-24671: 서버 세션 만료를 흉내낸 클라이언트 타이머(ORDER_TIME_LIMIT_MS)가
          쏘는 모달 — 백드롭/Esc 로 못 닫게 하고 [확인]으로 장바구니 이동만 허용한다. */}
      <Modal
        open={orderExpired}
        onClose={() => setOrderExpired(false)}
        closeOnBackdrop={false}
        title="주문시간이 초과되었어요"
        description="주문시간이 초과되어 장바구니로 이동합니다. 주문을 다시 시도해주세요."
        footer={
          <Button variant="black" onClick={() => router.push('/cart')}>
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

/** 주문자 정보 펼침 패널의 한 줄(받는 분/휴대폰/이메일) — 라벨 열 너비 고정, 값은 그 옆. */
function OrdererInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <dt className="text-body-m text-fg-tertiary w-16 shrink-0">{label}</dt>
      <dd className="text-body-m text-fg">{value}</dd>
    </div>
  );
}

/** 안내 모달 본문의 불릿 한 줄("·" + 문구) — PaymentMethodAccordion 의 동일 모달에도 같은
 * 모양이 필요해질 수 있지만, 지금은 이 화면 안에서만 쓰여 굳이 공용 컴포넌트로 빼지 않았다. */
function InfoBullet({ children }: { children: ReactNode }) {
  return (
    <li className="text-body-s text-fg-secondary flex gap-1">
      <span aria-hidden className="text-fg-tertiary shrink-0">
        ·
      </span>
      {children}
    </li>
  );
}

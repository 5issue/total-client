'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Logo } from '@/components/atoms/Logo/Logo';
import { Radio } from '@/components/atoms/Radio';
import { PaymentBenefitNotice } from '@/components/molecules/checkout/PaymentBenefitNotice';
import { PaymentMethodButton } from '@/components/molecules/checkout/PaymentMethodButton';
import { Dropdown } from '@/components/molecules/shared/Dropdown';
import { Modal } from '@/components/molecules/shared/Modal';
import { StatusLabel } from '@/components/molecules/shared/StatusLabel';
import type { OtherPaymentMethodId, PaymentMethodId } from '@/components/organisms/checkout/model';

/**
 * 결제수단 선택 (organism). Figma "5팀 UI 공유용" — `결제수단`/`다른 결제수단_open`
 * (node 666-23284, 결제수단 아코디언 node 666-22301).
 *
 * 1차 라디오그룹(`payment-method`, 네이티브 `input[type=radio]` — `Radio` atom): 컬리캐시
 * 충전결제 / Kurly Pay(계좌카드) / N Pay / 다른 결제수단. `Radio` 는 원형만(자체 `<label>`)
 * 그려 접근 이름은 sr-only 로 주고, 행의 나머지 시각 콘텐츠(뱃지 포함)는 형제 `<button>` 에
 * 둔다 — Figma 뱃지 배치가 라디오와 분리돼 있어 한 `<label>` 에 다 넣기보다 이 편이 자연스럽다.
 *
 * "다른 결제수단" 선택 시에만 2차 라디오그룹(`PaymentMethodButton`, 이미 role="radio" 버튼)이
 * 펼쳐진다 — 신용카드/휴대폰/토스페이/카카오페이/PAYCO. 신용카드를 고르면 카드사 선택
 * 드롭다운이 더 나온다(Figma node 666-22997/666-23167 — 할부가 아니라 카드사 선택이었다,
 * placeholder "카드를 선택해 주세요"). 카드사 목록은 Figma 바텀시트(node 666-23167)
 * 실측 20개 그대로.
 *
 * 컬리캐시 충전결제의 케이뱅크 그라디언트 뱃지·리스트 각 행의 "혜택" 태그·배송지의
 * "기본배송지" 필은 전부 `StatusLabel`(kbank/rewards/defaultAddress) 재사용 — 새로 안 만든다.
 *
 * N Pay 는 아직 이용 불가 수단이라 `disabled`(2026-09-11 확인) — 선택·라디오 포커스 모두 막고
 * 흐리게(`opacity-40`) 표시한다.
 */
export interface PaymentMethodAccordionProps {
  /** `null` 도 타입상 허용하지만(호출부가 언젠가 미선택을 필요로 할 경우 대비) 기본값은
   * "다른 결제수단" — Figma 스크린샷 그대로(사용자 확인, 2026-09-11). */
  method: PaymentMethodId | null;
  onMethodChange: (method: PaymentMethodId) => void;
  otherMethod: OtherPaymentMethodId;
  onOtherMethodChange: (method: OtherPaymentMethodId) => void;
  /** 신용카드 선택 시 카드사 드롭다운 값. 미선택은 `null`. */
  cardIssuer: string | null;
  onCardIssuerChange: (value: string) => void;
  className?: string;
}

/** Figma 바텀시트(node 666-23167) 카드사 목록 그대로 — 20개. */
const CARD_ISSUER_OPTIONS = [
  { value: 'hyundai', label: '현대' },
  { value: 'shinhan', label: '신한' },
  { value: 'bc', label: '비씨(페이북)' },
  { value: 'kb', label: 'KB국민' },
  { value: 'samsung', label: '삼성' },
  { value: 'lotte', label: '롯데' },
  { value: 'hana', label: '하나(외환)' },
  { value: 'nh', label: 'NH채움' },
  { value: 'woori', label: '우리' },
  { value: 'suhyup', label: '수협' },
  { value: 'citi', label: '씨티' },
  { value: 'gwangju', label: '광주' },
  { value: 'jeonbuk', label: '전북' },
  { value: 'jeju', label: '제주' },
  { value: 'shinhyup-check', label: '신협체크' },
  { value: 'mg-check', label: 'MG새마을체크' },
  { value: 'savings-check', label: '저축은행체크' },
  { value: 'post-card', label: '우체국카드' },
  { value: 'kdb', label: 'KDB산업은행' },
  { value: 'kakaobank', label: '카카오뱅크' },
];

function RewardsTag() {
  return <StatusLabel type="rewards">혜택</StatusLabel>;
}

function OptionRow({
  value,
  label,
  checked,
  onSelect,
  disabled = false,
  children,
  trailing,
  onTrailingClick,
  trailingLabel,
}: {
  value: PaymentMethodId;
  /** 접근 가능한 이름(sr-only) — 행의 시각 콘텐츠(뱃지 포함)는 `children` 이 대신 그린다. */
  label: string;
  checked: boolean;
  onSelect: () => void;
  /** 아직 미제공 수단(예: 네이버페이) — 선택 불가, `CartLineItem` 품절과 같은 흐림 처리. */
  disabled?: boolean;
  children: ReactNode;
  /** 행 오른쪽 끝의 독립 클릭 대상(예: 컬리캐시 충전결제의 정보 아이콘). 선택 버튼과
   * 겹치지 않도록 별도 `<button>` 으로 그린다 — `<button>` 안에 `<button>` 을 못 넣으므로
   * `children`(라디오 선택 버튼)과 이 `trailing` 을 감싸는 바깥 `justify-between` 행을 하나
   * 더 두고, 안쪽 선택 버튼 자체는 더 이상 `flex-1`/`justify-between` 을 갖지 않는다. */
  trailing?: ReactNode;
  onTrailingClick?: () => void;
  trailingLabel?: string;
}) {
  return (
    <div
      className={['flex w-full items-center gap-1 px-4 py-2', disabled && 'opacity-40']
        .filter(Boolean)
        .join(' ')}
    >
      <Radio
        name="payment-method"
        value={value}
        label={label}
        tone="black"
        checked={checked}
        disabled={disabled}
        onChange={onSelect}
      />
      <div className="flex min-w-0 flex-1 items-center justify-between gap-1">
        <button
          type="button"
          onClick={onSelect}
          disabled={disabled}
          className="flex min-w-0 items-center gap-1 text-left disabled:pointer-events-none"
        >
          {children}
        </button>
        {trailing ? (
          <button
            type="button"
            onClick={onTrailingClick}
            aria-label={trailingLabel}
            className="shrink-0"
          >
            {trailing}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function PaymentMethodAccordion({
  method,
  onMethodChange,
  otherMethod,
  onOtherMethodChange,
  cardIssuer,
  onCardIssuerChange,
  className,
}: PaymentMethodAccordionProps) {
  // node 666-24169: "컬리캐시 충전결제란?" 안내 모달 — 정보 아이콘 전용, 라디오 선택과는
  // 별개 동작이라 이 컴포넌트 로컬 state 로 둔다(CheckoutView 로 끌어올릴 이유 없음).
  const [chargeInfoOpen, setChargeInfoOpen] = useState(false);

  return (
    <div className={['flex flex-col pb-5', className].filter(Boolean).join(' ')}>
      <p className="text-heading-4 text-fg p-4">결제수단</p>

      <div className="flex flex-col">
        <OptionRow
          value="charge"
          label="컬리캐시 충전결제"
          checked={method === 'charge'}
          onSelect={() => onMethodChange('charge')}
          // Figma imgGroup23 실측: 원+"i" 형태(정보) — 물음표(help)가 아니다.
          trailing={<Icon name="info-line" size={20} aria-hidden />}
          onTrailingClick={() => setChargeInfoOpen(true)}
          trailingLabel="컬리캐시 충전결제 안내"
        >
          <span className="flex items-center gap-1">
            <span className="text-heading-4 text-fg">컬리캐시 충전결제</span>
            <StatusLabel type="kbank">케이뱅크 충전결제 3% 추가적립</StatusLabel>
          </span>
        </OptionRow>
        {method === 'charge' ? (
          <div className="px-4 pb-6">
            <div className="bg-brand-50 border-brand-200 rounded-m flex items-center justify-center border px-4 py-2">
              <p className="text-label-m text-fg">
                충전결제 사용하면 컬리캐시 <span className="text-primary">27원</span> 적립돼요
              </p>
            </div>
          </div>
        ) : null}

        <hr className="border-border" />

        <OptionRow
          value="kurlypay"
          label="Kurly Pay 계좌카드"
          checked={method === 'kurlypay'}
          onSelect={() => onMethodChange('kurlypay')}
        >
          {/* Figma(666-23018): "혜택" 뱃지가 justify-between 의 두번째 축이 아니라 로고·
              라벨과 한 그룹(gap/xs,5px)으로 묶여 왼쪽에 붙어있다 — 뒤에 남는 공간은 그
              그룹과 무관한 빈 flex-1 스페이서다. OptionRow 자식을 하나(그룹 전체)로
              합쳐야 space-between 이 이 그룹을 오른쪽으로 밀지 않는다. */}
          <span className="flex items-center gap-1.5">
            <Logo name="kurly-pay" height={20} aria-hidden />
            <span className="text-caption-m text-fg-tertiary">계좌카드</span>
            <RewardsTag />
          </span>
        </OptionRow>

        <hr className="border-border" />

        <OptionRow
          value="naverpay"
          label="네이버페이 — 이용 불가"
          checked={method === 'naverpay'}
          onSelect={() => onMethodChange('naverpay')}
          disabled
        >
          <span className="flex items-center gap-1.5">
            <Logo name="naver-pay" height={20} aria-hidden />
            <RewardsTag />
          </span>
        </OptionRow>

        <hr className="border-border" />

        <OptionRow
          value="other"
          label="다른 결제수단 — 신용카드, 간편결제, 휴대폰"
          checked={method === 'other'}
          onSelect={() => onMethodChange('other')}
        >
          <span className="flex items-center gap-1">
            <span className="text-heading-4 text-fg">다른 결제수단</span>
            <span className="text-caption-m text-fg-tertiary">신용카드 간편결제 휴대폰</span>
            <RewardsTag />
          </span>
        </OptionRow>

        {method === 'other' ? (
          // Figma node 666-23344(666-23354): 버튼그리드↔구분선↔드롭다운 사이는 gap/xs(8px) —
          // 버튼 "행"간 gap/s(12px, 아래 gap-y-3)와는 다른 레벨이라 헷갈리기 쉽다.
          // 왼쪽은 px-4(16px)가 아니라 pl-16(64px) — OptionRow 의 px-4(16px) + Radio 터치
          // 영역(size-11,44px) + gap-1(4px) 을 전부 더한 값이라야 위 "다른 결제수단" 텍스트와
          // x축이 맞는다 — 지난 수정(pl-12,48px)은 컨테이너 자체 px-4 를 빼먹은 계산 실수였다.
          <div className="flex flex-col gap-2 pr-4 pb-6 pl-16">
            {/* Figma 666-22997/666-23355: 2열×3행 고정(row1=신용카드+휴대폰, row2=토스페이+
                카카오페이, row3=PAYCO 혼자) — Figma 원본도 이 3행을 각각 별도 프레임으로
                명시한다(666-23356/23359/23362), 자동 줄바꿈에 맡기지 않는다.
                `grid grid-cols-2`(1fr 트랙)는 컨테이너가 328px(버튼 160×2+gap8) 보다 좁으면
                버튼이 트랙 폭에 안 맞춰지고(줄지 않고) 다음 칸과 겹쳐버렸다 — 실측 확인.
                `flex flex-wrap` 은 반대로 폭이 부족하면 1열로 무너졌다. 행마다 명시적
                `flex` 로 고정하면 폭이 부족해도(기본 flex-shrink) 겹치거나 무너지지 않고
                버튼만 살짝 줄어든다. */}
            <div className="flex flex-col gap-y-3">
              <div className="flex gap-x-2">
                <PaymentMethodButton
                  type="text"
                  label="신용카드"
                  selected={otherMethod === 'card'}
                  onClick={() => onOtherMethodChange('card')}
                />
                <PaymentMethodButton
                  type="text"
                  label="휴대폰"
                  selected={otherMethod === 'phone'}
                  onClick={() => onOtherMethodChange('phone')}
                />
              </div>
              <div className="flex gap-x-2">
                <PaymentMethodButton
                  type="logo-image"
                  logo="toss-pay"
                  label="토스페이"
                  showBenefitBadge
                  selected={otherMethod === 'tosspay'}
                  onClick={() => onOtherMethodChange('tosspay')}
                />
                <PaymentMethodButton
                  type="logo"
                  logo="kakao-pay"
                  label="카카오페이"
                  selected={otherMethod === 'kakaopay'}
                  onClick={() => onOtherMethodChange('kakaopay')}
                />
              </div>
              <div className="flex gap-x-2">
                <PaymentMethodButton
                  type="logo"
                  logo="payco"
                  label="페이코"
                  selected={otherMethod === 'payco'}
                  onClick={() => onOtherMethodChange('payco')}
                />
              </div>
            </div>

            {otherMethod === 'card' ? (
              <>
                <hr className="border-border" />
                {/* `Dropdown` variant="box" 는 rounded-sm(4px) 이 자체 클래스에 박혀있는데
                    Figma 실측(node 666-23365)은 radius/l(12px) — `rounded-lg!` 로 확실히
                    덮어쓴다(className 병합 순서에 기대지 않는 안전한 방법). `min-h-12` 는
                    이전 라운드에 요청받은 높이 보정, 그대로 유지. */}
                <Dropdown
                  label="카드사"
                  variant="box"
                  block
                  placeholder="카드를 선택해 주세요"
                  options={CARD_ISSUER_OPTIONS}
                  value={cardIssuer}
                  onChange={onCardIssuerChange}
                  className="min-h-12 rounded-lg!"
                />
              </>
            ) : null}
          </div>
        ) : null}

        <hr className="border-border" />

        {/* Figma node 666-23367: 바깥은 gap/s(12px)+px-4 만 있고 자체 세로 여백은 없다 —
            앞 구분선이 여백을 대신한다. 안쪽은 제목↔안내 사이 gap/xs(8px). */}
        <div className="flex flex-col gap-3 px-4 pt-3">
          <div className="flex flex-col gap-2">
            <p className="text-label-m text-fg-secondary">무이자 혜택</p>
            <PaymentBenefitNotice
              title="토스페이"
              bullets={['컬리 회원 중 300명 추첨 제공', '토스ID 당 1회 혜택 적용 - 9/1 ~ 9/30']}
            />
          </div>
        </div>
      </div>

      {/* node 666-24169. 불릿 아이콘은 Figma 실측 지름 3px 원이라 우리 아이콘 세트로는
          재현이 안 돼(다른 안내 모달들과 동일 사유) "·" 문자로 대신한다. */}
      <Modal
        open={chargeInfoOpen}
        onClose={() => setChargeInfoOpen(false)}
        title="컬리캐시 충전결제란?"
        footer={
          <Button variant="black" onClick={() => setChargeInfoOpen(false)}>
            확인
          </Button>
        }
      >
        <ul className="flex flex-col gap-2">
          <li className="text-body-s text-fg-secondary flex gap-1">
            <span aria-hidden className="text-fg-tertiary shrink-0">
              ·
            </span>
            {/* Figma 원문 "컬계좌로..." 는 "컬리"+"계좌로" 가 겹친 오탈자로 보여 바로잡았다. */}
            계좌로 캐시를 충전해 사용하는 결제수단이에요. 만원 단위로 충전할 수 있어요.
          </li>
          <li className="text-body-s text-fg-secondary flex gap-1">
            <span aria-hidden className="text-fg-tertiary shrink-0">
              ·
            </span>
            충전결제로 결제 시, 배송완료 8일 후 결제 금액의 1%가 컬리캐시로 적립돼요. (유효기간
            6개월 / 적립된 캐시는 인출 불가)
          </li>
          <li className="text-body-s text-fg-secondary flex gap-1">
            <span aria-hidden className="text-fg-tertiary shrink-0">
              ·
            </span>
            <span>
              [추가 이벤트]
              <br />
              충전결제(케이뱅크)로 결제 시, 익월 15일에 결제 금액의 3%가 적립금으로 추가 지급돼요.
              (건당 최대 3천원 / 월 최대 1만원 / 유효기간 2개월)
            </span>
          </li>
        </ul>
      </Modal>
    </div>
  );
}

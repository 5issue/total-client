'use client';

import type { ReactNode } from 'react';

import { Icon } from '@/components/atoms/Icon';
import { Logo } from '@/components/atoms/Logo/Logo';
import { Radio } from '@/components/atoms/Radio';
import { PaymentBenefitNotice } from '@/components/molecules/checkout/PaymentBenefitNotice';
import { PaymentMethodButton } from '@/components/molecules/checkout/PaymentMethodButton';
import { Dropdown } from '@/components/molecules/shared/Dropdown';
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
  /** 미선택 초기 상태가 있다(Figma 데모 스크린샷은 "다른 결제수단"이 이미 선택된 상태를
   * 보여줄 뿐, 실제 기본값은 아니다 — 2026-09-11 확인). */
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
}: {
  value: PaymentMethodId;
  /** 접근 가능한 이름(sr-only) — 행의 시각 콘텐츠(뱃지 포함)는 `children` 이 대신 그린다. */
  label: string;
  checked: boolean;
  onSelect: () => void;
  /** 아직 미제공 수단(예: 네이버페이) — 선택 불가, `CartLineItem` 품절과 같은 흐림 처리. */
  disabled?: boolean;
  children: ReactNode;
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
      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        className="flex min-w-0 flex-1 items-center justify-between gap-1 text-left disabled:pointer-events-none"
      >
        {children}
      </button>
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
  return (
    <div className={['flex flex-col pb-5', className].filter(Boolean).join(' ')}>
      <p className="text-heading-4 text-fg p-4">결제수단</p>

      <div className="flex flex-col">
        <OptionRow
          value="charge"
          label="컬리캐시 충전결제"
          checked={method === 'charge'}
          onSelect={() => onMethodChange('charge')}
        >
          <span className="flex items-center gap-1">
            <span className="text-heading-4 text-fg">컬리캐시 충전결제</span>
            <StatusLabel type="kbank">케이뱅크 충전결제 3% 추가적립</StatusLabel>
          </span>
          {/* Figma imgGroup23 실측: 원+"i" 형태(정보) — 물음표(help)가 아니다. */}
          <Icon name="info-line" size={20} aria-hidden />
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
          <span className="flex items-center gap-1.5">
            <Logo name="kurly-pay" height={20} aria-hidden />
            <span className="text-caption-m text-fg-tertiary">계좌카드</span>
          </span>
          <RewardsTag />
        </OptionRow>

        <hr className="border-border" />

        <OptionRow
          value="naverpay"
          label="네이버페이 — 이용 불가"
          checked={method === 'naverpay'}
          onSelect={() => onMethodChange('naverpay')}
          disabled
        >
          <Logo name="naver-pay" height={20} aria-hidden />
          <RewardsTag />
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
          </span>
          <RewardsTag />
        </OptionRow>

        {method === 'other' ? (
          // Figma node 666-23344(666-23354): 버튼그리드↔구분선↔드롭다운 사이는 gap/xs(8px) —
          // 버튼 "행"간 gap/s(12px, 아래 gap-y-3)와는 다른 레벨이라 헷갈리기 쉽다.
          <div className="flex flex-col gap-2 px-4 pb-6">
            {/* Figma 666-22997: 버튼 그리드는 행간 gap/s(12px) · 열간 gap/xs(8px) 로 서로
                다르다 — 한 `gap` 값으로 합치면 행간이 실측보다 좁아진다. */}
            <div className="flex flex-wrap gap-x-2 gap-y-3">
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
              <PaymentMethodButton
                type="logo"
                logo="payco"
                label="페이코"
                selected={otherMethod === 'payco'}
                onClick={() => onOtherMethodChange('payco')}
              />
            </div>

            {otherMethod === 'card' ? (
              <>
                <hr className="border-border" />
                <Dropdown
                  label="카드사"
                  variant="box"
                  block
                  placeholder="카드를 선택해 주세요"
                  options={CARD_ISSUER_OPTIONS}
                  value={cardIssuer}
                  onChange={onCardIssuerChange}
                />
              </>
            ) : null}
          </div>
        ) : null}

        <hr className="border-border" />

        {/* Figma node 666-23367: 바깥은 gap/s(12px)+px-4 만 있고 자체 세로 여백은 없다 —
            앞 구분선이 여백을 대신한다. 안쪽은 제목↔안내 사이 gap/xs(8px). */}
        <div className="flex flex-col gap-3 px-4">
          <div className="flex flex-col gap-2">
            <p className="text-label-m text-fg-secondary">무이자 혜택</p>
            <PaymentBenefitNotice
              title="토스페이"
              bullets={[
                '토스페이 1만원 이상 결제 시, 1만원 토스포인트 추첨 적립',
                '컬리 회원 중 300명 추첨 제공',
                '토스ID 당 1회 혜택 적용 - 9/1 ~ 9/30',
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

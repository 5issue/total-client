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
 * 펼쳐진다 — 신용카드/휴대폰/토스페이/카카오페이/PAYCO. 신용카드를 고르면 할부 드롭다운이 더
 * 나온다(Figma 원본 드롭다운 placeholder 텍스트 "상품불량"은 다른 컴포넌트에서 복사된 것으로
 * 보여 할부 선택으로 대체 — Figma 코멘트로 확인 예정, PR #82 참고).
 *
 * 컬리캐시 충전결제의 케이뱅크 그라디언트 뱃지·리스트 각 행의 "혜택" 태그·배송지의
 * "기본배송지" 필은 전부 `StatusLabel`(kbank/rewards/defaultAddress) 재사용 — 새로 안 만든다.
 */
export interface PaymentMethodAccordionProps {
  method: PaymentMethodId;
  onMethodChange: (method: PaymentMethodId) => void;
  otherMethod: OtherPaymentMethodId;
  onOtherMethodChange: (method: OtherPaymentMethodId) => void;
  installment: string;
  onInstallmentChange: (value: string) => void;
  className?: string;
}

const INSTALLMENT_OPTIONS = [
  { value: 'lump', label: '일시불' },
  { value: '2', label: '2개월 무이자' },
  { value: '3', label: '3개월 무이자' },
  { value: '6', label: '6개월' },
];

function RewardsTag() {
  return <StatusLabel type="rewards">혜택</StatusLabel>;
}

function OptionRow({
  value,
  label,
  checked,
  onSelect,
  children,
}: {
  value: PaymentMethodId;
  /** 접근 가능한 이름(sr-only) — 행의 시각 콘텐츠(뱃지 포함)는 `children` 이 대신 그린다. */
  label: string;
  checked: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full items-center gap-1 px-4 py-2">
      <Radio
        name="payment-method"
        value={value}
        label={label}
        tone="black"
        checked={checked}
        onChange={onSelect}
      />
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center justify-between gap-1 text-left"
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
  installment,
  onInstallmentChange,
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
          <Icon name="help-circle" size={20} aria-hidden />
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
          label="네이버페이"
          checked={method === 'naverpay'}
          onSelect={() => onMethodChange('naverpay')}
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
          <div className="flex flex-col gap-3 px-4 pb-6">
            <div className="flex flex-wrap gap-2">
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
                  label="할부 개월 수"
                  variant="box"
                  block
                  options={INSTALLMENT_OPTIONS}
                  value={installment}
                  onChange={onInstallmentChange}
                />
              </>
            ) : null}
          </div>
        ) : null}

        <hr className="border-border" />

        <div className="flex flex-col gap-2 px-4 pt-3">
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
  );
}

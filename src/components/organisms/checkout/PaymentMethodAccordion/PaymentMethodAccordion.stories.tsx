import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import type { OtherPaymentMethodId, PaymentMethodId } from '@/components/organisms/checkout/model';

import { PaymentMethodAccordion } from './PaymentMethodAccordion';

const meta = {
  title: 'organisms/checkout/PaymentMethodAccordion',
  component: PaymentMethodAccordion,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  // 아래 스토리는 전부 `render` 로 상태를 직접 갖는 컨트롤드 래퍼를 그린다 — 이 args 는
  // Story 타입이 요구하는 자리채움일 뿐 실제로 쓰이지 않는다.
  args: {
    method: 'other',
    onMethodChange: fn(),
    otherMethod: 'card',
    onOtherMethodChange: fn(),
    cardIssuer: null,
    onCardIssuerChange: fn(),
  },
} satisfies Meta<typeof PaymentMethodAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled({ initialMethod = 'other' as PaymentMethodId }) {
  const [method, setMethod] = useState<PaymentMethodId>(initialMethod);
  const [otherMethod, setOtherMethod] = useState<OtherPaymentMethodId>('card');
  const [cardIssuer, setCardIssuer] = useState<string | null>(null);

  return (
    <div className="w-mobile-frame bg-surface">
      <PaymentMethodAccordion
        method={method}
        onMethodChange={setMethod}
        otherMethod={otherMethod}
        onOtherMethodChange={setOtherMethod}
        cardIssuer={cardIssuer}
        onCardIssuerChange={setCardIssuer}
      />
    </div>
  );
}

/** 기본 — "다른 결제수단" 펼침 + 신용카드 선택(카드사 드롭다운 노출). Figma 666-23284. */
export const Default: Story = {
  render: () => <Controlled />,
};

/** 컬리캐시 충전결제 선택 — 케이뱅크 혜택 안내 박스 노출. */
export const ChargeSelected: Story = {
  render: () => <Controlled initialMethod="charge" />,
};

/** 접힘 — Kurly Pay 선택, "다른 결제수단" 펼침 없음. */
export const Collapsed: Story = {
  render: () => <Controlled initialMethod="kurlypay" />,
};

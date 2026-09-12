import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import type { OtherPaymentMethodId, PaymentMethodId } from '@/components/organisms/checkout/model';

import { PaymentMethodAccordion } from './PaymentMethodAccordion';

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

const meta = {
  title: 'organisms/checkout/PaymentMethodAccordion',
  component: PaymentMethodAccordion,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  // `render` 가 상태를 직접 갖는 컨트롤드 래퍼를 그린다 — `method` 만 Controlled 의
  // 초기값으로 실제 연결되고(컨트롤로 조작 가능), 나머지 args 는 Story 타입이 요구하는
  // 자리채움(컴포넌트 내부 상태로 바뀌어 실제로는 쓰이지 않는다 — 코드리뷰 지적으로
  // argTypes 를 추가하며 `method` 만이라도 실제 컨트롤에 연결).
  args: {
    method: 'other',
    onMethodChange: fn(),
    otherMethod: 'card',
    onOtherMethodChange: fn(),
    cardIssuer: null,
    onCardIssuerChange: fn(),
  },
  argTypes: {
    method: {
      control: 'radio',
      options: ['charge', 'kurlypay', 'naverpay', 'other'],
      description: 'Controlled 래퍼의 초기 선택값.',
    },
    onMethodChange: { control: false },
    otherMethod: { control: false },
    onOtherMethodChange: { control: false },
    cardIssuer: { control: false },
    onCardIssuerChange: { control: false },
  },
  render: (args) => <Controlled initialMethod={args.method ?? 'other'} />,
} satisfies Meta<typeof PaymentMethodAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 — "다른 결제수단" 펼침 + 신용카드 선택(카드사 드롭다운 노출). Figma 666-23284. */
export const Default: Story = {};

/** 컬리캐시 충전결제 선택 — 계좌 등록 유도 카드 노출(node 666-23086). */
export const ChargeSelected: Story = {
  args: { method: 'charge' },
};

/** Kurly Pay 선택 — 계좌·카드 등록 유도 카드 노출(node 666-22918), "다른 결제수단" 펼침 없음. */
export const Collapsed: Story = {
  args: { method: 'kurlypay' },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김, 코드리뷰 지적으로 추가) ---

/** 라디오 선택 전환 — Kurly Pay 로 바꾸면 그 라디오만 선택되고 등록 유도 카드가 뜬다. */
export const SwitchesPaymentMethod: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const charge = canvas.getByRole('radio', { name: '컬리캐시 충전결제' });
    const kurlypay = canvas.getByRole('radio', { name: 'Kurly Pay 계좌카드' });

    await expect(kurlypay).not.toBeChecked();
    await userEvent.click(kurlypay);
    await expect(kurlypay).toBeChecked();
    await expect(charge).not.toBeChecked();
    await expect(canvas.getByText('계좌 등록')).toBeInTheDocument();
  },
};

/** 아코디언 펼침 — "다른 결제수단" 선택 시에만 결제수단 버튼 그리드가 나타난다. */
export const ExpandsOtherMethodGrid: Story = {
  tags: ['!autodocs'],
  args: { method: 'kurlypay' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('radio', { name: '신용카드' })).not.toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('radio', { name: '다른 결제수단 — 신용카드, 간편결제, 휴대폰' }),
    );

    await expect(canvas.getByRole('radio', { name: '신용카드' })).toBeInTheDocument();
  },
};

/** 카드사 드롭다운 — 목록에서 고르면 트리거에 선택한 카드사명이 표시된다. */
export const SelectsCardIssuer: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: '카드사' });

    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole('option', { name: '신한' }));
    await expect(trigger).toHaveTextContent('신한');
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { OrderBreakdownRow } from './OrderBreakdownRow';

const meta = {
  title: 'molecules/mypage/OrderBreakdownRow',
  component: OrderBreakdownRow,
  args: {
    label: '쿠폰할인 금액',
    value: '0원',
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-sm p-4">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof OrderBreakdownRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 — 상세 내역 없음(node 848-83792, "배송비" 등). */
export const Default: Story = {};

/** 하위 상세 내역 포함(node 848-83792, "쿠폰할인 금액" → "상품 쿠폰"/"장바구니 쿠폰"). */
export const WithDetails: Story = {
  args: {
    details: [
      { label: '상품 쿠폰', value: '0원' },
      { label: '장바구니 쿠폰', value: '0원' },
    ],
  },
};

/** primary 톤(node 848-83792, "환불 수단"·"환불 차감금액") — 본문 색으로 강조. */
export const PrimaryTone: Story = {
  args: {
    label: '환불 수단',
    value: '토스페이',
    tone: 'primary',
  },
};

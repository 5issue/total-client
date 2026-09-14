import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CartQuantityRow, type CartQuantityRowProps } from './CartQuantityRow';

const meta = {
  title: 'molecules/product/CartQuantityRow',
  component: CartQuantityRow,
  tags: ['autodocs'],
  args: {
    badgeLabel: '컬리멤버스',
    name: '[풀무원] 고소한 유기농 순두부 (2개입)',
    priceLabel: '2,520원',
    originalPriceLabel: '3,400원',
    unitPriceLabel: '100g 당 360원',
    quantity: 0,
    onQuantityChange: () => {},
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CartQuantityRow>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled(props: CartQuantityRowProps) {
  const [quantity, setQuantity] = useState(props.quantity);
  return <CartQuantityRow {...props} quantity={quantity} onQuantityChange={setQuantity} />;
}

/** 기본 — 멤버스 뱃지 + 할인가 (node 2461:7212). */
export const Default: Story = {
  render: (args) => <Controlled {...args} />,
};

/** 뱃지/할인 없는 최소 구성. */
export const Minimal: Story = {
  name: '최소 구성(뱃지·할인 없음)',
  args: { badgeLabel: undefined, originalPriceLabel: undefined },
  render: (args) => <Controlled {...args} />,
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const IncreaseQuantity: Story = {
  tags: ['!autodocs'],
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /수량 증가/ }));
    await expect(canvas.getByText('1')).toBeInTheDocument();
  },
};

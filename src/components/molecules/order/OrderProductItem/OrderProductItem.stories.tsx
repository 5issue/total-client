import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { OrderProductItem } from './OrderProductItem';

const meta = {
  title: 'molecules/order/OrderProductItem',
  component: OrderProductItem,
  tags: ['autodocs'],
  args: {
    deliveryType: '샛별배송',
    name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
    price: 2780,
    originalPrice: 3400,
    quantity: 1,
    imageSrc: '/orders/yonsei-milk-900ml.png',
    onAddToCart: fn(),
  },
  argTypes: {
    onAddToCart: { control: false },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof OrderProductItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma 주문 내역 상품 행(node 771-106840). */
export const Default: Story = {};

export const AddsToCart: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: `${args.name} 장바구니 담기` }));
    await expect(args.onAddToCart).toHaveBeenCalledOnce();
  },
};

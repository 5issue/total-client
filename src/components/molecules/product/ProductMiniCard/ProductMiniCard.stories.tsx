import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ProductMiniCard } from './ProductMiniCard';

const meta = {
  title: 'molecules/product/ProductMiniCard',
  component: ProductMiniCard,
  tags: ['autodocs'],
  args: {
    imageSrc: '/graphic-icons/price-drop.webp',
    name: '바로먹는 아보카도 3입 (페루산)',
    priceLabel: '8,990원~',
    discountLabel: '35%',
    originalPriceLabel: '13,900원',
    onAddToCart: fn(),
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProductMiniCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutDiscount: Story = {
  name: '할인 없음',
  args: { discountLabel: undefined, originalPriceLabel: undefined },
};

export const ClickAddToCart: Story = {
  name: '담기 클릭 시 핸들러 호출',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /장바구니 담기/ }));
    await expect(args.onAddToCart).toHaveBeenCalledTimes(1);
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ProductCard } from './ProductCard';

const meta = {
  title: 'molecules/product/ProductCard',
  component: ProductCard,
  tags: ['autodocs'],
  args: {
    imageAlt: '',
    deliveryLabel: '샛별배송',
    name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
    originalPriceLabel: '3,400',
    discountLabel: '25%',
    priceLabel: '2,780원~',
    reviewCountLabel: '9,999+',
    couponPercentLabel: '+25%',
    kurlyOnly: true,
    onAddToCart: fn(),
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 — 쿠폰 배지 + Kurly Only 태그 (node 577:20684). */
export const Default: Story = {};

/** 할인/쿠폰/Kurly Only 모두 없는 최소 구성. */
export const Minimal: Story = {
  name: '최소 구성(할인·쿠폰·Kurly Only 없음)',
  args: {
    originalPriceLabel: undefined,
    discountLabel: undefined,
    couponPercentLabel: undefined,
    kurlyOnly: false,
    name: '[동원] 고추참치 85g x 8캔',
    priceLabel: '13,510원',
  },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const ClickAddToCart: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /장바구니 담기/ }));
    await expect(args.onAddToCart).toHaveBeenCalledTimes(1);
  },
};

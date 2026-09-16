import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { SearchResultProductCard } from './SearchResultProductCard';

const meta = {
  title: 'molecules/product/SearchResultProductCard',
  component: SearchResultProductCard,
  tags: ['autodocs'],
  args: {
    imageSrc: '/placeholders/product-thumbnail.webp',
    name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
    price: 2780,
    originalPrice: 3400,
    discountRate: 25,
    reviewCount: 9999,
    deliveryType: '샛별배송',
    couponBadgeLabel: '+25%쿠폰',
    kurlyOnly: true,
    onAddToCart: fn(),
  },
  argTypes: {
    price: { control: 'number' },
    originalPrice: { control: 'number' },
    discountRate: { control: 'number' },
    reviewCount: { control: 'number' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    // 검색 결과 카드는 w-full(그리드 셀 폭에 맞춤) — 실사용처(ProductGrid 2열 셀)와
    // 비슷한 폭으로 프리뷰하기 위해 고정폭 컨테이너로 감싼다.
    (Story) => (
      <div className="w-45">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchResultProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 할인·쿠폰·Kurly Only 뱃지가 전부 없는 일반 상품(Figma node 882-60590 계열). */
export const WithoutDiscount: Story = {
  name: '할인/쿠폰 없음',
  args: {
    price: 4990,
    originalPrice: null,
    discountRate: null,
    couponBadgeLabel: null,
    kurlyOnly: false,
  },
};

export const ClickAddToCart: Story = {
  name: '담기 버튼 클릭 시 핸들러 호출',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /장바구니 담기/ }));
    await expect(args.onAddToCart).toHaveBeenCalledTimes(1);
  },
};

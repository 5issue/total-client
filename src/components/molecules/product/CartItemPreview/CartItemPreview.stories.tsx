import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { CartItemPreview } from './CartItemPreview';

const meta = {
  title: 'molecules/product/CartItemPreview',
  component: CartItemPreview,
  tags: ['autodocs'],
  args: {
    imageAlt: '',
    name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
    tagline: '가격, 퀄리티 모두 만족스러운 1A등급 우유',
  },
  argTypes: {
    className: { control: false },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CartItemPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 — 이미지 없이 회색 박스 (node 2888:2661). */
export const Default: Story = {};

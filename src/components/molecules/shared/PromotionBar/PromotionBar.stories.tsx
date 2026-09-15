import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { PromotionBar } from './PromotionBar';

const meta = {
  title: 'molecules/shared/PromotionBar',
  component: PromotionBar,
  tags: ['autodocs'],
  args: {
    text: '첫 구매니까, 하나만 사도 ',
    emphasisText: '무료배송',
  },
  argTypes: {
    className: { control: false },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PromotionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 — 무료배송 고지 (node 2429:2588). */
export const Default: Story = {};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { QuickMenu } from './QuickMenu';

const meta = {
  title: 'molecules/home/QuickMenu',
  component: QuickMenu,
  tags: ['autodocs'],
  args: {
    icon: 'coupon',
    label: '쿠폰',
    onClick: fn(),
  },
} satisfies Meta<typeof QuickMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCount: Story = {
  name: '숫자 카운트 포함',
  args: { count: 3 },
};

export const ClickInteraction: Story = {
  name: '클릭 시 핸들러 호출',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '쿠폰' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { QuickMenuItem, type QuickMenuItemIconName } from './QuickMenuItem';

const ICON_NAMES: QuickMenuItemIconName[] = [
  'badge-discount',
  'category-fashion',
  'category-recipe',
  'clover-benefit',
  'coupon-discount',
  'coupon-special',
  'event-attendance',
  'event-calendar',
  'event-default',
  'event-point',
  'gift-lucky',
  'kurly-only',
  'point-rewards',
  'price-drop',
];

const meta = {
  title: 'molecules/home/QuickMenuItem',
  component: QuickMenuItem,
  tags: ['autodocs'],
  args: {
    icon: 'coupon-discount',
    label: '첫구매혜택',
    onClick: fn(),
  },
  argTypes: {
    icon: {
      control: 'select',
      options: ICON_NAMES,
    },
  },
} satisfies Meta<typeof QuickMenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const New: Story = {
  name: '신규(N) 배지 포함',
  args: { isNew: true },
};

export const ClickInteraction: Story = {
  name: '클릭 시 핸들러 호출',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '첫구매혜택' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

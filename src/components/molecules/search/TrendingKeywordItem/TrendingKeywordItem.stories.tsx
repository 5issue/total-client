import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { TrendingKeywordItem } from './TrendingKeywordItem';

const meta = {
  title: 'molecules/search/TrendingKeywordItem',
  component: TrendingKeywordItem,
  tags: ['autodocs'],
  args: {
    rank: 1,
    keyword: '원피스',
    onClick: fn(),
  },
} satisfies Meta<typeof TrendingKeywordItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ClickInteraction: Story = {
  name: '클릭 시 핸들러 호출',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /원피스/ }));
    await expect(args.onClick).toHaveBeenCalledWith('원피스');
  },
};

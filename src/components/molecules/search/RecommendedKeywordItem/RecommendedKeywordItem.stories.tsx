import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { RecommendedKeywordItem } from './RecommendedKeywordItem';

const meta = {
  title: 'molecules/search/RecommendedKeywordItem',
  component: RecommendedKeywordItem,
  tags: ['autodocs'],
  args: {
    keyword: '신상 밀키트',
    imageSrc: '/recommended-keywords/kit.png',
    onClick: fn(),
  },
} satisfies Meta<typeof RecommendedKeywordItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ClickInteraction: Story = {
  name: '클릭 시 핸들러 호출',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '신상 밀키트' }));
    await expect(args.onClick).toHaveBeenCalledWith('신상 밀키트');
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CategoryTabs } from './CategoryTabs';

const meta = {
  title: 'organisms/home/CategoryTabs',
  component: CategoryTabs,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CategoryTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 — "추천" 활성, 15개 카테고리 가로 스크롤 (node 577:20633). */
export const Default: Story = {};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

/** 클릭한 탭이 활성으로 전환된다. 방향키 이동·roving tabIndex 는 TabBar 에서 검증. */
export const ClickChangesActiveTab: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const best = canvas.getByRole('tab', { name: '베스트' });
    await userEvent.click(best);
    await expect(best).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tab', { name: '추천' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  },
};

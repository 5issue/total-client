import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { LoadingIndicator } from './LoadingIndicator';

const meta = {
  title: 'atoms/LoadingIndicator',
  component: LoadingIndicator,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof LoadingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma "5팀 UI 공유용" node 665-60896 "LoadingDots" — 점 3개가 순서대로 떠오른다. */
export const Default: Story = {};

// --- 인터랙션/접근성 테스트 전용 (autodocs 에서 숨김) ---

export const HasStatusRole: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const status = within(canvasElement).getByRole('status');
    await expect(status).toHaveTextContent('불러오는 중');
  },
};

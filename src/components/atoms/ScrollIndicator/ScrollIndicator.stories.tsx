import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { ScrollIndicator } from './ScrollIndicator';

const meta = {
  title: 'atoms/ScrollIndicator',
  component: ScrollIndicator,
  args: {
    position: 'left',
    'aria-label': '카테고리 탭 가로 스크롤 위치',
  },
  argTypes: {
    position: { control: 'select', options: ['left', 'center', 'right'] },
  },
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof ScrollIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Center: Story = {
  args: { position: 'center' },
};

export const Right: Story = {
  args: { position: 'right' },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const HasAccessibleLabel: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('img', { name: '카테고리 탭 가로 스크롤 위치' }),
    ).toBeInTheDocument();
  },
};

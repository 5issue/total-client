import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { PageIndicator } from './PageIndicator';

const meta = {
  title: 'atoms/PageIndicator',
  component: PageIndicator,
  args: {
    count: 3,
    activeIndex: 0,
    'aria-label': '배너 3개 중 1번째',
  },
  argTypes: {
    tone: { control: 'select', options: ['black', 'purple'] },
  },
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof PageIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SecondActive: Story = {
  args: { activeIndex: 1, 'aria-label': '배너 3개 중 2번째' },
};

/** Figma purple 예시(2428:1858)는 항상 점 2개뿐이다(black 은 3개). */
export const PurpleTone: Story = {
  args: { tone: 'purple', count: 2, activeIndex: 1, 'aria-label': '배너 2개 중 2번째' },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const HasAccessibleGroup: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('group', { name: '배너 3개 중 1번째' }),
    ).toBeInTheDocument();
  },
};

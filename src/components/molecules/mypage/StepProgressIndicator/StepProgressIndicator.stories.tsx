import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { StepProgressIndicator } from './StepProgressIndicator';

const meta = {
  title: 'molecules/mypage/StepProgressIndicator',
  component: StepProgressIndicator,
  args: {
    steps: ['반품접수', '택배회수', '상품검수', '반품완료'],
    activeIndex: 0,
  },
  argTypes: {
    activeIndex: { control: 'number' },
    steps: { control: false },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-sm p-4">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof StepProgressIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 반품 4단계 — 1단계(반품접수) 활성. */
export const ReturnFourSteps: Story = {};

/** 취소 2단계 — 1단계(취소접수) 활성. */
export const CancelTwoSteps: Story = {
  args: { steps: ['취소접수', '취소완료'], activeIndex: 0 },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const HighlightsActiveStepOnly: Story = {
  tags: ['!autodocs'],
  args: { steps: ['반품접수', '택배회수', '상품검수', '반품완료'], activeIndex: 1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const active = canvas.getByText('택배회수');
    const inactive = canvas.getByText('반품접수');
    await expect(active).toHaveClass('text-primary');
    await expect(inactive).not.toHaveClass('text-primary');
  },
};

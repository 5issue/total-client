import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { Indicator } from './Indicator';

const meta = {
  title: 'atoms/Indicator',
  component: Indicator,
  args: {
    steps: ['반품접수', '택배회수', '상품검수', '반품완료'],
    current: 0,
    'aria-label': '반품 진행 상태',
  },
  argTypes: {
    current: { control: { type: 'number', min: 0 } },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Indicator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma "Segment=4" — 4단계, 첫 단계 활성. 기본 상태. */
export const Default: Story = {};

/** Figma "Segment=3" */
export const ThreeSteps: Story = {
  args: { steps: ['반품접수', '상품검수', '반품완료'], current: 0 },
};

/** Figma "Segment=2" */
export const TwoSteps: Story = {
  args: { steps: ['반품접수', '반품완료'], current: 0 },
};

/** current 를 옮기면 해당 단계가 활성으로 표시된다. */
export const MidProgress: Story = {
  args: { current: 2 },
};

export const LastStep: Story = {
  args: { current: 3 },
};

/** steps 가 비면 아무것도 렌더하지 않는다(빈 `<ol>`). */
export const Empty: Story = {
  args: { steps: [], current: 0 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryAllByRole('listitem')).toHaveLength(0);
  },
};

// --- 인터랙션/접근성 테스트 전용 (autodocs 에서 숨김) ---

export const ActiveStepIsMarked: Story = {
  tags: ['!autodocs'],
  args: { current: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = canvas.getAllByRole('listitem');
    await expect(items).toHaveLength(4);
    await expect(items[2]).toHaveAttribute('aria-current', 'step');
    await expect(items[0]).not.toHaveAttribute('aria-current');
  },
};

export const HasAccessibleLabel: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('list', { name: '반품 진행 상태' }),
    ).toBeInTheDocument();
  },
};

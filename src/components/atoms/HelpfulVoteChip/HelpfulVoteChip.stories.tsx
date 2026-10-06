import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { HelpfulVoteChip } from './HelpfulVoteChip';

const meta = {
  title: 'atoms/HelpfulVoteChip',
  component: HelpfulVoteChip,
  tags: ['autodocs'],
  args: {
    count: 2,
    selected: false,
    onClick: fn(),
  },
  argTypes: {
    selected: { control: 'boolean' },
    count: { control: 'number' },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof HelpfulVoteChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const ClickFiresOnClick: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const chip = within(canvasElement).getByRole('button');
    await userEvent.click(chip);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

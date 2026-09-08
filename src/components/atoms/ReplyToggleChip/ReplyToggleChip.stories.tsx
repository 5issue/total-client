import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ReplyToggleChip } from './ReplyToggleChip';

const meta = {
  title: 'atoms/ReplyToggleChip',
  component: ReplyToggleChip,
  tags: ['autodocs'],
  args: {
    selected: false,
    onClick: fn(),
  },
  argTypes: {
    selected: { control: 'boolean' },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ReplyToggleChip>;

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

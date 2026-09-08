import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ShortcutChip } from './ShortcutChip';

const meta = {
  title: 'atoms/ShortcutChip',
  component: ShortcutChip,
  tags: ['autodocs'],
  args: {
    children: '바로가기',
    onClick: fn(),
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ShortcutChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const ClickFiresOnClick: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const chip = within(canvasElement).getByRole('button');
    await userEvent.click(chip);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

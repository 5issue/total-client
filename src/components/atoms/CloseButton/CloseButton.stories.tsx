import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { CloseButton } from './CloseButton';

const meta = {
  title: 'atoms/CloseButton',
  component: CloseButton,
  tags: ['autodocs'],
  args: {
    onClick: fn(),
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CloseButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const ClickFiresOnClick: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { KeywordChip } from './KeywordChip';

const meta = {
  title: 'atoms/KeywordChip',
  component: KeywordChip,
  tags: ['autodocs'],
  args: {
    label: '순두부양념',
    active: false,
    onClick: fn(),
  },
} satisfies Meta<typeof KeywordChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Active: Story = {
  args: { label: '연관', active: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const List: Story = {
  name: '목록 (가로 스크롤)',
  render: () => (
    <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
      <KeywordChip label="순두부양념" />
      <KeywordChip label="연관" active />
    </div>
  ),
};

export const ClickInteraction: Story = {
  name: '클릭 시 onClick 호출',
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('button', { name: '순두부양념' });
    await userEvent.click(chip);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

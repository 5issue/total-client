import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KeywordChip } from './KeywordChip';

const meta = {
  title: 'atoms/KeywordChip',
  component: KeywordChip,
  tags: ['autodocs'],
  args: {
    label: '순두부양념',
    active: false,
  },
} satisfies Meta<typeof KeywordChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Active: Story = {
  args: { label: '연관', active: true },
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

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { TabItem } from './TabItem';

const meta = {
  title: 'atoms/TabItem',
  component: TabItem,
  tags: ['autodocs'],
  args: {
    label: '상품설명',
    active: false,
  },
} satisfies Meta<typeof TabItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Active: Story = {
  args: { active: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AllStates: Story = {
  name: '전체 상태 (default / active / disabled)',
  render: () => (
    <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #DDE4ED' }}>
      <TabItem label="상품설명" />
      <TabItem label="상세정보" active />
      <TabItem label="후기 30,042" disabled />
    </div>
  ),
};

export const Tones: Story = {
  name: 'tone 별 active 색 (brand-secondary / black / brand-primary)',
  render: () => (
    <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #DDE4ED' }}>
      <TabItem label="상품설명" active tone="brand-secondary" />
      <TabItem label="카테고리" active tone="black" />
      <TabItem label="추천" active tone="brand-primary" size="sm" />
    </div>
  ),
};

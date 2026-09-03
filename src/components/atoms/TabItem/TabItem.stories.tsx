import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { TabItem } from './TabItem';

const meta = {
  title: 'atoms/TabItem',
  component: TabItem,
  tags: ['autodocs'],
  args: {
    label: '상품설명',
    active: false,
    onClick: fn(),
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['brand-secondary', 'brand-primary', 'black'],
    },
    size: {
      control: 'select',
      options: ['sm', 'lg'],
    },
  },
  // TabItem 은 role="tab" 을 렌더한다 — tablist 부모 없이 단독 렌더되면
  // aria-required-parent 위반이라 모든 스토리를 tablist 로 감싼다.
  decorators: [
    (Story) => (
      <div role="tablist">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TabItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Active: Story = {
  args: { active: true },
};

export const AllStates: Story = {
  name: '전체 상태 (default / active)',
  render: () => (
    <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--color-border)' }}>
      <TabItem label="상품설명" />
      <TabItem label="상세정보" active />
      <TabItem label="후기 30,042" />
    </div>
  ),
};

export const Tones: Story = {
  name: 'tone 별 active 색 (brand-secondary / black / brand-primary)',
  render: () => (
    <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--color-border)' }}>
      <TabItem label="상품설명" active tone="brand-secondary" />
      <TabItem label="카테고리" active tone="black" />
      <TabItem label="추천" active tone="brand-primary" size="sm" />
    </div>
  ),
};

export const ClickInteraction: Story = {
  name: '클릭 시 onClick 호출',
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const tab = canvas.getByRole('tab', { name: '상품설명' });
    await userEvent.click(tab);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { TabBar, type TabBarItem } from './TabBar';

const PRODUCT_TABS = [
  { id: 'description', label: '상품설명' },
  { id: 'detail', label: '상세정보' },
  { id: 'review', label: '후기 30,042' },
  { id: 'qna', label: '문의' },
] as const satisfies readonly [TabBarItem, ...TabBarItem[]];

const MYPAGE_TABS = [
  { id: 'fridge', label: 'MY 냉장고' },
  { id: 'recipe', label: 'MY 레시피' },
] as const satisfies readonly [TabBarItem, ...TabBarItem[]];

const DISABLED_TABS = [
  { id: 'description', label: '상품설명' },
  { id: 'detail', label: '상세정보', disabled: true },
  { id: 'review', label: '후기 30,042' },
] as const satisfies readonly [TabBarItem, ...TabBarItem[]];

const meta = {
  title: 'molecules/shared/TabBar',
  component: TabBar,
  tags: ['autodocs'],
  args: {
    items: [...PRODUCT_TABS],
    activeId: PRODUCT_TABS[0].id,
    onChange: () => {},
  },
  argTypes: {
    fitted: { control: 'boolean' },
    tone: {
      control: 'select',
      options: ['brand-secondary', 'brand-primary', 'black'],
    },
    size: {
      control: 'select',
      options: ['sm', 'lg'],
    },
  },
} satisfies Meta<typeof TabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledTabBar({
  items,
  fitted,
}: {
  items: readonly [TabBarItem, ...TabBarItem[]];
  fitted?: boolean;
}) {
  const [activeId, setActiveId] = useState(items[0].id);
  return <TabBar items={[...items]} activeId={activeId} onChange={setActiveId} fitted={fitted} />;
}

export const Scroll: Story = {
  name: '자연폭 + 가로 스크롤 (Tab_Bar)',
  render: () => <ControlledTabBar items={PRODUCT_TABS} />,
};

export const Fitted: Story = {
  name: '균등폭 2탭 (Tab_Bar_Ver2)',
  render: () => <ControlledTabBar items={MYPAGE_TABS} fitted />,
};

export const Disabled: Story = {
  name: '비활성 탭 포함',
  render: () => <ControlledTabBar items={DISABLED_TABS} />,
};

export const ClickInteraction: Story = {
  name: '클릭 시 activeId 변경',
  render: () => <ControlledTabBar items={PRODUCT_TABS} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const detailTab = canvas.getByRole('tab', { name: '상세정보' });
    await userEvent.click(detailTab);
    await expect(detailTab).toHaveAttribute('aria-selected', 'true');
  },
};

export const KeyboardNavigation: Story = {
  name: '방향키로 탭 이동 (비활성 탭 건너뜀)',
  render: () => <ControlledTabBar items={DISABLED_TABS} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('tab', { name: '상품설명' });
    first.focus();
    // '상세정보'는 disabled 라 건너뛰고 '후기 30,042'로 이동해야 한다.
    await userEvent.keyboard('{ArrowRight}');
    const review = canvas.getByRole('tab', { name: '후기 30,042' });
    await expect(review).toHaveFocus();
    await expect(review).toHaveAttribute('aria-selected', 'true');
  },
};

import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

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

const meta = {
  title: 'molecules/shared/TabBar',
  component: TabBar,
  tags: ['autodocs'],
  args: {
    items: [...PRODUCT_TABS],
    activeId: PRODUCT_TABS[0].id,
    onChange: () => {},
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

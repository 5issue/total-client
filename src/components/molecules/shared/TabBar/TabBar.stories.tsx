import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { TabBar, type TabBarItem } from './TabBar';

const PRODUCT_TABS = [
  { id: 'description', label: '상품설명' },
  { id: 'detail', label: '상세정보' },
  { id: 'review', label: '후기 30,042' },
  { id: 'description-2', label: '상품설명' },
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

/**
 * 상태별 스토리 규칙(git-convention S2-6)의 예외: TabBar/TabItem 은 disabled 상태를
 * 지원하지 않는다 — Figma "Tab_Bar" 컴포넌트 세트에 disabled variant 가 없어
 * 의도적으로 제거했다(이슈 #37). 그래서 Disabled 스토리가 없다.
 */
export const Scroll: Story = {
  name: '자연폭 + 가로 스크롤 (Tab_Bar)',
  render: () => <ControlledTabBar items={PRODUCT_TABS} />,
};

export const Fitted: Story = {
  name: '균등폭 2탭 (Tab_Bar_Ver2)',
  render: () => <ControlledTabBar items={MYPAGE_TABS} fitted />,
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
  name: '방향키로 탭 이동',
  render: () => <ControlledTabBar items={PRODUCT_TABS} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // PRODUCT_TABS 마지막 탭도 라벨이 '상품설명'이라 이름으로는 모호함 — 탭 순서로 첫 번째를 지정.
    const tabs = canvas.getAllByRole('tab');
    const first = tabs[0];
    if (!first) throw new Error('no tabs rendered');
    first.focus();
    await userEvent.keyboard('{ArrowRight}');
    const detail = canvas.getByRole('tab', { name: '상세정보' });
    await expect(detail).toHaveFocus();
    await expect(detail).toHaveAttribute('aria-selected', 'true');
  },
};

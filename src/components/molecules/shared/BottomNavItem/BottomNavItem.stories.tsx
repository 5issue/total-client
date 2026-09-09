import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { BottomNavItem } from './BottomNavItem';

const meta = {
  title: 'molecules/shared/BottomNavItem',
  component: BottomNavItem,
  tags: ['autodocs'],
  args: {
    tab: 'home',
    label: '홈',
    href: '/',
    active: false,
    badge: false,
  },
  argTypes: {
    tab: {
      control: 'select',
      options: ['home', 'lounge', 'category', 'search', 'my'],
    },
  },
} satisfies Meta<typeof BottomNavItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Active: Story = {
  args: { active: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: '홈' });
    await expect(link).toHaveAttribute('href', '/');
    await expect(link).toHaveAttribute('aria-current', 'page');
  },
};

export const WithBadge: Story = {
  name: '알림 배지 (badge)',
  args: { tab: 'lounge', label: '라운지', href: '/lounge', badge: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: '라운지 (새 알림 있음)' });
    await expect(link).toHaveAttribute('href', '/lounge');
  },
};

export const AllTabs: Story = {
  name: '전체 탭 (Figma 순서: 홈-라운지-카테고리-검색-마이컬리)',
  render: () => (
    <div className="flex gap-2">
      <BottomNavItem tab="home" label="홈" href="/" active />
      <BottomNavItem tab="lounge" label="라운지" href="/lounge" badge />
      <BottomNavItem tab="category" label="카테고리" href="/category" />
      <BottomNavItem tab="search" label="검색" href="/search" />
      <BottomNavItem tab="my" label="마이컬리" href="/mypage" />
    </div>
  ),
};

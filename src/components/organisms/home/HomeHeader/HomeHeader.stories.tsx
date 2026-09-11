import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { HomeHeader } from './HomeHeader';

const meta = {
  title: 'organisms/home/HomeHeader',
  component: HomeHeader,
  tags: ['autodocs'],
  args: {
    cartCount: 4,
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof HomeHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 — 마켓컬리 선택 + 장바구니 뱃지 4 (node 577:20626). */
export const Default: Story = {};

/** 장바구니가 비어 있으면 뱃지를 숨긴다. */
export const EmptyCart: Story = {
  name: '장바구니 비어있음',
  args: { cartCount: 0 },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

/** 서비스 토글 클릭 시 활성 탭이 전환된다. */
export const ServiceToggleInteraction: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const beauty = canvas.getByRole('tab', { name: '뷰티컬리' });
    await userEvent.click(beauty);
    await expect(beauty).toHaveAttribute('aria-selected', 'true');
  },
};

/** 마이컬리/장바구니는 목적지를 서술하는 링크다(code-style §5). */
export const AccountAndCartLinks: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: '마이컬리' })).toHaveAttribute('href', '/mypage');
    await expect(canvas.getByRole('link', { name: '장바구니, 담긴 상품 4개' })).toHaveAttribute(
      'href',
      '/cart',
    );
  },
};

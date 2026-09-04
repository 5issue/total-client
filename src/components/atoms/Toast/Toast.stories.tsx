import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Image from 'next/image';
import { expect, within } from 'storybook/test';

import { Toast } from './Toast';

const meta = {
  title: 'atoms/Toast',
  component: Toast,
  args: {
    children: '최근 3개월간 6,138명이 재구매했어요',
    icon: (
      <Image
        src="/graphic-icons/toast-card.webp"
        alt=""
        width={20}
        height={20}
        className="size-5"
      />
    ),
  },
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Figma "Error Toast"(2949:2915) — 아이콘 없이 카드형, 텍스트는 danger 색. */
export const Error: Story = {
  args: {
    variant: 'error',
    icon: undefined,
    children: '배송 상세정보를 입력해주세요.',
  },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const HasStatusRole: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    // status 는 라이브 리전 role 이라 accessible name 이 아니라 콘텐츠로 스크린리더에 전달된다.
    const status = within(canvasElement).getByRole('status');
    await expect(status).toHaveTextContent('최근 3개월간 6,138명이 재구매했어요');
  },
};

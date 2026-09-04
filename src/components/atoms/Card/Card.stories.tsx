import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Image from 'next/image';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Icon } from '@/components/atoms/Icon/Icon';

import { Card } from './Card';

const meta = {
  title: 'atoms/Card',
  component: Card,
  args: {
    title: '컬리 큐레이터',
    subtitle: '시작하기',
  },
  argTypes: {
    variant: { control: 'select', options: ['surface', 'plain'] },
    icon: { control: false },
    title: { control: false },
    subtitle: { control: false },
  },
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma "Card" — 아이콘+타이틀+CTA, surface 컨테이너. 아이콘은 실제 그래픽 에셋 사용. */
export const Surface: Story = {
  args: {
    icon: (
      <Image
        src="/graphic-icons/event-default.webp"
        alt=""
        width={36}
        height={36}
        className="size-9 shrink-0 rounded-full object-cover"
      />
    ),
  },
};

/** Figma "Promo_Banner" — 배경 없는 텍스트 행. 배지는 Icon 아톰의 `new`(new-14.svg) 재사용. */
export const PromoBanner: Story = {
  args: {
    variant: 'plain',
    title: (
      <>
        친구초대 <Icon name="new" size={14} aria-hidden className="inline align-text-bottom" />
      </>
    ),
    subtitle: <span className="text-primary">친구 찾고 5천원 받기</span>,
  },
};

/** Figma "Menu_Card_Text" — 라벨+값+상태, 배경 없는 텍스트 행. 값/상태는 Neutral/800. */
export const MenuCardText: Story = {
  args: {
    variant: 'plain',
    title: (
      <>
        앱 버전 <span className="text-fg-tertiary">3.80.0</span>
      </>
    ),
    subtitle: <span className="text-fg-tertiary">최신버전</span>,
  },
};

export const Clickable: Story = {
  args: { onClick: fn() },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const ClickFires: Story = {
  tags: ['!autodocs'],
  args: { onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const NonInteractiveHasNoButtonRole: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).queryByRole('button')).not.toBeInTheDocument();
  },
};

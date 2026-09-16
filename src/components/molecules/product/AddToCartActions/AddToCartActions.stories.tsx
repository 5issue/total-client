import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { AddToCartActions } from './AddToCartActions';

const meta = {
  title: 'molecules/product/AddToCartActions',
  component: AddToCartActions,
  tags: ['autodocs'],
  args: {
    promotion: { text: '첫 구매니까, 하나만 사도 ', emphasisText: '무료배송' },
    onToggleLike: fn(),
    onSubscribe: fn(),
    onAddToCart: fn(),
  },
  argTypes: {
    onToggleLike: { control: false },
    onSubscribe: { control: false },
    onAddToCart: { control: false },
    className: { control: false },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof AddToCartActions>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 — 혜택 배너 + 찜/신선구독/장바구니담기 3버튼 (node 2490:1487). */
export const Default: Story = {};

/** 신선구독 불가 상품 — 장바구니 담기 버튼이 전체 폭 (node 2490:1629). */
export const NoSubscribe: Story = {
  name: '신선구독 버튼 없음',
  args: { showSubscribeButton: false, promotion: undefined },
};

/** 혜택 배너 없이 버튼만 (node 2490:1505). */
export const NoPromotion: Story = {
  name: '혜택 배너 없음',
  args: { promotion: undefined },
};

/** 찜한 상태 — 하트 아이콘이 Brand/Medium(#c16edd)로 바뀐다. */
export const Liked: Story = {
  name: '찜한 상태',
  args: { liked: true },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const ToggleLike: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '찜하기' }));
    await expect(args.onToggleLike).toHaveBeenCalledOnce();
  },
};

/** `heart-filled` 아이콘은 SVG 안에 `fill="var(--color-brand-500)"` 가 하드코딩돼
 * 있어 버튼의 `color` 를 바꿔도 안 먹는다 — 실제로 렌더되는 SVG path 의 fill 이
 * `--color-brand-500` 지역 재정의를 통해 brand-300(#c16edd)으로 바뀌는지 검증. */
export const LikedColor: Story = {
  tags: ['!autodocs'],
  args: { liked: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heartButton = canvas.getByRole('button', { name: '찜 해제' });
    const path = heartButton.querySelector('path');
    if (!path) throw new Error('heart-filled path not found');
    await expect(getComputedStyle(path).fill).toBe('rgb(193, 110, 221)');
  },
};

export const ClickAddToCart: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '장바구니 담기' }));
    await expect(args.onAddToCart).toHaveBeenCalledOnce();
  },
};

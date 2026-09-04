import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { FloatingButton } from './FloatingButton';

const meta = {
  title: 'atoms/FloatingButton',
  component: FloatingButton,
  args: {
    variant: 'primary',
    icon: 'filter',
    children: '필터 초기화',
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary'] },
  },
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof FloatingButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary', icon: 'refresh', children: '신선구독 상품 둘러보기' },
};

export const WithoutIcon: Story = {
  args: { icon: undefined },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const ClickFires: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: args.children as string });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

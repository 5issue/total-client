import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { RefundReturnView } from './RefundReturnView';

const meta = {
  title: 'organisms/mypage/RefundReturnView',
  component: RefundReturnView,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } },
  args: {
    defaultSelectedIds: [],
  },
  argTypes: {
    defaultSelectedIds: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto flex min-h-dvh max-w-screen-sm flex-col">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RefundReturnView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 미선택 — 전체선택 (0/4), CTA 비활성. Figma node 848-82641. */
export const Default: Story = {};

/** 일부 선택 — 첫 상품만. Figma node 848-82701. */
export const SomeSelected: Story = {
  args: { defaultSelectedIds: ['item-1'] },
};

/** 전체 선택 — (4/4). Figma node 848-82764. */
export const AllSelected: Story = {
  args: { defaultSelectedIds: ['item-1', 'item-2', 'item-3', 'item-4'] },
};

/** 전체선택 토글 — 4건이 모두 체크되고 다음 버튼이 활성된다. */
export const TogglesSelectAll: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const next = canvas.getByRole('button', { name: '다음' });
    await expect(next).toBeDisabled();
    await userEvent.click(canvas.getByRole('checkbox', { name: '전체 선택' }));
    await expect(next).toBeEnabled();
    await expect(canvas.getByText('(4/4)')).toBeVisible();
  },
};

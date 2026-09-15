import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { RefundDetailView } from './RefundDetailView';

const meta = {
  title: 'organisms/mypage/RefundDetailView',
  component: RefundDetailView,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className="mx-auto flex min-h-dvh max-w-screen-sm flex-col">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RefundDetailView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 반품 사유 입력 완료 후 도착하는 확인 화면. Figma node 795-64058. */
export const Default: Story = {};

/** 하단 약관 "보기" 클릭 시 안내 모달이 뜬다. */
export const OpensTermsModal: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole('button', { name: '보기' })[0] as HTMLElement);
    await expect(within(document.body).getByText('개인정보 수집·이용 및 처리 동의')).toBeVisible();
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { getRouter } from '@storybook/nextjs-vite/navigation.mock';
import { expect, userEvent, within } from 'storybook/test';

import { CancelReturnExchangeDetailView } from './CancelReturnExchangeDetailView';
import { MOCK_CANCEL_RETURN_EXCHANGE_ITEMS } from '../CancelReturnExchangeHistoryView/mock';

const [RETURN_REQUESTED, CANCEL_REQUESTED, RETURN_COMPLETED, CANCEL_COMPLETED] =
  MOCK_CANCEL_RETURN_EXCHANGE_ITEMS;

const meta = {
  title: 'organisms/mypage/CancelReturnExchangeDetailView',
  component: CancelReturnExchangeDetailView,
  args: { item: RETURN_REQUESTED! },
  argTypes: { item: { control: false } },
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/mypage/orders/cancel-return-exchange/r-1' },
    },
  },
} satisfies Meta<typeof CancelReturnExchangeDetailView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 반품 상세, 상품 1개(node 848-83792) — 인디케이터 + 상품별 "상품불량" 증빙 사진. */
export const ReturnRequested: Story = {};

/** 반품 상세, 상품 4개(node 666-30712) — 상품마다 증빙 사진이 반복되고, 완료 후
 * 5일 경과라 인디케이터가 없다. */
export const ReturnCompletedFourProducts: Story = {
  args: { item: RETURN_COMPLETED! },
};

/** 취소 상세, 상품 1개(node 666-30539) — 증빙 사진 없이 상품만 나열. */
export const CancelRequested: Story = {
  args: { item: CANCEL_REQUESTED! },
};

/** 취소 상세, 상품 4개(node 666-30539) — 완료 후 5일 경과라 인디케이터가 없다. */
export const CancelCompletedFourProducts: Story = {
  args: { item: CANCEL_COMPLETED! },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const BackGoesBack: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '뒤로 가기' }));
    await expect(getRouter().back).toHaveBeenCalledTimes(1);
  },
};

export const ShowsDefectEvidenceOnlyForReturns: Story = {
  tags: ['!autodocs'],
  args: { item: CANCEL_REQUESTED! },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('상품불량')).not.toBeInTheDocument();
  },
};

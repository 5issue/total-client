import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { OrderCompleteView } from './OrderCompleteView';

const meta = {
  title: 'organisms/checkout/OrderCompleteView',
  component: OrderCompleteView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/checkout/complete' } },
  },
} satisfies Meta<typeof OrderCompleteView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const ShowsOrderNumberAndTotal: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('주문번호 24242424224422')).toBeInTheDocument();
    await expect(canvas.getByText('30,800')).toBeInTheDocument();
  },
};

export const CloseGoesHome: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    // 닫기는 뒤로가기가 아니라 메인 홈 링크(사용자 확정) — 결제 완료 후 주문서로 되돌아가면 안 된다.
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: '닫기' })).toHaveAttribute('href', '/');
  },
};

export const RecommendCarouselTurnsPages: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1페이지: Figma 실측 6개. 이전 버튼은 첫 페이지라 비활성.
    await expect(canvas.getByText('[타바스코] 스콜피온 엑스트라 핫소스 2종')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: '이전 페이지' })).toBeDisabled();

    await userEvent.click(canvas.getByRole('button', { name: '다음 페이지' }));

    // 2페이지로 실제로 넘어간다(시각만이 아님).
    await expect(
      canvas.queryByText('[타바스코] 스콜피온 엑스트라 핫소스 2종'),
    ).not.toBeInTheDocument();
    await expect(canvas.getByText('[전주 베테랑] 고기만두')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: '다음 페이지' })).toBeDisabled();
  },
};

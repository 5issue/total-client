import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

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

export const ShowsBottomCtaBar: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    // node 666-26336 하단 CTA 바. 둘 다 아직 갈 곳이 없어 무동작이지만 노출은 돼야 한다.
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: '주문 상세보기' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: '쇼핑 계속하기' })).toBeInTheDocument();
  },
};

export const CopyingOrderNumberShowsToast: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    // 헤드리스 브라우저는 클립보드 권한이 없을 수 있어 writeText 를 스텁으로 갈아끼운다.
    const writeText = fn(async () => {});
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: '복사' }));

    await expect(writeText).toHaveBeenCalledWith('24242424224422');
    await expect(await canvas.findByRole('status')).toHaveTextContent('주문 번호를 복사했어요');
  },
};

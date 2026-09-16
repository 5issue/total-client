import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { MyKurlyHomeView } from './MyKurlyHomeView';

const meta = {
  title: 'organisms/mypage/MyKurlyHomeView',
  component: MyKurlyHomeView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/mypage' } },
  },
} satisfies Meta<typeof MyKurlyHomeView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const ShowsSummaryAndSections: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('박서연님')).toBeInTheDocument();
    await expect(canvas.getByText('적립금')).toBeInTheDocument();
    await expect(canvas.getByText('주문내역')).toBeInTheDocument();

    for (const title of [
      '큐레이터 활동으로 수익 만들기',
      '쇼핑',
      '혜택',
      '내 정보관리',
      '서비스 안내',
      '고객 지원',
    ]) {
      await expect(canvas.getByRole('heading', { name: title })).toBeInTheDocument();
    }
  },
};

export const BenefitSheetOpensOnMountAndCloses: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    // node 698-62968: 진입 시 혜택 알림 동의 바텀시트가 떠 있는 상태.
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', {
      name: '혜택 알림 받고 저렴하게 구매하세요',
    });
    await expect(within(dialog).getByText('저렴하게 구매하세요!')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: '30일 동안 보지 않기' }));

    await expect(
      within(canvasElement.ownerDocument.body).queryByRole('dialog'),
    ).not.toBeInTheDocument();
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { getRouter } from '@storybook/nextjs-vite/navigation.mock';
import { expect, userEvent, within } from 'storybook/test';

import { CancelReturnExchangeHistoryView } from './CancelReturnExchangeHistoryView';

const meta = {
  title: 'organisms/mypage/CancelReturnExchangeHistoryView',
  component: CancelReturnExchangeHistoryView,
  args: {},
  argTypes: {},
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/mypage/orders/cancel-return-exchange' },
    },
  },
} satisfies Meta<typeof CancelReturnExchangeHistoryView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 전체 탭 — 반품접수(4단계) + 취소접수(2단계) + 5일 경과 완료 2건(인디케이터 없음). */
export const Default: Story = {};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const BackGoesBack: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '뒤로 가기' }));
    await expect(getRouter().back).toHaveBeenCalledTimes(1);
  },
};

export const ShowsAllFourEntriesOnAllTab: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 인디케이터는 전체 단계를 라벨로 보여준다(활성 단계만 강조) — "반품접수" 진행
    // 카드의 인디케이터가 "반품접수"(활성)~"반품완료"(마지막 단계) 를 전부 라벨로
    // 그리고, 그 라벨이 5일 지나 인디케이터 없는 "반품완료" 카드의 제목과 겹쳐 각각
    // 두 번씩 나타난다("택배회수"·"상품검수" 는 인디케이터에만 있어 한 번).
    await expect(canvas.getAllByText('반품접수')).toHaveLength(2);
    await expect(canvas.getByText('택배회수')).toBeInTheDocument();
    await expect(canvas.getByText('상품검수')).toBeInTheDocument();
    await expect(canvas.getAllByText('반품완료')).toHaveLength(2);
    await expect(canvas.getAllByText('취소접수')).toHaveLength(2);
    await expect(canvas.getAllByText('취소완료')).toHaveLength(2);
  },
};

export const CancelTabFiltersOutReturnEntries: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: '취소' }));

    // "취소접수"(카드 제목 + 인디케이터 활성 라벨)와 "취소완료"(인디케이터 마지막
    // 단계 라벨 + 완료 카드 제목) 모두 두 번씩 나타난다.
    await expect(canvas.getAllByText('취소접수')).toHaveLength(2);
    await expect(canvas.getAllByText('취소완료')).toHaveLength(2);
    await expect(canvas.queryByText('반품접수')).not.toBeInTheDocument();
    await expect(canvas.queryByText('반품완료')).not.toBeInTheDocument();
  },
};

export const ExchangeTabShowsEmptyState: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    // Figma 예시 화면에 교환 항목이 없어 mock 데이터가 없다 — 빈 상태만 확인한다.
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: '교환' }));

    await expect(canvas.getByText('교환 내역이 없어요')).toBeInTheDocument();
  },
};

export const CardClickNavigatesToDetail: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '반품접수 상세보기' }));
    await expect(getRouter().push).toHaveBeenCalledWith(
      '/mypage/orders/cancel-return-exchange/r-1',
    );
  },
};

export const CompletedOldEntriesHaveNoIndicator: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    // 인디케이터가 있는 카드(반품접수 1건)에서만 단계 라벨이 렌더돼야 한다 — 5일
    // 경과한 완료 카드(반품완료·취소완료)에 인디케이터가 또 붙으면 "택배회수"·
    // "상품검수" 가 두 번씩 나타난다.
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('택배회수')).toHaveLength(1);
    await expect(canvas.getAllByText('상품검수')).toHaveLength(1);
  },
};

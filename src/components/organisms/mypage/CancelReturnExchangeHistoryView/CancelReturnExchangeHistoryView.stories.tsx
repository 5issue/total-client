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

/**
 * 전체 탭 — 반품접수(4단계, 진행중) + 취소접수(2단계, 진행중) + 완료 후 5일 미만인
 * 반품완료·취소완료 2건. 완료 상태도 인디케이터를 계속 보여준다(사용자 확인 사항).
 */
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
    // 인디케이터는 전체 단계를 라벨로 보여준다(활성 단계만 강조) — 반품접수·반품완료
    // 카드 둘 다 자기 인디케이터를 갖는다(완료 후 5일 미만이라 인디케이터 유지). 각 라벨은
    // "카드 제목(자기 자신)" + "반품접수 카드 인디케이터" + "반품완료 카드 인디케이터"
    // 3곳에 겹쳐 나타나고, 인디케이터에만 있는 중간 단계("택배회수"·"상품검수")는
    // 두 카드의 인디케이터에서 한 번씩, 총 2번 나타난다. 취소도 동일한 구조(2단계).
    await expect(canvas.getAllByText('반품접수')).toHaveLength(3);
    await expect(canvas.getAllByText('택배회수')).toHaveLength(2);
    await expect(canvas.getAllByText('상품검수')).toHaveLength(2);
    await expect(canvas.getAllByText('반품완료')).toHaveLength(3);
    await expect(canvas.getAllByText('취소접수')).toHaveLength(3);
    await expect(canvas.getAllByText('취소완료')).toHaveLength(3);
  },
};

// 탭 선택은 이제 URL 쿼리(`?tab=`)가 단일 진실 소스라, 탭을 "클릭"해도 목 라우터인
// `replace` 만 호출될 뿐 캔버스가 다시 렌더되지는 않는다(`CardClickNavigatesToDetail`
// 이 `push` 호출만 확인하는 것과 같은 이유) — 그래서 "탭별로 필터링된 화면"은 클릭이
// 아니라 `parameters.nextjs.navigation.query` 로 직접 그 탭에서 시작하는 스토리로
// 검증하고, "탭 클릭"은 별도로 URL 이 올바르게 바뀌는지만 확인한다.

export const CancelTabViaQueryFiltersOutReturnEntries: Story = {
  tags: ['!autodocs'],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/mypage/orders/cancel-return-exchange', query: { tab: '취소' } },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 취소접수·취소완료 카드 둘 다 자기 인디케이터를 갖는다(완료 후 5일 미만) — 각
    // 라벨이 "카드 제목" + "두 카드의 인디케이터" 3곳에 겹쳐 나타난다.
    await expect(canvas.getAllByText('취소접수')).toHaveLength(3);
    await expect(canvas.getAllByText('취소완료')).toHaveLength(3);
    await expect(canvas.queryByText('반품접수')).not.toBeInTheDocument();
    await expect(canvas.queryByText('반품완료')).not.toBeInTheDocument();
  },
};

export const ExchangeTabViaQueryShowsEmptyState: Story = {
  tags: ['!autodocs'],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/mypage/orders/cancel-return-exchange', query: { tab: '교환' } },
    },
  },
  play: async ({ canvasElement }) => {
    // Figma 예시 화면에 교환 항목이 없어 mock 데이터가 없다 — 빈 상태만 확인한다.
    const canvas = within(canvasElement);
    await expect(canvas.getByText('교환 내역이 없어요')).toBeInTheDocument();
  },
};

export const EmptyStateInquiryButtonDoesNotNavigate: Story = {
  tags: ['!autodocs'],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/mypage/orders/cancel-return-exchange', query: { tab: '교환' } },
    },
  },
  play: async ({ canvasElement }) => {
    // node 779-61154("교환 내역이 없는 경우") — "1:1 문의 가기" 버튼은 문의 채널이
    // 아직 없어 클릭해도 화면 이동이 없다(사용자 확인 사항).
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '1:1 문의 가기' }));
    await expect(getRouter().push).not.toHaveBeenCalled();
  },
};

export const TabClickReplacesUrlQuery: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    // 카드 클릭 → 상세 화면 → 뒤로가기 왕복 시 탭이 유지되려면, 탭 클릭이 로컬
    // state 가 아니라 `router.replace` 로 URL 쿼리를 갱신해야 한다(사용자 확인 사항).
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: '취소' }));

    const params = new URLSearchParams();
    params.set('tab', '취소');
    await expect(getRouter().replace).toHaveBeenCalledWith(
      `/mypage/orders/cancel-return-exchange?${params.toString()}`,
      { scroll: false },
    );
  },
};

export const AllTabClickRemovesUrlQuery: Story = {
  tags: ['!autodocs'],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/mypage/orders/cancel-return-exchange', query: { tab: '취소' } },
    },
  },
  play: async ({ canvasElement }) => {
    // "전체" 는 쿼리를 지운다(깨끗한 기본 URL 유지) — 값을 `tab=전체` 로 쓰지 않는다.
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: '전체' }));

    await expect(getRouter().replace).toHaveBeenCalledWith(
      '/mypage/orders/cancel-return-exchange',
      { scroll: false },
    );
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

export const CompletedRecentEntriesShowIndicator: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    // 완료(반품완료·취소완료) 카드도 완료 후 5일이 지나지 않았다면 인디케이터를
    // 계속 보여준다(사용자 확인 사항) — 반품/취소 각각 진행중 카드 + 완료 카드,
    // 총 2개씩 자기 인디케이터(`aria-label="~ 진행 상태"`, ol 의 암묵적 role="list")
    // 를 가진다.
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('list', { name: '반품 진행 상태' })).toHaveLength(2);
    await expect(canvas.getAllByRole('list', { name: '취소 진행 상태' })).toHaveLength(2);
  },
};

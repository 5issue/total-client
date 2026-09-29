import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, userEvent, within } from 'storybook/test';

import { ThemeStoreProvider } from '@/providers/ThemeStoreProvider';

import { MyKurlyHomeView } from './MyKurlyHomeView';

// `PromoSummarySectionContainer`/`AccountLinkSectionContainer`가 useQuery·useMutation을
// 호출한다 — QueryClientProvider 없이는 throw 한다(`MyFridgeView.stories.tsx`와 동일).
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta = {
  title: 'organisms/mypage/MyKurlyHomeView',
  component: MyKurlyHomeView,
  tags: ['autodocs'],
  args: {},
  argTypes: {},
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/mypage' } },
  },
  // KurlyHeader 의 ThemeToggle 이 useThemeStore(전역 Zustand)를 읽는다 — 실제 앱은
  // app/providers.tsx 가 항상 감싸지만 Storybook 은 그 트리 바깥이라 여기서 직접 제공한다
  // (BottomNav.stories.tsx 의 UIStoreProvider 래핑과 같은 패턴).
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <ThemeStoreProvider>
          <Story />
        </ThemeStoreProvider>
      </QueryClientProvider>
    ),
  ],
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

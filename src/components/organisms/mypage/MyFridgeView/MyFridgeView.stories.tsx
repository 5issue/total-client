import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, fn, userEvent, within } from 'storybook/test';

import { MOCK_FRIDGE_ITEMS } from './mock';
import { MyFridgeView } from './MyFridgeView';

// "MY 레시피" 탭이 실제 쿼리 훅을 쓰는 `MyRecipeViewContainer`를 렌더해서
// QueryClientProvider 없이는 throw 한다(`SocialLoginPanel.stories.tsx`와 동일 이유).
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta = {
  title: 'organisms/mypage/MyFridgeView',
  component: MyFridgeView,
  tags: ['autodocs'],
  // `fridgeItems` 등은 실제로는 `MyFridgeViewContainer`(이슈 #138)가 `useFridgeItems`로
  // 공급한다 — 이 표현 컴포넌트는 네트워크 없이 목값을 직접 받는다(#90 `ProductGrid`와
  // 동일한 컨테이너/표현 분리, api-convention §8).
  args: {
    initialTab: 'fridge',
    fridgeItems: MOCK_FRIDGE_ITEMS,
    fridgeItemsPending: false,
    fridgeItemsError: false,
    onDeleteItems: fn(),
  },
  argTypes: {
    initialTab: {
      control: 'select',
      options: ['fridge', 'recipe'],
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/mypage/fridge' } },
  },
} satisfies Meta<typeof MyFridgeView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  name: '불러오는 중',
  args: { fridgeItemsPending: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('냉장고 품목을 불러오는 중이에요')).toBeInTheDocument();
  },
};

export const LoadError: Story = {
  name: '불러오기 실패',
  args: { fridgeItemsError: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('상품을 불러오지 못했어요')).toBeInTheDocument();
  },
};

export const RecipeTab: Story = {
  name: 'MY 레시피 탭',
  args: { initialTab: 'recipe' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('최근 본 레시피')).toBeInTheDocument();
  },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const SwitchToRecipeTab: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'MY 레시피' }));
    // 탭 전환 순간엔 "MY 레시피 제작 중" 로딩(mock 딜레이)을 먼저 거친다 — 실제
    // 콘텐츠는 findByText 로 그 딜레이가 끝나길 기다렸다가 확인한다.
    await expect(canvas.getByText('MY 레시피 제작 중')).toBeInTheDocument();
    // mock 딜레이(1200ms)보다 여유 있게 기다린다 — findByText 기본 타임아웃(1000ms)보다 길다.
    await expect(
      await canvas.findByText('최근 본 레시피', {}, { timeout: 3000 }),
    ).toBeInTheDocument();
  },
};

export const FilterByExpired: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 카드 이름(<p>)과 체크박스 sr-only 라벨(같은 상품명 포함) 둘 다 매칭돼 selector 로 좁힌다.
    await expect(canvas.getByText(/전용목장우유/, { selector: 'p' })).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: '만료' }));

    await expect(canvas.queryByText(/전용목장우유/, { selector: 'p' })).not.toBeInTheDocument();
    await expect(canvas.getByText(/모짜렐라 슈레드 치즈/, { selector: 'p' })).toBeInTheDocument();
  },
};

export const SelectAndDeleteItem: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // index 0 = 전체선택, index 1 = 첫 카드(우유) — 접근 가능한 이름 정규식 매칭이
    // 이 테스트 환경에서 불안정해 순서로 집는다.
    const [, milkCheckbox] = canvas.getAllByRole('checkbox');
    if (!milkCheckbox) throw new Error('no item checkbox rendered');
    await userEvent.click(milkCheckbox);
    await userEvent.click(canvas.getByRole('button', { name: '선택삭제' }));

    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', {
      name: '상품을 삭제하시겠어요?',
    });
    await userEvent.click(within(dialog).getByRole('button', { name: '삭제' }));

    await expect(
      within(canvasElement.ownerDocument.body).queryByRole('dialog'),
    ).not.toBeInTheDocument();
    // 목록에서 즉시 사라지는지가 아니라(그건 컨테이너의 invalidate 이후 몫, #138 컨테이너
    // 분리) 올바른 품목으로 `onDeleteItems`가 호출됐는지를 이 표현 컴포넌트 레벨에서 검증한다.
    await expect(args.onDeleteItems).toHaveBeenCalledWith(['milk']);
  },
};

export const RefillOpensBottomSheet: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [firstRefillButton] = canvas.getAllByRole('button', { name: '채워넣기' });
    if (!firstRefillButton) throw new Error('no 채워넣기 button rendered');
    await userEvent.click(firstRefillButton);

    const sheet = await within(canvasElement.ownerDocument.body).findByRole('dialog', {
      name: '채워넣기',
    });
    // 우유는 품절(soldOut)이라 첫 "채워넣기" 버튼은 두 번째 카드(생연어)다. 시트 안에서
    // 상품명이 미리보기·일반가·멤버스가 세 군데에 나온다 — 하나 이상 존재하는지만 확인.
    await expect(within(sheet).getAllByText(/노르웨이 생연어/).length).toBeGreaterThan(0);
  },
};

export const StorageTipOpensBottomSheet: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [firstTipButton] = canvas.getAllByRole('button', { name: '보관팁' });
    if (!firstTipButton) throw new Error('no 보관팁 button rendered');
    await userEvent.click(firstTipButton);

    const sheet = await within(canvasElement.ownerDocument.body).findByRole('dialog', {
      name: '보관 TIP',
    });
    await expect(within(sheet).getByText(/보관 TIP/)).toBeInTheDocument();
  },
};

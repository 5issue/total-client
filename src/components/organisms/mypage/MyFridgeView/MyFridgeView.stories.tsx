import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { MyFridgeView } from './MyFridgeView';

const meta = {
  title: 'organisms/mypage/MyFridgeView',
  component: MyFridgeView,
  tags: ['autodocs'],
  args: { initialTab: 'fridge' },
  argTypes: {
    initialTab: {
      control: 'select',
      options: ['fridge', 'recipe'],
    },
  },
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/mypage/fridge' } },
  },
} satisfies Meta<typeof MyFridgeView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

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
    await expect(canvas.getByText('최근 본 레시피')).toBeInTheDocument();
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
  play: async ({ canvasElement }) => {
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
    await expect(canvas.queryByText(/전용목장우유/, { selector: 'p' })).not.toBeInTheDocument();
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

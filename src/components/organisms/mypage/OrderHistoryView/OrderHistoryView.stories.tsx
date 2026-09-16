import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  MOCK_FOUR_ITEM_ORDER,
  MOCK_ORDERS,
  MOCK_PARTIAL_RETURN_ORDER,
  TOAST_ADD_AGAIN,
  TOAST_ADD_ONCE,
} from './mock';
import { OrderHistoryView } from './OrderHistoryView';

const meta = {
  title: 'organisms/mypage/OrderHistoryView',
  component: OrderHistoryView,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className="mx-auto flex min-h-dvh max-w-screen-sm flex-col">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OrderHistoryView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 주문완료 — Figma node 771-106840. */
export const Default: Story = {
  args: { initialStatus: '주문완료' },
};

/** 배송준비 — 주문완료와 같은 CTA, 인디케이터만 배송준비 활성. */
export const Preparing: Story = {
  args: { initialStatus: '배송준비' },
};

/** 배송중 — Figma node 771-106998. */
export const Shipping: Story = {
  args: { initialStatus: '배송중' },
};

/** 배송완료 · 반품 접수 가능. */
export const Delivered: Story = {
  args: { initialStatus: '배송완료' },
};

/** 배송완료 · 반품 접수 기간 종료 — Figma node 848-86519. */
export const DeliveredReturnClosed: Story = {
  args: { initialStatus: '배송완료', returnPeriodEnded: true },
};

/** 상품 4건 + 펼쳐보기 — Figma node 771-107381. */
export const ManyItems: Story = {
  args: { orders: [MOCK_FOUR_ITEM_ORDER] },
};

/** 주문 2건 — Figma node 771-107323. */
export const MultipleOrders: Story = {
  args: { orders: MOCK_ORDERS },
};

/** 일부만 반품 — Figma node 771-107724. */
export const PartialReturn: Story = {
  args: { orders: [MOCK_PARTIAL_RETURN_ORDER] },
};

/** 주문 내역이 없을 때 — Figma node 848-86771. */
export const Empty: Story = {
  args: { orders: [] },
};

/** 검색 결과 없음 — Figma node 848-86401. */
export const SearchEmpty: Story = {
  args: { defaultQuery: '버섯' },
};

/** 기간 드롭다운을 열어 6개월을 고른다. */
export const SelectsPeriod: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox', { name: '조회 기간' }));
    await userEvent.click(canvas.getByRole('option', { name: '6개월' }));
    await expect(canvas.getByRole('combobox', { name: '조회 기간' })).toHaveTextContent('6개월');
  },
};

/** 같은 상품 담기 1회 → 첫 토스트, 2회 → 한번 더 토스트. */
export const AddsToCartTwice: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const add = canvas.getAllByRole('button', { name: /장바구니 담기$/ })[0];
    if (!add) throw new Error('담기 버튼이 없습니다');
    await userEvent.click(add);
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent(TOAST_ADD_ONCE));
    await userEvent.click(add);
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent(TOAST_ADD_AGAIN));
  },
};

/** 주문 취소 모달을 연다. */
export const OpensCancelModal: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '주문 취소' }));
    const dialog = await waitFor(() =>
      within(canvasElement.ownerDocument.body).getByRole('dialog'),
    );
    await expect(dialog).toHaveAccessibleName('주문을 취소하시겠어요?');
  },
};

/** 주문 없음 화면의 베스트 CTA 가 노출된다. */
export const ShowsEmptyOrders: Story = {
  tags: ['!autodocs'],
  args: { orders: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('주문 내역이 없습니다.')).toBeVisible();
    await expect(canvas.getByRole('button', { name: '베스트 상품 보기' })).toBeVisible();
  },
};

/** 검색 없음에서 초기화하면 목록이 돌아온다. */
export const ResetsSearch: Story = {
  tags: ['!autodocs'],
  args: { defaultQuery: '버섯' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('해당 조건에 맞는 주문내역이 없습니다.')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '초기화하기' }));
    await expect(canvas.getByText(/주문번호/)).toBeVisible();
  },
};

/** 배송준비에서도 주문 취소 모달이 열린다. */
export const OpensCancelModalWhenPreparing: Story = {
  tags: ['!autodocs'],
  args: { initialStatus: '배송준비' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('listitem', { current: 'step' })).toHaveTextContent('배송준비');
    await userEvent.click(canvas.getByRole('button', { name: '주문 취소' }));
    const dialog = await waitFor(() =>
      within(canvasElement.ownerDocument.body).getByRole('dialog'),
    );
    await expect(dialog).toHaveAccessibleName('주문을 취소하시겠어요?');
  },
};

/** 배송완료에서 반품 접수·후기 작성이 보인다. */
export const ShowsDeliveredCtas: Story = {
  tags: ['!autodocs'],
  args: { initialStatus: '배송완료' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('listitem', { current: 'step' })).toHaveTextContent('배송완료');
    await expect(canvas.getByRole('button', { name: '반품 접수' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: '후기 작성' })).toBeVisible();
    const actions = canvas.getByRole('button', { name: '반품 접수' }).parentElement;
    await expect(actions?.firstElementChild).toHaveAccessibleName('반품 접수');
    await expect(canvas.queryByRole('button', { name: '주문 취소' })).toBeNull();
  },
};

/** 반품 기간이 끝나면 후기 작성만 남는다. */
export const HidesReturnWhenPeriodEnded: Story = {
  tags: ['!autodocs'],
  args: { initialStatus: '배송완료', returnPeriodEnded: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: '후기 작성' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: '반품 접수' })).toBeNull();
    await expect(canvas.getByText('08.27(수) 04:16')).toBeVisible();
  },
};

/** 주문 카드가 2건 보인다. */
export const ShowsTwoOrders: Story = {
  tags: ['!autodocs'],
  args: { orders: MOCK_ORDERS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText(/주문번호/)).toHaveLength(2);
    await expect(canvas.getByRole('button', { name: '주문 취소' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: '후기 작성' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: '반품 접수' })).toBeNull();
  },
};

/** 4건이면 펼쳐보기 토글이 있다. */
export const ShowsAccordionToggle: Story = {
  tags: ['!autodocs'],
  args: { orders: [MOCK_FOUR_ITEM_ORDER] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: '총 4건 제품 펼쳐보기' })).toBeVisible();
  },
};

/** 일부 반품은 인디케이터 없이 반품완료 그룹을 보여 준다. */
export const ShowsPartialReturn: Story = {
  tags: ['!autodocs'],
  args: { orders: [MOCK_PARTIAL_RETURN_ORDER] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('반품완료')).toBeVisible();
    await expect(canvas.getByText('배송완료')).toBeVisible();
    await expect(canvas.queryByRole('list', { name: '주문 진행 상태' })).toBeNull();
    await expect(canvas.getByRole('button', { name: '후기 작성' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: '반품 접수' })).toBeNull();
  },
};

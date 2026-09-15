import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { getRouter } from '@storybook/nextjs-vite/navigation.mock';
import { expect, fn, screen, userEvent, within } from 'storybook/test';

import { OrderDetailView } from './OrderDetailView';

const meta = {
  title: 'organisms/mypage/OrderDetailView',
  component: OrderDetailView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/mypage/orders/24242424224422' } },
  },
} satisfies Meta<typeof OrderDetailView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const ShowsOrderSummaryAndSections: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('주문번호 24242424224422')).toBeInTheDocument();
    await expect(canvas.getByText('주문완료')).toBeInTheDocument();

    // Figma 는 세 카드 제목이 모두 `주문 정보` 지만 복붙 아티팩트라 셋으로 나눴다(사용자 확인).
    for (const title of ['주문 상품', '결제 정보', '주문 정보', '배송 정보', '배송 요청사항']) {
      await expect(canvas.getByRole('heading', { name: title })).toBeInTheDocument();
    }
  },
};

export const ShowsCouponBreakdownDetails: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    // 쿠폰·적립금은 하위 분해 항목을 함께 보여준다(node 2461-7028).
    const canvas = within(canvasElement);
    await expect(canvas.getByText('쿠폰할인 금액')).toBeInTheDocument();
    await expect(canvas.getByText('상품 쿠폰')).toBeInTheDocument();
    await expect(canvas.getByText('장바구니 쿠폰')).toBeInTheDocument();
    await expect(canvas.getByText('컬리캐시')).toBeInTheDocument();
  },
};

export const BackGoesBack: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '뒤로 가기' }));

    await expect(getRouter().back).toHaveBeenCalledTimes(1);
  },
};

export const CancelButtonOpensModal: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    // `Modal` 은 document.body 에 포털되므로 전역 `screen` 으로 찾는다.
    const canvas = within(canvasElement);
    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: '주문 취소' }));

    const dialog = await screen.findByRole('dialog', { name: '주문을 취소하시겠어요?' });
    await expect(
      within(dialog).getByText('상품이 품절되면 다시 구매할 수 없어요.'),
    ).toBeInTheDocument();

    // 실제 취소 처리는 BE 연동 후 — 지금은 닫히기만 한다.
    await userEvent.click(within(dialog).getByRole('button', { name: '닫기' }));
    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  },
};

export const FullCancelButtonOpensSameModal: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '전체 상품 주문 취소' }));

    await expect(
      await screen.findByRole('dialog', { name: '주문을 취소하시겠어요?' }),
    ).toBeInTheDocument();
  },
};

export const ConfirmingCancelShowsCancelledState: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    // 취소 확정 후 화면(node 666-27472): "주문완료"+도착 예정 → "주문취소" 단독,
    // 카드 안 "주문 취소" 버튼 소멸, 하단 CTA 는 비활성 "…완료" 라벨로 바뀐다.
    const canvas = within(canvasElement);
    await expect(canvas.getByText('주문완료')).toBeInTheDocument();
    await expect(canvas.getByText('내일 (수) 아침 도착')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: '전체 상품 주문 취소' }));
    const dialog = await screen.findByRole('dialog', { name: '주문을 취소하시겠어요?' });
    await userEvent.click(within(dialog).getByRole('button', { name: '주문 취소' }));

    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await expect(canvas.getByText('주문취소')).toBeInTheDocument();
    await expect(canvas.queryByText('주문완료')).not.toBeInTheDocument();
    await expect(canvas.queryByText('내일 (수) 아침 도착')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: '주문 취소' })).not.toBeInTheDocument();

    const doneButton = canvas.getByRole('button', { name: '전체 상품 주문 취소 완료' });
    await expect(doneButton).toBeDisabled();
  },
};

export const RefillingAllShowsToast: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: '전체 상품 다시 담기' }));

    await expect(await canvas.findByRole('status')).toHaveTextContent(
      '장바구니에 전체 상품을 다시 담았어요',
    );
  },
};

export const CopyingOrderNumberShowsToast: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    // 헤드리스 브라우저는 클립보드 권한이 없을 수 있어 writeText 를 스텁으로 갈아끼운다
    // (`OrderCompleteView` 의 같은 테스트와 동일한 패턴 — 둘 다 `useCopyToast` 를 쓴다).
    const writeText = fn(async () => {});
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: '복사' }));

    await expect(writeText).toHaveBeenCalledWith('24242424224422');
    await expect(await canvas.findByRole('status')).toHaveTextContent('주문 번호를 복사했어요');
  },
};

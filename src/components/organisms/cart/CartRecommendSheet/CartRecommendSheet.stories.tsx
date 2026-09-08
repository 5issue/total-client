import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import type { RecommendProductView } from '@/components/organisms/cart/model';

import { CartRecommendSheet } from './CartRecommendSheet';

const ITEMS: RecommendProductView[] = [
  { id: '1', name: '[전주 베테랑] 고기만두', price: 10760, discountPercent: 10 },
  { id: '2', name: '[KF365] 훈제오리 300g (150gx2입)', price: 6990, discountPercent: 33 },
  { id: '3', name: '[KF365] 깐마늘 200g', price: 4100, discountPercent: 25 },
  { id: '4', name: '[상하농원] 암꽃게 간장게장', price: 2540 },
  { id: '5', name: '[데체코] 구르메 파스타면 6종', price: 6980 },
  { id: '6', name: '[동원] 고추참치 85g x 8캔', price: 13510 },
];

/** 열림 상태를 스토리가 들고, 트리거 버튼으로 연다. */
function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <div className="max-w-md">
      <button type="button" onClick={() => setOpen(true)}>
        추천 시트 열기
      </button>
      <CartRecommendSheet
        open={open}
        onClose={() => setOpen(false)}
        items={ITEMS}
        totalPrice={29240}
        onOrder={() => setOpen(false)}
        onAddItem={() => undefined}
      />
    </div>
  );
}

const meta = {
  title: 'organisms/cart/CartRecommendSheet',
  component: CartRecommendSheet,
  parameters: { layout: 'fullscreen' },
  // 시트는 열림 상태를 스토리가 소유하므로 실제 렌더는 Harness 가 담당한다.
  // args 는 타입 충족용 placeholder — render 가 무시한다.
  args: {
    open: false,
    onClose: () => undefined,
    items: ITEMS,
    totalPrice: 29240,
    onOrder: () => undefined,
    onAddItem: () => undefined,
  },
  render: () => <Harness />,
  tags: ['autodocs'],
} satisfies Meta<typeof CartRecommendSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 — "추천 시트 열기" 를 누르면 하단에서 시트가 올라온다. */
export const Default: Story = {};

/** 열기 → 상품/주문 버튼 노출 → Esc 로 닫힘. */
export const OpenAndClose: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '추천 시트 열기' }));

    const dialog = await within(document.body).findByRole('dialog', {
      name: '함께 구매하면 좋은 상품',
    });
    await expect(within(dialog).getByText('함께 구매하면 좋은 상품들이에요!')).toBeInTheDocument();
    await expect(
      within(dialog).getByRole('button', { name: '29,240원 주문하기' }),
    ).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument();
  },
};

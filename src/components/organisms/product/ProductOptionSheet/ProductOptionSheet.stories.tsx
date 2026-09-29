import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { MOCK_OPTION_PRODUCT, MOCK_UNIT } from './mock';
import { ProductOptionSheet } from './ProductOptionSheet';

/** 열림 상태를 스토리가 들고, 트리거 버튼으로 연다(CartRecommendSheet 패턴). */
function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <div className="max-w-md">
      <button type="button" onClick={() => setOpen(true)}>
        담기 시트 열기
      </button>
      <ProductOptionSheet
        open={open}
        onClose={() => setOpen(false)}
        productName={MOCK_OPTION_PRODUCT.name}
        productTagline={MOCK_OPTION_PRODUCT.tagline}
        unit={MOCK_UNIT}
      />
    </div>
  );
}

const meta = {
  title: 'organisms/product/ProductOptionSheet',
  component: ProductOptionSheet,
  parameters: { layout: 'fullscreen' },
  // 시트는 열림 상태를 스토리가 소유하므로 실제 렌더는 Harness 가 담당한다.
  args: {
    open: false,
    onClose: () => undefined,
    productName: MOCK_OPTION_PRODUCT.name,
    productTagline: MOCK_OPTION_PRODUCT.tagline,
    unit: MOCK_UNIT,
  },
  argTypes: {
    open: { control: false },
    onClose: { control: false },
  },
  render: () => <Harness />,
  tags: ['autodocs'],
} satisfies Meta<typeof ProductOptionSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 — "담기 시트 열기" 를 누르면 하단에서 시트가 올라온다 (node 2888:2738). */
export const Default: Story = {};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const OpenQuantityAndClose: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '담기 시트 열기' }));

    const dialog = await within(document.body).findByRole('dialog', { name: '장바구니 담기' });
    // 상품명은 미리보기 행 + 담을 상품 행 두 곳에 반복 노출된다(Figma 실측) — AllBy 사용.
    await expect(within(dialog).getAllByText(MOCK_UNIT.name)).toHaveLength(2);

    await userEvent.click(within(dialog).getByRole('button', { name: /수량 증가/ }));
    await expect(within(dialog).getByText('2')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: '장바구니 담기' }));
    await expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument();
  },
};

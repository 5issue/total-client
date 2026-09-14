import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { DisplaySectionList } from './DisplaySectionList';
import { MOCK_DISPLAY_SECTIONS } from './mock';

const meta = {
  title: 'organisms/home/DisplaySectionList',
  component: DisplaySectionList,
  tags: ['autodocs'],
  args: {
    ...MOCK_DISPLAY_SECTIONS[0],
    onAddToCart: fn(),
  },
  argTypes: {
    onAddToCart: { control: false },
    products: { control: false },
    className: { control: false },
  },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DisplaySectionList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 — "지금 가장 많이 담는 특가" 섹션 (node 577:20681). */
export const Default: Story = {};

/** 그랜드뷰컬페 섹션 (node 577:20688). */
export const GrandViewCafe: Story = {
  args: { ...MOCK_DISPLAY_SECTIONS[1] },
};

/** 추석 준비 섹션 (node 577:20695). */
export const ChuseokPrep: Story = {
  args: { ...MOCK_DISPLAY_SECTIONS[2] },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

/** 카드의 담기 클릭 시 상품 id 와 함께 onAddToCart 가 호출된다. */
export const ClickAddToCart: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const firstProduct = MOCK_DISPLAY_SECTIONS[0]!.products[0]!;
    await userEvent.click(
      canvas.getByRole('button', { name: `${firstProduct.name} 장바구니 담기` }),
    );
    await expect(args.onAddToCart).toHaveBeenCalledWith(firstProduct.id);
  },
};

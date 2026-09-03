import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Icon } from '@/components/atoms/Icon';

import { AccordionBreakdown } from './AccordionBreakdown';

/**
 * Figma "Item_H_Brakerdown" 카드 — 스토리 데모용. AccordionBreakdown 은 카드 종류에
 * 무관하므로(children) 실제 화면에선 이 자리에 다른 카드를 넣어도 된다.
 */
function BreakdownItem({
  name,
  price,
  originalPrice,
  quantity,
  deliveryLabel = '샛별배송',
  onAddToCart,
}: {
  name: string;
  price: string;
  originalPrice?: string;
  quantity: string;
  deliveryLabel?: string;
  onAddToCart?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="bg-fg-disabled h-[84px] w-[63px] shrink-0 rounded-s" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-heading-6 text-fg-tertiary">{deliveryLabel}</p>
          <p className="text-heading-6 text-fg truncate">{name}</p>
          <div className="flex items-center gap-1">
            <span className="text-heading-0 text-fg">{price}</span>
            {originalPrice ? (
              <span className="text-heading-5 text-fg-quaternary line-through">
                {originalPrice}
              </span>
            ) : null}
            <span className="text-fg-quaternary mx-1">|</span>
            <span className="text-heading-6 text-fg-secondary">{quantity}</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-label={`${name} 장바구니 담기`}
        onClick={onAddToCart}
        className="border-fg-tertiary text-fg-tertiary bg-surface rounded-m flex size-10 shrink-0 items-center justify-center border"
      >
        <Icon name="cart" size={20} aria-hidden />
      </button>
    </div>
  );
}

/** Figma "Accordion_Brakerdown" 샘플 데이터. 스토리 안에서만 정의. */
const ITEMS = Array.from({ length: 6 }, () => ({
  name: '[풀무원] 고소한 유기농 순두부 (2개입)',
  price: '2,720원',
  originalPrice: '3,400원',
  quantity: '1개',
}));

const meta = {
  title: 'molecules/shared/AccordionBreakdown',
  component: AccordionBreakdown,
  args: { children: null, collapsedCount: 3, defaultOpen: false },
  argTypes: {
    defaultOpen: { control: 'boolean' },
    collapsedCount: { control: 'number' },
    children: { control: false },
    expandLabel: { control: false },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-sm p-4">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof AccordionBreakdown>;

export default meta;
type Story = StoryObj<typeof meta>;

const onAddToCart = fn();

/** 접힘 — 3건 + "총 6건 제품 펼쳐보기". */
export const Default: Story = {
  render: (args) => (
    <AccordionBreakdown {...args}>
      {ITEMS.map((it, i) => (
        <BreakdownItem key={i} {...it} onAddToCart={onAddToCart} />
      ))}
    </AccordionBreakdown>
  ),
};

export const Expanded: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <AccordionBreakdown {...args}>
      {ITEMS.map((it, i) => (
        <BreakdownItem key={i} {...it} onAddToCart={onAddToCart} />
      ))}
    </AccordionBreakdown>
  ),
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const ExpandsAndCollapses: Story = {
  tags: ['!autodocs'],
  render: (args) => (
    <AccordionBreakdown {...args}>
      {ITEMS.map((it, i) => (
        <BreakdownItem key={i} {...it} />
      ))}
    </AccordionBreakdown>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    await userEvent.click(canvas.getByRole('button', { name: '총 6건 제품 펼쳐보기' }));
    await expect(canvas.getAllByRole('listitem')).toHaveLength(6);
    await userEvent.click(canvas.getByRole('button', { name: '접기' }));
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
  },
};

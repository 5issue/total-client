import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { AccordionOrder } from './AccordionOrder';

/**
 * Figma "Item_H_Order" 카드 — 스토리 데모용. AccordionOrder 는 카드 종류에
 * 무관하므로(children) 실제 화면에선 다른 카드를 넣어도 된다.
 */
function OrderItem({
  name,
  price,
  originalPrice,
  quantity,
}: {
  name: string;
  price: string;
  originalPrice?: string;
  quantity: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="bg-fg-disabled size-[54px] shrink-0 rounded-s" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-heading-6 text-fg">{name}</p>
        <div className="flex items-center gap-1">
          <span className="text-heading-4 text-fg">{price}</span>
          {originalPrice ? (
            <span className="text-label-m text-fg-quaternary line-through">{originalPrice}</span>
          ) : null}
          <span className="text-fg-quaternary mx-1">|</span>
          <span className="text-heading-6 text-fg-secondary">{quantity}</span>
        </div>
      </div>
    </div>
  );
}

/** Figma "Accordion_Order" 샘플 상품 데이터. 스토리 안에서만 정의. */
const ITEMS = [
  {
    name: '[풀무원] 고소한 유기농 순두부 (2개입)',
    price: '2,720원',
    originalPrice: '3,400원',
    quantity: '1개',
  },
  {
    name: '[풀무원] 국산 콩 무농약 두부 (300g)',
    price: '2,720원',
    originalPrice: '3,400원',
    quantity: '1개',
  },
];

const meta = {
  title: 'molecules/shared/AccordionOrder',
  component: AccordionOrder,
  args: { title: '주문상품', deliveryLabel: '샛별배송', children: null, defaultOpen: true },
  argTypes: {
    defaultOpen: { control: 'boolean' },
    children: { control: false },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="border-border rounded-m max-w-md border">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof AccordionOrder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <AccordionOrder {...args}>
      {ITEMS.map((it, i) => (
        <OrderItem key={i} {...it} />
      ))}
    </AccordionOrder>
  ),
};

export const Collapsed: Story = {
  args: { defaultOpen: false },
  render: (args) => (
    <AccordionOrder {...args}>
      {ITEMS.map((it, i) => (
        <OrderItem key={i} {...it} />
      ))}
    </AccordionOrder>
  ),
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const TogglesPanel: Story = {
  tags: ['!autodocs'],
  args: { defaultOpen: false },
  render: (args) => (
    <AccordionOrder {...args}>
      {ITEMS.map((it, i) => (
        <OrderItem key={i} {...it} />
      ))}
    </AccordionOrder>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('[풀무원] 고소한 유기농 순두부 (2개입)')).not.toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '주문상품' }));
    await expect(canvas.getByText('[풀무원] 고소한 유기농 순두부 (2개입)')).toBeVisible();
  },
};

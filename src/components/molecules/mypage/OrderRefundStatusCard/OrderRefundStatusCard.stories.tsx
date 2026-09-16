import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { OrderRefundStatusCard } from './OrderRefundStatusCard';

const PRODUCTS = [
  {
    name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
    deliveryType: '샛별배송',
    price: 2720,
    originalPrice: 3400,
    quantity: 1,
  },
];

const FOUR_PRODUCTS = [
  ...PRODUCTS,
  {
    name: "[Kurly's] 동물복지 유정란 20구",
    deliveryType: '샛별배송',
    price: 10051,
    originalPrice: 10580,
    quantity: 1,
  },
  {
    name: '바로먹는 아보카도 3입 (페루산)',
    deliveryType: '샛별배송',
    price: 9990,
    originalPrice: 13000,
    quantity: 1,
  },
  {
    name: '[풀무원] 동물복지 치킨 너겟 오리지널',
    deliveryType: '샛별배송',
    price: 7979,
    originalPrice: 8980,
    quantity: 1,
  },
];

const meta = {
  title: 'molecules/mypage/OrderRefundStatusCard',
  component: OrderRefundStatusCard,
  args: {
    steps: ['반품접수', '택배회수', '상품검수', '반품완료'],
    activeStepIndex: 0,
    status: '반품접수',
    receivedDateLabel: '접수일자 2026. 08. 26',
    products: PRODUCTS,
  },
  argTypes: {
    steps: { control: false },
    products: { control: false },
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
} satisfies Meta<typeof OrderRefundStatusCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 반품접수(node 1233-115014) — 4단계 인디케이터. */
export const ReturnRequested: Story = {};

/** 취소접수(node 666-30373) — 2단계 인디케이터. */
export const CancelRequested: Story = {
  args: {
    steps: ['취소접수', '취소완료'],
    activeStepIndex: 0,
    status: '취소접수',
  },
};

/** 완료 후 5일 경과(node 666-30389) — 인디케이터 없음. */
export const CompletedWithoutIndicator: Story = {
  args: {
    steps: undefined,
    status: '반품완료',
    receivedDateLabel: '접수일자 2026. 08. 20',
  },
};

/** 상품 4개 이상(node 666-30892) — 3개 + 아코디언. */
export const FourOrMoreProducts: Story = {
  args: { products: FOUR_PRODUCTS },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const HidesIndicatorWhenStepsOmitted: Story = {
  tags: ['!autodocs'],
  args: { steps: undefined, status: '반품완료' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('반품접수')).not.toBeInTheDocument();
    await expect(canvas.getByText('반품완료')).toBeInTheDocument();
  },
};

export const ExpandsToShowFourthProduct: Story = {
  tags: ['!autodocs'],
  args: { products: FOUR_PRODUCTS },
  play: async ({ canvasElement }) => {
    // 숨김/펼침 자체의 카운트 검증은 AccordionBreakdown 자신의 스토리가 이미
    // 담당한다(이 카드엔 인디케이터도 같은 listitem 역할을 써서 개수가 섞인다) —
    // 여기서는 카드가 AccordionBreakdown 에 상품 목록을 올바르게 넘기는지만 본다.
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '총 4건 제품 펼쳐보기' }));

    await expect(canvas.getByText('[풀무원] 동물복지 치킨 너겟 오리지널')).toBeInTheDocument();
  },
};

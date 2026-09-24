import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { DisplaySectionList, type DisplaySectionListProps } from './DisplaySectionList';

/**
 * Storybook 전용 고정값 — 예전엔 `mock.ts`(실 API 연동 전 홈 화면이 그대로 쓰던 목데이터)를
 * 재사용했지만, `#136`에서 홈이 실 API(`useHomeRecommendations`)로 옮겨가며 `mock.ts`를
 * 지웠다. 이 컴포넌트는 여전히 순수 presentational이라 스토리용 고정값만 여기 남긴다.
 */
const SECTIONS: Omit<DisplaySectionListProps, 'onAddToCart' | 'className'>[] = [
  {
    title: '🛒 지금 가장 많이 담는 특가',
    subtitle: '꼭 담아야 할 추천 특가템 최대 50%  OFF',
    href: '/products?section=hot-deals',
    products: [
      {
        id: 'p1',
        imageAlt: '',
        deliveryLabel: '샛별배송',
        name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
        originalPriceLabel: '3,400',
        discountLabel: '25%',
        priceLabel: '2,780원~',
        reviewCountLabel: '9,999+',
        couponPercentLabel: '+25%',
        kurlyOnly: true,
      },
      {
        id: 'p2',
        imageAlt: '',
        deliveryLabel: '샛별배송',
        name: '[도연하다] 스지 된장찌개',
        originalPriceLabel: '7,900',
        discountLabel: '32%',
        priceLabel: '5,372원~',
        reviewCountLabel: '9,999+',
        couponPercentLabel: '+25%',
        kurlyOnly: true,
      },
      {
        id: 'p3',
        imageAlt: '',
        deliveryLabel: '샛별배송',
        name: '[스미후루] 감숙왕 바나나 2종',
        originalPriceLabel: '4,500',
        discountLabel: '15%',
        priceLabel: '3,825원~',
        reviewCountLabel: '5,000+',
        couponPercentLabel: '+25%',
        kurlyOnly: true,
      },
      {
        id: 'p4',
        imageAlt: '',
        deliveryLabel: '샛별배송',
        name: '[우리쌀 왕호두] 호두과자 (30g X 10개)',
        originalPriceLabel: '9,000',
        discountLabel: '20%',
        priceLabel: '7,200원~',
        reviewCountLabel: '2,500+',
        couponPercentLabel: '+25%',
        kurlyOnly: true,
      },
    ],
  },
  {
    title: '🛒 1년에 단 4번, 그랜드뷰컬페',
    subtitle: '100% 당첨 랜덤쿠폰부터 99% 래플까지',
    href: '/products?section=grand-view-cafe',
    products: [
      {
        id: 'p5',
        imageAlt: '',
        deliveryLabel: '샛별배송',
        name: '[선물세트] 태우한우 1+ 실속 구이 세트 (냉동)',
        originalPriceLabel: '217,000',
        discountLabel: '33%',
        priceLabel: '145,000원~',
        reviewCountLabel: '9,999+',
        couponPercentLabel: '+25%',
        kurlyOnly: true,
      },
      {
        id: 'p6',
        imageAlt: '',
        deliveryLabel: '샛별배송',
        name: '[오리온] 초코송이 36g x 18입',
        originalPriceLabel: '10,800',
        discountLabel: '7%',
        priceLabel: '10,040원~',
        reviewCountLabel: '9,999+',
        couponPercentLabel: '+25%',
        kurlyOnly: true,
      },
    ],
  },
  {
    title: '🎁 눈 깜짝하면 다가올 추석 준비!',
    subtitle: '최대 혜택으로 선물하세요! 쿠폰+최대 77% OFF',
    href: '/products?section=chuseok-prep',
    products: [
      {
        id: 'p9',
        imageAlt: '',
        deliveryLabel: '샛별배송',
        name: '[일상식탁] 부산식 얼큰 낙곱새',
        originalPriceLabel: '18,900',
        discountLabel: '13%',
        priceLabel: '16,443원~',
        reviewCountLabel: '9,999+',
        couponPercentLabel: '+25%',
        kurlyOnly: true,
      },
      {
        id: 'p10',
        imageAlt: '',
        deliveryLabel: '샛별배송',
        name: '[사리원] 소불고기 전골',
        originalPriceLabel: '15,900',
        discountLabel: '15%',
        priceLabel: '13,515원~',
        reviewCountLabel: '9,999+',
        couponPercentLabel: '+25%',
        kurlyOnly: true,
      },
    ],
  },
];

const meta = {
  title: 'organisms/home/DisplaySectionList',
  component: DisplaySectionList,
  tags: ['autodocs'],
  args: {
    ...SECTIONS[0],
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
  args: { ...SECTIONS[1] },
};

/** 추석 준비 섹션 (node 577:20695). */
export const ChuseokPrep: Story = {
  args: { ...SECTIONS[2] },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

/** 카드의 담기 클릭 시 상품 id 와 함께 onAddToCart 가 호출된다. */
export const ClickAddToCart: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const firstProduct = SECTIONS[0]!.products[0]!;
    await userEvent.click(
      canvas.getByRole('button', { name: `${firstProduct.name} 장바구니 담기` }),
    );
    await expect(args.onAddToCart).toHaveBeenCalledWith(firstProduct.id);
  },
};

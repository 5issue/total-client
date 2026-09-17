import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import type { FridgeItem } from '@/components/organisms/mypage/MyFridgeView/model';

import { KitchenInventoryCard } from './KitchenInventoryCard';

const BASE_ITEM: FridgeItem = {
  id: 'milk',
  productId: 'milk-901',
  name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
  tagline: '가격, 퀄리티 모두 만족스러운 1A등급 우유',
  imageSrc: '/placeholders/product-thumbnail.webp',
  quantityLabel: '1개',
  expiryLabel: '08.27(수)까지',
  dDayLabel: 'D-2',
  storageType: 'refrigerated',
  expired: false,
  filters: ['stored', 'expiring'],
  priceLabel: '2,780원',
  originalPriceLabel: '3,400원',
  memberPriceLabel: '2,670원',
  storageTip: { title: '전용목장우유', steps: ['개봉하지 않은 상태로 냉장실에 보관하세요.'] },
};

const meta = {
  title: 'molecules/mypage/KitchenInventoryCard',
  component: KitchenInventoryCard,
  tags: ['autodocs'],
  args: {
    item: BASE_ITEM,
    checked: false,
    onCheckedChange: fn(),
    onRefill: fn(),
    onShowStorageTip: fn(),
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-45">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof KitchenInventoryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Frozen: Story = {
  name: '냉동 상품',
  args: { item: { ...BASE_ITEM, storageType: 'frozen', dDayLabel: 'D-121' } },
};

export const Expired: Story = {
  name: '만료(냉장)',
  args: { item: { ...BASE_ITEM, expired: true, dDayLabel: 'D+2', filters: ['expired'] } },
};

export const ExpiredFrozen: Story = {
  name: '만료(냉동)',
  args: {
    item: {
      ...BASE_ITEM,
      storageType: 'frozen',
      expired: true,
      dDayLabel: 'D+4',
      filters: ['expired'],
    },
  },
};

export const SoldOut: Story = {
  name: '품절',
  args: { item: { ...BASE_ITEM, soldOut: true } },
};

export const Checked: Story = {
  args: { checked: true },
};

export const ToggleCheckbox: Story = {
  name: '체크박스 클릭 시 상태 토글',
  render: (args) => {
    function Controlled() {
      const [checked, setChecked] = useState(args.checked);
      return <KitchenInventoryCard {...args} checked={checked} onCheckedChange={setChecked} />;
    }
    return <Controlled />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
  },
};

export const ClickRefill: Story = {
  name: '채워넣기 클릭 시 핸들러 호출',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '채워넣기' }));
    await expect(args.onRefill).toHaveBeenCalledTimes(1);
  },
};

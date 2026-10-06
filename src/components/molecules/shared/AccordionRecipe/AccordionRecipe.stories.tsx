import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { AccordionRecipe } from './AccordionRecipe';

/** Figma "Accordion_Recipe" 샘플 데이터. 스토리 안에서만 정의. */
const OWNED_ITEMS = [
  { name: '[데체코] 구르메 파스타면 6종', badge: 'D-4' },
  { name: '[데체코] 구르메 파스타면 6종', badge: 'D-4' },
  { name: '[데체코] 구르메 파스타면 6종', badge: 'D-4' },
];

const INGREDIENTS = [
  { name: '우유', amount: '50mL' },
  { name: '계란', amount: '2개' },
  { name: '파프리카', amount: '30g' },
  { name: '가염버터', amount: '5g' },
  { name: '생크림', amount: '20mL' },
  { name: '당근', amount: '50g' },
  { name: '파', amount: '20g' },
];

const meta = {
  title: 'molecules/shared/AccordionRecipe',
  component: AccordionRecipe,
  args: {
    title: '냉장고 속 재료 3개로 요리를 할 수 있어요',
    ownedCount: 3,
    neededCount: 2,
    ownedItems: OWNED_ITEMS,
    ingredients: INGREDIENTS,
    defaultOpen: true,
  },
  argTypes: {
    defaultOpen: { control: 'boolean' },
    ownedItems: { control: false },
    ingredients: { control: false },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof AccordionRecipe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Collapsed: Story = {
  args: { defaultOpen: false },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const TogglesPanel: Story = {
  tags: ['!autodocs'],
  args: { defaultOpen: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('사용 재료')).not.toBeVisible();
    await userEvent.click(canvas.getByRole('button'));
    await expect(canvas.getByText('사용 재료')).toBeVisible();
  },
};

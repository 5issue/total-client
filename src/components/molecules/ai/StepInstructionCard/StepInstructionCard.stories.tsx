import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { StepInstructionCard } from './StepInstructionCard';

const meta = {
  title: 'molecules/ai/StepInstructionCard',
  component: StepInstructionCard,
  tags: ['autodocs'],
  args: {
    step: 1,
    imageSrc: '/graphic-icons/coupon-discount.webp',
    imageAlt: '재료 손질 단계',
    instruction:
      '엑스트라버진 올리브오일, 파마산 치즈가루 100g, 국내산 레몬 3입, 꽃소금 500g, 통후추 50g, 식용유 900ml 등 필요한 재료를 깨끗이 씻고 손질해 준비해요.',
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StepInstructionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const StepTwo: Story = {
  name: '2단계',
  args: { step: 2 },
};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { CarouselArrow } from './CarouselArrow';

const meta = {
  title: 'atoms/CarouselArrow',
  component: CarouselArrow,
  tags: ['autodocs'],
  args: {
    direction: 'left',
    variant: 'outline',
    'aria-label': '이전',
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['left', 'right'],
    },
    variant: {
      control: 'select',
      options: ['outline', 'filled'],
    },
  },
} satisfies Meta<typeof CarouselArrow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Outline: Story = {};

export const Filled: Story = {
  args: { variant: 'filled' },
};

export const AllVariants: Story = {
  name: '전체 조합 (direction × variant)',
  render: () => (
    <div className="flex gap-6">
      {(['outline', 'filled'] as const).map((variant) => (
        <div
          key={variant}
          className={`border-border rounded-m flex flex-col gap-2 border p-4 ${variant === 'outline' ? 'bg-black' : ''}`}
        >
          <span
            className={`text-caption-m ${variant === 'outline' ? 'text-surface-secondary' : 'text-fg-secondary'}`}
          >
            {variant}
          </span>
          <div className="flex gap-3">
            <CarouselArrow direction="left" variant={variant} aria-label="이전" />
            <CarouselArrow direction="right" variant={variant} aria-label="다음" />
          </div>
        </div>
      ))}
    </div>
  ),
};

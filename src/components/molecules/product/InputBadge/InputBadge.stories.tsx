import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { InputBadge } from './InputBadge';

const meta = {
  title: 'molecules/product/InputBadge',
  component: InputBadge,
  tags: ['autodocs'],
  args: {
    size: 'M',
    color: 'light',
    children: 'D-4',
  },
  argTypes: {
    size: { control: 'radio', options: ['S', 'M'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof InputBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Expire: Story = {
  args: { size: 'M', color: 'expire', children: 'D-1' },
};

export const SelectionTagLight: Story = {
  args: { size: 'S', color: 'light', children: '아보카도' },
};

export const SelectionTagSelected: Story = {
  args: { size: 'S', color: 'selected', children: '아보카도' },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-3">
        <InputBadge size="S" color="light">
          아보카도
        </InputBadge>
        <InputBadge size="S" color="selected">
          아보카도
        </InputBadge>
      </div>
      <div className="flex items-center gap-3">
        <InputBadge size="M" color="light">
          D-4
        </InputBadge>
        <InputBadge size="M" color="expire">
          D-1
        </InputBadge>
      </div>
    </div>
  ),
};

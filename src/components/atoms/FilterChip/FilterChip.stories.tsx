import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';

import { FilterChip } from './FilterChip';

const meta = {
  title: 'atoms/FilterChip',
  component: FilterChip,
  tags: ['autodocs'],
  args: {
    children: 'Kurly  Only',
    leadingIcon: 'member',
    selected: false,
    tone: 'basic',
    onClick: fn(),
  },
  argTypes: {
    selected: { control: 'boolean' },
    tone: { control: 'radio', options: ['basic', 'gradient'] },
    disabled: { control: 'boolean' },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FilterChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

export const Gradient: Story = {
  args: { tone: 'gradient', children: '멤버스혜택' },
};

export const GradientSelected: Story = {
  args: { tone: 'gradient', selected: true, children: '멤버스혜택' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      <FilterChip {...args} tone="basic" selected={false}>
        Kurly Only
      </FilterChip>
      <FilterChip {...args} tone="basic" selected={true}>
        Kurly Only
      </FilterChip>
      <FilterChip {...args} tone="gradient" selected={false}>
        멤버스혜택
      </FilterChip>
      <FilterChip {...args} tone="gradient" selected={true}>
        멤버스혜택
      </FilterChip>
    </div>
  ),
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const ClickFiresOnClick: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const chip = within(canvasElement).getByRole('button');
    await userEvent.click(chip);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const DisabledChipIsUnclickable: Story = {
  tags: ['!autodocs'],
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const chip = within(canvasElement).getByRole('button');
    await expect(chip).toBeDisabled();
    fireEvent.click(chip);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

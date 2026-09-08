import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';

import { AddressChip } from './AddressChip';

const meta = {
  title: 'molecules/address/AddressChip',
  component: AddressChip,
  tags: ['autodocs'],
  args: {
    type: 'home',
    label: '우리집',
    selected: false,
    onClick: fn(),
  },
  argTypes: {
    type: { control: 'radio', options: ['home', 'company', 'custom'] },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof AddressChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AllTypes: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      <AddressChip {...args} type="home" label="우리집" selected={false} />
      <AddressChip {...args} type="home" label="우리집" selected={true} />
      <AddressChip {...args} type="company" label="회사" selected={false} />
      <AddressChip {...args} type="company" label="회사" selected={true} />
      <AddressChip {...args} type="custom" label="직접입력" selected={false} />
      <AddressChip {...args} type="custom" label="직접입력" selected={true} />
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

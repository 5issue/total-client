import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';

import { Chip } from './Chip';

const meta = {
  title: 'atoms/Chip',
  component: Chip,
  tags: ['autodocs'],
  args: {
    children: '매주',
    selected: false,
    onClick: fn(),
  },
  argTypes: {
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onRemove: { control: false },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Removable: Story = {
  args: { children: '샐러드', onRemove: fn(), onClick: undefined },
};

export const RemovableDisabled: Story = {
  args: { children: '샐러드', onRemove: fn(), onClick: undefined, disabled: true },
};

export const SelectStates: Story = {
  render: (args) => (
    <div className="flex gap-3">
      <Chip {...args} selected={false}>
        매주
      </Chip>
      <Chip {...args} selected={true}>
        매주
      </Chip>
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

export const RemoveButtonFiresOnRemove: Story = {
  tags: ['!autodocs'],
  args: { children: '샐러드', onRemove: fn(), onClick: undefined },
  play: async ({ canvasElement, args }) => {
    const removeButton = within(canvasElement).getByRole('button', { name: '샐러드 삭제' });
    await userEvent.click(removeButton);
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
  },
};

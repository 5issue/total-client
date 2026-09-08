import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { TagChip } from './TagChip';

const meta = {
  title: 'atoms/TagChip',
  component: TagChip,
  tags: ['autodocs'],
  args: {
    children: '과일과 채소 위주의 비건식',
    onClick: fn(),
  },
  argTypes: {
    onRefresh: { control: false },
    onRemove: { control: false },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TagChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Reset: Story = {
  args: { children: '다시 추천 받기', onRefresh: fn(), onClick: undefined },
};

export const Removable: Story = {
  args: { children: '국·반찬·메인요리', onRemove: fn(), onClick: undefined },
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

export const RemoveButtonFiresOnRemove: Story = {
  tags: ['!autodocs'],
  args: { children: '국·반찬·메인요리', onRemove: fn(), onClick: undefined },
  play: async ({ canvasElement, args }) => {
    const removeButton = within(canvasElement).getByRole('button', {
      name: '국·반찬·메인요리 삭제',
    });
    await userEvent.click(removeButton);
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
  },
};

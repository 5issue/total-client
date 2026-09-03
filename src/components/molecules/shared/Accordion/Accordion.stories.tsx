import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Accordion } from './Accordion';

const meta = {
  title: 'molecules/shared/Accordion',
  component: Accordion,
  args: { header: '유제품', children: null, defaultOpen: true, onToggle: fn() },
  argTypes: {
    defaultOpen: { control: 'boolean' },
    disabled: { control: 'boolean' },
    open: { control: false },
    header: { control: false },
    children: { control: false },
    onToggle: { control: false },
    headerClassName: { control: false },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="border-border rounded-m max-w-md border">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 제네릭 셸 — 헤더 + 임의 패널. 도메인 예시는 AccordionFilter/Order/Breakdown/Recipe 참고. */
export const Default: Story = {
  render: (args) => (
    <Accordion {...args}>
      <p className="text-body-s text-fg-secondary px-4 pb-3">패널 내용</p>
    </Accordion>
  ),
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const TogglesOnClick: Story = {
  tags: ['!autodocs'],
  args: { defaultOpen: false },
  render: (args) => (
    <Accordion {...args} header="자세히 보기">
      <p className="text-body-s text-fg-secondary px-4 pb-3">패널 내용</p>
    </Accordion>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: '자세히 보기' });
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText('패널 내용')).not.toBeVisible();
    await userEvent.click(btn);
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText('패널 내용')).toBeVisible();
    await expect(args.onToggle).toHaveBeenLastCalledWith(true);
  },
};

function ControlledDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Accordion header="제어 모드" open={open} onToggle={setOpen}>
      <p className="text-body-s text-fg-secondary px-4 pb-3">열림: {String(open)}</p>
    </Accordion>
  );
}

export const ControlledMode: Story = {
  tags: ['!autodocs'],
  render: () => <ControlledDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '제어 모드' }));
    await expect(canvas.getByText('열림: true')).toBeVisible();
  },
};

export const Disabled: Story = {
  tags: ['!autodocs'],
  args: { disabled: true, defaultOpen: false },
  render: (args) => (
    <Accordion {...args} header="비활성">
      <p className="px-4 pb-3">내용</p>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole('button', { name: '비활성' });
    await expect(btn).toBeDisabled();
    await userEvent.click(btn);
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
  },
};

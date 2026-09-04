import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Tooltip, type TooltipProps } from './Tooltip';

/** Tooltip 은 컨트롤드 — 스토리에서 open 을 들고 앵커 버튼으로 토글. */
function Demo({ open: initial = true, ...rest }: Partial<TooltipProps>) {
  const [open, setOpen] = useState(initial);
  return (
    <Tooltip
      open={open}
      onClose={() => setOpen(false)}
      title={rest.title ?? '알림 설정을 켜보세요'}
      description={rest.description}
      placement={rest.placement}
      align={rest.align}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-label-m rounded-m border-border text-fg bg-surface border px-3 py-2"
      >
        앵커
      </button>
    </Tooltip>
  );
}

const meta = {
  title: 'molecules/shared/Tooltip',
  component: Tooltip,
  render: (args) => <Demo key={args.open ? 'open' : 'closed'} {...args} />,
  args: {
    open: true,
    onClose: fn(),
    title: '알림 설정을 켜보세요',
    description: '주문·배송 상태를 바로 받아볼 수 있어요',
    placement: 'top',
    align: 'center',
    children: null,
  },
  argTypes: {
    placement: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    children: { control: false },
    onClose: { control: false },
  },
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="flex min-h-55 items-center justify-center p-12">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 — 앵커 위(top), 꼬리 가운데. 제목 + 설명 2줄. */
export const Default: Story = {};

export const TitleOnly: Story = {
  args: { description: undefined },
};

export const Bottom: Story = {
  args: { placement: 'bottom' },
};

export const Right: Story = {
  args: { placement: 'right', description: undefined },
};

export const AlignStart: Story = {
  args: { placement: 'top', align: 'start' },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const ClosesOnButton: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('dialog')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '닫기' }));
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
  },
};

export const ClosesOnEscape: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
  },
};

export const LabelledByTitle: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('dialog', { name: '알림 설정을 켜보세요' }),
    ).toBeInTheDocument();
  },
};

/** 닫으면 포커스가 열기 전 요소(앵커)로 돌아온다. */
export const RestoresFocusOnClose: Story = {
  tags: ['!autodocs'],
  args: { open: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const anchor = canvas.getByRole('button', { name: '앵커' });
    await userEvent.click(anchor);
    await expect(canvas.getByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    await expect(anchor).toHaveFocus();
  },
};

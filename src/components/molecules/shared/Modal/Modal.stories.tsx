import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, screen, userEvent } from 'storybook/test';

import { Modal, type ModalProps } from './Modal';

/** Button atom(#31) 도입 전 데모용. Figma Modal 의 secondary/primary 버튼 스타일. */
function DemoButton({
  tone = 'secondary',
  children,
  onClick,
}: {
  tone?: 'secondary' | 'primary';
  children: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        tone === 'primary'
          ? 'text-label-xl bg-primary text-primary-foreground rounded-m flex h-11 items-center justify-center'
          : 'text-label-l bg-surface-secondary text-fg rounded-m flex h-11 items-center justify-center'
      }
    >
      {children}
    </button>
  );
}

/** 중첩 모달 — 안쪽을 닫아도 바깥이 열려 있으면 스크롤 잠금·포커스가 유지되는지 확인용. */
function StackedDemo() {
  const [outer, setOuter] = useState(true);
  const [inner, setInner] = useState(false);
  return (
    <div className="p-8">
      <Modal open={outer} onClose={() => setOuter(false)} title="바깥 모달">
        <button
          type="button"
          onClick={() => setInner(true)}
          className="text-label-m rounded-m border-border text-fg bg-surface border px-3 py-2"
        >
          안쪽 열기
        </button>
      </Modal>
      <Modal open={inner} onClose={() => setInner(false)} title="안쪽 모달" />
    </div>
  );
}

function Demo({ open: initial = true, onClose, ...rest }: Partial<ModalProps>) {
  const [open, setOpen] = useState(initial);
  return (
    <div className="p-8">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-label-m rounded-m border-border text-fg bg-surface border px-3 py-2"
      >
        모달 열기
      </button>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          onClose?.();
        }}
        title={rest.title ?? '주문을 취소할까요?'}
        description={rest.description}
        footerLayout={rest.footerLayout}
        footer={
          rest.footer ?? (
            <>
              <DemoButton onClick={() => setOpen(false)}>닫기</DemoButton>
              <DemoButton tone="primary" onClick={() => setOpen(false)}>
                주문 취소
              </DemoButton>
            </>
          )
        }
      >
        {rest.children}
      </Modal>
    </div>
  );
}

const meta = {
  title: 'molecules/shared/Modal',
  component: Modal,
  render: (args) => <Demo {...args} />,
  args: {
    open: true,
    onClose: fn(),
    title: '주문을 취소할까요?',
    description: '취소한 주문은 되돌릴 수 없어요.',
    footerLayout: 'row',
  },
  argTypes: {
    footerLayout: { control: 'inline-radio', options: ['row', 'column'] },
    open: { control: false },
    onClose: { control: false },
    footer: { control: false },
    children: { control: false },
  },
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma "Button_Align=Horizontal" — 가로 균등분할 버튼. */
export const Default: Story = {};

/** Figma "Button_Align=Vertical" — 세로 스택 버튼. */
export const VerticalButtons: Story = {
  args: { footerLayout: 'column' },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const TrapsFocusAndLabelled: Story = {
  tags: ['!autodocs'],
  play: async () => {
    const dialog = await screen.findByRole('dialog', { name: '주문을 취소할까요?' });
    await expect(dialog).toBeInTheDocument();
    // Tab 이 마지막 버튼에서 첫 버튼으로 순환
    const close = screen.getByRole('button', { name: '닫기' });
    const confirm = screen.getByRole('button', { name: '주문 취소' });
    confirm.focus();
    await userEvent.tab();
    await expect(close).toHaveFocus();
  },
};

export const ClosesOnEscape: Story = {
  tags: ['!autodocs'],
  play: async () => {
    await expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  },
};

export const ClosesOnCancelButton: Story = {
  tags: ['!autodocs'],
  play: async () => {
    await userEvent.click(await screen.findByRole('button', { name: '닫기' }));
    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  },
};

/** 중첩 모달: 안쪽을 닫아도 바깥이 열려 있으면 body 스크롤 잠금이 풀리지 않는다. */
export const StackedKeepsScrollLock: Story = {
  tags: ['!autodocs'],
  render: () => <StackedDemo />,
  play: async () => {
    await userEvent.click(await screen.findByRole('button', { name: '안쪽 열기' }));
    await expect(await screen.findByRole('dialog', { name: '안쪽 모달' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(screen.queryByRole('dialog', { name: '안쪽 모달' })).not.toBeInTheDocument();
    await expect(screen.getByRole('dialog', { name: '바깥 모달' })).toBeInTheDocument();
    await expect(document.body).toHaveStyle({ overflow: 'hidden' });
  },
};

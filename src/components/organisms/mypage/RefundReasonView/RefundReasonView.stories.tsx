import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, screen, userEvent, within } from 'storybook/test';

import { RefundReasonView } from './RefundReasonView';

const meta = {
  title: 'organisms/mypage/RefundReasonView',
  component: RefundReasonView,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    defaultReasonId: null,
    defaultSheetOpen: false,
  },
  argTypes: {
    defaultReasonId: { control: false },
    defaultSheetOpen: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto flex min-h-dvh max-w-screen-sm flex-col">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RefundReasonView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 미선택 — 플레이스홀더, CTA 비활성. Figma node 666-29306. */
export const Default: Story = {};

/** 시트 열림, 라디오 미선택. Figma node 666-29905. */
export const SheetOpen: Story = {
  args: { defaultSheetOpen: true },
};

/** 상품불량 선택 + 시트 열림. Figma node 666-30033. */
export const Selected: Story = {
  args: { defaultReasonId: 'defect', defaultSheetOpen: true },
};

/** 드롭다운으로 시트를 열고, 기본은 아무 라디오도 선택되지 않는다. */
export const OpensSheetUnselected: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const next = canvas.getByRole('button', { name: '다음' });
    await expect(next).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: '반품 사유를 선택해주세요' }));
    const dialog = await screen.findByRole('dialog', { name: '반품 사유를 선택해주세요' });
    await expect(dialog).toBeVisible();
    const radios = within(dialog).getAllByRole('radio');
    for (const radio of radios) {
      await expect(radio).not.toBeChecked();
    }
    await expect(
      within(dialog).getByRole('radio', { name: '단순변심 (냉장 및 냉동상품 불가)' }),
    ).toBeDisabled();
  },
};

/** 상품불량을 고르면 트리거 문구가 바뀌고 다음이 활성된다. 시트는 열린 채로 둔다. */
export const SelectsReason: Story = {
  tags: ['!autodocs'],
  args: { defaultSheetOpen: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = await screen.findByRole('dialog', { name: '반품 사유를 선택해주세요' });
    await userEvent.click(within(dialog).getByRole('radio', { name: '상품불량' }));
    await expect(canvas.getByRole('button', { name: '다음' })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: '상품불량' })).toBeVisible();
  },
};

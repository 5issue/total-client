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
    items: { control: false },
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

/**
 * 상품불량을 고르면 트리거 문구가 바뀌지만, 상세 사유·사진이 아직 없어 `다음`은
 * 여전히 비활성이다(node 666-29703 — 사유 선택 후 상세 미입력 상태).
 */
export const SelectsReason: Story = {
  tags: ['!autodocs'],
  args: { defaultSheetOpen: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = await screen.findByRole('dialog', { name: '반품 사유를 선택해주세요' });
    await userEvent.click(within(dialog).getByRole('radio', { name: '상품불량' }));
    await expect(canvas.getByRole('button', { name: '상품불량' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: '다음' })).toBeDisabled();
  },
};

/**
 * 사유 선택 + 상세 사유 10자 이상 + 사진 1장을 모두 채우면 `다음`이 활성된다
 * (node 666-29851). 10자 미만으로 입력을 시작하면 "최소 10자 이상 입력해주세요"
 * 에러가 뜨고, 10자를 채우면 사라진다.
 */
export const CompletesReason: Story = {
  tags: ['!autodocs'],
  args: { defaultReasonId: 'defect' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const next = canvas.getByRole('button', { name: '다음' });
    await expect(next).toBeDisabled();

    const textarea = canvas.getByPlaceholderText('상세 사유를 입력해주세요');
    await userEvent.type(textarea, '파손됨');
    await expect(canvas.getByRole('alert')).toHaveTextContent('최소 10자 이상 입력해주세요');
    await expect(next).toBeDisabled();

    await userEvent.type(textarea, '. 상세 내용 추가');
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    await expect(next).toBeDisabled();

    const file = new File(['photo'], 'refund.png', { type: 'image/png' });
    await userEvent.upload(canvas.getByLabelText('사진 추가 (최대 3장)', { exact: false }), file);

    await expect(next).toBeEnabled();
  },
};

/**
 * 반품 항목이 2건이면 사유 그룹도 2개 반복되고, 한 항목만 사유를 채워선 `다음`이
 * 활성화되지 않는다 — "항목마다 사유가 무조건 있어야 한다"(node 848-82875).
 */
export const MultipleItemsEachNeedReason: Story = {
  tags: ['!autodocs'],
  args: {
    items: [
      { id: 'item-1', name: '[연세우유 x 마켓컬리] 전용목장우유 900mL', price: 2720, quantity: 1 },
      { id: 'item-2', name: "[Kurly's] 동물복지 유정란 20구", price: 10051, quantity: 1 },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const triggers = canvas.getAllByRole('button', { name: '반품 사유를 선택해주세요' });
    await expect(triggers).toHaveLength(2);

    const next = canvas.getByRole('button', { name: '다음' });
    await expect(next).toBeDisabled();

    // 첫 번째 항목만 사유를 골라도 두 번째 항목이 비어 있어 여전히 비활성.
    const [firstTrigger] = triggers;
    await userEvent.click(firstTrigger!);
    const dialog = await screen.findByRole('dialog', { name: '반품 사유를 선택해주세요' });
    await userEvent.click(within(dialog).getByRole('radio', { name: '상품불량' }));
    await userEvent.keyboard('{Escape}');
    await expect(next).toBeDisabled();
    await expect(canvas.getAllByRole('button', { name: '반품 사유를 선택해주세요' })).toHaveLength(
      1,
    );
  },
};

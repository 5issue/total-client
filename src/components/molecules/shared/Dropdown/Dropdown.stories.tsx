import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Dropdown, type DropdownProps } from './Dropdown';

const SORT_OPTIONS = [
  { value: 'recommend', label: '추천순' },
  { value: 'new', label: '신상품순' },
  { value: 'sales', label: '판매량순' },
  { value: 'benefit', label: '혜택순' },
  { value: 'price-asc', label: '낮은 가격순' },
  { value: 'price-desc', label: '높은 가격순' },
];

/** Dropdown 은 컨트롤드 — 스토리에서 상태를 들고 있는 래퍼. */
function Controlled({ value: initial = null, onChange, ...rest }: DropdownProps) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <Dropdown
      {...rest}
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    />
  );
}

const meta = {
  title: 'molecules/shared/Dropdown',
  component: Dropdown,
  render: (args) => <Controlled {...args} />,
  args: {
    label: '정렬 기준',
    options: SORT_OPTIONS,
    value: null,
    onChange: fn(),
    placeholder: '선택하기',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['box', 'text'] },
    block: { control: 'boolean' },
    disabled: { control: 'boolean' },
    options: { control: false },
    onChange: { control: false },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="min-h-80 max-w-sm">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 — box 트리거, 선택 없음(placeholder). */
export const Default: Story = {};

export const Selected: Story = {
  args: { value: 'benefit' },
};

/** Figma "Dropdown_Box Size=L" — 컨테이너 폭에 맞춤, 라벨↔쉐브론 양끝 정렬. */
export const Block: Story = {
  args: {
    block: true,
    label: '반품 사유',
    options: [
      { value: 'defect', label: '상품불량' },
      { value: 'change-mind', label: '단순 변심' },
      { value: 'wrong', label: '오배송' },
    ],
    value: 'defect',
  },
};

/** Figma "Dropdown_Text" — 테두리 없는 인라인 트리거. */
export const Text: Story = {
  args: { variant: 'text', value: 'recommend' },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'recommend' },
};

/** 옵션이 없을 때 — 트리거는 placeholder 를 유지하고 열리지 않는다. */
export const Empty: Story = {
  args: { options: [], value: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox'));
    await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
  },
};

/** 열린 상태 — 트리거를 누르면 listbox 가 뜨고 선택값이 강조된다. */
export const Open: Story = {
  args: { value: 'benefit' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox'));
    const listbox = await canvas.findByRole('listbox');
    await expect(listbox).toBeInTheDocument();
    await expect(canvas.getByRole('option', { name: '혜택순' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const SelectsWithKeyboard: Story = {
  tags: ['!autodocs'],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}'); // open
    await userEvent.keyboard('{ArrowDown}{ArrowDown}'); // recommend → new → sales
    await userEvent.keyboard('{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith('sales');
    await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

export const ClosesOnEscape: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox'));
    await expect(await canvas.findByRole('listbox')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
    await expect(canvas.getByRole('combobox')).toHaveFocus();
  },
};

export const SkipsDisabledOption: Story = {
  tags: ['!autodocs'],
  args: {
    options: [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true },
      { value: 'c', label: 'C' },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('combobox').focus();
    await userEvent.keyboard('{ArrowDown}'); // open, active = A
    await userEvent.keyboard('{ArrowDown}'); // skip disabled B → C
    await userEvent.keyboard('{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith('c');
  },
};

import type { ReactNode } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Radio, type RadioTone } from './Radio';

const meta = {
  title: 'atoms/Radio',
  component: Radio,
  args: {
    label: '기본 배송지로 설정',
    name: 'default-address',
  },
  argTypes: {
    variant: { control: 'select', options: ['ring', 'check'] },
    tone: { control: 'select', options: ['purple', 'black'] },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { checked: true, onChange: () => {} },
};

export const Disabled: Story = {
  args: { disabled: true },
};

/** Figma "Disabled" 행은 unselected 만 정의돼 있다 — 실사용 확장(디자인 확인 필요). */
export const DisabledSelected: Story = {
  args: { disabled: true, checked: true, onChange: () => {} },
};

export const BlackTone: Story = {
  args: { tone: 'black', checked: true, onChange: () => {} },
};

export const CheckVariant: Story = {
  args: { variant: 'check', checked: true, onChange: () => {} },
};

/** 체크마크는 selected 가 아니어도 항상 그려진다(옅은 neutral-400) — Figma 실측 확인. */
export const CheckVariantUnselected: Story = {
  args: { variant: 'check' },
};

/** 행: Radio_Purple/Radio_Check/Radio_Black, 열: Default/Selected/Disabled 로 9개 상태를 한 화면에서 비교한다. */
export const AllStates: Story = {
  render: () => {
    const columns = ['Default', 'Selected', 'Disabled'] as const;
    type Column = (typeof columns)[number];

    const renderRing = (rowLabel: string, tone: RadioTone, col: Column) => (
      <Radio
        label={`${rowLabel} ${col}`}
        name={`preview-${rowLabel}-${col}`}
        tone={tone}
        checked={col === 'Selected'}
        disabled={col === 'Disabled'}
        onChange={() => {}}
      />
    );
    const renderCheck = (rowLabel: string, col: Column) => (
      <Radio
        label={`${rowLabel} ${col}`}
        name={`preview-${rowLabel}-${col}`}
        variant="check"
        checked={col === 'Selected'}
        disabled={col === 'Disabled'}
        onChange={() => {}}
      />
    );

    const rows: { label: string; renderCell: (col: Column) => ReactNode }[] = [
      { label: 'Radio_Purple', renderCell: (col) => renderRing('Radio_Purple', 'purple', col) },
      { label: 'Radio_Check', renderCell: (col) => renderCheck('Radio_Check', col) },
      { label: 'Radio_Black', renderCell: (col) => renderRing('Radio_Black', 'black', col) },
    ];

    return (
      <table className="border-separate border-spacing-4">
        <thead>
          <tr>
            <th />
            {columns.map((c) => (
              <th key={c} className="text-label-m text-fg-tertiary font-normal">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th className="text-label-m text-fg-tertiary pr-2 text-right font-normal">
                {row.label}
              </th>
              {columns.map((col) => (
                <td key={col}>{row.renderCell(col)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const ClickSelects: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const radio = within(canvasElement).getByRole('radio');
    await expect(radio).not.toBeChecked();
    await userEvent.click(radio);
    await expect(radio).toBeChecked();
  },
};

export const LabelIsAssociated: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    // label 이 sr-only 여도 htmlFor 로 접근성 이름이 연결돼야 한다
    await expect(
      within(canvasElement).getByRole('radio', { name: '기본 배송지로 설정' }),
    ).toBeInTheDocument();
  },
};

export const DisabledCannotBeClicked: Story = {
  tags: ['!autodocs'],
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const radio = within(canvasElement).getByRole('radio');
    await userEvent.click(radio, { pointerEventsCheck: 0 });
    await expect(radio).not.toBeChecked();
  },
};

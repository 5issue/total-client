import type { ReactNode } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Checkbox, type CheckboxVariant } from './Checkbox';

const meta = {
  title: 'atoms/Checkbox',
  component: Checkbox,
  args: {
    label: '전체 동의',
  },
  argTypes: {
    variant: { control: 'select', options: ['outline', 'filled'] },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

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

export const Filled: Story = {
  args: { variant: 'filled' },
};

export const FilledSelected: Story = {
  args: { variant: 'filled', checked: true, onChange: () => {} },
};

/**
 * Figma "Checkbox" 프레임과 동일한 배치(행: Outline/Filled, 열: Default/Selected/
 * Disabled)로 6개 상태를 한 화면에서 비교한다.
 */
export const AllStates: Story = {
  render: () => {
    const columns = ['Default', 'Selected', 'Disabled'] as const;
    type Column = (typeof columns)[number];
    const variants: CheckboxVariant[] = ['outline', 'filled'];

    const renderCell = (variant: CheckboxVariant, col: Column) => (
      <Checkbox
        label={`${variant} ${col}`}
        variant={variant}
        checked={col === 'Selected'}
        disabled={col === 'Disabled'}
        onChange={() => {}}
      />
    );

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
          {variants.map((variant) => (
            <tr key={variant}>
              <th className="text-label-m text-fg-tertiary pr-2 text-right font-normal capitalize">
                {variant}
              </th>
              {columns.map((col) => (
                <td key={col}>{renderCell(variant, col) as ReactNode}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const ClickToggles: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole('checkbox');
    await expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();
  },
};

export const LabelIsAssociated: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('checkbox', { name: '전체 동의' }),
    ).toBeInTheDocument();
  },
};

export const DisabledCannotBeClicked: Story = {
  tags: ['!autodocs'],
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole('checkbox');
    await userEvent.click(checkbox, { pointerEventsCheck: 0 });
    await expect(checkbox).not.toBeChecked();
  },
};

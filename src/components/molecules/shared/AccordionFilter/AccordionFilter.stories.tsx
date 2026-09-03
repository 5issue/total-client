import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { AccordionFilter, type AccordionFilterProps } from './AccordionFilter';

/** Figma "Accordion_Filter" 샘플 데이터 (유제품 카테고리). 스토리 안에서만 정의. */
const OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'milk', label: '우유·두유' },
  { value: 'yogurt', label: '요거트·생크림' },
  { value: 'icecream', label: '아이스크림' },
  { value: 'processed-cheese', label: '가공치즈' },
  { value: 'natural-cheese', label: '자연치즈' },
  { value: 'butter', label: '버터' },
];

function Controlled({ value: v0 = [], ...rest }: Partial<AccordionFilterProps>) {
  const [value, setValue] = useState<string[]>(v0);
  return (
    <AccordionFilter
      title={rest.title ?? '유제품'}
      options={rest.options ?? OPTIONS}
      value={value}
      onChange={setValue}
      defaultOpen={rest.defaultOpen}
    />
  );
}

const meta = {
  title: 'molecules/shared/AccordionFilter',
  component: AccordionFilter,
  render: (args) => <Controlled {...args} />,
  args: { title: '유제품', options: OPTIONS, value: [], onChange: fn(), defaultOpen: true },
  argTypes: {
    defaultOpen: { control: 'boolean' },
    options: { control: false },
    value: { control: false },
    onChange: { control: false },
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
} satisfies Meta<typeof AccordionFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Collapsed: Story = {
  args: { defaultOpen: false },
};

export const WithSelection: Story = {
  args: { value: ['milk', 'yogurt'] },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const TogglesOptions: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const milk = canvas.getByRole('checkbox', { name: '우유·두유' });
    await expect(milk).not.toBeChecked();
    await userEvent.click(milk);
    await expect(milk).toBeChecked();
  },
};

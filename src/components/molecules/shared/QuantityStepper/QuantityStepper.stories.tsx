import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { QuantityStepper, type QuantityStepperProps } from './QuantityStepper';

const meta = {
  title: 'molecules/shared/QuantityStepper',
  component: QuantityStepper,
  tags: ['autodocs'],
  args: {
    value: 1,
    onChange: () => {},
  },
} satisfies Meta<typeof QuantityStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledStepper(props: Omit<QuantityStepperProps, 'onChange'> & { value: number }) {
  const [value, setValue] = useState(props.value);
  return <QuantityStepper {...props} value={value} onChange={setValue} />;
}

export const Default: Story = {
  render: () => <ControlledStepper value={1} />,
};

/** Figma "Disabled" — count 0, min 에 도달해 감소 버튼 비활성. */
export const AtMinimum: Story = {
  name: '최소값 (감소 버튼 비활성)',
  render: () => <ControlledStepper value={0} />,
};

export const AtMaximum: Story = {
  name: '최대값 (증가 버튼 비활성)',
  render: () => <ControlledStepper value={5} max={5} />,
};

export const ClickIncreasesValue: Story = {
  name: '클릭 시 값 증가',
  render: () => <ControlledStepper value={1} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '수량 증가' }));
    await expect(canvas.getByText('2')).toBeInTheDocument();
  },
};

export const ClickDecreasesValue: Story = {
  name: '클릭 시 값 감소',
  render: () => <ControlledStepper value={2} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '수량 감소' }));
    await expect(canvas.getByText('1')).toBeInTheDocument();
  },
};

export const DecreaseDisabledAtMin: Story = {
  name: '최소값에서 감소 버튼 클릭 무시',
  render: () => <ControlledStepper value={0} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const decrease = canvas.getByRole('button', { name: '수량 감소' });
    await expect(decrease).toBeDisabled();
    await expect(canvas.getByText('0')).toBeInTheDocument();
  },
};

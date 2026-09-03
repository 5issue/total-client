import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { ServiceSwitch, type ServiceSwitchOption } from './ServiceSwitch';

const OPTIONS: [ServiceSwitchOption, ServiceSwitchOption] = [
  { id: 'market', label: '마켓컬리' },
  { id: 'beauty', label: '뷰티컬리' },
];

const DISABLED_OPTIONS: [ServiceSwitchOption, ServiceSwitchOption] = [
  { id: 'market', label: '마켓컬리' },
  { id: 'beauty', label: '뷰티컬리', disabled: true },
];

const meta = {
  title: 'molecules/shared/ServiceSwitch',
  component: ServiceSwitch,
  tags: ['autodocs'],
  args: {
    options: OPTIONS,
    activeId: OPTIONS[0].id,
    onChange: () => {},
  },
} satisfies Meta<typeof ServiceSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledServiceSwitch({
  options,
}: {
  options: [ServiceSwitchOption, ServiceSwitchOption];
}) {
  const [activeId, setActiveId] = useState(options[0].id);
  return <ServiceSwitch options={options} activeId={activeId} onChange={setActiveId} />;
}

export const Default: Story = {
  render: () => <ControlledServiceSwitch options={OPTIONS} />,
};

export const Disabled: Story = {
  name: '옵션 비활성',
  render: () => <ControlledServiceSwitch options={DISABLED_OPTIONS} />,
};

export const ClickInteraction: Story = {
  name: '클릭 시 선택 전환',
  render: () => <ControlledServiceSwitch options={OPTIONS} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const beauty = canvas.getByRole('tab', { name: '뷰티컬리' });
    await userEvent.click(beauty);
    await expect(beauty).toHaveAttribute('aria-selected', 'true');
  },
};

export const DisabledClickIsNoop: Story = {
  name: '비활성 옵션 클릭은 무시',
  render: () => <ControlledServiceSwitch options={DISABLED_OPTIONS} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const beauty = canvas.getByRole('tab', { name: '뷰티컬리' });
    await expect(beauty).toBeDisabled();
    await expect(beauty).toHaveAttribute('aria-selected', 'false');
  },
};

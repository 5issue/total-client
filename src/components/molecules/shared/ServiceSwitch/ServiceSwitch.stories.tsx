import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ServiceSwitch, type ServiceSwitchOption } from './ServiceSwitch';

const OPTIONS: [ServiceSwitchOption, ServiceSwitchOption] = [
  { id: 'market', label: '마켓컬리' },
  { id: 'beauty', label: '뷰티컬리' },
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

export const Default: Story = {
  render: () => {
    function Controlled() {
      const [activeId, setActiveId] = useState(OPTIONS[0].id);
      return <ServiceSwitch options={OPTIONS} activeId={activeId} onChange={setActiveId} />;
    }
    return <Controlled />;
  },
};

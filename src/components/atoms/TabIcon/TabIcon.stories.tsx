import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { TAB_ICONS, type TabName } from './tab-icons.generated';
import { TabIcon } from './TabIcon';

const TAB_NAMES = Object.keys(TAB_ICONS) as TabName[];

const meta = {
  title: 'atoms/TabIcon',
  component: TabIcon,
  tags: ['autodocs'],
  args: {
    tab: 'home',
    active: false,
    size: 28,
    'aria-hidden': true,
  },
  argTypes: {
    tab: {
      control: 'select',
      options: TAB_NAMES,
    },
    size: {
      control: { type: 'number', min: 16, max: 48, step: 2 },
    },
  },
} satisfies Meta<typeof TabIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Active: Story = {
  args: { active: true },
};

export const WithLabel: Story = {
  name: '탭 버튼 (aria-label)',
  args: {
    tab: 'home',
    'aria-label': '홈',
    'aria-hidden': undefined,
  },
};

export const AllTabs: Story = {
  name: `전체 탭 (${TAB_NAMES.length}종 × default/active)`,
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      {TAB_NAMES.map((tab) => (
        <div key={tab} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#515E69' }}>{tab}</span>
          <div style={{ display: 'flex', gap: 12 }}>
            <TabIcon tab={tab} active={false} aria-hidden />
            <TabIcon tab={tab} active aria-hidden />
          </div>
        </div>
      ))}
    </div>
  ),
};

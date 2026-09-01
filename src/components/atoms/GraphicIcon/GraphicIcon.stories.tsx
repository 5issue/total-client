import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { GRAPHIC_ICONS, type GraphicIconName } from './graphic-icons.generated';
import { GraphicIcon } from './GraphicIcon';

const GRAPHIC_ICON_NAMES = Object.keys(GRAPHIC_ICONS) as GraphicIconName[];

const meta = {
  title: 'atoms/GraphicIcon',
  component: GraphicIcon,
  tags: ['autodocs'],
  args: {
    name: 'showcase',
    'aria-hidden': true,
  },
  argTypes: {
    name: {
      control: 'select',
      options: GRAPHIC_ICON_NAMES,
    },
    size: {
      control: { type: 'number', min: 24, max: 64, step: 2 },
    },
  },
} satisfies Meta<typeof GraphicIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  name: '기능 아이콘 (aria-label)',
  args: {
    name: 'cart-badge',
    'aria-label': '새 알림이 있는 장바구니',
    'aria-hidden': undefined,
  },
};

export const AllGraphicIcons: Story = {
  name: `전체 그래픽 아이콘 (${GRAPHIC_ICON_NAMES.length}종)`,
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {GRAPHIC_ICON_NAMES.map((name) => (
        <div
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            padding: 12,
            border: '1px solid #DDE4ED',
            borderRadius: 8,
          }}
        >
          <GraphicIcon name={name} aria-hidden />
          <span style={{ fontSize: 11, color: '#515E69', textAlign: 'center' }}>{name}</span>
        </div>
      ))}
    </div>
  ),
};

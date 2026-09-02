import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Icon } from './Icon';
import { ICONS, type IconName } from './icons.generated';

const ICON_NAMES = Object.keys(ICONS) as IconName[];

// pause/play 는 색이 고정된 흰색 글리프라 어두운/색 있는 원형 버튼 위에 쓰도록 디자인됐다.
// 그리드 배경(흰색)에서는 안 보이므로 QA용으로만 어두운 칩 위에 올린다.
const FIXED_WHITE_ICONS = new Set<IconName>(['pause', 'play']);

const meta = {
  title: 'atoms/Icon',
  component: Icon,
  tags: ['autodocs'],
  args: {
    name: 'heart',
    size: 24,
    'aria-hidden': true,
  },
  argTypes: {
    name: {
      control: 'select',
      options: ICON_NAMES,
    },
    size: {
      control: { type: 'number', min: 12, max: 48, step: 2 },
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  name: '기능 아이콘 (aria-label)',
  args: {
    name: 'cart',
    size: 24,
    'aria-label': '장바구니',
    'aria-hidden': undefined,
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {[16, 20, 24, 28, 32].map((size) => (
        <div
          key={size}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
        >
          <Icon {...args} size={size} />
          <span className="text-caption-m text-fg-tertiary">{size}px</span>
        </div>
      ))}
    </div>
  ),
};

export const AllIcons: Story = {
  name: `전체 아이콘 (${ICON_NAMES.length}종)`,
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
        gap: 16,
      }}
    >
      {ICON_NAMES.map((name) => {
        const isFixedWhite = FIXED_WHITE_ICONS.has(name);
        return (
          <div
            key={name}
            // radius: --radius-m 이 8px 로 정정되면(#18/#25) rounded-m 으로 교체
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              padding: 12,
              borderRadius: 8,
            }}
            className={`border-border border ${isFixedWhite ? 'bg-black' : ''}`}
          >
            <Icon name={name} size={24} aria-hidden />
            <span
              className={`text-caption-m text-center break-all ${isFixedWhite ? 'text-surface-secondary' : 'text-fg-secondary'}`}
            >
              {name}
            </span>
          </div>
        );
      })}
    </div>
  ),
};

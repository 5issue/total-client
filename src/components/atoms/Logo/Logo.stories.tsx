import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Logo } from './Logo';
import { LOGOS, type LogoName } from './logos.generated';

const LOGO_NAMES = Object.keys(LOGOS) as LogoName[];

// kurly-l/kurly 는 흰 잉크 워드마크라 밝은 배경에서는 안 보인다. 실제로는 다크 히어로
// 배너/헤더 등 색 있는 배경 위에 올라가는 게 디자인 의도라, QA용으로만 어두운 칩 위에 둔다.
const DARK_BACKDROP_LOGOS = new Set<LogoName>(['kurly-l', 'kurly']);

const meta = {
  title: 'atoms/Logo',
  component: Logo,
  tags: ['autodocs'],
  args: {
    name: 'kurly-xl',
    height: 40,
    'aria-hidden': true,
  },
  argTypes: {
    name: {
      control: 'select',
      options: LOGO_NAMES,
    },
    height: {
      control: { type: 'number', min: 12, max: 160, step: 4 },
    },
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  name: '헤더 로고 (aria-label)',
  args: {
    name: 'kurly-xl',
    height: 32,
    'aria-label': 'Kurly 홈으로 이동',
    'aria-hidden': undefined,
  },
};

export const AllLogos: Story = {
  name: `전체 로고 (${LOGO_NAMES.length}종)`,
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {LOGO_NAMES.map((name) => {
        const isDark = DARK_BACKDROP_LOGOS.has(name);
        return (
          <div
            key={name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              padding: 16,
              minWidth: 140,
              border: '1px solid #DDE4ED',
              borderRadius: 8,
              background: isDark ? '#222222' : undefined,
            }}
          >
            <Logo name={name} height={32} aria-hidden />
            <span
              style={{
                fontSize: 11,
                color: isDark ? '#F0F5F8' : '#515E69',
                textAlign: 'center',
                wordBreak: 'break-all',
              }}
            >
              {name}
            </span>
          </div>
        );
      })}
    </div>
  ),
};

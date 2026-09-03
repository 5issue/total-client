import type { ReactNode } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Badge, type BadgeColor, type BadgeSize } from './Badge';

const COLORS: BadgeColor[] = ['cyan', 'purple'];
const SIZES: BadgeSize[] = ['small', 'medium', 'large'];

/** purple 은 Figma 컴포넌트 세트에 large 가 없다(Badge.tsx 주석 참고) — 매트릭스에서 제외. */
const SIZES_BY_COLOR: Record<BadgeColor, BadgeSize[]> = {
  cyan: ['small', 'medium', 'large'],
  purple: ['small', 'medium'],
};

const meta = {
  title: 'atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: {
    children: '멤버스',
    color: 'cyan',
    size: 'small',
  },
  argTypes: {
    color: { control: 'select', options: COLORS },
    size: { control: 'select', options: SIZES },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Large: Story = {
  args: { children: '멤버스특가', size: 'large' },
};

/** Figma 예시 카피 그대로 — 매트릭스에서 구분이 잘 안 돼서 실제 텍스트로 맞춘다. */
const SAMPLE_CHILDREN: Record<BadgeColor, Partial<Record<BadgeSize, ReactNode>>> = {
  cyan: {
    small: '멤버스',
    medium: (
      <>
        <b>+25%</b>쿠폰
      </>
    ),
    large: '멤버스특가',
  },
  purple: {
    small: '베스트',
    medium: (
      <>
        <b>+최대20%</b>쿠폰
      </>
    ),
  },
};

export const AllColorsAndSizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      {COLORS.map((color) => (
        <div key={color} className="flex items-center gap-3">
          {SIZES_BY_COLOR[color].map((size) => (
            <Badge key={size} color={color} size={size}>
              {SAMPLE_CHILDREN[color][size]}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};

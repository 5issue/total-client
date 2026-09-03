import type { ReactNode } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Badge, type BadgeColor, type BadgeSize } from './Badge';

const COLORS: BadgeColor[] = ['cyan', 'purple'];
const SIZES: BadgeSize[] = ['small', 'medium', 'large'];

/**
 * purple 은 Figma 컴포넌트 세트에 large 가 없다 — BadgeProps 타입에서부터 막혀 있어서(Badge.tsx
 * 참고) 여기도 'small'|'medium' 으로 좁게 타입을 잡아야 Badge 에 그대로 넘길 수 있다.
 */
const CYAN_SIZES: readonly BadgeSize[] = ['small', 'medium', 'large'];
const PURPLE_SIZES: readonly ('small' | 'medium')[] = ['small', 'medium'];

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
  // BadgeProps 가 discriminated union(purple 은 large 를 아예 못 받음)이라, 제네릭 color
  // 변수로는 타입이 안 좁혀져 색상별로 나눠 렌더한다.
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-3">
        {CYAN_SIZES.map((size) => (
          <Badge key={size} color="cyan" size={size}>
            {SAMPLE_CHILDREN.cyan[size]}
          </Badge>
        ))}
      </div>
      <div className="flex items-center gap-3">
        {PURPLE_SIZES.map((size) => (
          <Badge key={size} color="purple" size={size}>
            {SAMPLE_CHILDREN.purple[size]}
          </Badge>
        ))}
      </div>
    </div>
  ),
};

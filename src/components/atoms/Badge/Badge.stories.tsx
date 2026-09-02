import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Badge, type BadgeColor, type BadgeSize } from './Badge';

const COLORS: BadgeColor[] = ['cyan', 'purple'];
const SIZES: BadgeSize[] = ['small', 'medium', 'large'];

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

export const AllColorsAndSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      {COLORS.map((color) => (
        <div key={color} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {SIZES.map((size) => (
            <Badge key={size} color={color} size={size}>
              {color}/{size}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};

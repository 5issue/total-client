import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ReviewerBadge } from './ReviewerBadge';

const meta = {
  title: 'molecules/product/ReviewerBadge',
  component: ReviewerBadge,
  tags: ['autodocs'],
  args: {
    username: '정**',
    badges: [{ color: 'purple', size: 'small', children: '베스트' }],
  },
  argTypes: {
    username: { control: 'text' },
    badges: { control: 'object' },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ReviewerBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Best: Story = {};

export const Membership: Story = {
  args: { badges: [{ color: 'cyan', size: 'small', children: '멤버스' }] },
};

export const BestAndMembership: Story = {
  args: {
    badges: [
      { color: 'purple', size: 'small', children: '베스트' },
      { color: 'cyan', size: 'small', children: '멤버스' },
    ],
  },
};

export const NoBadge: Story = {
  args: { badges: [] },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <ReviewerBadge
        username="정**"
        badges={[
          { color: 'purple', size: 'small', children: '베스트' },
          { color: 'cyan', size: 'small', children: '멤버스' },
        ]}
      />
      <ReviewerBadge
        username="김**"
        badges={[{ color: 'cyan', size: 'small', children: '멤버스' }]}
      />
      <ReviewerBadge username="이**" />
    </div>
  ),
};

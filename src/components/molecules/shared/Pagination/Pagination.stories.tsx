import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Pagination, type PaginationProps } from './Pagination';

const meta = {
  title: 'molecules/shared/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  args: {
    current: 1,
    total: 2,
  },
  argTypes: {
    current: { control: 'number' },
    total: { control: 'number' },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledPagination(props: Omit<PaginationProps, 'onPrevious' | 'onNext'>) {
  const [current, setCurrent] = useState(props.current);
  return (
    <Pagination
      {...props}
      current={current}
      onPrevious={() => setCurrent((c) => c - 1)}
      onNext={() => setCurrent((c) => c + 1)}
    />
  );
}

export const Default: Story = {
  render: () => <ControlledPagination current={1} total={2} />,
};

/** Figma 예시 — 첫 페이지라 이전 버튼 비활성. */
export const AtFirstPage: Story = {
  name: '첫 페이지 (이전 버튼 비활성)',
  render: () => <ControlledPagination current={1} total={5} />,
};

export const AtLastPage: Story = {
  name: '마지막 페이지 (다음 버튼 비활성)',
  render: () => <ControlledPagination current={5} total={5} />,
};

export const ClickNextAdvances: Story = {
  name: '다음 클릭 시 페이지 증가',
  render: () => <ControlledPagination current={1} total={3} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '다음 페이지' }));
    await expect(canvas.getByText('2')).toBeInTheDocument();
  },
};

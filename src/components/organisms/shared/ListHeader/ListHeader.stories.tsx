import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ListHeader, type ListHeaderProps } from './ListHeader';

const SORT_OPTIONS = [
  { value: 'recommend', label: '추천순' },
  { value: 'new', label: '신상품순' },
  { value: 'sales', label: '판매량순' },
  { value: 'price-asc', label: '낮은 가격순' },
  { value: 'price-desc', label: '높은 가격순' },
];

/** 정렬은 컨트롤드(Dropdown) — 스토리에서 상태를 들고 있는 래퍼. */
function Controlled({ sortValue: initial = null, onSortChange, ...rest }: ListHeaderProps) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <ListHeader
      {...rest}
      sortValue={value}
      onSortChange={(v) => {
        setValue(v);
        onSortChange?.(v);
      }}
    />
  );
}

const meta = {
  title: 'organisms/shared/ListHeader',
  component: ListHeader,
  render: (args) => <Controlled {...args} />,
  args: {
    count: 32,
    sortOptions: SORT_OPTIONS,
    sortValue: 'recommend',
    onSortChange: fn(),
    onFilterClick: fn(),
  },
  argTypes: {
    sortOptions: { control: false },
    onSortChange: { control: false },
    onFilterClick: { control: false },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="min-h-72 max-w-md">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof ListHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 — 개수 + 정렬(추천순) + 필터. */
export const Default: Story = {};

/** 큰 개수 — 천 단위 구분 표시. */
export const LargeCount: Story = {
  args: { count: 1284 },
};

/** 필터 없음 — `onFilterClick` 미지정. */
export const WithoutFilter: Story = {
  args: { onFilterClick: undefined },
};

/** 정렬 미선택 — placeholder("선택하기") 노출. */
export const Unsorted: Story = {
  args: { sortValue: null },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

/** 정렬 옵션을 고르면 `onSortChange` 가 그 값으로 호출된다. */
export const ChangesSort: Story = {
  tags: ['!autodocs'],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox', { name: '정렬 기준' }));
    await userEvent.click(await canvas.findByRole('option', { name: '신상품순' }));
    await expect(args.onSortChange).toHaveBeenLastCalledWith('new');
  },
};

/** 필터 버튼 클릭 시 `onFilterClick` 이 호출된다. */
export const OpensFilter: Story = {
  tags: ['!autodocs'],
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: '필터' }));
    await expect(args.onFilterClick).toHaveBeenCalledOnce();
  },
};

/** 개수는 "총 N개" 로 천 단위 구분해 표시한다. */
export const ShowsCount: Story = {
  tags: ['!autodocs'],
  args: { count: 1284 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('총 1,284개')).toBeInTheDocument();
  },
};

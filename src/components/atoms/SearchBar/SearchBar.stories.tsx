import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { SearchBar } from './SearchBar';

const meta = {
  title: 'atoms/SearchBar',
  component: SearchBar,
  args: {
    label: '상품 검색',
    onSearch: fn(),
    onClear: fn(),
  },
  argTypes: {
    labelVisible: { control: 'boolean' },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma "Default" — 빈 값, placeholder. 클리어 버튼은 값이 있을 때만. */
export const Default: Story = {};

/** Figma "Filled" — 값이 있으면 우측 클리어(X) 버튼 노출. */
export const Filled: Story = {
  args: { defaultValue: '텍스트' },
};

export const LabelVisible: Story = {
  args: { labelVisible: true },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: '텍스트' },
};

/** Figma "Focused" — 포커스 시 보더가 border-active(#222) 로. */
export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('searchbox');
    await userEvent.click(input);
    await expect(input).toHaveFocus();
  },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const TypingUpdatesValue: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('searchbox');
    await userEvent.type(input, '원피스');
    await expect(input).toHaveValue('원피스');
  },
};

export const ClearButtonEmptiesValue: Story = {
  tags: ['!autodocs'],
  args: { defaultValue: '텍스트' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '검색어 지우기' }));
    await expect(canvas.getByRole('searchbox')).toHaveValue('');
    await expect(args.onClear).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole('searchbox')).toHaveFocus();
  },
};

export const EnterTriggersSearch: Story = {
  tags: ['!autodocs'],
  play: async ({ args, canvasElement }) => {
    const input = within(canvasElement).getByRole('searchbox');
    await userEvent.type(input, '신발{Enter}');
    await expect(args.onSearch).toHaveBeenCalledWith('신발');
  },
};

export const ClearButtonHiddenWhenEmpty: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('button', { name: '검색어 지우기' }),
    ).not.toBeInTheDocument();
  },
};

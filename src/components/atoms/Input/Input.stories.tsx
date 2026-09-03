import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Icon } from '@/components/atoms/Icon';

import { Input } from './Input';

/** trailing 슬롯 데모용 검색 아이콘 — Icon atom 의 `search` (#19). */
function SearchIcon() {
  return <Icon name="search" size={24} aria-hidden />;
}

const meta = {
  title: 'atoms/Input',
  component: Input,
  args: {
    label: '주소 검색',
    placeholder: '도로명, 지번, 건물명 검색',
  },
  argTypes: {
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    labelVisible: { control: 'boolean' },
    trailing: { control: false },
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
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: { defaultValue: '102' },
};

export const WithTrailingIcon: Story = {
  args: { trailing: <SearchIcon /> },
};

export const LabelVisible: Story = {
  args: { labelVisible: true },
};

export const Disabled: Story = {
  args: { disabled: true, trailing: <SearchIcon /> },
};

/** Figma "Focused" — 포커스 시 보더가 border-active(#222) 로. */
export const Focused: Story = {
  args: { trailing: <SearchIcon /> },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox');
    await userEvent.click(input);
    await expect(input).toHaveFocus();
  },
};

export const ErrorState: Story = {
  args: { error: '올바른 주소를 입력해 주세요', defaultValue: '10' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByRole('alert')).toHaveTextContent('올바른 주소를 입력해 주세요');
  },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const TypingUpdatesValue: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox');
    await userEvent.type(input, '서울시 중구');
    await expect(input).toHaveValue('서울시 중구');
  },
};

export const LabelIsAssociated: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    // label 이 sr-only 여도 htmlFor 로 접근성 이름이 연결돼야 한다
    await expect(
      within(canvasElement).getByRole('textbox', { name: '주소 검색' }),
    ).toBeInTheDocument();
  },
};

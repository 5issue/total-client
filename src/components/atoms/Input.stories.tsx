import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Input } from './Input';

/**
 * 검색 아이콘 — Icon atom(#11) 도입 전까지 스토리 데모용.
 * path 는 Figma node 2394-3737 의 search 아이콘 export 원본 그대로, fill 만 currentColor.
 */
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
      <path d="M11.3538 4C15.4152 4 18.7076 7.29241 18.7076 11.3538C18.7076 13.1191 18.0856 14.7392 17.0487 16.0067L19.7842 18.7424C20.0719 19.0301 20.0719 19.4965 19.7842 19.7842C19.4965 20.0719 19.0301 20.0719 18.7424 19.7842L16.0067 17.0487C14.7392 18.0856 13.1191 18.7076 11.3538 18.7076C7.29241 18.7076 4 15.4152 4 11.3538C4 7.29241 7.29241 4 11.3538 4ZM11.3538 5.47334C8.10611 5.47334 5.47334 8.10611 5.47334 11.3538C5.47334 14.6015 8.10611 17.2342 11.3538 17.2342C14.6015 17.2342 17.2342 14.6015 17.2342 11.3538C17.2342 8.10611 14.6015 5.47334 11.3538 5.47334Z" />
    </svg>
  );
}

const meta = {
  title: 'Atoms/Input',
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

export const ErrorState: Story = {
  args: { error: '올바른 주소를 입력해 주세요', defaultValue: '10' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByRole('alert')).toHaveTextContent('올바른 주소를 입력해 주세요');
  },
};

export const TypingUpdatesValue: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox');
    await userEvent.type(input, '서울시 중구');
    await expect(input).toHaveValue('서울시 중구');
  },
};

export const LabelIsAssociated: Story = {
  play: async ({ canvasElement }) => {
    // label 이 sr-only 여도 htmlFor 로 접근성 이름이 연결돼야 한다
    await expect(
      within(canvasElement).getByRole('textbox', { name: '주소 검색' }),
    ).toBeInTheDocument();
  },
};

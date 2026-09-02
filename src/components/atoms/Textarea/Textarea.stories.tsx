import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Textarea } from './Textarea';

const meta = {
  title: 'atoms/Textarea',
  component: Textarea,
  args: {
    label: '상세 사유',
    placeholder: '상세 사유를 입력해주세요',
  },
  argTypes: {
    hint: { control: 'text' },
    error: { control: 'text' },
    maxLength: { control: 'number' },
    disabled: { control: 'boolean' },
    labelVisible: { control: 'boolean' },
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
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { hint: '최소 10자' },
};

/** Figma "Typing" — maxLength 지정 시 우측 하단에 `{글자수} / {max}` 카운터. */
export const WithCounter: Story = {
  args: { maxLength: 250, defaultValue: '가나다라마바사' },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    maxLength: 250,
    defaultValue:
      '가나다라마바사 가나다라마바사 가나다라마바사 가나다라마바사 가나다라마바사 가나다라마바사 가나다라마바사',
  },
};

export const LabelVisible: Story = {
  args: { labelVisible: true, hint: '최소 10자' },
};

export const ErrorState: Story = {
  args: { error: '최소 10자 이상 입력해 주세요', defaultValue: '짧음' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByRole('alert')).toHaveTextContent('최소 10자 이상 입력해 주세요');
  },
};

/** Figma "Focused" — 포커스 시 보더가 border-active(#222) 로. */
export const Focused: Story = {
  args: { hint: '최소 10자' },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('textbox'));
  },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const CounterUpdatesWhileTyping: Story = {
  tags: ['!autodocs'],
  args: { maxLength: 250 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), '가나다라마');
    await expect(canvas.getByText('5')).toBeInTheDocument();
    await expect(canvas.getByText('/ 250')).toBeInTheDocument();
    await expect(canvas.getByRole('textbox')).toHaveValue('가나다라마');
  },
};

export const RespectsMaxLength: Story = {
  tags: ['!autodocs'],
  args: { maxLength: 5 },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox');
    await userEvent.type(input, '가나다라마바사아');
    await expect(input).toHaveValue('가나다라마');
  },
};

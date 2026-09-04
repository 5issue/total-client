import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Calendar, type CalendarProps } from './Calendar';

/** 스토리 결정성을 위해 고정한 기준 달(2026년 9월). */
const SEPT_2026 = new Date(2026, 8, 1);

/** Calendar 는 컨트롤드 — 스토리에서 선택값을 들고 있는 래퍼. */
function Controlled({ value: initial = null, onChange, ...rest }: CalendarProps) {
  const [value, setValue] = useState<Date | null>(initial);
  return (
    <Calendar
      {...rest}
      value={value}
      onChange={(date) => {
        setValue(date);
        onChange?.(date);
      }}
    />
  );
}

const meta = {
  title: 'molecules/shared/Calendar',
  component: Calendar,
  render: (args) => <Controlled {...args} />,
  args: {
    value: null,
    onChange: fn(),
    defaultMonth: SEPT_2026,
  },
  argTypes: {
    value: { control: false },
    onChange: { control: false },
    defaultMonth: { control: false },
    min: { control: false },
    max: { control: false },
    isDateDisabled: { control: false },
    isDateHighlighted: { control: false },
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
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 — 선택 없음, 2026년 9월. */
export const Default: Story = {};

/** 날짜가 선택된 상태 — 다크 원 + 흰 글자. */
export const Selected: Story = {
  args: { value: new Date(2026, 8, 15) },
};

/** min/max 로 선택 범위 제한 — 범위 밖 날짜는 비활성. */
export const RangeBounded: Story = {
  args: {
    value: new Date(2026, 8, 15),
    min: new Date(2026, 8, 8),
    max: new Date(2026, 8, 22),
  },
};

/** 특정 날짜 비활성 — 주말(일·토) 선택 불가. */
export const WithDisabledDates: Story = {
  args: {
    isDateDisabled: (date: Date) => date.getDay() === 0 || date.getDay() === 6,
  },
};

/**
 * `isDateHighlighted` — 선택은 안 됐지만 고를 수 있는 날짜를 상시 강조.
 * 15·22·29 일이 `bg-surface-secondary` 로 표시된다.
 */
export const Highlighted: Story = {
  args: {
    isDateHighlighted: (date: Date) => [15, 22, 29].includes(date.getDate()),
  },
};

/**
 * 정기배송 배송일 선택 시나리오(Figma 신선구독 화면).
 * 받을 요일 = 월요일 → 월요일만 강조·선택 가능, 나머지는 비활성.
 */
export const SubscriptionDelivery: Story = {
  args: {
    value: new Date(2026, 8, 7),
    min: new Date(2026, 8, 1),
    isDateDisabled: (date: Date) => date.getDay() !== 1,
    isDateHighlighted: (date: Date) => date.getDay() === 1,
  },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const SelectsOnClick: Story = {
  tags: ['!autodocs'],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /2026년 9월 12일/ }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole('gridcell', { selected: true })).toContainElement(
      canvas.getByRole('button', { name: /2026년 9월 12일/ }),
    );
  },
};

export const KeyboardNavigation: Story = {
  tags: ['!autodocs'],
  args: { value: new Date(2026, 8, 10) },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('button', { name: /2026년 9월 10일/ }).focus();
    // 아래로 한 주(+7) → 17일, 오른쪽 한 칸(+1) → 18일
    await userEvent.keyboard('{ArrowDown}{ArrowRight}');
    await expect(canvas.getByRole('button', { name: /2026년 9월 18일/ })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith(expect.any(Date));
  },
};

export const NavigatesMonths: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('grid')).toHaveAccessibleName('2026년 9월');
    await userEvent.click(canvas.getByRole('button', { name: '다음 달' }));
    await expect(canvas.getByRole('grid')).toHaveAccessibleName('2026년 10월');
    await userEvent.click(canvas.getByRole('button', { name: '이전 달' }));
    await userEvent.click(canvas.getByRole('button', { name: '이전 달' }));
    await expect(canvas.getByRole('grid')).toHaveAccessibleName('2026년 8월');
  },
};

/** PageDown 으로 다음 달 이동 후 같은 일(day) 유지. */
export const KeyboardMonthJump: Story = {
  tags: ['!autodocs'],
  args: { value: new Date(2026, 8, 20) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('button', { name: /2026년 9월 20일/ }).focus();
    await userEvent.keyboard('{PageDown}');
    await expect(canvas.getByRole('button', { name: /2026년 10월 20일/ })).toHaveFocus();
  },
};

/**
 * 방향키/PageUp/PageDown 으로도 min/max 경계를 넘어갈 수 없어야 한다.
 * (리뷰 지적: 이전·다음 달 버튼은 경계에서 비활성화되지만, 키보드 이동은 경계를
 * 확인하지 않아 그 밖 달까지 계속 진입할 수 있었다.)
 */
export const KeyboardStaysWithinRange: Story = {
  tags: ['!autodocs'],
  args: {
    value: new Date(2026, 8, 15),
    min: new Date(2026, 8, 8),
    max: new Date(2026, 8, 22),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('button', { name: /2026년 9월 15일/ }).focus();
    await userEvent.keyboard('{PageDown}');
    // max(9/22) 를 넘어가지 않고 그 날짜로 고정되며, 표시 월도 9월 그대로여야 한다.
    await expect(canvas.getByRole('grid')).toHaveAccessibleName('2026년 9월');
    await expect(canvas.getByRole('button', { name: /2026년 9월 22일/ })).toHaveFocus();
    await userEvent.keyboard('{PageDown}');
    await expect(canvas.getByRole('grid')).toHaveAccessibleName('2026년 9월');
    await expect(canvas.getByRole('button', { name: /2026년 9월 22일/ })).toHaveFocus();
  },
};

/** 비활성 날짜는 클릭해도 선택되지 않는다. */
export const DisabledDatesNotSelectable: Story = {
  tags: ['!autodocs'],
  args: {
    isDateDisabled: (date: Date) => date.getDay() !== 1,
    isDateHighlighted: (date: Date) => date.getDay() === 1,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    // 9월 9일은 수요일 → 비활성
    await userEvent.click(canvas.getByRole('button', { name: /2026년 9월 9일/ }));
    await expect(args.onChange).not.toHaveBeenCalled();
    // 9월 14일은 월요일 → 강조·선택 가능
    await userEvent.click(canvas.getByRole('button', { name: /2026년 9월 14일/ }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};

/**
 * roving tabIndex 불변식 — `value`(10월)와 `defaultMonth`(9월)의 달이 달라
 * `focusedDate` 가 표시 월 밖이어도, 그리드 안에 `tabIndex=0` 셀이 정확히 하나
 * 있어야 키보드로 진입할 수 있다.
 */
export const GridIsKeyboardReachable: Story = {
  tags: ['!autodocs'],
  args: { value: new Date(2026, 9, 15), defaultMonth: SEPT_2026 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('grid')).toHaveAccessibleName('2026년 9월');
    const tabbable = within(canvas.getByRole('grid'))
      .getAllByRole('button')
      .filter((b) => b.getAttribute('tabindex') === '0');
    await expect(tabbable).toHaveLength(1);
  },
};

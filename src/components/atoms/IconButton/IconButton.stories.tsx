import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';

import { IconButton, type IconButtonSize, type IconButtonVariant } from './IconButton';

const VARIANTS: IconButtonVariant[] = [
  'primary',
  'secondary',
  'tertiary',
  'outlinePrimary',
  'outlineBlack',
];

const SIZES: IconButtonSize[] = ['s', 'm', 'l'];

const meta = {
  title: 'atoms/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: {
    icon: 'heart',
    activeIcon: 'heart-filled',
    variant: 'primary',
    size: 's',
    'aria-label': '찜하기',
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    size: { control: 'select', options: SIZES },
    disabled: { control: 'boolean' },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: ({ icon, activeIcon, 'aria-label': ariaLabel }) => (
    <div className="flex items-center gap-3">
      {VARIANTS.map((variant) => (
        <IconButton
          key={variant}
          variant={variant}
          size="s"
          icon={icon}
          activeIcon={activeIcon}
          aria-label={`${ariaLabel} - ${variant}`}
        />
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: ({ icon, activeIcon, 'aria-label': ariaLabel }) => (
    <div className="flex items-center gap-3">
      {SIZES.map((size) => (
        <IconButton
          key={size}
          variant="primary"
          size={size}
          icon={icon}
          activeIcon={activeIcon}
          aria-label={`${ariaLabel} - ${size}`}
        />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledAllVariants: Story = {
  render: ({ icon, activeIcon, 'aria-label': ariaLabel }) => (
    <div className="flex items-center gap-3">
      {VARIANTS.map((variant) => (
        <IconButton
          key={variant}
          variant={variant}
          size="s"
          icon={icon}
          activeIcon={activeIcon}
          aria-label={`${ariaLabel} - ${variant}`}
          disabled
        />
      ))}
    </div>
  ),
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const ClickFiresOnClick: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

// `:active` 는 합성 이벤트(dispatchEvent 기반)로는 브라우저가 실제로 트리거해주지 않아
// (진짜 포인터 입력에만 반응) getComputedStyle 로 시각 상태를 검증할 수 없다 — 대신
// group-active: 클래스가 두 아이콘에 정확히 걸려 있는지(마크업 배선)를 검증한다.
export const PressedShowsActiveIcon: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button');
    const [baseIcon, activeIconSvg] = button.querySelectorAll('svg');
    if (!baseIcon || !activeIconSvg) {
      throw new Error('IconButton with activeIcon must render two <svg> icons');
    }

    await expect(baseIcon).toHaveClass('group-active:opacity-0');
    await expect(activeIconSvg).toHaveClass('opacity-0');
    await expect(activeIconSvg).toHaveClass('group-active:opacity-100');
  },
};

export const DisabledButtonIsUnclickable: Story = {
  tags: ['!autodocs'],
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');
    await expect(button).toBeDisabled();
    await expect(button).toHaveClass('disabled:pointer-events-none');
    // userEvent.click 은 pointer-events:none 에서 에러를 던지므로, fireEvent 로
    // 실제 클릭을 우회 발생시켜 onClick 이 호출되지 않는지까지 검증한다.
    fireEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

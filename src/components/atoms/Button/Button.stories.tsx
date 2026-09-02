import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button, type ButtonSize, type ButtonVariant } from './Button';

const VARIANTS: ButtonVariant[] = [
  'primary',
  'secondary',
  'tertiary',
  'black',
  'outlinePrimary',
  'outlineBlack',
  'text',
  'danger',
];

const SIZES: ButtonSize[] = ['s', 'm', 'l', 'xl'];

const meta = {
  title: 'atoms/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Button',
    variant: 'primary',
    size: 's',
    // Figma 기본값(showLeftIcon/showRightIcon)과 동일하게 아이콘 포함을 기본으로 둔다.
    leadingIcon: 'left',
    trailingIcon: 'right',
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    size: { control: 'select', options: SIZES },
    leadingIcon: { control: false },
    trailingIcon: { control: false },
    disabled: { control: 'boolean' },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TextOnly: Story = {
  args: { leadingIcon: undefined, trailingIcon: undefined },
};

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      {VARIANTS.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {SIZES.map((size) => (
        <Button key={size} {...args} size={size}>
          {size.toUpperCase()}
        </Button>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledAllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      {VARIANTS.map((variant) => (
        <Button key={variant} {...args} variant={variant} disabled>
          {variant}
        </Button>
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

export const DisabledButtonIsUnclickable: Story = {
  tags: ['!autodocs'],
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button');
    await expect(button).toBeDisabled();
    await expect(button).toHaveClass('disabled:pointer-events-none');
  },
};

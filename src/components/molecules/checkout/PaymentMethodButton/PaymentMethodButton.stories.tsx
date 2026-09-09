import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { PaymentMethodButton } from './PaymentMethodButton';

const meta = {
  title: 'molecules/checkout/PaymentMethodButton',
  component: PaymentMethodButton,
  tags: ['autodocs'],
  args: {
    type: 'logo',
    logo: 'kakao-pay',
    label: '카카오페이',
    showBenefitBadge: true,
    onClick: fn(),
  },
} satisfies Meta<typeof PaymentMethodButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  name: '선택됨 (혜택 배지는 선택 여부와 무관하게 유지)',
  args: { selected: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const TextType: Story = {
  name: '텍스트형',
  args: { type: 'text', label: '신용카드', showBenefitBadge: false },
};

/** type="logo-image"(issue #67) — 토스페이는 Figma에 벡터가 없는 raster 전용 로고. */
export const LogoImageType: Story = {
  name: '로고형 — raster 전용(토스페이)',
  args: { type: 'logo-image', logo: 'toss-pay', label: '토스페이' },
};

export const AllPaymentMethods: Story = {
  name: '결제수단 라디오그룹 예시',
  render: () => {
    function Group() {
      const [selected, setSelected] = useState('kakao-pay');
      return (
        <div role="radiogroup" aria-label="결제수단" className="flex flex-wrap gap-2">
          <PaymentMethodButton
            type="logo"
            logo="kakao-pay"
            label="카카오페이"
            showBenefitBadge
            selected={selected === 'kakao-pay'}
            onClick={() => setSelected('kakao-pay')}
          />
          <PaymentMethodButton
            type="logo"
            logo="naver-pay"
            label="네이버페이"
            selected={selected === 'naver-pay'}
            onClick={() => setSelected('naver-pay')}
          />
          <PaymentMethodButton
            type="logo"
            logo="samsung-pay"
            label="삼성페이"
            showBenefitBadge
            selected={selected === 'samsung-pay'}
            onClick={() => setSelected('samsung-pay')}
          />
          <PaymentMethodButton
            type="logo-image"
            logo="toss-pay"
            label="토스페이"
            selected={selected === 'toss-pay'}
            onClick={() => setSelected('toss-pay')}
          />
          <PaymentMethodButton type="text" label="신용카드" disabled />
        </div>
      );
    }
    return <Group />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const kakaoRadio = canvas.getByRole('radio', { name: '카카오페이' });
    const tossRadio = canvas.getByRole('radio', { name: '토스페이' });

    await expect(kakaoRadio).toHaveAttribute('aria-checked', 'true');
    await expect(tossRadio).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(tossRadio);

    await expect(tossRadio).toHaveAttribute('aria-checked', 'true');
    await expect(kakaoRadio).toHaveAttribute('aria-checked', 'false');
  },
};

export const ClickTogglesSelected: Story = {
  name: '클릭 시 핸들러 호출',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const radio = canvas.getByRole('radio', { name: '카카오페이' });
    await expect(radio).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(radio);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

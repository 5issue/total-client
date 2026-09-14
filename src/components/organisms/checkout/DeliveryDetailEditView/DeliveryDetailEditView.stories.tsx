import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { getRouter } from '@storybook/nextjs-vite/navigation.mock';
import { expect, userEvent, within } from 'storybook/test';

import { DeliveryDetailEditView } from './DeliveryDetailEditView';

const meta = {
  title: 'organisms/checkout/DeliveryDetailEditView',
  component: DeliveryDetailEditView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/checkout/delivery-detail' } },
  },
} satisfies Meta<typeof DeliveryDetailEditView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const OtherLocationSectionHiddenByDefault: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    // 기본값은 '문 앞' — 사용자 확인(2026-09-14): 이때 "기타장소 세부사항" 섹션은 숨김.
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radio', { name: '문 앞' })).toBeChecked();
    await expect(canvas.queryByText('기타장소 세부사항')).not.toBeInTheDocument();
  },
};

export const SelectingOtherLocationRevealsDetailSection: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: '기타 장소' }));

    await expect(canvas.getByText('기타장소 세부사항')).toBeInTheDocument();
    // '기타'가 기본 선택 — Textarea 도 같이 나온다.
    await expect(canvas.getByRole('radio', { name: '기타' })).toBeChecked();
    await expect(canvas.getByPlaceholderText(/원하시는 장소를 자세히/)).toBeInTheDocument();

    // 다른 옵션(택배 수령실)을 고르면 Textarea 는 사라진다.
    await userEvent.click(canvas.getByRole('radio', { name: '택배 수령실' }));
    await expect(canvas.queryByPlaceholderText(/원하시는 장소를 자세히/)).not.toBeInTheDocument();
  },
};

export const InvalidPhoneBlocksSubmit: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByPlaceholderText('숫자만 입력해주세요'), '123');
    await userEvent.click(canvas.getByRole('button', { name: '동의하고 저장' }));

    await expect(canvas.getByText('올바른 휴대폰 번호를 입력해주세요')).toBeInTheDocument();
    await expect(getRouter().back).not.toHaveBeenCalled();
  },
};

export const ValidSubmitGoesBack: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByPlaceholderText('숫자만 입력해주세요'), '01012341234');
    await userEvent.click(canvas.getByRole('button', { name: '동의하고 저장' }));

    await expect(getRouter().back).toHaveBeenCalledTimes(1);
  },
};

export const CloseButtonGoesBack: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '닫기' }));

    await expect(getRouter().back).toHaveBeenCalledTimes(1);
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { getRouter } from '@storybook/nextjs-vite/navigation.mock';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

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
    await expect(canvas.getByPlaceholderText(/계단 밑/)).toBeInTheDocument();

    // 공동현관(대문) 앞을 고르면 Textarea 는 사라진다(node 666-26457 — 세부 입력 없음).
    await userEvent.click(canvas.getByRole('radio', { name: '공동현관(대문) 앞' }));
    await expect(canvas.queryByPlaceholderText(/원하시는 장소를 자세히/)).not.toBeInTheDocument();
  },
};

export const SelectingLockerRevealsItsOwnDetailTextarea: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: '기타 장소' }));
    await userEvent.click(canvas.getByRole('radio', { name: '택배 수령실' }));

    // '기타'의 예시 문구는 사라지고, '택배 수령실' 전용 예시 문구로 바뀐다(node 666-26389).
    await expect(canvas.queryByPlaceholderText(/계단 밑/)).not.toBeInTheDocument();
    await expect(canvas.getByPlaceholderText(/1층 출입구 오른쪽 택배수령실/)).toBeInTheDocument();
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

// --- 필수값 미입력 알림 모달(node 761-106060/106130/106200) ---
// `Modal` 은 `document.body` 에 포털되므로 `canvasElement` 스코프가 아니라 전역 `screen` 으로 찾는다.

export const EmptyPhoneShowsAlertModalAndFocusesOnConfirm: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 휴대폰을 비운 채(기본값) 바로 제출 — '받으실 분'은 기본값이 채워져 있어 통과한다.
    await userEvent.click(canvas.getByRole('button', { name: '동의하고 저장' }));

    const dialog = await screen.findByRole('dialog', { name: '휴대폰 번호를 입력해주세요.' });
    await userEvent.click(within(dialog).getByRole('button', { name: '확인' }));

    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await expect(getRouter().back).not.toHaveBeenCalled();
    await waitFor(() => expect(canvas.getByPlaceholderText('숫자만 입력해주세요')).toHaveFocus());
  },
};

export const EmptyOtherLocationDetailShowsAlertModalForEtc: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByPlaceholderText('숫자만 입력해주세요'), '01012341234');
    await userEvent.click(canvas.getByRole('radio', { name: '기타 장소' }));
    // '기타'가 기본 선택 — 세부 내용을 채우지 않고 제출.
    await userEvent.click(canvas.getByRole('button', { name: '동의하고 저장' }));

    const dialog = await screen.findByRole('dialog', {
      name: '기타 장소 세부 사항 내용을 입력해주세요.',
    });
    await userEvent.click(within(dialog).getByRole('button', { name: '확인' }));

    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByPlaceholderText(/계단 밑/)).toHaveFocus());
  },
};

export const EmptyOtherLocationDetailShowsAlertModalForLocker: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByPlaceholderText('숫자만 입력해주세요'), '01012341234');
    await userEvent.click(canvas.getByRole('radio', { name: '기타 장소' }));
    await userEvent.click(canvas.getByRole('radio', { name: '택배 수령실' }));
    await userEvent.click(canvas.getByRole('button', { name: '동의하고 저장' }));

    const dialog = await screen.findByRole('dialog', {
      name: '택배 수령실 위치를 자세히 입력해주세요.',
    });
    await expect(dialog).toBeInTheDocument();
  },
};

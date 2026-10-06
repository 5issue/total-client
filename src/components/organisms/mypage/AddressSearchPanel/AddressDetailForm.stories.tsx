import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import type { AddressFormValues } from '../model';
import { AddressDetailForm } from './AddressDetailForm';

/** 마지막 onSubmit 호출의 인자 — 호출 안 됐으면 그 자체가 테스트 실패다. */
function lastSubmittedValues(onSubmit: unknown): AddressFormValues {
  const call = (onSubmit as ReturnType<typeof fn>).mock.calls.at(-1);
  if (!call) throw new Error('onSubmit 이 호출되지 않았습니다.');
  return call[0] as AddressFormValues;
}

const meta = {
  title: 'organisms/mypage/AddressDetailForm',
  component: AddressDetailForm,
  tags: ['autodocs'],
  args: {
    address: {
      zonecode: '06236',
      roadAddress: '서울특별시 강남구 테헤란로 152 (역삼동, 강남파이낸스센터아파트)',
    },
    usedAliases: [],
    willBeDefault: true,
    onSubmit: fn(),
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AddressDetailForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const EmptyDetailAddressAsksConfirmBeforeSaving: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    // 피드백 원문: "나머지 주소를 작성하지 않아도 저장이 됩니다" — 저장 자체는 막히지
    // 않지만, 비운 채 누르면 확인 모달(node 666-25967)을 한 번 거친다.
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));

    const body = within(canvasElement.ownerDocument.body);
    await expect(body.getByText('상세주소 입력')).toBeInTheDocument();
    await expect(
      body.getByText('나머지 주소를 입력하지 않으셨습니다. 이대로 저장하시겠습니까?'),
    ).toBeInTheDocument();
    await expect(args.onSubmit).not.toHaveBeenCalled();

    await userEvent.click(body.getByRole('button', { name: '확인' }));

    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    const values = lastSubmittedValues(args.onSubmit);
    expect(values.detailAddress).toBeUndefined();
    // 받으실 분/휴대폰 입력이 없으니 로그인한 사용자 기본정보로 자동 채워진다.
    expect(values.recipient).toBe('이준호');
    expect(values.phone).toBe('01012341234');
    expect(values.isDefault).toBe(true);
  },
};

export const CancelingEmptyDetailAddressConfirmDoesNotSave: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));

    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(body.getByRole('button', { name: '취소' }));

    await expect(args.onSubmit).not.toHaveBeenCalled();
    await expect(body.queryByText('상세주소 입력')).not.toBeInTheDocument();
  },
};

export const SelectsHomeAliasAndSaves: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '우리집' }));
    await userEvent.type(canvas.getByLabelText('나머지 주소'), '101동 1502호');
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));

    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    const values = lastSubmittedValues(args.onSubmit);
    expect(values.aliasType).toBe('home');
    expect(values.name).toBe('우리집');
    expect(values.detailAddress).toBe('101동 1502호');
  },
};

export const CustomAliasWithoutNameStillSaves: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    // 피드백(2026-09-14): "직접입력" 이름도 "나머지 주소"처럼 선택 입력 — 안 적어도
    // 저장된다(AddressDetailFormSchema 에 customAlias 필수화 refine 없음).
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '직접입력' }));
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));

    // 나머지 주소도 안 적었으니 "상세주소 입력" 확인 모달을 한 번 거친다.
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(body.getByRole('button', { name: '확인' }));

    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    const values = lastSubmittedValues(args.onSubmit);
    expect(values.aliasType).toBe('custom');
    expect(values.name).toBeUndefined();
  },
};

export const AliasConflictShowsConfirmModal: Story = {
  tags: ['!autodocs'],
  args: { usedAliases: ['home'] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '우리집' }));

    // 이미 '우리집'을 쓰는 배송지가 있으니 바로 선택되지 않고 확인 모달이 뜬다.
    const body = within(canvasElement.ownerDocument.body);
    await expect(body.getByText('우리집을 변경하시겠어요?')).toBeInTheDocument();
    await userEvent.click(body.getByRole('button', { name: '확인' }));
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));

    // 나머지 주소를 안 적었으니 이번엔 "상세주소 입력" 확인 모달을 한 번 더 거친다.
    await userEvent.click(body.getByRole('button', { name: '확인' }));

    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    const values = lastSubmittedValues(args.onSubmit);
    expect(values.aliasType).toBe('home');
  },
};

export const UnchecksSaveAsDefaultWhenNotFirstAddress: Story = {
  tags: ['!autodocs'],
  args: { willBeDefault: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // 기본값은 체크됨(Figma) — 첫 배송지가 아니면 꺼서 기본배송지로 안 만들 수 있다.
    // (시각적 라벨 <span> 과 Radio 자체의 sr-only <label> 이 같은 텍스트라 getByText 는
    // 모호하다 — 실제 라디오 요소를 역할로 짚는다.)
    await userEvent.click(canvas.getByRole('radio', { name: '기본 배송지로 저장' }));
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));

    // 나머지 주소를 안 적었으니 "상세주소 입력" 확인 모달을 거친다.
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(body.getByRole('button', { name: '확인' }));

    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    const values = lastSubmittedValues(args.onSubmit);
    expect(values.isDefault).toBe(false);
  },
};

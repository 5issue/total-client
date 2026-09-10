import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Image from 'next/image';
import { expect, fn, userEvent, within } from 'storybook/test';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';

import { ErrorState } from './ErrorState';

type ApiErrorIconName = 'payment' | 'document' | 'package' | 'wifi' | 'timeout' | 'database';

/**
 * Figma "Icon Api" 컴포넌트셋(node 3013-2621~2626, Payment 는 3011-3796) — 전부
 * 벡터 없는 raster 전용 에셋(Toast 아이콘과 동일 패턴). 상태별로 같은 도안에
 * 배지만 다르다.
 */
const apiErrorIcon = (name: ApiErrorIconName) => (
  <Image
    src={`/graphic-icons/${name}-error.webp`}
    alt=""
    width={100}
    height={100}
    className="size-25"
  />
);

/** Error_API 공통 액션 — 재시도 버튼. 스토리마다 새 mock 이 필요해 호출 시점에 만든다. */
const retryAction = () => (
  <FloatingButton icon="refresh" onClick={fn()}>
    다시 시도
  </FloatingButton>
);

function apiErrorArgs(name: ApiErrorIconName, title: string, description: string) {
  return { icon: apiErrorIcon(name), title, description, action: retryAction() };
}

const meta = {
  title: 'molecules/shared/ErrorState',
  component: ErrorState,
  args: {
    icon: <Icon name="alert" size={56} aria-hidden />,
    title: '담은 상품이 없어요',
    action: (
      <FloatingButton icon="reset" onClick={fn()}>
        필터 초기화
      </FloatingButton>
    ),
  },
  argTypes: {
    icon: { control: false },
    action: { control: false },
    children: { control: false },
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
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 — Figma "Error"(2650:3716). 설명 없이 조용한 안내 한 줄 + 액션. */
export const Default: Story = {};

/** 액션 버튼 없이 안내 문구만. */
export const WithoutAction: Story = {
  args: { action: undefined },
};

/**
 * `description` 이 있으면 헤드라인 톤으로 바뀐다 — Figma "Error_API"(3009:3775) 결제 에러 형태.
 */
export const WithDescription: Story = {
  args: {
    icon: apiErrorIcon('payment'),
    title: '결제 처리 오류',
    description: '결제 상태를 확인하신 후 다시 시도해 주세요',
    action: (
      <FloatingButton icon="refresh" onClick={fn()}>
        결제 정보 재전송
      </FloatingButton>
    ),
  },
};

/**
 * `children` 으로 도메인 특화 콘텐츠(주문정보 박스)를 조립 — Error_API 전체 재현.
 * 박스 자체는 이 컴포넌트가 아니라 소비자(organism) 책임.
 */
export const WithDetailBox: Story = {
  args: {
    icon: apiErrorIcon('payment'),
    title: '결제 처리 오류',
    description: '결제 상태를 확인하신 후 다시 시도해 주세요',
    action: (
      <FloatingButton icon="refresh" onClick={fn()}>
        결제 정보 재전송
      </FloatingButton>
    ),
    children: (
      <div className="bg-surface-secondary flex w-full flex-col gap-2 rounded-lg px-4 py-5">
        {[
          ['주문 번호', 'order122334455667788'],
          ['주문 시간', '2026.09.04 11:11:11'],
          ['결제 방식', '토스페이'],
          ['오류 사유', '잔액부족'],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-label-m text-fg-secondary">{label}</span>
            <span className="text-label-m text-fg">{value}</span>
          </div>
        ))}
      </div>
    ),
  },
};

/** apiErrorArgs 스토리 공통 검증 — "다시 시도" 버튼이 접근 가능한 이름으로 클릭 가능한지 확인. */
const playRetryAction: Story['play'] = async ({ canvasElement }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: '다시 시도' }));
};

/** Error_API — 문서를 불러오지 못했을 때. */
export const DocumentError: Story = {
  args: apiErrorArgs('document', '문서를 불러오지 못했어요', '잠시 후 다시 시도해 주세요'),
  play: playRetryAction,
};

/** Error_API — 상품/패키지 정보를 불러오지 못했을 때. */
export const PackageError: Story = {
  args: apiErrorArgs('package', '상품 정보를 불러오지 못했어요', '잠시 후 다시 시도해 주세요'),
  play: playRetryAction,
};

/** Error_API — 네트워크 연결이 끊겼을 때. */
export const WifiError: Story = {
  args: apiErrorArgs(
    'wifi',
    '네트워크 연결을 확인해 주세요',
    '인터넷 연결 상태를 확인한 후 다시 시도해 주세요',
  ),
  play: playRetryAction,
};

/** Error_API — 요청 시간이 초과됐을 때. */
export const TimeoutError: Story = {
  args: apiErrorArgs('timeout', '요청 시간이 초과됐어요', '잠시 후 다시 시도해 주세요'),
  play: playRetryAction,
};

/** Error_API — 서버(DB) 오류가 발생했을 때. */
export const DatabaseError: Story = {
  args: apiErrorArgs('database', '일시적인 오류가 발생했어요', '잠시 후 다시 시도해 주세요'),
  play: playRetryAction,
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

export const HasStatusRole: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    // status 는 라이브 리전 role 이라 accessible name 이 아니라 콘텐츠로 스크린리더에 전달된다.
    const status = within(canvasElement).getByRole('status');
    await expect(status).toHaveTextContent('담은 상품이 없어요');
  },
};

const handleAction = fn();

export const ActionClickFires: Story = {
  tags: ['!autodocs'],
  args: {
    action: (
      <FloatingButton icon="reset" onClick={handleAction}>
        필터 초기화
      </FloatingButton>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '필터 초기화' }));
    await expect(handleAction).toHaveBeenCalledTimes(1);
  },
};

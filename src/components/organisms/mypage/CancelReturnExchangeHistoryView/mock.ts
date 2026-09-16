/**
 * 취소·반품·교환 내역 스텁 데이터 (퍼블리싱 단계). Figma node 666-30339/30389/30892 실측.
 * BE 연동 전이라 값은 전부 여기서 온다.
 */
export type CancelReturnExchangeType = '취소' | '반품' | '교환';

export const STEP_LABELS: Record<'취소' | '반품', string[]> = {
  취소: ['취소접수', '취소완료'],
  // Figma 는 3번째 단계 라벨을 "상품검수"로 쓴다(스크린샷상 "상품검사"로 보일 수 있으나
  // node 실측 텍스트는 "상품검수").
  반품: ['반품접수', '택배회수', '상품검수', '반품완료'],
};

/** 이 상태에 도달하면 "완료"다 — 5일 경과 인디케이터 소멸 판단 기준(node 666-30389). */
export const TERMINAL_STATUS: Record<'취소' | '반품', string> = {
  취소: '취소완료',
  반품: '반품완료',
};

export interface CancelReturnExchangeProduct {
  name: string;
  deliveryType: string;
  price: number;
  originalPrice: number;
  quantity: number;
  imageSrc?: string;
}

export interface CancelReturnExchangeItem {
  id: string;
  type: CancelReturnExchangeType;
  status: string;
  /** 화면 표시용 접수일자 문구(예: "접수일자 2026. 08. 26"). */
  receivedDateLabel: string;
  /** 완료 상태에 도달한 날짜(ISO). 미완료 항목은 없음. 5일 경과 판단에 쓴다. */
  completedAt?: string;
  products: CancelReturnExchangeProduct[];
}

/** 4개 상품 세트 — 반품/취소 항목이 공유한다(node 666-30892, "총 4건" 데모). */
const FOUR_PRODUCTS: CancelReturnExchangeProduct[] = [
  {
    name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
    deliveryType: '샛별배송',
    price: 2720,
    originalPrice: 3400,
    quantity: 1,
  },
  {
    // Figma 반품/취소 두 카드가 이 상품 가격을 각각 10,051원/10,501원으로 다르게 적어뒀다
    // (자릿수 오타로 보인다) — 다른 화면(주문 내역 상세)과도 일치하는 10,051원을 썼다.
    name: "[Kurly's] 동물복지 유정란 20구",
    deliveryType: '샛별배송',
    price: 10051,
    originalPrice: 10580,
    quantity: 1,
  },
  {
    name: '바로먹는 아보카도 3입 (페루산)',
    deliveryType: '샛별배송',
    price: 9990,
    originalPrice: 13000,
    quantity: 1,
  },
  {
    // Figma node 는 3개까지만 모델링돼 있다(아코디언 접힌 기본값) — "총 4건" 문구에
    // 맞춰 주문 내역 상세와 같은 4번째 상품을 더했다.
    name: '[풀무원] 동물복지 치킨 너겟 오리지널',
    deliveryType: '샛별배송',
    price: 7979,
    originalPrice: 8980,
    quantity: 1,
  },
];

export const MOCK_CANCEL_RETURN_EXCHANGE_ITEMS: CancelReturnExchangeItem[] = [
  {
    id: 'r-1',
    type: '반품',
    status: '반품접수',
    receivedDateLabel: '접수일자 2026. 08. 26',
    products: [FOUR_PRODUCTS[0]!],
  },
  {
    id: 'c-1',
    type: '취소',
    status: '취소접수',
    receivedDateLabel: '접수일자 2026. 08. 26',
    products: [FOUR_PRODUCTS[0]!],
  },
  {
    id: 'r-2',
    type: '반품',
    status: '반품완료',
    receivedDateLabel: '접수일자 2026. 08. 20',
    // 데모 기준일(아래 REFERENCE_TODAY)보다 5일 이상 지난 완료 항목 — 인디케이터 소멸 확인용.
    completedAt: '2026-08-21',
    products: FOUR_PRODUCTS,
  },
  {
    id: 'c-2',
    type: '취소',
    status: '취소완료',
    receivedDateLabel: '접수일자 2026. 08. 20',
    completedAt: '2026-08-21',
    products: FOUR_PRODUCTS,
  },
];

/** 데모 기준 "오늘" — 위 완료 항목들의 5일 경과 여부가 이 날짜 기준으로 갈린다. */
export const REFERENCE_TODAY = new Date('2026-08-27');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * 완료 상태에 도달한 지 5일이 지나면 진행 단계 인디케이터를 숨긴다(node 666-30389,
 * 사용자 확인: "'반품완료'·'취소완료' 상태에서 5일이 지나면 Indicator가 없어집니다").
 * 미완료 항목은 항상 보여준다.
 */
export function shouldShowStepIndicator(
  item: CancelReturnExchangeItem,
  referenceDate: Date = REFERENCE_TODAY,
): boolean {
  if (item.type === '교환') return true;
  const isTerminal = item.status === TERMINAL_STATUS[item.type];
  if (!isTerminal || !item.completedAt) return true;
  const daysElapsed = Math.floor(
    (referenceDate.getTime() - new Date(item.completedAt).getTime()) / MS_PER_DAY,
  );
  return daysElapsed < 5;
}

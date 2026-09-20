import type { FridgeItem } from './model';

/**
 * 나의 냉장고 스텁 데이터(퍼블리싱 단계). BE `hooks/fridge` 연동 전이라 화면 값은
 * 전부 여기서 온다 — Figma node 1120-56174 실측 그대로(상품명·수량·유통기한).
 * 우유는 `ProductOptionSheet` mock(`MOCK_ADD_TO_CART_PRODUCT`)과 동일 상품이라
 * 가격·태그라인을 그대로 맞췄다 — 화면이 달라도 같은 상품은 같은 값이어야 한다.
 * 우유는 Figma "품절된 상품일 때"(node 666-31223) 예시와 동일 상품이라 `soldOut: true`.
 *
 * `imageSrc`는 실제 상품 이미지 연동 전까지 전부 같은 placeholder — 비워두면 카드
 * 썸네일 배경(`bg-surface-secondary`)과 체크박스(`variant="filled"` 미체크 배경도
 * 같은 토큰)가 같은 색이라 체크박스가 안 보인다(실기기 확인, #111 QA).
 *
 * `storageType`(refrigerated/frozen)은 Figma 배지 아이콘이 두 계열로 갈리는 걸 보고
 * 분류했다 — 실제 보관 방법 데이터가 아직 없어 상품 특성상 합리적으로 추정한 값이다
 * (떡갈비·한우세트=frozen, 나머지=refrigerated, 디자인 확인 필요).
 *
 * `memberPriceLabel`은 "채워넣기" 시트(node 1206-109860)가 일반가와 함께 보여주는
 * 멤버스 전용가 — 실제 정책 연동 전까지 일반가 대비 약 3~4% 할인된 임의값이다.
 */
const PLACEHOLDER_IMAGE = '/placeholders/product-thumbnail.webp';

export const MOCK_FRIDGE_ITEMS: FridgeItem[] = [
  {
    id: 'milk',
    productId: 'milk-901',
    name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
    tagline: '가격, 퀄리티 모두 만족스러운 1A등급 우유',
    imageSrc: PLACEHOLDER_IMAGE,
    quantityLabel: '1개',
    expiryLabel: '08.27(수)까지',
    dDayLabel: 'D-2',
    storageType: 'refrigerated',
    expired: false,
    soldOut: true,
    filters: ['stored', 'expiring'],
    priceLabel: '2,780원',
    originalPriceLabel: '3,400원',
    memberPriceLabel: '2,670원',
    storageTip: {
      title: '전용목장우유',
      steps: [
        '개봉하지 않은 상태로 냉장실 가장 안쪽(0~2℃)에 보관하세요.',
        '개봉 후에는 3일 이내 드시는 것을 권장해요.',
      ],
    },
  },
  {
    id: 'salmon',
    productId: 'salmon-200',
    name: '[KF365] 항공직송 노르웨이 생연어 200g (냉장)',
    tagline: '신선한 노르웨이산 생연어',
    imageSrc: PLACEHOLDER_IMAGE,
    quantityLabel: '1개',
    expiryLabel: '08.27(수)까지',
    dDayLabel: 'D-2',
    storageType: 'refrigerated',
    expired: false,
    filters: ['stored', 'expiring'],
    priceLabel: '15,900원',
    memberPriceLabel: '15,210원',
    storageTip: {
      title: '노르웨이 생연어',
      steps: [
        '밀봉된 상태로 냉장실 가장 안쪽(0~2℃)에 보관하세요.',
        '해동 후에는 재냉동하지 말고 바로 섭취하세요.',
      ],
    },
  },
  {
    id: 'onion',
    productId: 'onion-500',
    name: '[바름팜] 친환경 양파 500g',
    tagline: '아삭한 국내산 친환경 양파',
    imageSrc: PLACEHOLDER_IMAGE,
    quantityLabel: '1개',
    expiryLabel: '08.27(수)까지',
    dDayLabel: 'D-3',
    storageType: 'refrigerated',
    expired: false,
    filters: ['stored', 'expiring'],
    priceLabel: '3,980원',
    memberPriceLabel: '3,820원',
    storageTip: {
      title: '친환경 양파',
      steps: [
        '통풍이 잘되는 서늘한 곳이나 냉장실 채소칸에 보관하세요.',
        '자른 후에는 밀폐해 보관하세요.',
      ],
    },
  },
  {
    id: 'tofu',
    productId: 'tofu-500',
    name: "[Kurly's] 국산콩 두부 500g",
    tagline: '고소한 국산콩 두부',
    imageSrc: PLACEHOLDER_IMAGE,
    quantityLabel: '1개',
    expiryLabel: '08.27(수)까지',
    dDayLabel: 'D-3',
    storageType: 'refrigerated',
    expired: false,
    filters: ['stored'],
    priceLabel: '3,480원',
    memberPriceLabel: '3,330원',
    storageTip: {
      title: '국산콩 두부',
      steps: ['개봉 후 남은 두부는 물에 담가 냉장 보관하세요.', '물은 매일 갈아주세요.'],
    },
  },
  {
    id: 'scallion',
    productId: 'scallion-100',
    name: '한끼 채소 손질 대파 100g',
    tagline: '손질까지 끝낸 신선한 대파',
    imageSrc: PLACEHOLDER_IMAGE,
    quantityLabel: '1개',
    expiryLabel: '08.27(수)까지',
    dDayLabel: 'D-4',
    storageType: 'refrigerated',
    expired: false,
    filters: ['stored'],
    priceLabel: '2,180원',
    memberPriceLabel: '2,090원',
    storageTip: {
      title: '손질 대파',
      steps: ['밀폐용기에 담아 냉장실에 세워서 보관하세요.'],
    },
  },
  {
    id: 'tteokgalbi',
    productId: 'tteokgalbi-345',
    name: '[조선호텔] 떡갈비 345g',
    tagline: '한입에 즐기는 프리미엄 떡갈비',
    imageSrc: PLACEHOLDER_IMAGE,
    quantityLabel: '1개',
    expiryLabel: '08.27(수)까지',
    dDayLabel: 'D-121',
    storageType: 'frozen',
    expired: false,
    filters: ['stored'],
    priceLabel: '9,900원',
    memberPriceLabel: '9,480원',
    storageTip: {
      title: '떡갈비',
      steps: ['냉동 상태를 유지하고, 조리 전 냉장실에서 자연 해동하세요.'],
    },
  },
  {
    id: 'cheese',
    productId: 'cheese-200',
    name: '[상하치즈] 모짜렐라 슈레드 치즈 200g',
    tagline: '쭉쭉 늘어나는 모짜렐라 치즈',
    imageSrc: PLACEHOLDER_IMAGE,
    quantityLabel: '1개',
    expiryLabel: '08.27(수)까지',
    dDayLabel: 'D+2',
    storageType: 'refrigerated',
    expired: true,
    filters: ['expired'],
    priceLabel: '5,980원',
    memberPriceLabel: '5,730원',
    storageTip: {
      title: '모짜렐라 슈레드 치즈',
      steps: ['개봉 후에는 밀봉해 냉장 보관하고 최대한 빨리 드세요.'],
    },
  },
  {
    id: 'hanwoo',
    productId: 'hanwoo-set',
    name: '[선물세트] 태우한우 1+ 실속 구이 세트 (냉동)',
    tagline: '품격과 실속을 모두 갖춘 한우 선물세트',
    imageSrc: PLACEHOLDER_IMAGE,
    quantityLabel: '1개',
    expiryLabel: '08.27(수)까지',
    dDayLabel: 'D+4',
    storageType: 'frozen',
    expired: true,
    filters: ['expired'],
    priceLabel: '145,000원',
    originalPriceLabel: '217,000원',
    memberPriceLabel: '141,050원',
    storageTip: {
      title: '한우 구이 세트',
      steps: ['냉동 상태를 유지하고, 조리 전 냉장실에서 자연 해동하세요.'],
    },
  },
];

/**
 * `title`은 Figma(node 1120-56175)가 두 개의 `<p>`로 강제 줄바꿈한 걸 그대로
 * 옮긴 것 — 자연스러운 wrap 에 맡기면(컨테이너 폭에 따라) "알려" / "드려요!" 처럼
 * 단어 중간이 갈라진다. `FridgeAiNoticeBanner`가 `\n` 기준으로 두 줄을 각각
 * `<p>`로 렌더한다.
 */
export const MOCK_FRIDGE_AI_NOTICE = {
  title: 'AI가 구매하신 상품의 \n유통 및 소비기한을 알려드려요!',
  description: '실제 보관 상태에 따라 제품의 신선도에 차이가 있을 수 있어요',
};

export const MOCK_FRIDGE_EXPIRY_NOTICE =
  '만료 후 3일간 비활성화 상태로 유지되며, 이후 자동 삭제돼요';

/** "담기 완료" 시트 — "함께 구매하면 좋을 상품" 캐러셀(node 3119-3924/3119-3760). */
export const MOCK_FRIDGE_RECOMMENDED_PRODUCTS = [
  {
    id: 'basil',
    imageSrc: PLACEHOLDER_IMAGE,
    imageAlt: '',
    deliveryLabel: '샛별배송',
    name: '친환경 베이비 바질 10g',
    priceLabel: '995원',
  },
  {
    id: 'bread',
    imageSrc: PLACEHOLDER_IMAGE,
    imageAlt: '',
    deliveryLabel: '샛별배송',
    name: '[더브레드블루] 통밀발효종빵 300g',
    couponLabel: '+25%쿠폰',
    priceLabel: '135,000원',
  },
  {
    id: 'tomato',
    imageSrc: PLACEHOLDER_IMAGE,
    imageAlt: '',
    deliveryLabel: '샛별배송',
    name: '[주말특가][KF365] 대추방울토마토 750g',
    originalPriceLabel: '13,990원',
    discountLabel: '35%',
    couponLabel: '+25%쿠폰',
    priceLabel: '8,990원',
  },
];

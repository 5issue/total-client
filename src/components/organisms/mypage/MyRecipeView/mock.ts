/**
 * MY 레시피 스텁 데이터. RECO-02/RECIPE-01/RECIPE-03/FAV-01~03/RECENT-01~02 연동
 * (#140·#152·#153) 이후로도 실 API가 못 주는 필드(레시피 상세의 `ownedItems`·
 * 자리표시 재료·조리법·구매 상품)만 여기 남아 `mapRecipe.ts`의 `PLACEHOLDER_DETAIL`로
 * 쓰인다 — 카드 목록 자체(`MOCK_RECIPES` 등)는 실 데이터로 대체돼 삭제했다.
 *
 * `imageSrc`는 `MOCK_FRIDGE_ITEMS`(MyFridgeView/mock.ts)와 같은 원칙으로 실제 이미지
 * 연동 전까지 전부 같은 placeholder.
 */
// `MyFridgeView`(MY냉장고→MY레시피 탭 전환 트리거)와 `RecipeAiRecommendSection`
// (헤드라인 "OO님을 위한 AI 추천 레시피") 둘 다 같은 값을 써야 해 여기서 공유한다.
export const NICKNAME = '준호';

const PLACEHOLDER_IMAGE = '/placeholders/product-thumbnail.webp';

// storageType(냉동/냉장)은 `MyFridgeView`의 같은 상품(떡갈비=frozen, 두부·우유=refrigerated)과
// 값을 맞췄다 — badgeIcon이 그 값을 InputBadge 아이콘(snowflake/water-drop)으로 그대로 쓴다.
const GRATIN_OWNED_ITEMS = [
  {
    name: '[조선호텔] 떡갈비 345g',
    badge: 'D-4',
    badgeIcon: 'frozen' as const,
    thumbnailUrl: PLACEHOLDER_IMAGE,
  },
  {
    name: "[Kurly's] 국산콩 두부 3종 (택1)",
    badge: 'D-4',
    badgeIcon: 'refrigerated' as const,
    thumbnailUrl: PLACEHOLDER_IMAGE,
  },
  {
    name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
    badge: 'D-4',
    badgeIcon: 'refrigerated' as const,
    thumbnailUrl: PLACEHOLDER_IMAGE,
  },
];

const GRATIN_INGREDIENTS = [
  { name: '떡갈비', amount: '100g' },
  { name: '두부', amount: '150g' },
  { name: '우유', amount: '50mL' },
  { name: '슬라이스 치즈', amount: '1장(20g)' },
  { name: '모짜렐라 치즈', amount: '30g' },
  { name: '브로콜리', amount: '50g' },
  { name: '파슬리2g', amount: '2g' },
];

const GRATIN_STEPS = [
  '떡갈비 100g을 전자레인지로 해동한 뒤 한입 크기로 썬다.',
  '두부 150g을 으깨어 우유 50mL와 섞고 밑간한 떡갈비와 함께 그릇에 담는다.',
  '브로콜리 50g을 올리고 슬라이스 치즈 1장, 모짜렐라 치즈 30g으로 덮는다.',
  '에어프라이어에 180도로 10분 구운 뒤 파슬리 2g을 뿌려 마무리한다.',
];

const GRATIN_NEEDED_PRODUCTS = [
  {
    id: 'cheddar-cheese',
    imageSrc: PLACEHOLDER_IMAGE,
    name: '[소와나무] 체다 슬라이스 치즈 15매입',
    discountLabel: '33%',
    originalPriceLabel: '8,980원',
    price: 5980,
    priceLabel: '5,980원',
  },
  {
    id: 'mozzarella-cheese',
    imageSrc: PLACEHOLDER_IMAGE,
    name: '[상하치즈] 모짜렐라 슈레드 치즈 2종(택1)',
    discountLabel: '12%',
    originalPriceLabel: '11,280원',
    price: 9990,
    priceLabel: '9,990원',
  },
  {
    id: 'parsley',
    imageSrc: PLACEHOLDER_IMAGE,
    name: '[허브&스파이스마켓] 파슬리 12g',
    price: 2590,
    priceLabel: '2,590원',
  },
  {
    id: 'broccoli',
    imageSrc: PLACEHOLDER_IMAGE,
    name: '[KF365] 브로콜리 365',
    discountLabel: '14%',
    originalPriceLabel: '4,990원',
    price: 4290,
    priceLabel: '4,290원',
  },
];

/** 실 API(RECIPE-01)에 없는 필드(ownedItems/steps 등) 대체용 — mapRecipe.ts(#140) 참고. */
export const PLACEHOLDER_DETAIL = {
  ownedItems: GRATIN_OWNED_ITEMS,
  ingredients: GRATIN_INGREDIENTS,
  steps: GRATIN_STEPS,
  neededProducts: GRATIN_NEEDED_PRODUCTS,
};

/** "장바구니 담기 완료" 시트 — "함께 구매하면 좋을 상품"(node 3119-3924, MyFridgeView 와 동일 패턴). */
export const MOCK_RECIPE_RECOMMENDED_PRODUCTS = [
  {
    id: 'baby-basil',
    imageSrc: PLACEHOLDER_IMAGE,
    imageAlt: '',
    deliveryLabel: '샛별배송',
    name: '친환경 베이비 바질 10g',
    priceLabel: '995원',
  },
  {
    id: 'sourdough-bread',
    imageSrc: PLACEHOLDER_IMAGE,
    imageAlt: '',
    deliveryLabel: '샛별배송',
    name: '[더브레드블루] 통밀발효종빵 300g',
    couponLabel: '+25%쿠폰',
    priceLabel: '13,500원',
  },
  {
    id: 'cherry-tomato',
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

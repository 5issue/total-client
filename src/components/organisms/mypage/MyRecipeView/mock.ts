import { formatPrice } from '@/lib/formatters';

import type { Recipe } from './model';

/**
 * MY 레시피 스텁 데이터(퍼블리싱 단계). BE `hooks/recipe` 연동 전이라 화면 값은 전부
 * 여기서 온다 — Figma node 1281-210501(메인)·666-31653(상세) 등 실측 그대로.
 *
 * `imageSrc`는 `MOCK_FRIDGE_ITEMS`(MyFridgeView/mock.ts)와 같은 원칙으로 실제 이미지
 * 연동 전까지 전부 같은 placeholder.
 *
 * Figma 에 조리법·재료·구매 상품까지 전체 스펙이 있는 레시피는 "떡갈비 두부 그라탕"
 * (node 666-31653/31862/31703 등) 하나뿐이다. 나머지 레시피는 카드 정보(이름·이미지·
 * 보유/필요 개수)만 디자인돼 있어, 상세 화면 진입 시 그라탕과 같은 형태의 자리표시
 * 재료·조리법·구매 상품(`PLACEHOLDER_DETAIL`)으로 채운다 — 실제 콘텐츠는 디자인/BE
 * 확정 후 교체.
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

const PLACEHOLDER_DETAIL = {
  ownedItems: GRATIN_OWNED_ITEMS,
  ingredients: GRATIN_INGREDIENTS,
  steps: GRATIN_STEPS,
  neededProducts: GRATIN_NEEDED_PRODUCTS,
};

// AI 카드의 "부족 재료 담기" 가격은 상세 장바구니에 전달되는 `neededProducts` 합계와
// 항상 같아야 한다 — 하드코딩 문자열이 따로 있으면 어긋나기 쉽다(코드래빗 리뷰).
const GRATIN_MISSING_INGREDIENTS_PRICE_LABEL = formatPrice(
  GRATIN_NEEDED_PRODUCTS.reduce((sum, product) => sum + product.price, 0),
);

export const MOCK_RECIPES: Recipe[] = [
  // AI 추천 레시피 3종(메인 캐러셀, node 1281-210506) — "떡갈비 두부 그라탕"만 실제 상세 스펙.
  {
    id: 'tteok-dubu-rice-bowl',
    name: '떡갈비 두부 소보로 덮밥',
    description: '떡갈비와 두부를 포슬포슬하게 볶아 따뜻한 밥 위에 얹어 쓱쓱 비벼 먹는 간편 덮밥.',
    imageSrc: PLACEHOLDER_IMAGE,
    ownedIngredientCount: 3,
    neededIngredientCount: 4,
    liked: false,
    tags: ['1인분', '간단해요'],
    missingIngredientsPriceLabel: GRATIN_MISSING_INGREDIENTS_PRICE_LABEL,
    ...PLACEHOLDER_DETAIL,
  },
  {
    id: 'tteok-dubu-gratin',
    name: '떡갈비 두부 그라탕',
    description: '육즙 가득한 떡갈비와 두부에 진한 체다·모짜렐라 치즈를 얹어 오븐에 구워낸 요리.',
    imageSrc: PLACEHOLDER_IMAGE,
    ownedIngredientCount: 3,
    neededIngredientCount: 4,
    liked: false,
    tags: ['1인분', '간단해요'],
    missingIngredientsPriceLabel: GRATIN_MISSING_INGREDIENTS_PRICE_LABEL,
    ownedItems: GRATIN_OWNED_ITEMS,
    ingredients: GRATIN_INGREDIENTS,
    steps: GRATIN_STEPS,
    neededProducts: GRATIN_NEEDED_PRODUCTS,
  },
  {
    id: 'dubu-tteok-inari',
    name: '두부 떡갈비 유부초밥',
    description:
      '으깬 두부와 떡갈비를 달콤짭조름한 유부 피에 꽉 채워 만든 든든하고 영양 만점인 초밥.',
    imageSrc: PLACEHOLDER_IMAGE,
    ownedIngredientCount: 2,
    neededIngredientCount: 4,
    liked: false,
    tags: ['1인분', '간단해요'],
    missingIngredientsPriceLabel: GRATIN_MISSING_INGREDIENTS_PRICE_LABEL,
    ...PLACEHOLDER_DETAIL,
  },

  // 최근 본 레시피(node 1281-210531 · 666-31937 전체보기) 7종, 찜한 레시피는 이 중 일부.
  {
    id: 'avocado-toast',
    name: '아보카도 토스트',
    description: '잘 익은 아보카도를 으깨 노릇하게 구운 식빵 위에 듬뿍 올린 든든한 한 끼 토스트.',
    imageSrc: PLACEHOLDER_IMAGE,
    ownedIngredientCount: 0,
    neededIngredientCount: 5,
    liked: true,
    tags: ['1인분', '간단해요'],
    missingIngredientsPriceLabel: '15,900원',
    ...PLACEHOLDER_DETAIL,
  },
  {
    id: 'caprese-salad',
    name: '카프레제 샐러드',
    description: '토마토와 모짜렐라, 바질을 번갈아 쌓고 올리브오일을 둘러 낸 이탈리안 샐러드.',
    imageSrc: PLACEHOLDER_IMAGE,
    ownedIngredientCount: 0,
    neededIngredientCount: 3,
    liked: false,
    tags: ['1인분', '간단해요'],
    missingIngredientsPriceLabel: '9,900원',
    ...PLACEHOLDER_DETAIL,
  },
  {
    id: 'asparagus-scramble',
    name: '아스파라거스 스크램블에그',
    description: '아삭한 아스파라거스와 베이컨을 넣어 폭신하게 볶은 스크램블에그.',
    imageSrc: PLACEHOLDER_IMAGE,
    ownedIngredientCount: 1,
    neededIngredientCount: 3,
    liked: true,
    tags: ['1인분', '간단해요'],
    missingIngredientsPriceLabel: '8,900원',
    ...PLACEHOLDER_DETAIL,
  },
  {
    id: 'avocado-salmon-roll',
    name: '아보카도 연어 롤',
    description: '훈제 연어와 아보카도를 김밥 김에 돌돌 말아낸 든든한 한 끼 롤.',
    imageSrc: PLACEHOLDER_IMAGE,
    ownedIngredientCount: 1,
    neededIngredientCount: 4,
    liked: false,
    tags: ['1인분', '간단해요'],
    missingIngredientsPriceLabel: '18,900원',
    ...PLACEHOLDER_DETAIL,
  },
  {
    id: 'avocado-carpaccio',
    name: '아보카도 카르파초',
    description: '얇게 저민 아보카도에 레몬즙과 올리브오일을 뿌려 산뜻하게 즐기는 전채.',
    imageSrc: PLACEHOLDER_IMAGE,
    ownedIngredientCount: 0,
    neededIngredientCount: 3,
    liked: false,
    tags: ['1인분', '간단해요'],
    missingIngredientsPriceLabel: '11,900원',
    ...PLACEHOLDER_DETAIL,
  },
  {
    id: 'grilled-chicken-salad',
    name: '그릴드 치킨 샐러드',
    description: '노릇하게 구운 닭가슴살을 신선한 채소 위에 올린 담백한 샐러드.',
    imageSrc: PLACEHOLDER_IMAGE,
    ownedIngredientCount: 1,
    neededIngredientCount: 3,
    liked: false,
    tags: ['1인분', '간단해요'],
    missingIngredientsPriceLabel: '13,900원',
    ...PLACEHOLDER_DETAIL,
  },
  {
    id: 'tomato-basil-spaghetti',
    name: '토마토 바질 스파게티',
    description: '잘 익은 토마토와 향긋한 바질을 듬뿍 올린 새콤달콤 스파게티.',
    imageSrc: PLACEHOLDER_IMAGE,
    ownedIngredientCount: 0,
    neededIngredientCount: 5,
    liked: true,
    tags: ['1인분', '간단해요'],
    missingIngredientsPriceLabel: '16,900원',
    ...PLACEHOLDER_DETAIL,
  },
];

export const MOCK_AI_RECOMMENDED_RECIPE_IDS = [
  'tteok-dubu-rice-bowl',
  'tteok-dubu-gratin',
  'dubu-tteok-inari',
];

export const MOCK_RECENT_RECIPE_IDS = [
  'avocado-toast',
  'caprese-salad',
  'asparagus-scramble',
  'avocado-salmon-roll',
  'avocado-carpaccio',
  'grilled-chicken-salad',
  'tomato-basil-spaghetti',
];

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

export function findRecipe(id: string): Recipe | undefined {
  return MOCK_RECIPES.find((recipe) => recipe.id === id);
}

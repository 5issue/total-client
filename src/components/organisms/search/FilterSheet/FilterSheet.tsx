'use client';

import { useId, useState } from 'react';

import { Checkbox } from '@/components/atoms/Checkbox';
import { Icon } from '@/components/atoms/Icon';
import { Radio } from '@/components/atoms/Radio';
import { BottomSheet } from '@/components/molecules/shared/BottomSheet';

/**
 * 검색 결과 화면의 필터 바텀시트 (organism). Figma node 884-59056(카테고리) /
 * 884-60424(가격) / 884-61068(브랜드 선택완료), 시트 본문은 node 968:111659.
 *
 * 상품 스키마에 카테고리/가격/브랜드 등 필드가 없어(#90) 이 시트의 선택은 시각 상태만
 * 토글하고 실제 목록 필터링에는 반영하지 않는다 — Kurly Only/쿠폰/멤버스혜택
 * (`SearchResultSection`)과 달리 목데이터에 대응 필드가 없다. "N개 상품보기" 는 상위가
 * 이미 좁힌 현재 결과 개수(`resultCount`)를 그대로 보여준다.
 *
 * 선택 요약은 두 군데다: 탭 라벨 옆 개수 배지(Figma "TabItemBoxed")와 하단의 제거 가능한
 * 칩 목록. 단 **카테고리 선택은 칩으로 요약하지 않는다** — 디자인팀 지정(#90, "카테고리는
 * 드롭다운만 되면 됨"). Figma 카테고리 탭도 아코디언 19개 + 하단 바뿐이다.
 */
const TABS = ['카테고리', '가격', '브랜드', '유형', '혜택', '출시', '포장타입'] as const;
type FilterTab = (typeof TABS)[number];

/**
 * 탭별 옵션 데이터. 실제 facet API 가 없어 Figma 목업 값을 그대로 옮겼다 — API 가 생기면
 * 이 상수들만 응답으로 교체한다.
 * - 카테고리 19개는 실제 라벨이지만, 하위 옵션은 Figma 에 "유제품"만 있다.
 * - 브랜드는 Figma 자체가 모든 행에 같은 더미("가보팜스")를 써서 대표 예시로 대체했다.
 * - 유형/혜택/출시/포장타입은 Figma 가 브랜드 탭 컴포넌트를 그대로 재사용하고 있었으나
 *   이 4개 탭엔 정렬·자음인덱스가 안 맞아 단순 목록으로 구현하기로 했다(#90).
 */
const CATEGORIES = [
  '유제품',
  '베이커리',
  '간식·과자·떡',
  '반려동물',
  '가구·인테리어',
  '건강식품',
  '간편식·밀키트·샐러드',
  '유아동',
  '가전제품',
  '커피·차',
  '생수·음료',
  '주방용품',
  '면·양념·오일',
  '스킨케어·메이크업',
  '헤어·바디·구강',
  '과일·견과·쌀',
  '키즈웨어',
  '정육·가공육·달걀',
  '패션잡화',
];

const CATEGORY_SUBOPTIONS: Partial<Record<string, string[]>> = {
  유제품: ['전체', '우유·두유', '요거트·생크림', '아이스크림', '가공치즈', '자연치즈', '버터'],
};

const PRICE_RANGES = [
  { value: 'under-3000', label: '3,000원 미만' },
  { value: '3000-6000', label: '3,000원 ~6,000원' },
  { value: '6000-20000', label: '6,000원 ~ 20,000원' },
  { value: 'over-20000', label: '20,000원 이상' },
];

const MOCK_BRANDS = ['가보팜스', '나무목장', '다온푸드', '라온낙농', '마루원', '바른농원'];
const BRAND_ALPHABET = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅅ',
  'ㅇ',
  'ㅈ',
  'ㅊ',
  'ㅋ',
  'ㅍ',
  'ㅎ',
  'A-Z',
];

const SIMPLE_TAB_OPTIONS: Partial<Record<FilterTab, string[]>> = {
  유형: ['냉장', '냉동', '상온'],
  혜택: ['무료배송', '오늘의특가', '1+1'],
  출시: ['신상품', '베스트'],
  포장타입: ['낱개', '묶음', '리필'],
};

/** 가로 스크롤 영역 공통(탭 바·자음 인덱스·선택 칩). */
const SCROLL_ROW = 'scrollbar-hide flex items-center overflow-x-auto';

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/**
 * 체크박스 목록 행 (Figma "FilterCountCheckboxItem" node 1233-114890 실측: h-50,
 * gap-8, px-20). 개수는 행 오른쪽 끝이 아니라 라벨 바로 옆(gap-4)에 붙고, 라벨·개수
 * 모두 Heading/H5_Medium 이다.
 *
 * 화면에 보이는 라벨은 아톰을 감싸지 않고 같은 `id` 를 공유하는 형제 `<label>` 로 둔다 —
 * 둘을 함께 감싸면 label 이 중첩된다. 그래서 아톰에는 `label=""` 을 넘긴다: 아톰이 자체
 * 렌더하는 `sr-only` 라벨까지 남기면 같은 input 에 label 이 둘 붙어 접근 가능한 이름이
 * "가보팜스 가보팜스" 처럼 중복된다(#99 리뷰). 이름은 보이는 형제 라벨이 담당한다.
 * `!size-7` 은 아톰의 44px 터치 래퍼를 Figma 프레임(28px)으로 줄이고, `shrink-0` 이
 * 없으면 긴 라벨에서 체크박스가 눌려 찌그러진다.
 */
function CheckboxRow({
  label,
  checked,
  onChange,
  trailing,
  indented = false,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  trailing?: string;
  /** 카테고리 하위 옵션처럼 한 단계 들여쓴 행(Gap/XXXL 32px). 기본은 Gap/L 20px. */
  indented?: boolean;
}) {
  const id = useId();
  return (
    <div className={`flex h-12.5 w-full items-center gap-2 pr-5 ${indented ? 'pl-8' : 'pl-5'}`}>
      <Checkbox
        tone="black"
        size={28}
        id={id}
        label=""
        checked={checked}
        onChange={onChange}
        className="!size-7 shrink-0"
      />
      <label htmlFor={id} className="text-heading-5 flex min-w-0 cursor-pointer items-center gap-1">
        <span className="text-fg truncate">{label}</span>
        {trailing ? <span className="text-fg-quaternary shrink-0">{trailing}</span> : null}
      </label>
    </div>
  );
}

/**
 * 가격 탭 전용 행 — `Radio` 아톰 `tone="black"`(Figma "Radio_Black"). 라벨은
 * Heading/H5_Medium(Figma "FilterRadioGroup" node 1233-115856), 라디오와 Gap/XS(8px).
 * `label=""` 인 이유는 `CheckboxRow` 주석과 같다(중복 accessible name 방지).
 */
function PriceRadioRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  const id = useId();
  return (
    <div className="flex w-full items-center gap-2">
      <Radio
        id={id}
        tone="black"
        label=""
        name="price-range"
        checked={checked}
        onChange={onChange}
        className="!size-7 shrink-0"
      />
      <label htmlFor={id} className="text-heading-5 text-fg cursor-pointer">
        {label}
      </label>
    </div>
  );
}

/** Figma "TabItemBoxed" — 라벨 + 선택 개수 배지(SF Pro Black) + 활성 밑줄. */
function FilterTabBar({
  activeTab,
  counts,
  onSelect,
}: {
  activeTab: FilterTab;
  counts: Record<FilterTab, number>;
  onSelect: (tab: FilterTab) => void;
}) {
  return (
    <div className={`${SCROLL_ROW} gap-1 px-2`}>
      {TABS.map((tab) => {
        const active = tab === activeTab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onSelect(tab)}
            className={[
              'text-heading-5 rounded-m flex h-12 shrink-0 flex-col items-center justify-center gap-1 px-2 pt-3 whitespace-nowrap',
              active ? 'text-fg' : 'text-fg-secondary',
            ].join(' ')}
          >
            <span className="flex items-center gap-0.5">
              {tab}
              {counts[tab] > 0 ? <span className="font-numeric">{counts[tab]}</span> : null}
            </span>
            <span
              aria-hidden
              className={['h-0.5 w-full', active ? 'bg-fg' : 'bg-transparent'].join(' ')}
            />
          </button>
        );
      })}
    </div>
  );
}

/**
 * 카테고리 탭 — 아코디언(Figma "FilterAccordion" node 1233-117618: h-48, pl-16 pr-12).
 * 대분류 행은 펼침/접힘만 하고 "선택" 상태가 없다(#90) — 실제 선택은 하위 체크박스다.
 */
function CategoryPanel({
  expanded,
  onToggleExpand,
  selections,
  onToggleOption,
}: {
  expanded: string | null;
  onToggleExpand: (category: string | null) => void;
  selections: Record<string, string[]>;
  onToggleOption: (category: string, option: string) => void;
}) {
  return (
    <ul className="flex flex-col">
      {CATEGORIES.map((category) => {
        const isOpen = expanded === category;
        const subOptions = CATEGORY_SUBOPTIONS[category];
        return (
          <li key={category}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => onToggleExpand(isOpen ? null : category)}
              className="text-heading-4 text-fg flex h-12 w-full items-center justify-between pr-3 pl-4"
            >
              {category}
              <Icon
                name="arrow-down"
                size={24}
                aria-hidden
                className={`text-fg-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {!isOpen ? null : subOptions ? (
              <div className="flex flex-col pb-1">
                {subOptions.map((option) => (
                  <CheckboxRow
                    key={option}
                    label={option}
                    indented
                    checked={selections[category]?.includes(option) ?? false}
                    onChange={() => onToggleOption(category, option)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-label-m text-fg-tertiary px-4 pb-3">하위 카테고리 준비 중이에요</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** 가격 탭 — 단일 선택 라디오 4단계(Figma node 884-60424: px-20 py-24, 행 간격 24). */
function PricePanel({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6 px-5 py-6">
      {PRICE_RANGES.map((range) => (
        <PriceRadioRow
          key={range.value}
          label={range.label}
          checked={value === range.value}
          onChange={() => onChange(range.value)}
        />
      ))}
    </div>
  );
}

/** 브랜드 탭 — 정렬 토글 + 자음 인덱스 + 체크박스 목록(Figma "BrandFilter" node 968-111162). */
function BrandPanel({
  sort,
  onSortChange,
  activeLetter,
  onLetterChange,
  selected,
  onToggle,
}: {
  sort: 'alpha' | 'popular';
  onSortChange: (sort: 'alpha' | 'popular') => void;
  activeLetter: string;
  onLetterChange: (letter: string) => void;
  selected: string[];
  onToggle: (brand: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex h-12.75 items-center gap-4 px-5 pt-3">
        <button
          type="button"
          onClick={() => onSortChange('alpha')}
          className={`text-body-m ${sort === 'alpha' ? 'text-primary' : 'text-fg'}`}
        >
          가나다순
        </button>
        <div aria-hidden className="bg-border h-3 w-px" />
        <button
          type="button"
          onClick={() => onSortChange('popular')}
          className={`text-body-m ${sort === 'popular' ? 'text-primary' : 'text-fg'}`}
        >
          상품 많은순
        </button>
      </div>

      {/* 자음 인덱스는 가나다순에서만 의미가 있다 — 상품많은순일 땐 숨긴다(#90). */}
      {sort === 'alpha' ? (
        <div className={`${SCROLL_ROW} gap-2 px-4 py-2`}>
          {BRAND_ALPHABET.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => onLetterChange(letter)}
              className={[
                'text-heading-5 flex h-11 shrink-0 items-center justify-center rounded-full px-3',
                activeLetter === letter
                  ? 'bg-fg text-fg-inverse'
                  : 'bg-surface-secondary text-fg-quaternary',
              ].join(' ')}
            >
              {letter}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col">
        {MOCK_BRANDS.map((brand) => (
          <CheckboxRow
            key={brand}
            label={brand}
            trailing="1"
            checked={selected.includes(brand)}
            onChange={() => onToggle(brand)}
          />
        ))}
      </div>
    </div>
  );
}

/** 유형/혜택/출시/포장타입 — 정렬·자음인덱스 없는 단순 체크박스 목록. */
function SimpleOptionsPanel({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}) {
  return (
    <div className="flex flex-col py-1">
      {options.map((option) => (
        <CheckboxRow
          key={option}
          label={option}
          checked={selected.includes(option)}
          onChange={() => onToggle(option)}
        />
      ))}
    </div>
  );
}

type SelectedChip = { key: string; label: string; onRemove: () => void };

/**
 * 하단 고정 영역 — 선택 칩 줄 + 초기화/상품보기 바 (Figma node 884-61068 실측).
 * 칩 줄은 px-16 py-8 에 칩 사이 10px, 칩("RemovableChip")은 테두리 없는
 * surface-secondary pill(h-32, px-8). 바는 px-16 에 높이 104 = pt-12 + CTA 56 + 아래 36
 * — `pb-9` 가 그 아래 36px 를 만든다(py-3 만 주면 80px 라 버튼이 시트 바닥에 붙는다).
 */
function FilterFooter({
  chips,
  hasSelection,
  onReset,
  resultCount,
  onSubmit,
}: {
  chips: SelectedChip[];
  hasSelection: boolean;
  onReset: () => void;
  resultCount: number;
  onSubmit: () => void;
}) {
  return (
    <div className="flex flex-col">
      {chips.length > 0 ? (
        <div className={`${SCROLL_ROW} gap-2.5 px-4 py-2`}>
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              className="bg-surface-secondary text-heading-5 text-fg flex h-8 shrink-0 items-center gap-1 rounded-full px-2 whitespace-nowrap"
            >
              {chip.label}
              <Icon name="close" size={20} aria-hidden />
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-6 px-4 pt-3 pb-9">
        <button
          type="button"
          disabled={!hasSelection}
          onClick={onReset}
          className={[
            'text-heading-2 rounded-m flex h-11.5 shrink-0 items-center gap-1 px-1 py-2',
            // 활성 Static/Black(#222) / 비활성 Icon/Disabled(#c9d5df).
            hasSelection ? 'text-fg' : 'text-neutral-400',
          ].join(' ')}
        >
          {/* Figma 아이콘이 좌우 반전된 형태다(원본은 -scale-y-100 + rotate-180). */}
          <Icon name="refresh" size={28} aria-hidden className="-scale-x-100" />
          초기화
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="bg-primary text-fg-inverse text-heading-1 rounded-m flex h-14 flex-1 items-center justify-center gap-1 px-1 py-2"
        >
          {resultCount}개 상품보기
        </button>
      </div>
    </div>
  );
}

export interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  /** "N개 상품보기" 버튼에 쓸 현재 결과 개수. */
  resultCount: number;
}

export function FilterSheet({ open, onClose, resultCount }: FilterSheetProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('카테고리');

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categorySubSelections, setCategorySubSelections] = useState<Record<string, string[]>>({});
  const [priceSelection, setPriceSelection] = useState<string | null>(null);
  const [brandSort, setBrandSort] = useState<'alpha' | 'popular'>('alpha');
  const [activeLetter, setActiveLetter] = useState('ㄱ');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [simpleSelections, setSimpleSelections] = useState<Record<string, string[]>>({});

  function resetAll() {
    setExpandedCategory(null);
    setCategorySubSelections({});
    setPriceSelection(null);
    setSelectedBrands([]);
    setSimpleSelections({});
  }

  function toggleCategorySub(category: string, option: string) {
    setCategorySubSelections((prev) => ({
      ...prev,
      [category]: toggleInList(prev[category] ?? [], option),
    }));
  }

  function toggleBrand(brand: string) {
    setSelectedBrands((prev) => toggleInList(prev, brand));
  }

  function toggleSimpleOption(tab: FilterTab, option: string) {
    setSimpleSelections((prev) => ({ ...prev, [tab]: toggleInList(prev[tab] ?? [], option) }));
  }

  const priceLabel = PRICE_RANGES.find((r) => r.value === priceSelection)?.label;
  const categorySubCount = Object.values(categorySubSelections).reduce((n, v) => n + v.length, 0);
  const simpleCount = (tab: FilterTab) => simpleSelections[tab]?.length ?? 0;

  const tabCounts: Record<FilterTab, number> = {
    카테고리: categorySubCount,
    가격: priceSelection ? 1 : 0,
    브랜드: selectedBrands.length,
    유형: simpleCount('유형'),
    혜택: simpleCount('혜택'),
    출시: simpleCount('출시'),
    포장타입: simpleCount('포장타입'),
  };

  const selectedChips: SelectedChip[] = [
    ...(priceLabel
      ? [{ key: 'price', label: priceLabel, onRemove: () => setPriceSelection(null) }]
      : []),
    ...selectedBrands.map((b) => ({ key: `brand-${b}`, label: b, onRemove: () => toggleBrand(b) })),
    ...Object.entries(simpleSelections).flatMap(([tab, options]) =>
      options.map((option) => ({
        key: `simple-${tab}-${option}`,
        label: option,
        onRemove: () => toggleSimpleOption(tab as FilterTab, option),
      })),
    ),
  ];
  // 칩 줄 노출 조건과 일부러 다르다 — 칩으로 요약하지 않는 카테고리 선택도 "선택된 필터"다.
  const hasSelection = selectedChips.length > 0 || categorySubCount > 0;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel="필터"
      // Figma(874px 프레임) 실측: 시트 상단 y=264 / 높이 610 → 70dvh. `maxHeight` 가
      // 아니라 `height` 인 이유는 탭마다 콘텐츠 길이가 크게 달라(카테고리 19개 vs 가격 4개)
      // 최대치로만 두면 짧은 탭에서 시트가 쪼그라들어 탭을 옮길 때마다 들썩이기 때문이다.
      // Figma 도 모든 탭이 같은 높이라 고정이 스펙이다(#90).
      height="70dvh"
      footer={
        <FilterFooter
          chips={selectedChips}
          hasSelection={hasSelection}
          onReset={resetAll}
          resultCount={resultCount}
          onSubmit={onClose}
        />
      }
    >
      <div className="flex h-full flex-col">
        <p className="text-heading-1 text-fg px-4 pt-1 pb-2">필터</p>
        <FilterTabBar activeTab={activeTab} counts={tabCounts} onSelect={setActiveTab} />

        {/* `min-h-0 flex-1` — 고정 높이 시트에서 남는 공간만 채우고 자체 스크롤한다. */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {activeTab === '카테고리' ? (
            <CategoryPanel
              expanded={expandedCategory}
              onToggleExpand={setExpandedCategory}
              selections={categorySubSelections}
              onToggleOption={toggleCategorySub}
            />
          ) : activeTab === '가격' ? (
            <PricePanel value={priceSelection} onChange={setPriceSelection} />
          ) : activeTab === '브랜드' ? (
            <BrandPanel
              sort={brandSort}
              onSortChange={setBrandSort}
              activeLetter={activeLetter}
              onLetterChange={setActiveLetter}
              selected={selectedBrands}
              onToggle={toggleBrand}
            />
          ) : (
            <SimpleOptionsPanel
              options={SIMPLE_TAB_OPTIONS[activeTab] ?? []}
              selected={simpleSelections[activeTab] ?? []}
              onToggle={(option) => toggleSimpleOption(activeTab, option)}
            />
          )}
        </div>
      </div>
    </BottomSheet>
  );
}

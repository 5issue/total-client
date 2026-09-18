'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Checkbox } from '@/components/atoms/Checkbox';
import { Icon } from '@/components/atoms/Icon';
import type { FridgeItem } from '@/components/organisms/mypage/MyFridgeView/model';

/**
 * 나의 냉장고 상품 카드 (molecule). Figma "5팀 UI 공유용" `KitchenInventoryCardXl`
 * (node 1120-56187 등, 180×330).
 *
 * `SearchResultProductCard`(썸네일 위 뱃지 오버레이)와 `CartLineItem`(체크박스·품절
 * 표현)의 컨벤션을 합쳤다 — 체크박스+D-day 뱃지가 동시에 썸네일 위에 겹치는 조합은
 * 기존 카드 어디에도 없어 새 molecule 로 뒀다.
 *
 * 이미지는 상세 페이지 링크(`/products/[productId]`) — 품절이어도 그대로 이동 가능,
 * "채워넣기"만 비활성화된다(디자인 요구사항).
 *
 * 체크박스는 `Checkbox` atom 을 그대로 쓰되, 그 `<label>` 이 항상 44px 터치 타깃으로
 * 글리프를 가운데 두기 때문에 Figma 가 원하는 "썸네일 (8,8) 지점에 글리프 좌상단"과는
 * 어긋난다(글리프 18px 기준 중심 오프셋 13px) — 감싸는 요소를 `-top-1.25 -left-1.25`
 * (-5px)만큼 당겨 글리프만 (8,8)에 오도록 보정한다. 이 44px 히트박스가 이미지의
 * `overflow-hidden` 안에 있으면 상단·좌측 5px 가 잘려 실제 터치 영역이 39×39px 로
 * 줄어든다(코드래빗 리뷰, #111) — 그래서 이미지 클리핑(`overflow-hidden`)은 안쪽
 * 래퍼로 따로 두고, 체크박스·D-day 뱃지는 클리핑 없는 바깥 `relative` 컨테이너에
 * 얹어 44px 전체가 히트된다.
 *
 * "채워넣기"/"품절"/"보관팁" 버튼은 Figma 실측 높이(38px/36px)가 44px 터치 타깃보다
 * 작다(코드래빗 리뷰, #111) — 카드 전체 높이(180×330 고정)를 지키기 위해 시각적
 * 크기(테두리·배경이 있는 안쪽 `span`)는 실측 그대로 두고, 클릭을 받는 바깥
 * `button` 만 44px로 키운 뒤 `-my-*` 음수 마진으로 레이아웃에 차지하는 공간은
 * 원래 크기로 되돌린다(체크박스 오프셋 보정과 같은 원칙) — 여분 몇 px는 인접 여백
 * (gap-2/pt-1)로 흡수돼 다른 요소와 겹치지 않는다.
 */
export interface KitchenInventoryCardProps {
  item: FridgeItem;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onRefill: () => void;
  onShowStorageTip: () => void;
  className?: string;
}

function DDayBadge({ item }: { item: FridgeItem }) {
  const icon = item.expired
    ? item.storageType === 'frozen'
      ? 'frozen-danger'
      : 'refrigerated-danger'
    : item.storageType;

  return (
    <span
      className={[
        'inline-flex h-6 items-center gap-0.5 rounded-full border px-2',
        item.expired
          ? 'bg-error border-error text-fg-danger'
          : 'bg-surface-secondary text-fg-secondary border-neutral-400',
      ].join(' ')}
    >
      <Icon name={icon} size={16} aria-hidden />
      <span className="text-caption-m">{item.dDayLabel}</span>
    </span>
  );
}

export function KitchenInventoryCard({
  item,
  checked,
  onCheckedChange,
  onRefill,
  onShowStorageTip,
  className,
}: KitchenInventoryCardProps) {
  return (
    <div className={['flex w-full flex-col gap-1', className].filter(Boolean).join(' ')}>
      <div className="relative aspect-square w-full">
        <div className="bg-surface-secondary absolute inset-0 overflow-hidden rounded-sm">
          <Link href={`/products/${item.productId}`} className="absolute inset-0">
            {item.imageSrc ? (
              <Image
                src={item.imageSrc}
                alt={item.name}
                fill
                sizes="180px"
                className="object-cover"
              />
            ) : null}
          </Link>
          {/* "IMG_Size"(디자인 시스템 node 3329-8439) 자체 스펙 — 사진 위에 항상 얹는
              어두운 스크림. 체크박스·D-day 뱃지가 어떤 사진 위에서도 보이게 하는
              용도라 `pointer-events-none`으로 클릭은 이미지 링크로 그대로 통과시킨다. */}
          <div aria-hidden className="bg-fridge-card-scrim pointer-events-none absolute inset-0" />
        </div>
        <span className="absolute -top-1.25 -left-1.25">
          <Checkbox
            variant="filled"
            label={`${item.name} 선택`}
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
          />
        </span>
        <span className="absolute top-2 right-2">
          <DDayBadge item={item} />
        </span>
      </div>

      <div className="flex flex-col items-start gap-2 pt-1">
        {item.soldOut ? (
          <button
            type="button"
            disabled
            className="-my-0.75 flex h-11 w-full items-center justify-center"
          >
            <span className="text-label-l text-fg-disabled rounded-m flex h-9.5 w-full items-center justify-center gap-1 border border-neutral-400">
              품절
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onRefill}
            className="-my-0.75 flex h-11 w-full items-center justify-center"
          >
            <span className="text-label-l text-fg active:bg-surface-secondary rounded-m flex h-9.5 w-full items-center justify-center gap-1 border border-neutral-400">
              <Icon name="plus-small" size={20} aria-hidden />
              채워넣기
            </span>
          </button>
        )}

        <div className="flex flex-col items-start">
          <p className="text-label-m text-fg">{item.name}</p>
          <div className="flex h-5 items-center gap-1">
            <span className="text-caption-m text-fg-secondary">{item.quantityLabel}</span>
            <span aria-hidden className="bg-border h-3 w-px" />
            <span className="text-caption-m text-fg-secondary">{item.expiryLabel}</span>
          </div>
          <button
            type="button"
            onClick={onShowStorageTip}
            className="-my-1 flex h-11 w-15.25 items-center justify-center"
          >
            <span className="text-label-m text-primary flex items-center justify-center gap-1">
              보관팁
              <Icon name="right" size={12} aria-hidden />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

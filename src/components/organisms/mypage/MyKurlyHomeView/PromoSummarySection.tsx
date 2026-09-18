import Image from 'next/image';

import { Icon } from '@/components/atoms/Icon';
import { StatusLabel } from '@/components/molecules/shared/StatusLabel';

import { MOCK_KITCHEN_CARDS, MOCK_QUICK_MENU, MOCK_SUMMARY } from './mock';

/**
 * Promo Section(node 910-110883) — 인사말/구독 배너/멤버십 혜택 박스/적립금·캐시·포인트
 * 요약/퀵메뉴 5종/컬리키친. Figma 원본 그룹 그대로 하나의 organism 으로 옮겼다.
 *
 * 목적지 화면이 없는 배너·박스·카드는 비상호작용이다(model.ts `LinkItem` pending 원칙).
 * chevron 은 `right-small` 대신 `right`(currentColor)를 축소해 쓴다 — `right-small` 은
 * stroke 가 흰색 고정 자산이라(`HeroBanner` 어두운 배경용) 흰 배경에서 안 보인다.
 *
 * 다크모드(node 1691-205433/205434 재확인, 2026-09-18): 이전에 이 두 컴포넌트 텍스트를
 * `text-black`/`text-neutral-900` 고정값으로 바꿨었는데, 그 근거였던 `get_design_context`
 * 코드젠 결과가 실제로는 라이트 모드 폴백 hex 를 그대로 보여준 것이었다 — `Icon/White_Inverse`
 * 때와 같은 함정. `get_variable_defs`(다크 노드 기준)로 직접 확인한 결과:
 *   - Membership_Benefit_Box 상단 줄("컬리 인기...")·My_Summary_Card 배지("상품권 미보유")
 *     → `Static/Black`(#222 고정) 이 맞다 — `text-black` 유지.
 *   - 나머지(카테고리 3종, SummaryRow 라벨·값) → `Text/Secondary`/`Text/Primary` 시맨틱
 *     변수 바인딩(다크에서 각각 #f0f5f8/#ffffff) — `text-fg-secondary`/`text-fg` 로 되돌림.
 *   - 두 컴포넌트의 테두리 → `Border/Strong`(#dde4ed) 고정값(라이트·다크 동일) — 시맨틱
 *     `border-border`(다크에서 #515e69 로 갈라짐) 대신 프리미티브 `border-neutral-300`
 *     (=#dde4ed) 사용. My_Summary_Card 는 Figma 에 배경 자체가 없어(테두리만) `bg-surface`
 *     를 뺐다 — 값을 시맨틱으로 되돌리면 라이트/다크 페이지 배경과 항상 반대색이라
 *     배경 없이도 대비가 보장된다(이전엔 고정 검정 텍스트라 다크 배경과 같은 색이 돼
 *     안 보였던 것, 원인은 배경 부재가 아니라 텍스트색이 틀렸던 것).
 */
function ChevronRight() {
  return <Icon name="right" size={10} aria-hidden className="text-fg-quaternary" />;
}

function Divider() {
  return <span aria-hidden className="bg-border h-5 w-px" />;
}

export function PromoSummarySection() {
  return (
    <div className="flex flex-col gap-3 px-4 pt-5 pb-1">
      <div className="flex w-full items-center justify-between">
        <p className="text-body-l">
          <span className="text-cyan">반가워요! </span>
          <span className="text-fg">{MOCK_SUMMARY.nickname}님</span>
        </p>
        <p className="text-label-xs text-fg-tertiary">{MOCK_SUMMARY.freeShippingNotice}</p>
      </div>

      {/* Promotion_Nav_Banner(node 910-110890) */}
      <div className="border-cyan flex h-10.5 w-full items-center justify-between rounded-lg border px-4">
        <div className="flex items-center gap-1">
          <Icon name="coupon-cyan" size={14} aria-hidden />
          <p className="text-label-xl text-fg-secondary">첫구독시 2개월간 구독료 100원</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusLabel type="owned">보유중</StatusLabel>
          <ChevronRight />
        </div>
      </div>

      {/* Membership_Benefit_Box(node 910-110891) */}
      <div className="overflow-hidden rounded-lg border border-neutral-300">
        <div className="bg-surface-secondary flex h-11 items-center justify-between gap-3 px-4">
          <p className="text-label-xl flex-1 text-black">
            컬리 인기 상품도 추가 할인 받을 수 있어요
          </p>
          <ChevronRight />
        </div>
        <div className="bg-surface flex h-9.5 items-center justify-center gap-4 px-4">
          <p className="text-label-xl text-fg-secondary flex-1 text-center">멤버스 특가</p>
          <Divider />
          <p className="text-label-xl text-fg-secondary flex-1 text-center">이달의 혜택</p>
          <Divider />
          <p className="text-label-xl text-fg-secondary flex-1 text-center">제휴 혜택</p>
        </div>
      </div>

      {/* My_Summary_Card(node 910-110892) */}
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-neutral-300 px-4 py-2">
        <SummaryRow label="적립금" value={`${MOCK_SUMMARY.points} 원`} />
        <SummaryRow
          label="컬리캐시"
          badge={MOCK_SUMMARY.hasGiftCard ? undefined : '상품권 미보유'}
          value={`${MOCK_SUMMARY.kurlyCash} 원`}
        />
        <SummaryRow label="매일혜택 포인트" value={`${MOCK_SUMMARY.dailyBenefitPoints} P`} />
      </div>

      {/* Quick_Menu(node 910-110893) */}
      <div className="flex w-full items-center justify-between">
        {MOCK_QUICK_MENU.map((item) => (
          <div key={item.id} className="flex h-16 w-13 flex-col items-center justify-center gap-1">
            <Icon name={item.icon} size={28} aria-hidden />
            <div className="flex items-center gap-1">
              <p className="text-body-m text-fg">{item.label}</p>
              {item.count !== undefined ? (
                <p className="font-numeric text-numeric-l text-primary">{item.count}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* 컬리키친(node 910-110899) */}
      <div className="flex flex-col gap-3 pt-3">
        <h2 className="text-label-xl text-fg">컬리키친</h2>
        <div className="flex items-center gap-2">
          {MOCK_KITCHEN_CARDS.map((card) => (
            <div
              key={card.id}
              className="bg-surface-secondary rounded-m flex h-13 flex-1 items-center justify-center gap-2 px-4 py-3"
            >
              <p className="text-label-xl text-fg flex-1 text-center">{card.title}</p>
              {/* 원 배경은 `bg-bg`(Icon/White_Inverse, 라이트 흰색/다크 #222222)로 테마 처리
                  — 이전엔 원 자체를 이미지에 베이크드해 export 했더니 캔버스 모서리에
                  당시 Figma 배경색(#515e69)이 불투명하게 같이 구워져, 실제 카드 배경
                  (bg-surface-secondary, 다크 #7e8f9b)과 색이 달라 사각형 회색 테두리가
                  비쳐 보이는 문제가 있었다(스크린샷 피드백, 2026-09-18) — 투명 배경
                  글리프만 export 해 해결. */}
              <span className="bg-bg flex size-10 items-center justify-center rounded-full">
                <Image src={card.iconSrc} alt="" width={card.iconWidth} height={card.iconHeight} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, badge }: { label: string; value: string; badge?: string }) {
  return (
    <div className="flex h-8 w-full items-center justify-between">
      <div className="flex flex-1 items-center gap-1">
        <p className="text-label-xl text-fg-secondary">{label}</p>
        {badge ? (
          <span className="bg-overlay-blue text-caption-s inline-flex h-5 items-center rounded-sm px-2 text-black">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <p className="text-label-xl text-fg w-15 text-right">{value}</p>
        <ChevronRight />
      </div>
    </div>
  );
}

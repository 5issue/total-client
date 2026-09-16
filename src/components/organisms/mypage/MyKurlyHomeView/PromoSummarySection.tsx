import Image from 'next/image';

import { Icon } from '@/components/atoms/Icon';
import { StatusLabel } from '@/components/molecules/shared/StatusLabel';

import { MOCK_KITCHEN_CARDS, MOCK_QUICK_MENU, MOCK_SUMMARY } from './mock';

/**
 * Promo Section(node 910-110883) — 인사말, 구독 배너, 멤버십 혜택 박스, 적립금·캐시·포인트
 * 요약 카드, 퀵메뉴 5종, 컬리키친(MY 냉장고·MY 레시피)까지 한 흰 배경 카드 안에 묶인
 * Figma 원본 그룹을 그대로 하나의 organism 으로 옮겼다.
 *
 * 목적지 화면이 없는 배너·박스·카드는 전부 비상호작용이다(model.ts `LinkItem`과 같은
 * pending 원칙 — 아직 없는 라우트로 가짜 링크를 걸지 않는다).
 *
 * `right-small`(atoms/Icon) 은 stroke 가 흰색으로 고정된 자산이라(`HeroBanner`의 어두운
 * 배경 위 "전체보기"에서 온 것 — themable: false) 흰 배경인 이 화면에서는 안 보인다.
 * 대신 `right`(28px 컷, `stroke="currentColor"`)를 10px로 축소해 쓰고 색은 Figma 실측
 * (`#8AA1AB`, node 910-110892 get_design_context 로 재확인) = `--color-fg-quaternary` 로
 * 직접 지정한다(리뷰 피드백으로 발견, 2026-09-17).
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
      <div className="border-border overflow-hidden rounded-lg border">
        <div className="bg-surface-secondary flex h-11 items-center justify-between gap-3 px-4">
          <p className="text-label-xl text-fg flex-1">컬리 인기 상품도 추가 할인 받을 수 있어요</p>
          <ChevronRight />
        </div>
        <div className="flex h-9.5 items-center justify-center gap-4 px-4">
          <p className="text-label-xl text-fg-secondary flex-1 text-center">멤버스 특가</p>
          <Divider />
          <p className="text-label-xl text-fg-secondary flex-1 text-center">이달의 혜택</p>
          <Divider />
          <p className="text-label-xl text-fg-secondary flex-1 text-center">제휴 혜택</p>
        </div>
      </div>

      {/* My_Summary_Card(node 910-110892) */}
      <div className="border-border flex flex-col items-center justify-center gap-1 rounded-lg border px-4 py-2">
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
              <Image src={card.iconSrc} alt="" width={40} height={40} />
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
          <span className="bg-overlay-blue text-fg text-caption-s inline-flex h-5 items-center rounded-sm px-2">
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

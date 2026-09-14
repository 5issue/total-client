import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { InfoBox } from '@/components/atoms/InfoBox';
import { OrderRecommendCarousel } from '@/components/organisms/checkout/OrderRecommendCarousel';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';

import { MOCK_ORDER_NUMBER, MOCK_ORDER_RECOMMEND, MOCK_ORDER_TOTAL } from './mock';

/**
 * 주문 완료 화면 (organism) — Figma node 666-26284.
 *
 * 결제 후 도착하는 종착 화면이라 상호작용이 거의 없다. 상태가 없어 서버 컴포넌트로 둔다
 * (추천 캐러셀만 페이지 전환 때문에 클라 경계 — `OrderRecommendCarousel`).
 *
 * 이번 작업 범위는 **퍼블리싱만**이다(사용자 확정, 2026-09-15). 결제 연동(토스페이먼츠)은
 * 체크아웃 PR #84 가 머지된 뒤 별도로 진행하고, 지금은 체크아웃의 "결제하기"가 이 경로로
 * 넘어오는 더미 흐름만 있다. 그래서 주문번호·금액·추천 상품은 전부 `mock.ts` 스텁이다.
 *
 * 의도적으로 비워 둔 동작(연동 시 배선):
 * - 주문번호 "복사" — 클립보드 복사 보류(사용자 지정). 시각만 둔다.
 * - 추천 상품 "담기" / "전체보기" — 무동작(`OrderRecommendCarousel` 주석 참고).
 *
 * 토큰(실측): 배경 `Bg/secondary`(#f0f5f8) → `bg-surface-secondary`, 카드 `Surface/Base`
 * `Radius/XL`16, 타이틀 `Display/Display_S`(28/600) + `Brand/Primary` → `text-display-s
 * text-primary`, 체크 아이콘은 28px 전용 컷 `check-brand`. 헤더 아래 여백 40px(`pt-10`),
 * 블록 간격 `Gap/XXXL`32 → `gap-8`, 카드 간격 `Gap/M`16 → `gap-4`.
 */
const NOTICE_ITEMS = [
  '• [주문완료], [배송준비중] 상태일 경우에만 주문내역 상세페이지에서 주문 취소가 가능합니다.',
  '• 엘리베이터 이용이 어려운 경우 6층 이상부터는 공동 현관 앞 또는 경비실로 대응 배송 될 수 있습니다.',
  '• 주문 / 배송 및 기타 문의가 있을 경우, 1:1 문의에 남겨주시면 신속히 해결해드리겠습니다.',
] as const;

export function OrderCompleteView() {
  return (
    <div className="bg-surface-secondary flex min-h-0 flex-1 flex-col">
      {/* 닫기는 메인 홈으로(사용자 확정) — 뒤로가기로 두면 결제창/주문서로 되돌아간다. */}
      <SectionHeader leading="close" leadingHref="/" title="주문 완료" />

      {/* 하단 여백은 Figma 에 없다(스크롤 끝). BottomNav 도 없어 바닥에 붙어 보이므로
          상단(40px)과 같은 값을 준다. */}
      <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-4 pt-10 pb-10">
        <h2 className="flex items-center justify-center gap-2">
          <Icon name="check-brand" size={28} aria-hidden />
          <span className="text-display-s text-primary">주문을 완료했어요</span>
        </h2>

        <div className="flex flex-col gap-4">
          <div className="bg-surface flex items-center justify-between rounded-xl px-4 py-3">
            <p className="text-heading-5 text-fg-tertiary">주문번호 {MOCK_ORDER_NUMBER}</p>
            {/* 복사 동작은 보류(사용자 지정) — 시각만. Button `s` 는 높이가 콘텐츠로 결정돼
                Figma 고정 38×52 와 달라 실측값으로 덮어쓴다. */}
            <Button size="s" variant="outlineBlack" className="h-[38px] w-13">
              복사
            </Button>
          </div>

          <div className="bg-surface flex items-start justify-between rounded-xl px-4 py-6">
            <p className="text-heading-0 text-fg">주문 금액</p>
            <p className="text-fg">
              <span className="text-heading-0">{MOCK_ORDER_TOTAL.toLocaleString('ko-KR')} </span>
              <span className="text-heading-5">원</span>
            </p>
          </div>

          <OrderRecommendCarousel items={MOCK_ORDER_RECOMMEND} />

          <InfoBox tone="dark" title="안내사항">
            {NOTICE_ITEMS.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </InfoBox>
        </div>
      </div>
    </div>
  );
}

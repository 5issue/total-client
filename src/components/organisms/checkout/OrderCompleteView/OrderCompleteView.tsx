'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { InfoBox } from '@/components/atoms/InfoBox';
import { Toast } from '@/components/atoms/Toast';
import { OrderRecommendCarousel } from '@/components/organisms/checkout/OrderRecommendCarousel';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useCopyToast } from '@/hooks/useCopyToast';

import { MOCK_ORDER_NUMBER, MOCK_ORDER_RECOMMEND, MOCK_ORDER_TOTAL } from './mock';

/**
 * 주문 완료 화면 (organism) — Figma node 666-26284(기본), 666-26336(하단 CTA 바 포함),
 * 1315-107613(복사 토스트).
 *
 * 결제 후 도착하는 종착 화면. 주문번호 복사 + 토스트 때문에 상태가 필요해 클라 경계다
 * (`CheckoutView` 와 같은 화면 단위 organism 패턴). 복사→토스트 로직은 `useCopyToast` —
 * 같은 패턴이 필요한 `OrderDetailView` 와 공유한다.
 *
 * 이번 작업 범위는 **퍼블리싱만**이다(사용자 확정, 2026-09-15). 결제 연동(토스페이먼츠)은
 * 별도 진행하고, 지금은 체크아웃의 "결제하기"가 이 경로로 넘어오는 더미 흐름만 있다.
 * 주문번호·금액·추천 상품은 전부 `mock.ts` 스텁이다.
 *
 * 하단 CTA: "주문 상세보기" → `/mypage/orders/{주문번호}` (#94), "쇼핑 계속하기" → `/search`
 * (피드백 반영, 2026-09-15 — 기존 `/` 에서 변경).
 * 추천 상품 "담기" / "전체보기" 는 무동작(`OrderRecommendCarousel` 주석 참고).
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
  const router = useRouter();
  const { visible: copyToastVisible, copy: copyOrderNumber } = useCopyToast();

  return (
    <div className="bg-surface-secondary flex flex-1 flex-col">
      {/* 닫기는 메인 홈으로(사용자 확정) — 뒤로가기로 두면 결제창/주문서로 되돌아간다. */}
      <SectionHeader leading="close" leadingHref="/" title="주문 완료" />

      <div className="flex flex-1 flex-col gap-8 px-4 pt-10 pb-10">
        <h2 className="flex items-center justify-center gap-2">
          <Icon name="check-brand" size={28} aria-hidden />
          <span className="text-display-s text-primary">주문을 완료했어요</span>
        </h2>

        <div className="flex flex-col gap-4">
          <div className="bg-surface flex items-center justify-between rounded-xl px-4 py-3">
            <p className="text-heading-5 text-fg-tertiary">주문번호 {MOCK_ORDER_NUMBER}</p>
            {/* Button `s` 는 높이가 콘텐츠로 결정돼 Figma 고정 38×52 와 달라 실측값으로 덮어쓴다. */}
            <Button
              size="s"
              variant="outlineBlack"
              className="h-[38px] w-13"
              onClick={() => copyOrderNumber(MOCK_ORDER_NUMBER)}
            >
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

      {/* 하단 CTA 바(node 666-26336 `HorizontalCtaBar`). `px-4 pt-3 pb-11` + 버튼 h-14 =
          Figma 실측 112px — 체크아웃·배송 상세와 같은 기존 패턴이다.
          토스트(node 1315-107772 `ActionToast`)는 이 바 바로 위에 띄운다: 토스트가 정의된
          노드(1315-107613)엔 CTA 바가 없어 Figma 좌표(y=766)를 그대로 쓰면 바와 겹친다.
          `sticky bottom-0` 은 장바구니 `CartOrderBar` 와 같은 방식이다 — 이 셸은
          `min-h-dvh`(확정 높이가 아님)라 안쪽 `overflow-y-auto` 로는 바가 고정되지 않고
          문서 아래로 밀려난다(실측 확인). */}
      <div className="bg-surface sticky bottom-0 px-4 pt-3 pb-11">
        {/* 항상 마운트해두고 opacity/translate 만 토글한다 — 조건부 렌더링으로 트랜지션을
            걸면 사라질 때 안 걸린다(`OrderDetailView` 하단 토스트와 같은 원칙).
            Tailwind v4 의 `translate-y-*` 는 `transform` 이 아니라 별도 `translate`
            속성이라 트랜지션 목록에 `translate` 를 명시해야 이동도 같이 걸린다. */}
        <div
          aria-hidden={!copyToastVisible}
          className={[
            'pointer-events-none absolute inset-x-4 bottom-full mb-3',
            'transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none',
            copyToastVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
          ].join(' ')}
        >
          <Toast variant="action">주문 번호를 복사했어요</Toast>
        </div>

        <div className="flex gap-2">
          <Button
            variant="tertiary"
            size="l"
            className="h-14 flex-1"
            onClick={() => router.push(`/mypage/orders/${MOCK_ORDER_NUMBER}`)}
          >
            주문 상세보기
          </Button>
          <Button
            variant="primary"
            size="l"
            className="h-14 flex-1"
            onClick={() => router.push('/search')}
          >
            쇼핑 계속하기
          </Button>
        </div>
      </div>
    </div>
  );
}

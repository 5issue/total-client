import Image from 'next/image';

import { Card } from '@/components/atoms/Card';

import { MOCK_CURATOR_CARDS } from './mock';

/**
 * Curator Section(node 910-110912) — "큐레이터 활동으로 수익 만들기" 3카드.
 * `atoms/Card`(`variant="surface"`)가 이 화면 카드에서 정의된 컴포넌트라 그대로 재사용.
 * 아이콘은 원(36px)으로 `iconSrc` 글리프(34px)를 감싼다 — 배경은 `bg-surface`가 아니라
 * `bg-bg`(Bg/default): 다크모드에서 카드보다 한 톤 어둡게 "파여 보이는" 원이 맞다
 * (마이컬리 다크 node 1691-205422 실측, 라이트에선 둘 다 흰색이라 시각 차이 없음).
 *
 * 글리프는 홈 화면용 `event-*.webp`(자체 컬러 원 배경 베이크드)를 재사용했었으나, 원
 * 안에 원이 겹쳐 보이는 버그였다 — Figma sprite(node 1691-205457/58/59)에서 직접 크롭한
 * 투명 배경 PNG로 교체했다(2026-09-18, 스크린샷 피드백). 라이트/다크 두 인스턴스의 sprite
 * 가 md5 동일해 자산은 테마 공용, 원 배경만 `bg-bg`로 테마에 따라 바뀐다.
 *
 * 카드 3개가 402px 프레임에 원래도 다 안 들어가는 디자인이라(원본도 세 번째 카드가
 * 잘려 보임), `QuickMenuSection`과 같은 가로 스크롤로 잘리지 않게 처리했다.
 */
export function CuratorSection() {
  return (
    <section className="flex flex-col gap-3 p-4">
      <h2 className="text-label-m text-fg">큐레이터 활동으로 수익 만들기</h2>
      <div className="scrollbar-hide flex items-center gap-3 overflow-x-auto">
        {MOCK_CURATOR_CARDS.map((card) => (
          <Card
            key={card.id}
            className="shrink-0"
            title={<span className="whitespace-nowrap">{card.title}</span>}
            subtitle={<span className="whitespace-nowrap">{card.subtitle}</span>}
            icon={
              <span className="bg-bg flex size-9 items-center justify-center rounded-full">
                <Image src={card.iconSrc} alt="" width={34} height={34} />
              </span>
            }
          />
        ))}
      </div>
    </section>
  );
}

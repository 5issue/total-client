import Image from 'next/image';

import { Card } from '@/components/atoms/Card';

import { MOCK_CURATOR_CARDS } from './mock';

/**
 * Curator Section(node 910-110912) — "큐레이터 활동으로 수익 만들기" 3카드.
 * `atoms/Card`(`variant="surface"`)가 이 화면 카드에서 정의된 컴포넌트라 그대로 재사용.
 * 아이콘은 흰 원(36px)으로 `event-*.webp` 글리프를 감싼다.
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
              <span className="bg-surface flex size-9 items-center justify-center rounded-full">
                <Image src={`/graphic-icons/${card.graphic}.webp`} alt="" width={24} height={24} />
              </span>
            }
          />
        ))}
      </div>
    </section>
  );
}

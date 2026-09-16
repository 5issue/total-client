import Image from 'next/image';

import { Card } from '@/components/atoms/Card';

import { MOCK_CURATOR_CARDS } from './mock';

/**
 * Curator Section(node 910-110912) — "큐레이터 활동으로 수익 만들기" 3카드.
 *
 * 카드 레이아웃은 `atoms/Card`(`variant="surface"`)와 실측이 1:1(Card 자체가 이 화면의
 * "컬리 큐레이터" 카드에서 정의됨) — title `text-label-l`, subtitle 기본색 `text-fg`
 * (검정, Card 문서 참고). 아이콘은 Figma 가 흰 원(36px) 안에 이벤트 그래픽을 넣은 형태라,
 * `public/graphic-icons/event-*.webp`(글리프만 있고 원 배경은 없음)를 흰 원으로 직접
 * 감싼다 — Figma 실측 좌표(퍼센트 크롭)를 그대로 베끼지 않고 기존 아이콘 세트를 재사용.
 *
 * Figma 는 카드 3개를 `shrink-0`(내용 폭 고정)으로 두는데, 실측 그대로면 402px 프레임
 * 안에 3개가 다 안 들어간다(원본 스크린샷도 세 번째 카드 텍스트가 화면 끝에서 잘려
 * 보인다) — 잘린 채로 두는 대신 `QuickMenuSection`과 같은 가로 스크롤 패턴을 적용해
 * 내용이 잘리지 않게 한다(이 앱에 이미 있는 오버플로 처리 관용구).
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

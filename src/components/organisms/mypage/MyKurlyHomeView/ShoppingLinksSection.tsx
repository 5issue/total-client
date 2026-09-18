import Image from 'next/image';

import { Card } from '@/components/atoms/Card';
import { Icon } from '@/components/atoms/Icon';

import { LinkSection } from './LinkSection';
import { MOCK_APP_VERSION, MOCK_LINK_SECTIONS } from './mock';

/**
 * Shopping Section(node 910-110918) — 구독 프로모션 배너 + `LinkSection` 8묶음.
 * 앱 정보만 제목이 없고 "앱 버전" 카드가 앞에 끼어 `leadingCard`로 처리한다
 * (mock.ts 의 `title` 미지정 섹션). 마지막(계정) 섹션은 하단 구분선 없음.
 */
export function ShoppingLinksSection() {
  const lastIndex = MOCK_LINK_SECTIONS.length - 1;

  return (
    <div className="flex flex-col items-start px-4">
      <div className="w-full py-2">
        <SubscriptionBannerCard />
      </div>
      {MOCK_LINK_SECTIONS.map((section, index) => (
        <LinkSection
          key={section.title ?? 'app-info'}
          section={section}
          divider={index !== lastIndex}
          leadingCard={section.title ? undefined : <AppVersionCard />}
          className="w-full"
        />
      ))}
    </div>
  );
}

/**
 * BannerCard(node 1233-113360) — "2개월 내내 구독료 100원!" 구독 유도 배너.
 * 배경 `--color-sky`(Figma Semantic/Banner) 위에 "100원" 일러스트. 원본은 카드보다
 * 훨씬 큰 소스를 퍼센트 크롭한 것이라, 그 좌표 대신 오른쪽 절반에 `object-cover`로
 * 채워 같은 인상만 유지한다. 목적지 화면이 없어 `Link`로 감싸지 않는다.
 *
 * 텍스트·아이콘은 `text-fg`(시맨틱, 다크에서 흰색) 대신 `text-black`(고정) — 배경이
 * `--color-sky` 하늘색으로 테마 무관하게 항상 밝아서, 다크모드에도 글자는 계속 검정이어야
 * 한다(node 1691-205422 실측: `Static/Black` 바인딩, `Text/Primary` 아님).
 */
function SubscriptionBannerCard() {
  return (
    <div className="bg-sky rounded-m relative flex h-15.25 w-full items-center overflow-hidden px-4">
      <div className="absolute inset-y-0 right-0 w-1/2">
        <Image
          src="/banners/subscription-100won.png"
          alt=""
          fill
          sizes="200px"
          className="object-cover"
        />
      </div>
      <div className="relative flex flex-col gap-1 text-black">
        <p className="text-heading-4">2개월 내내 구독료 100원!</p>
        <div className="flex items-center gap-1">
          <p className="text-label-m">지금이 기회! 멤버스 구독하기</p>
          <Icon name="arrow-right" size={20} aria-hidden />
        </div>
      </div>
    </div>
  );
}

/** Menu_Card_Text(node 698-62950) — 앱 버전 표시. 내비게이션 없는 순수 정보 카드. */
function AppVersionCard() {
  return (
    <Card
      variant="plain"
      title={
        <span className="inline-flex items-center gap-1">
          앱 버전 <span className="text-fg-tertiary">{MOCK_APP_VERSION.version}</span>
        </span>
      }
      subtitle={<span className="text-body-m text-fg-tertiary">{MOCK_APP_VERSION.label}</span>}
      className="w-full"
    />
  );
}

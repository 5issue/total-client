import Image from 'next/image';

/**
 * 이벤트/포인트 미션 완료 알림 카드 (molecule). Figma "5팀 디자인 시스템"
 * `MissionCompleteCard`(node 1233:113146) — 화면 상단에 뜨는 토스트로 쓰인다
 * (배치·등장/퇴장 애니메이션은 이 molecule의 책임이 아니다, `BottomSheet`/`Toast`와
 * 같은 원칙 — 쓰는 쪽 organism이 위치를 잡는다).
 *
 * 포인트 숫자는 그라데이션 텍스트(`bg-mission-reward-gradient` + `bg-clip-text
 * text-transparent`, tokens/color.css) — Figma 변수 미바인딩이라 컴포넌트 노드에서
 * 직접 실측한 값. 다이아몬드 아이콘은 Figma에 벡터 데이터가 없는 raster 전용 에셋이라
 * `public/graphic-icons/diamond.webp`로 받아 `next/image`로 그린다(Toast 의 `toast-card`
 * 아이콘과 같은 패턴).
 *
 * 우측 화살표는 목적지 화면이 아직 없어(미션/리워드 페이지 미확정) 장식용으로만
 * 렌더한다(SectionHeader의 `pending` 아이콘과 같은 원칙) — 실제 이동은 그 화면이
 * 생기면 `onClick`/`href`로 배선.
 */
export type MissionCompleteCardProps = {
  /** 포인트 표기(예: "100P"). */
  pointsLabel: string;
  description: string;
  className?: string;
};

export function MissionCompleteCard({
  pointsLabel,
  description,
  className,
}: MissionCompleteCardProps) {
  return (
    <div
      className={[
        'bg-surface flex h-15 w-full flex-col justify-center rounded-xl py-2 pr-1 pl-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/graphic-icons/diamond.webp" alt="" width={28} height={28} />
          <div className="flex flex-col">
            <p className="text-body-m text-fg flex items-center gap-1">
              미션 완료 !
              <span className="bg-mission-reward-gradient bg-clip-text font-bold text-transparent">
                {pointsLabel}
              </span>
              받기
            </p>
            <p className="text-caption-m text-fg-secondary">{description}</p>
          </div>
        </div>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
          <path
            d="M12.8 22.4L19.2 16.1459L13.0214 9.6"
            stroke="#8AA1AB"
            strokeWidth="2.4"
            strokeLinecap="square"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

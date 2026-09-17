import { Icon } from '@/components/atoms/Icon';

/**
 * 알약형 안내 배너 — 손가락 터치 아이콘 + 문구 (molecule). Figma "5팀 UI 공유용"
 * `InstructionBanner`(node 1233:114174). 상품 상세 콘텐츠에서 반복 사용된다.
 */
export type InstructionBannerProps = {
  text: string;
  className?: string;
};

export function InstructionBanner({ text, className }: InstructionBannerProps) {
  return (
    // px-5(20px, Figma node 848:74853 실측 — margin/default 16px 아님) 인셋 wrapper +
    // 안쪽 w-full. mx-5 단독이면 부모가 items-start 라 콘텐츠 크기로 쪼그라든다.
    <div className="w-full px-5">
      <div
        className={[
          'bg-surface-secondary flex h-11.75 w-full items-center justify-center gap-3 rounded-full px-4',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <p className="text-caption-m text-fg whitespace-nowrap">{text}</p>
        <Icon name="touch" size={40} aria-hidden />
      </div>
    </div>
  );
}

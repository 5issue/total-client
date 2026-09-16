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
    <div
      className={[
        // mx-5(20px): Figma 실측(node 665:43698, x=20/width=362/container 402)이 여백
        // margin/default(16px) 가 아니라 20px 다 — 이 배너만의 예외.
        'bg-surface-secondary mx-5 flex h-11.75 items-center justify-center gap-3 rounded-full px-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="text-caption-m text-fg whitespace-nowrap">{text}</p>
      <Icon name="touch" size={40} aria-hidden />
    </div>
  );
}

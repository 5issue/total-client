'use client';

import Image from 'next/image';

/**
 * AI 레시피 채팅의 조리 단계 카드 (Figma "Step_Instruction_Card", node 3215-3211).
 * 이미지 + 번호 배지 + 설명. `--radius-xxl`(18px, globals.css)은 이 노드에서 확인해
 * 새로 추가한 토큰이다(get_variable_defs: Radius/XXL).
 */
export type StepInstructionCardProps = {
  step: number;
  imageSrc: string;
  imageAlt: string;
  instruction: string;
  className?: string;
};

export function StepInstructionCard({
  step,
  imageSrc,
  imageAlt,
  instruction,
  className,
}: StepInstructionCardProps) {
  return (
    <div
      className={['bg-surface-secondary rounded-xxl flex flex-col gap-3 p-3', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="rounded-m relative h-[247px] w-full overflow-hidden">
        <Image src={imageSrc} alt={imageAlt} fill sizes="339px" className="object-cover" />
      </div>
      <div className="flex items-start gap-2">
        <span className="text-caption-s text-fg-inverse flex size-5 shrink-0 items-center justify-center rounded-full bg-neutral-950 font-bold">
          {step}
        </span>
        <p className="text-label-xs text-fg-secondary flex-1">{instruction}</p>
      </div>
    </div>
  );
}

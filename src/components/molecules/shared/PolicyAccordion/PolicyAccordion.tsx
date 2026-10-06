import type { ReactNode } from 'react';

import { Accordion } from '@/components/molecules/shared/Accordion';

/**
 * 정책/약관류 아코디언 — 가운데 정렬 보라색 헤더 + 회색 배경 본문 (molecule).
 * Figma "5팀 UI 공유용" `PolicyAccordion`(node 1233:118233/118234) — 공용
 * `Accordion` 셸을 그대로 쓰되 이 컴포넌트만의 헤더/패널 스타일을 입힌다.
 *
 * Figma 헤더는 [투명 스페이서 20px][가운데 텍스트][화살표 20px] 구조로 텍스트를 진짜
 * 가운데 정렬하지만, 공용 Accordion 헤더는 [텍스트][화살표 24px] 뿐이라 텍스트만
 * `text-center` 로 근사했다(화살표 폭만큼 약 10px 안쪽으로 치우침, 무시할 수준).
 */
export type PolicyAccordionProps = {
  title: string;
  children: ReactNode;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  className?: string;
};

export function PolicyAccordion({
  title,
  children,
  open,
  onToggle,
  className,
}: PolicyAccordionProps) {
  return (
    <Accordion
      open={open}
      onToggle={onToggle}
      animated
      header={<span className="text-label-m text-primary block text-center">{title}</span>}
      headerClassName="min-h-11 px-5"
      className={className}
    >
      {/* label-xs(14/400/-0.01em) — Figma Label_M 실측이 Regular 굵기 + 음수 자간이라
          project label 스케일 중 이 토큰만 두 값이 같이 맞는다. */}
      <div className="bg-surface-subtle text-label-xs text-fg-secondary flex flex-col items-center gap-6 px-4 py-8 text-center">
        {children}
      </div>
    </Accordion>
  );
}

import { Logo } from '@/components/atoms/Logo';

/**
 * AI 유통기한 안내 배너 (organism). Figma "5팀 UI 공유용" `RecommendedKeywordsContainer`
 * (node 1120-56175) — 그라데이션·로고까지 동일 컴포넌트 인스턴스지만, 그 컴포넌트는
 * `promptLabel`/`keywords` 가 항상 필수라 키워드 칩이 없는 이 화면에는 맞지 않는다
 * (`RecommendedKeywordsContainer.tsx` 자체 주석과 같은 "전용으로 둔다" 원칙). 그라데이션
 * 색만 그대로 재사용(`--color-blue`/`--color-brand-200`, get_variable_defs 확인).
 */
const GRADIENT_STYLE = {
  backgroundImage:
    'linear-gradient(127deg, color-mix(in srgb, var(--color-blue) 40%, transparent) 0%, color-mix(in srgb, var(--color-brand-200) 40%, transparent) 100%)',
};

export interface FridgeAiNoticeBannerProps {
  /** `\n` 으로 줄바꿈 지점을 명시한다 — Figma 가 `<p>` 두 개로 강제 개행한 제목을
   *  그대로 옮긴 것이라, 자연스러운 wrap 에 맡기면 컨테이너 폭에 따라 단어 중간이
   *  갈라진다("알려" / "드려요!"처럼). */
  title: string;
  description: string;
  className?: string;
}

export function FridgeAiNoticeBanner({ title, description, className }: FridgeAiNoticeBannerProps) {
  const titleLines = title.split('\n');

  return (
    <div
      className={['flex w-full flex-col gap-1 px-4 pt-5 pb-3', className].filter(Boolean).join(' ')}
      style={GRADIENT_STYLE}
    >
      {/* Figma(node 1120-56175) 는 로고와 제목 줄을 상단 정렬한다 — `items-center` 로
          두면 2줄로 접히는 제목이 로고 옆 세로 중앙에 붙어 위치가 어긋난다. */}
      <div className="flex items-start gap-1">
        <Logo name="chat-kurly-2" height={32} aria-hidden />
        <p className="text-heading-1 text-fg flex-1">
          {titleLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </p>
      </div>
      <p className="text-label-m text-fg">{description}</p>
    </div>
  );
}

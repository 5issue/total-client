export default function HomePage() {
  return (
    <section className="px-4 py-16">
      <h1 className="text-display-xs text-fg">total-client</h1>
      <p className="text-body-s text-fg-tertiary mt-2">
        환경·구조 세팅 스켈레톤입니다. 실제 화면 구현은 다음 단계입니다.
      </p>
      <div className="rounded-m border-border bg-surface-secondary mt-6 border p-4">
        <p className="text-body-s text-fg-secondary">
          디자인 토큰은 5팀 디자인 시스템(Figma)에서 추출했습니다. 색은
          <code> text-fg</code>, <code>bg-surface-secondary</code>,<code> border-border</code>,
          타이포는 <code>text-display-xs</code>,<code> text-body-s</code> 처럼 사용합니다.
        </p>
        <p className="text-numeric-l font-numeric text-primary mt-3">7,560원</p>
      </div>
    </section>
  );
}

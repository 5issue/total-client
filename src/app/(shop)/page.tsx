export default function HomePage() {
  return (
    <section className="px-4 py-16">
      <h1 className="text-2xl font-semibold text-brand">total-client</h1>
      <p className="mt-2 text-sm text-foreground-muted">
        환경·구조 세팅 스켈레톤입니다. 실제 화면 구현은 다음 단계입니다.
      </p>
      <div className="mt-6 rounded-card border border-border bg-surface-muted p-4">
        <p className="text-sm text-foreground">
          이 박스는 시맨틱 토큰(<code>bg-surface-muted</code>,{" "}
          <code>border-border</code>, <code>text-foreground</code>)으로 렌더되며
          OS 다크 모드 설정 또는 <code>&lt;html data-theme=&quot;dark&quot;&gt;</code>
          에 따라 자동 전환됩니다.
        </p>
        <p className="mt-2 text-sm dark:hidden">현재: 라이트</p>
        <p className="mt-2 hidden text-sm dark:block">현재: 다크</p>
      </div>
    </section>
  );
}

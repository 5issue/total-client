export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-brand">total-client</h1>
      <p className="mt-2 text-sm text-zinc-500">
        환경·구조 세팅 스켈레톤입니다. 실제 화면 구현은 다음 단계입니다.
      </p>
      <div className="mt-6 rounded-card border border-border bg-surface-muted p-4">
        <p className="text-sm">
          이 박스는 <code>@theme</code> 토큰(<code>--color-border</code>,
          <code> --color-surface-muted</code>, <code>--radius-card</code>)이
          정식 유틸리티로 생성되는지 확인하는 용도입니다.
        </p>
      </div>
    </main>
  );
}

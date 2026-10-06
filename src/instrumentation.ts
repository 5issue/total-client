/**
 * Node 런타임에서만, `API_MOCKING=enabled` 일 때만 MSW 목 서버를 등록한다.
 * Spring 백엔드가 아직 배포 전인 구간(소셜 로그인 등)을 로컬에서 검증하기 위한 임시 대응 —
 * 이 env 는 `.env.example` 에 빈 값으로만 안내돼 있어 스테이징/프로덕션은 항상 꺼져 있다.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.API_MOCKING === 'enabled') {
    const { server } = await import('./mocks/server');
    server.listen({ onUnhandledRequest: 'bypass' });
  }
}

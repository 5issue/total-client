import localFont from 'next/font/local';

/**
 * Pretendard Variable 자체 호스팅.
 *
 * Google Fonts 에 없는 폰트라 `next/font/google` 을 못 쓴다 — 대신 `pretendard` npm
 * 패키지(공식 배포)의 정적 파일을 `next/font/local` 로 직접 로드한다. 이러면 외부 CDN
 * 요청 없이 Next 가 알아서 프리로드·서브셋·`font-display: swap` 을 처리해준다.
 *
 * `variable` 이름은 일부러 `--font-sans` 가 아니라 `--font-pretendard` 로 따로 뒀다 —
 * `--font-sans` 는 이미 `typography.css` 의 `@theme` 에서 폴백 스택 전체(시스템 폰트 포함)를
 * 정의하고 있어서, 그 값 맨 앞에 `var(--font-pretendard)` 를 끼워 넣는 방식이 두 선언이
 * 서로를 덮어쓰는 특이도(specificity) 문제 없이 안전하다.
 *
 * `weight: '45 920'` 은 Pretendard Variable 실제 가변축 범위(패키지 자체 CSS 실측) 그대로.
 */
export const pretendard = localFont({
  src: '../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
  weight: '45 920',
});

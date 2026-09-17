import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';

/**
 * `(chrome)` 그룹 공통 로딩 폴백 — Figma 665-60086. 짧은 데이터 요청·화면 전환
 * 대기(3초 이내) 동안 표시된다. `loading.tsx` 는 같은 세그먼트의 `page.tsx` 만
 * Suspense fallback 으로 감싸므로 부모 `(chrome)/layout.tsx` 의 BottomNav 는 그대로
 * 유지되어 조작 가능하다(안내 문구·CTA 없음, structure-convention §1).
 */
export default function Loading() {
  return <LoadingIndicator className="flex-1" />;
}

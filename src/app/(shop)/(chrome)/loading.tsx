import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';

/**
 * `(chrome)` 공통 로딩 폴백 — Figma 665-60086. `page.tsx`만 Suspense fallback으로
 * 감싸므로 부모 레이아웃의 BottomNav는 그대로 유지된다.
 */
export default function Loading() {
  return <LoadingIndicator className="h-full" />;
}

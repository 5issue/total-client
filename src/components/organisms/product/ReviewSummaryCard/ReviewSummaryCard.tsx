import { StatusLabel } from '@/components/molecules/shared/StatusLabel';

/**
 * 후기 탭 상단 안내 카드 (organism). Figma "5팀 UI 공유용" `ReviewSummaryCard`
 * (node 665:43686) — "공지" 뱃지 + 운영 안내 문구 + 사진 후기 4장 스트립(마지막 칸에
 * "+ 더보기" 오버레이).
 *
 * "공지" 뱃지는 `StatusLabel type="notice"` 재사용(배경/타이포 1:1). 사진 4장은
 * 백엔드 연동 전까지 회색 박스, "+ 더보기"는 이동 대상이 없어 클릭 핸들러 없이
 * 시각만 둔다.
 *
 * 사진은 `flex-1 aspect-square` + `gap-1` 로 배치한다 — Figma 는 고정 90px 4장을
 * 370px(402px 캔버스 기준) 컨테이너에 `justify-between` 으로 둬서 간격이 딱 그
 * 캔버스 폭에서만 생기는데, 실기기 뷰포트(대부분 <402px)에선 남는 폭이 없어
 * 사라진다. flex-1 이면 뷰포트 폭과 무관하게 간격이 항상 보인다.
 */
const PHOTO_COUNT = 4;

export function ReviewSummaryCard({ className }: { className?: string }) {
  return (
    <div
      className={['bg-surface flex w-full flex-col gap-5 px-4 py-5', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center gap-2">
        <StatusLabel type="notice">공지</StatusLabel>
        <p className="text-body-m text-fg">상품후기 운영 안내</p>
      </div>

      <div className="flex w-full flex-col gap-2">
        <p className="text-body-m text-fg">사진 후기</p>
        <div className="rounded-m flex w-full items-center gap-1 overflow-hidden">
          {Array.from({ length: PHOTO_COUNT }, (_, i) => {
            const isLast = i === PHOTO_COUNT - 1;
            return (
              <div
                key={i}
                aria-hidden
                className="bg-surface-secondary relative aspect-square flex-1"
              >
                {isLast ? (
                  <>
                    <div className="bg-overlay absolute inset-0" />
                    <span className="text-label-m text-fg-inverse absolute inset-0 flex items-center justify-center text-center">
                      + 더보기
                    </span>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { StatusLabel } from '@/components/molecules/shared/StatusLabel';

/**
 * 후기 탭 상단 안내 카드 (organism). Figma "5팀 UI 공유용" `ReviewSummaryCard`
 * (node 665:43686) — "공지" 뱃지 + 운영 안내 문구 + 사진 후기 4장 스트립(마지막 칸에
 * "+ 더보기" 오버레이).
 *
 * "공지" 뱃지는 `molecules/shared/StatusLabel type="notice"` 가 이미 이 Figma 컴포넌트와
 * 1:1(배경 overlay_blue, caption-s bold)이라 그대로 재사용.
 *
 * 사진 4장은 실제 후기 사진 백엔드 연동 전까지 회색 박스(다른 이미지 슬롯과 동일
 * 관례). "+ 더보기" 는 이동 대상이 Figma에 없어 클릭 핸들러 없이 시각만 그대로 둔다
 * (임의로 갤러리 모달 등을 지어내지 않는다).
 *
 * Figma 는 고정 90px 정사각형 4장을 370px(=Figma 캔버스 402px 기준) 컨테이너에
 * `justify-between` 으로 배치해 남는 폭만큼만 사이 간격("Auto")이 생기는데, 이건
 * 정확히 402px 폭에서만 ~3px 간격이 나오는 우연의 결과다 — 실기기 뷰포트는 402px가
 * 아니라(대부분 더 좁음) 남는 폭이 거의 없어 간격이 사라져 보였다(실기기 QA 발견).
 * `flex-1 aspect-square` + 실제 `gap-1` 로 바꿔 뷰포트 폭과 무관하게 간격이 항상
 * 보이도록 했다 — 402px 에서 계산해도 한 장당 ~89.5px 로 원래 90px과 시각적으로
 * 동일하다.
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

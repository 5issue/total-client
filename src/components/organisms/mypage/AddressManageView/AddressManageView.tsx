'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';

/**
 * 배송지 관리 화면 컨테이너 (organism). Figma "5팀 UI 공유용" — node 359-15270 외 상태 노드.
 *
 * 장바구니 상단 `CartDeliveryAddress` 의 "추가"/"변경" 진입점. **퍼블리싱 단계** — 배송지가
 * 없는 빈 상태만 구현한다. 목록·기본배송지·CRUD·"새 배송지 추가" 폼·장바구니 복귀(선택 주소
 * 적용)는 데이터 연결과 함께 다음 단계(#70 머지 후).
 *
 * 구성: `SectionHeader`(뒤로 + "배송지 관리") + 중앙 `ErrorState`(안내만, 액션 버튼 없음) +
 * 하단 sticky CTA_Horizontal(흰 바 `pt-3 pb-11 px-4`, 아웃라인 풀폭 버튼 `h-14`).
 * 여백은 Figma `CTA_Horizontal`(node 359-15285) 실측 — 장바구니 `CartOrderBar` 와 동일 규격.
 */
export function AddressManageView() {
  const router = useRouter();

  return (
    <>
      <SectionHeader leading="back" onLeadingClick={() => router.back()} title="배송지 관리" />

      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <ErrorState
          icon={<Icon name="alert" size={56} aria-hidden />}
          title="배송지를 추가해주세요"
        />
      </div>

      <div className="bg-surface border-border sticky bottom-0 flex flex-col border-t px-4 pt-3 pb-11">
        <Button
          variant="outlineBlack"
          size="l"
          className="h-14 w-full"
          onClick={() => {
            // TODO(#72): 새 배송지 추가 폼으로 이동 (다음 상태 노드)
          }}
        >
          새 배송지 추가
        </Button>
      </div>
    </>
  );
}

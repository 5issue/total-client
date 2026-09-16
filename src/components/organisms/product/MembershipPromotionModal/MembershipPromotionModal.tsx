'use client';

import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/molecules/shared/Modal';

/**
 * 멤버십 전용 상품 클릭 시 뜨는 가입/혜택 안내 모달 (organism). Figma "5팀 UI 공유용"
 * `Promotion_Modal`(node 1233:116050) — 상품 상세뿐 아니라 목록 등에서도 멤버스 전용
 * 상품 클릭 시 재사용 가능하도록 도메인 중립적으로 뒀다.
 *
 * `molecules/shared/Modal` 을 그대로 쓰되, 이 모달만의 실측값이 기존 기본값(다른
 * 소비자 — CartView 삭제 확인 모달 — 가 쓰는 값)과 여러 군데 달라 override prop 으로
 * 갈아끼웠다: 폭 353px(`max-w-88`), 상단 패딩 20px(`pt-5`, 기본은 32px),
 * radius Radius/L=12px(`rounded-lg` — 기본 `rounded-xl`=16px는 Figma "Radius/XL"에
 * 해당해 이 모달과 안 맞는다), 본문↔footer 간격 28px(`gap-7`), 제목 Heading/H1_SemiBold
 * (`text-heading-1`, 기본은 H2_Medium), 설명 Bold+letter-spacing(`font-bold
 * tracking-wide`, 기본은 Regular) + 두 줄 hard break(Figma 원본이 줄바꿈 위치 고정),
 * 버튼 사이 16px(`gap-4`, 기본 8px).
 */
export type MembershipPromotionModalProps = {
  open: boolean;
  onClose: () => void;
  /** "컬리멤버스 혜택받기" 클릭 — 멤버십 가입 플로우가 아직 없어 기본은 시트 닫기만. */
  onSubscribe?: () => void;
};

export function MembershipPromotionModal({
  open,
  onClose,
  onSubscribe,
}: MembershipPromotionModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="컬리멤버스 전용상품"
      cardClassName="flex w-full max-w-88 flex-col gap-7 rounded-lg px-4 pt-5 pb-4"
      titleClassName="text-heading-1 text-fg"
      contentGapClassName="gap-4"
      footerGapClassName="gap-4"
      footerLayout="column"
      footer={
        <>
          <Button variant="primary" size="l" onClick={onSubscribe} className="h-11.5 w-full">
            컬리멤버스 혜택받기
          </Button>
          <Button variant="outlineBlack" size="l" onClick={onClose} className="h-11.5 w-full">
            취소
          </Button>
        </>
      }
    >
      <p className="text-body-m text-fg-secondary font-bold tracking-wide">
        컬리멤버스 회원만을 위한 특별한 상품과 다양한
        <br />
        혜택을 놓치지마세요.
      </p>
    </Modal>
  );
}

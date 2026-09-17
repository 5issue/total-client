'use client';

import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/molecules/shared/Modal';

/**
 * 최근 본 레시피 선택 삭제 확인 모달(node 666-32042). `MyFridgeView/
 * FridgeDeleteConfirmModal`과 동일 패턴 — #112(나의 냉장고)가 아직 리뷰 중이라
 * 그 컴포넌트를 공용으로 승격하지 않고 레시피 쪽에 같은 모양으로 새로 뒀다.
 *
 * Figma 원문은 "레시피을 삭제하시겠어요?"(조사 오류)라 "레시피를"로 고쳐 썼다.
 */
export interface RecipeDeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function RecipeDeleteConfirmModal({
  open,
  onClose,
  onConfirm,
}: RecipeDeleteConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="레시피를 삭제하시겠어요?"
      description="레시피를 삭제하면 MY 레시피에서 볼 수 없어요."
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            닫기
          </Button>
          <Button variant="black" onClick={onConfirm}>
            삭제
          </Button>
        </>
      }
    />
  );
}

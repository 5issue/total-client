'use client';

import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/molecules/shared/Modal';

/**
 * 선택 삭제 확인 모달 (organism). `FridgeDeleteConfirmModal`과 동일 패턴
 * (`Modal` 공용 molecule, node 666-31652 계열).
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
      title="최근 본 레시피에서 삭제하시겠어요?"
      description="삭제하면 최근 본 레시피 목록에서 볼 수 없어요."
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

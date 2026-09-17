'use client';

import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/molecules/shared/Modal';

/**
 * 선택 삭제 확인 모달 (organism). Figma "5팀 UI 공유용" `Modal`(node 666-31652).
 */
export interface FridgeDeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function FridgeDeleteConfirmModal({
  open,
  onClose,
  onConfirm,
}: FridgeDeleteConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="상품을 삭제하시겠어요?"
      description="상품을 삭제하면 MY 냉장고에서 볼 수 없어요."
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

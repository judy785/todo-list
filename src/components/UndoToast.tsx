import React from 'react';
import { DeletedTodoRestoreTarget } from '../types/todo';

interface UndoToastProps {
  undoTarget: DeletedTodoRestoreTarget | null;
  onUndo: () => void;
  onDismiss: () => void;
}

export const UndoToast: React.FC<UndoToastProps> = ({
  undoTarget,
  onUndo,
  onDismiss,
}) => {
  if (!undoTarget) return null;

  return (
    <aside className="undo-toast" role="status" aria-live="polite">
      <span className="undo-toast-text">할 일을 삭제했어요.</span>
      <div className="undo-toast-actions">
        <button
          type="button"
          className="btn-undo"
          onClick={onUndo}
          aria-label="삭제한 할 일 복원하기"
        >
          실행 취소
        </button>
        <button
          type="button"
          className="btn-undo-close"
          onClick={onDismiss}
          aria-label="알림 닫기"
        >
          ✕
        </button>
      </div>
    </aside>
  );
};

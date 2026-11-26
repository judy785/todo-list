import React from 'react';
import { StorageSaveStatus } from '../types/todo';

interface SummaryFooterProps {
  activeCount: number;
  completedCount: number;
  saveStatus: StorageSaveStatus;
  onRequestClearCompleted: () => void;
  onRetrySave: () => void;
}

export const SummaryFooter: React.FC<SummaryFooterProps> = ({
  activeCount,
  completedCount,
  saveStatus,
  onRequestClearCompleted,
  onRetrySave,
}) => {
  return (
    <footer className="summary-footer">
      <div className="footer-top">
        <span className="remaining-count">남은 할 일 {activeCount}개</span>
        <button
          type="button"
          className="btn-destructive"
          disabled={completedCount === 0}
          onClick={onRequestClearCompleted}
          aria-label={`완료된 할 일 ${completedCount}개 일괄 삭제`}
        >
          완료 항목 삭제
        </button>
      </div>

      {saveStatus === 'error' ? (
        <div className="footer-notice error" role="alert">
          <span>변경 내용을 이 브라우저에 저장하지 못했어요. 창을 닫으면 사라질 수 있습니다.</span>
          <button type="button" className="btn-text-link" onClick={onRetrySave}>
            저장 다시 시도
          </button>
        </div>
      ) : (
        <p className="footer-notice">이 브라우저에 자동 저장됩니다.</p>
      )}
    </footer>
  );
};

import React, { useState, useRef } from 'react';
import { useTodos } from './hooks/useTodos';
import { Header } from './components/Header';
import { TodoInput } from './components/TodoInput';
import { FilterAndSearch } from './components/FilterAndSearch';
import { TodoList } from './components/TodoList';
import { SummaryFooter } from './components/SummaryFooter';
import { UndoToast } from './components/UndoToast';
import { ConfirmDialog } from './components/ConfirmDialog';
import './styles/global.css';
import './styles/components.css';

export const App: React.FC = () => {
  const {
    todos,
    filteredTodos,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    undoTarget,
    saveStatus,
    loadError,
    lastAddedHidden,
    setLastAddedHidden,
    stats,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    restoreDeletedTodo,
    dismissUndo,
    clearCompletedTodos,
    retrySave,
  } = useTodos();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const clearBtnRef = useRef<HTMLButtonElement | null>(null);

  const handleOpenConfirm = () => {
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
    // 닫힌 후 호출 버튼으로 복귀
    setTimeout(() => {
      clearBtnRef.current?.focus();
    }, 0);
  };

  const handleConfirmClear = () => {
    clearCompletedTodos();
    setIsConfirmOpen(false);
  };

  const handleFocusInput = () => {
    const input = document.getElementById('new-todo-input') as HTMLInputElement | null;
    input?.focus();
  };

  const handleResetFilter = () => {
    setFilter('all');
    setSearchQuery('');
    setLastAddedHidden(false);
  };

  return (
    <main className="app-card">
      {/* 데이터 로드 경고 배너 */}
      {loadError && (
        <div className="hidden-item-alert" style={{ borderLeft: '4px solid var(--color-danger)' }} role="alert">
          <span>{loadError}</span>
        </div>
      )}

      {/* 헤더 및 진행률 */}
      <Header
        totalCount={stats.totalCount}
        completedCount={stats.completedCount}
        completionRate={stats.completionRate}
      />

      {/* 할 일 입력 */}
      <TodoInput
        onAdd={addTodo}
        lastAddedHidden={lastAddedHidden}
        onShowAll={handleResetFilter}
      />

      {/* 필터 및 검색 */}
      <FilterAndSearch
        currentFilter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
        resultCount={filteredTodos.length}
      />

      {/* 할 일 목록 */}
      <TodoList
        todos={filteredTodos}
        totalCount={todos.length}
        currentFilter={filter}
        searchQuery={searchQuery}
        onToggle={toggleTodo}
        onEdit={editTodo}
        onDelete={deleteTodo}
        onClearSearch={() => setSearchQuery('')}
        onResetFilter={handleResetFilter}
        onFocusInput={handleFocusInput}
      />

      {/* 하단 요약 및 일괄 삭제 */}
      <SummaryFooter
        activeCount={stats.activeCount}
        completedCount={stats.completedCount}
        saveStatus={saveStatus}
        onRequestClearCompleted={handleOpenConfirm}
        onRetrySave={retrySave}
      />

      {/* 개별 삭제 실행 취소 토스트 */}
      <UndoToast
        undoTarget={undoTarget}
        onUndo={restoreDeletedTodo}
        onDismiss={dismissUndo}
      />

      {/* 완료 항목 일괄 삭제 모달 */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        count={stats.completedCount}
        onConfirm={handleConfirmClear}
        onCancel={handleCloseConfirm}
      />
    </main>
  );
};

export default App;

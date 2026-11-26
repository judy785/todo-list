import React from 'react';
import { TodoItem as TodoItemType, TodoFilter } from '../types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: TodoItemType[];
  totalCount: number;
  currentFilter: TodoFilter;
  searchQuery: string;
  onToggle: (id: string) => void;
  onEdit: (id: string, newText: string) => boolean;
  onDelete: (id: string) => void;
  onClearSearch: () => void;
  onResetFilter: () => void;
  onFocusInput: () => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  totalCount,
  currentFilter,
  searchQuery,
  onToggle,
  onEdit,
  onDelete,
  onClearSearch,
  onResetFilter,
  onFocusInput,
}) => {
  // 빈 목록 상태 렌더링
  if (todos.length === 0) {
    if (totalCount === 0) {
      return (
        <div className="empty-state">
          <p className="empty-state-title">아직 할 일이 없어요</p>
          <p className="empty-state-desc">첫 할 일을 입력해 보세요.</p>
          <button type="button" className="btn-small btn-primary" onClick={onFocusInput}>
            할 일 추가하기
          </button>
        </div>
      );
    }

    if (searchQuery) {
      return (
        <div className="empty-state">
          <p className="empty-state-title">일치하는 할 일이 없어요</p>
          <p className="empty-state-desc">검색어를 변경하거나 초기화해 보세요.</p>
          <button type="button" className="btn-small btn-secondary" onClick={onClearSearch}>
            검색어 초기화
          </button>
        </div>
      );
    }

    if (currentFilter === 'active') {
      return (
        <div className="empty-state">
          <p className="empty-state-title">진행 중인 할 일이 없어요</p>
          <p className="empty-state-desc">모든 할 일을 마쳤습니다!</p>
        </div>
      );
    }

    if (currentFilter === 'completed') {
      return (
        <div className="empty-state">
          <p className="empty-state-title">아직 완료한 할 일이 없어요</p>
          <p className="empty-state-desc">할 일을 하나씩 완료해 보세요.</p>
        </div>
      );
    }

    return (
      <div className="empty-state">
        <p className="empty-state-title">이 조건에 맞는 할 일이 없어요</p>
        <button type="button" className="btn-small btn-secondary" onClick={onResetFilter}>
          전체 보기
        </button>
      </div>
    );
  }

  return (
    <ul className="todo-list" aria-label="할 일 목록">
      {todos.map((item) => (
        <TodoItem
          key={item.id}
          todo={item}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

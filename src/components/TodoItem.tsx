import React, { useState, useRef, useEffect } from 'react';
import { TodoItem as TodoItemType } from '../types/todo';

interface TodoItemProps {
  todo: TodoItemType;
  onToggle: (id: string) => void;
  onEdit: (id: string, newText: string) => boolean;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editError, setEditError] = useState<string | null>(null);

  const editInputRef = useRef<HTMLInputElement>(null);
  const editBtnRef = useRef<HTMLButtonElement>(null);
  const isComposingRef = useRef(false);

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditText(todo.text);
    setEditError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(todo.text);
    setEditError(null);
    // 수정 버튼으로 포커스 복귀
    setTimeout(() => editBtnRef.current?.focus(), 0);
  };

  const handleSaveEdit = () => {
    if (isComposingRef.current) return;

    const trimmed = editText.trim();
    if (!trimmed) {
      setEditError('할 일 내용을 입력해 주세요.');
      editInputRef.current?.focus();
      return;
    }

    if (trimmed.length > 200) {
      setEditError('할 일은 최대 200자까지 입력 가능합니다.');
      editInputRef.current?.focus();
      return;
    }

    const success = onEdit(todo.id, trimmed);
    if (success) {
      setIsEditing(false);
      setEditError(null);
      setTimeout(() => editBtnRef.current?.focus(), 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || isComposingRef.current) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  return (
    <li className="todo-item">
      {isEditing ? (
        <div className="edit-form">
          <label htmlFor={`edit-input-${todo.id}`} className="sr-only">
            할 일 내용 수정
          </label>
          <input
            id={`edit-input-${todo.id}`}
            ref={editInputRef}
            type="text"
            className="edit-input"
            value={editText}
            maxLength={200}
            onChange={(e) => {
              setEditText(e.target.value);
              if (editError && e.target.value.trim()) setEditError(null);
            }}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            aria-invalid={!!editError}
            aria-describedby={editError ? `edit-error-${todo.id}` : undefined}
          />
          <button
            type="button"
            className="btn-small btn-primary"
            onClick={handleSaveEdit}
          >
            저장
          </button>
          <button
            type="button"
            className="btn-small btn-secondary"
            onClick={handleCancelEdit}
          >
            취소
          </button>
          {editError && (
            <span id={`edit-error-${todo.id}`} className="sr-only" role="alert">
              {editError}
            </span>
          )}
        </div>
      ) : (
        <>
          <label className="todo-checkbox-label">
            <input
              type="checkbox"
              className="todo-checkbox"
              checked={todo.completed}
              onChange={() => onToggle(todo.id)}
              aria-label={`${todo.text} 완료 여부`}
            />
            <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
              {todo.text}
            </span>
          </label>

          <div className="todo-actions">
            <button
              ref={editBtnRef}
              type="button"
              className="btn-icon"
              aria-label={`"${todo.text}" 수정`}
              onClick={handleStartEdit}
            >
              수정
            </button>
            <button
              type="button"
              className="btn-icon destructive"
              aria-label={`"${todo.text}" 삭제`}
              onClick={() => onDelete(todo.id)}
            >
              삭제
            </button>
          </div>
        </>
      )}
    </li>
  );
};

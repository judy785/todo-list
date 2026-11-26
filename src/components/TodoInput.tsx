import React, { useState, useRef } from 'react';

interface TodoInputProps {
  onAdd: (text: string) => boolean;
  lastAddedHidden: boolean;
  onShowAll: () => void;
}

export const TodoInput: React.FC<TodoInputProps> = ({
  onAdd,
  lastAddedHidden,
  onShowAll,
}) => {
  const [text, setText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // IME 조합 중 엔터 입력 방지
    if (isComposingRef.current) return;

    const trimmed = text.trim();
    if (!trimmed) {
      setErrorMsg('할 일을 입력해 주세요.');
      inputRef.current?.focus();
      return;
    }

    if (trimmed.length > 200) {
      setErrorMsg('할 일은 최대 200자까지 입력할 수 있습니다.');
      inputRef.current?.focus();
      return;
    }

    const success = onAdd(trimmed);
    if (success) {
      setText('');
      setErrorMsg(null);
      // 추가 후 포커스 유지
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || isComposingRef.current) {
      return;
    }
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (errorMsg && e.target.value.trim()) {
      setErrorMsg(null);
    }
  };

  return (
    <div className="input-form">
      <form onSubmit={handleSubmit} className="input-row" noValidate>
        <label htmlFor="new-todo-input" className="sr-only">
          새 할 일
        </label>
        <input
          id="new-todo-input"
          ref={inputRef}
          type="text"
          className="todo-text-input"
          placeholder="어떤 일을 할 예정인가요?"
          value={text}
          maxLength={200}
          aria-invalid={!!errorMsg}
          aria-describedby={errorMsg ? 'todo-input-error' : undefined}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => {
            isComposingRef.current = true;
          }}
          onCompositionEnd={() => {
            isComposingRef.current = false;
          }}
        />
        <button type="submit" className="btn-primary">
          추가
        </button>
      </form>

      {errorMsg && (
        <p id="todo-input-error" className="input-error-msg" role="alert">
          {errorMsg}
        </p>
      )}

      {lastAddedHidden && (
        <div className="hidden-item-alert" role="status">
          <span>할 일을 추가했어요. 현재 필터/검색 조건에서는 보이지 않습니다.</span>
          <button type="button" className="btn-text-link" onClick={onShowAll}>
            전체 보기
          </button>
        </div>
      )}
    </div>
  );
};

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoInput } from '../components/TodoInput';
import { TodoItem } from '../components/TodoItem';
import { FilterAndSearch } from '../components/FilterAndSearch';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { UndoToast } from '../components/UndoToast';
import { TodoItem as TodoItemType } from '../types/todo';

describe('UI Components and Interactions', () => {
  it('TodoInput: 빈 입력 차단 및 경고 문구를 표시한다', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} lastAddedHidden={false} onShowAll={vi.fn()} />);

    const addButton = screen.getByRole('button', { name: '추가' });
    fireEvent.click(addButton);

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByText('할 일을 입력해 주세요.')).toBeInTheDocument();
  });

  it('TodoInput: 한글 IME 조합(isComposing) 중 Enter 키로 중복 제출되지 않는다', async () => {
    const onAdd = vi.fn().mockReturnValue(true);
    render(<TodoInput onAdd={onAdd} lastAddedHidden={false} onShowAll={vi.fn()} />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');

    // 한글 조합 시작
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: '한글입력' } });

    // isComposing 상태에서 Enter 이벤트
    fireEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
      nativeEvent: { isComposing: true } as unknown as KeyboardEvent,
    });

    expect(onAdd).not.toHaveBeenCalled();

    // 한글 조합 종료
    fireEvent.compositionEnd(input);

    // 정상 Enter
    fireEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
      nativeEvent: { isComposing: false } as unknown as KeyboardEvent,
    });

    expect(onAdd).toHaveBeenCalledWith('한글입력');
  });

  it('TodoItem: 인라인 수정 모드 진입, 저장 및 취소(Esc)가 동작한다', async () => {
    const user = userEvent.setup();
    const todo: TodoItemType = {
      id: 'task-1',
      text: '기존 할 일',
      completed: false,
      createdAt: '2026-11-26T10:00:00.000Z',
      updatedAt: '2026-11-26T10:00:00.000Z',
    };
    const onEdit = vi.fn().mockReturnValue(true);
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(
      <TodoItem
        todo={todo}
        onEdit={onEdit}
        onToggle={onToggle}
        onDelete={onDelete}
      />
    );

    // 수정 버튼 클릭
    const editBtn = screen.getByRole('button', { name: '"기존 할 일" 수정' });
    await user.click(editBtn);

    // 인라인 입력창 확인
    const editInput = screen.getByDisplayValue('기존 할 일');
    expect(editInput).toBeInTheDocument();

    // 내용 수정 후 저장
    await user.clear(editInput);
    await user.type(editInput, '새로운 내용');

    const saveBtn = screen.getByRole('button', { name: '저장' });
    await user.click(saveBtn);

    expect(onEdit).toHaveBeenCalledWith('task-1', '새로운 내용');
  });

  it('FilterAndSearch: 필터 버튼 aria-pressed 토글 및 검색어 초기화가 동작한다', () => {
    const onFilterChange = vi.fn();
    const onSearchChange = vi.fn();
    const onClearSearch = vi.fn();

    const { rerender } = render(
      <FilterAndSearch
        currentFilter="all"
        onFilterChange={onFilterChange}
        searchQuery="테스트"
        onSearchChange={onSearchChange}
        onClearSearch={onClearSearch}
        resultCount={3}
      />
    );

    const activeFilterBtn = screen.getByRole('button', { name: '진행 중' });
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true');
    expect(activeFilterBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(activeFilterBtn);
    expect(onFilterChange).toHaveBeenCalledWith('active');

    const clearBtn = screen.getByRole('button', { name: '검색어 초기화' });
    fireEvent.click(clearBtn);
    expect(onClearSearch).toHaveBeenCalled();

    rerender(
      <FilterAndSearch
        currentFilter="active"
        onFilterChange={onFilterChange}
        searchQuery=""
        onSearchChange={onSearchChange}
        onClearSearch={onClearSearch}
        resultCount={0}
      />
    );
    expect(screen.queryByRole('button', { name: '검색어 초기화' })).not.toBeInTheDocument();
  });

  it('UndoToast: 삭제 알림 및 실행 취소 클릭이 동작한다', () => {
    const onUndo = vi.fn();
    const onDismiss = vi.fn();

    render(
      <UndoToast
        undoTarget={{
          todo: {
            id: '1',
            text: '삭제된 할 일',
            completed: false,
            createdAt: '2026-11-26T10:00:00.000Z',
            updatedAt: '2026-11-26T10:00:00.000Z',
          },
          originalIndex: 0,
        }}
        onUndo={onUndo}
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByText('할 일을 삭제했어요.')).toBeInTheDocument();

    const undoBtn = screen.getByRole('button', { name: '삭제한 할 일 복원하기' });
    fireEvent.click(undoBtn);
    expect(onUndo).toHaveBeenCalled();

    const closeBtn = screen.getByRole('button', { name: '알림 닫기' });
    fireEvent.click(closeBtn);
    expect(onDismiss).toHaveBeenCalled();
  });

  it('ConfirmDialog: 열림 시 취소 버튼 포커스 및 Esc 누를 때 닫힌다', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    const { rerender } = render(
      <ConfirmDialog
        isOpen={true}
        count={3}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('완료한 할 일 3개가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.')).toBeInTheDocument();

    // Esc 키 이벤트
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();

    // 모달 닫기
    rerender(
      <ConfirmDialog
        isOpen={false}
        count={3}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.queryByText('완료한 할 일을 삭제할까요?')).not.toBeInTheDocument();
  });
});

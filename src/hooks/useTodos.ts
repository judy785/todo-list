import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { TodoItem, TodoFilter, DeletedTodoRestoreTarget, StorageSaveStatus } from '../types/todo';
import { loadTodosFromStorage, saveTodosToStorage } from '../lib/storage';

export function useTodos() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const todosRef = useRef<TodoItem[]>([]);
  todosRef.current = todos;

  const [filter, setFilter] = useState<TodoFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [undoTarget, setUndoTarget] = useState<DeletedTodoRestoreTarget | null>(null);
  const [saveStatus, setSaveStatus] = useState<StorageSaveStatus>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastAddedHidden, setLastAddedHidden] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 초기 스토리지 로드
  useEffect(() => {
    const result = loadTodosFromStorage();
    if (result.error) {
      if (result.error === 'UNSUPPORTED_VERSION') {
        setLoadError('더 최신 버전의 저장 형식을 사용하고 있어 데이터를 읽지 못했습니다. 기존 데이터는 보존되었습니다.');
      } else {
        setLoadError('저장된 목록을 읽지 못했어요. 기존 데이터는 덮어쓰지 않았습니다.');
      }
    }
    setTodos(result.tasks);
    todosRef.current = result.tasks;
    setIsInitialized(true);
  }, []);

  // 상태 변경 및 스토리지 동기화 (함수형 업데이트로 경쟁 상태 방지)
  const syncAndSave = useCallback((updater: (prev: TodoItem[]) => TodoItem[]) => {
    setTodos((prev) => {
      const updated = updater(prev);
      todosRef.current = updated;
      const success = saveTodosToStorage(updated);
      setSaveStatus(success ? 'saved' : 'error');
      return updated;
    });
  }, []);

  // 할 일 추가
  const addTodo = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || trimmed.length > 200) return false;

      const now = new Date().toISOString();
      const newTodo: TodoItem = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `todo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        text: trimmed,
        completed: false,
        createdAt: now,
        updatedAt: now,
      };

      syncAndSave((prev) => [newTodo, ...prev]);

      // 필터/검색 조건에 의해 가려지는지 검사
      const isVisibleUnderFilter = filter === 'all' || filter === 'active';
      const isVisibleUnderSearch = searchQuery === '' || trimmed.toLowerCase().includes(searchQuery.trim().toLowerCase());
      if (!isVisibleUnderFilter || !isVisibleUnderSearch) {
        setLastAddedHidden(true);
      } else {
        setLastAddedHidden(false);
      }

      return true;
    },
    [filter, searchQuery, syncAndSave]
  );

  // 완료 상태 토글
  const toggleTodo = useCallback(
    (id: string) => {
      syncAndSave((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                completed: !item.completed,
                updatedAt: new Date().toISOString(),
              }
            : item
        )
      );
    },
    [syncAndSave]
  );

  // 할 일 내용 수정 (completed와 createdAt 유지)
  const editTodo = useCallback(
    (id: string, newText: string) => {
      const trimmed = newText.trim();
      if (!trimmed || trimmed.length > 200) return false;

      syncAndSave((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                text: trimmed,
                updatedAt: new Date().toISOString(),
              }
            : item
        )
      );
      return true;
    },
    [syncAndSave]
  );

  // 단일 삭제 및 실행 취소 타깃 설정
  const deleteTodo = useCallback(
    (id: string) => {
      const currentList = todosRef.current;
      const targetIndex = currentList.findIndex((item) => item.id === id);
      if (targetIndex === -1) return;

      const targetItem = currentList[targetIndex];

      // 최신 1건을 실행 취소 대상으로 지정
      setUndoTarget({
        todo: targetItem,
        originalIndex: targetIndex,
      });

      syncAndSave((prev) => prev.filter((item) => item.id !== id));
    },
    [syncAndSave]
  );

  // 실행 취소(Undo)
  const restoreDeletedTodo = useCallback(() => {
    if (!undoTarget) return;

    const { todo, originalIndex } = undoTarget;

    syncAndSave((prev) => {
      const restored = [...prev];
      const insertIndex = Math.min(originalIndex, restored.length);
      restored.splice(insertIndex, 0, todo);
      // createdAt 순 정렬 보장
      restored.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      return restored;
    });

    setUndoTarget(null);
  }, [undoTarget, syncAndSave]);

  const dismissUndo = useCallback(() => {
    setUndoTarget(null);
  }, []);

  // 완료된 항목 일괄 삭제
  const clearCompletedTodos = useCallback(() => {
    setUndoTarget(null); // 일괄 삭제는 개별 undo 대상 취소
    syncAndSave((prev) => prev.filter((item) => !item.completed));
  }, [syncAndSave]);

  // 검색 및 필터링된 목록 계산
  const filteredTodos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return todos.filter((item) => {
      // 1. 상태 필터
      if (filter === 'active' && item.completed) return false;
      if (filter === 'completed' && !item.completed) return false;

      // 2. 검색어 필터
      if (query && !item.text.toLowerCase().includes(query)) {
        return false;
      }

      return true;
    });
  }, [todos, filter, searchQuery]);

  // 통계 계산
  const stats = useMemo(() => {
    const totalCount = todos.length;
    const completedCount = todos.filter((t) => t.completed).length;
    const activeCount = totalCount - completedCount;
    const completionRate = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return {
      totalCount,
      completedCount,
      activeCount,
      completionRate,
    };
  }, [todos]);

  // 저장 재시도
  const retrySave = useCallback(() => {
    const success = saveTodosToStorage(todosRef.current);
    if (success) {
      setSaveStatus('saved');
    } else {
      setSaveStatus('error');
    }
  }, []);

  return {
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
    isInitialized,
    stats,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    restoreDeletedTodo,
    dismissUndo,
    clearCompletedTodos,
    retrySave,
  };
}

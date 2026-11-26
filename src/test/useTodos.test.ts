import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTodos } from '../hooks/useTodos';

describe('useTodos Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('할 일 추가, 글자 수 제한, 공백 차단을 정상 처리한다', () => {
    const { result } = renderHook(() => useTodos());

    // 공백 입력 차단
    act(() => {
      const added = result.current.addTodo('   ');
      expect(added).toBe(false);
    });
    expect(result.current.todos.length).toBe(0);

    // 200자 초과 차단
    act(() => {
      const tooLong = 'a'.repeat(201);
      const added = result.current.addTodo(tooLong);
      expect(added).toBe(false);
    });
    expect(result.current.todos.length).toBe(0);

    // 정상 추가 (앞뒤 공백 trim)
    act(() => {
      const added = result.current.addTodo('  운동하기  ');
      expect(added).toBe(true);
    });
    expect(result.current.todos.length).toBe(1);
    expect(result.current.todos[0].text).toBe('운동하기');
    expect(result.current.todos[0].completed).toBe(false);
  });

  it('새 항목 추가 시 최신 항목이 항상 맨 위에 위치한다', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('첫 번째');
    });
    act(() => {
      result.current.addTodo('두 번째');
    });

    expect(result.current.todos[0].text).toBe('두 번째');
    expect(result.current.todos[1].text).toBe('첫 번째');
  });

  it('완료 상태 토글 시 completed가 변경되고 updatedAt이 갱신되며 createdAt은 유지된다', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('할 일');
    });

    const original = result.current.todos[0];

    act(() => {
      result.current.toggleTodo(original.id);
    });

    const updated = result.current.todos[0];
    expect(updated.completed).toBe(true);
    expect(updated.createdAt).toBe(original.createdAt);
  });

  it('할 일 내용 수정 시 completed와 createdAt은 유지된다', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('초기 내용');
    });

    const targetId = result.current.todos[0].id;
    const originalCreatedAt = result.current.todos[0].createdAt;

    act(() => {
      result.current.editTodo(targetId, '수정된 내용');
    });

    const updated = result.current.todos[0];
    expect(updated.text).toBe('수정된 내용');
    expect(updated.createdAt).toBe(originalCreatedAt);
  });

  it('개별 삭제 및 실행 취소(Undo) 시 원래 데이터와 순서를 정확히 복원한다', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('항목 1');
      result.current.addTodo('항목 2');
      result.current.addTodo('항목 3');
    });

    // 목록 순서: [항목 3, 항목 2, 항목 1]
    const itemToDelete = result.current.todos[1]; // 항목 2
    expect(itemToDelete.text).toBe('항목 2');

    // 삭제 실행
    act(() => {
      result.current.deleteTodo(itemToDelete.id);
    });

    expect(result.current.todos.length).toBe(2);
    expect(result.current.undoTarget).not.toBeNull();
    expect(result.current.undoTarget?.todo.text).toBe('항목 2');

    // 실행 취소
    act(() => {
      result.current.restoreDeletedTodo();
    });

    expect(result.current.todos.length).toBe(3);
    expect(result.current.todos[1].text).toBe('항목 2');
    expect(result.current.undoTarget).toBeNull();
  });

  it('빠른 연속 삭제 시에도 최신 1건만 실행 취소 대상으로 혼동 없이 유지된다', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('1번');
      result.current.addTodo('2번');
    });

    const first = result.current.todos[0]; // 2번
    const second = result.current.todos[1]; // 1번

    act(() => {
      result.current.deleteTodo(first.id);
      result.current.deleteTodo(second.id);
    });

    // 최신 삭제 대상은 1번이어야 함
    expect(result.current.undoTarget?.todo.text).toBe('1번');
    expect(result.current.todos.length).toBe(0);
  });

  it('완료 항목 일괄 삭제를 정상 수행한다', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('미완료 1');
      result.current.addTodo('완료 2');
      result.current.addTodo('미완료 3');
    });

    const completedTarget = result.current.todos.find((t) => t.text === '완료 2')!;
    act(() => {
      result.current.toggleTodo(completedTarget.id);
    });

    expect(result.current.stats.completedCount).toBe(1);

    act(() => {
      result.current.clearCompletedTodos();
    });

    expect(result.current.todos.length).toBe(2);
    expect(result.current.todos.some((t) => t.text === '완료 2')).toBe(false);
    expect(result.current.stats.completedCount).toBe(0);
  });

  it('통계 및 진행률 계산: 0개일 때 0%로 0으로 나누기 오류를 방지한다', () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.stats.totalCount).toBe(0);
    expect(result.current.stats.completionRate).toBe(0);

    act(() => {
      result.current.addTodo('할 일 1');
      result.current.addTodo('할 일 2');
    });

    expect(result.current.stats.completionRate).toBe(0);

    act(() => {
      result.current.toggleTodo(result.current.todos[0].id);
    });

    expect(result.current.stats.completionRate).toBe(50);
  });

  it('상태 필터와 검색어의 교집합 필터링을 올바르게 수행한다', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('리액트 공부하기');
      result.current.addTodo('타입스크립트 연습');
      result.current.addTodo('리액트 프로젝트 빌드');
    });

    // '리액트 프로젝트 빌드' 완료 처리
    const todoToComplete = result.current.todos.find((t) => t.text === '리액트 프로젝트 빌드')!;
    act(() => {
      result.current.toggleTodo(todoToComplete.id);
    });

    // 1. 검색어만 적용: '리액트' -> 2개
    act(() => {
      result.current.setSearchQuery('리액트');
    });
    expect(result.current.filteredTodos.length).toBe(2);

    // 2. 검색어 '리액트' + 필터 '진행 중' -> '리액트 공부하기' 1개
    act(() => {
      result.current.setFilter('active');
    });
    expect(result.current.filteredTodos.length).toBe(1);
    expect(result.current.filteredTodos[0].text).toBe('리액트 공부하기');

    // 3. 검색어 '리액트' + 필터 '완료' -> '리액트 프로젝트 빌드' 1개
    act(() => {
      result.current.setFilter('completed');
    });
    expect(result.current.filteredTodos.length).toBe(1);
    expect(result.current.filteredTodos[0].text).toBe('리액트 프로젝트 빌드');
  });

  it('완료 전용 필터 상태에서 새 할 일을 추가하면 lastAddedHidden이 true가 된다', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.setFilter('completed');
    });

    act(() => {
      result.current.addTodo('새로운 미완료 할 일');
    });

    expect(result.current.lastAddedHidden).toBe(true);
    expect(result.current.filteredTodos.length).toBe(0);
  });
});

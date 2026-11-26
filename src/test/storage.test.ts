import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadTodosFromStorage,
  saveTodosToStorage,
  isValidTodoItem,
  STORAGE_KEY,
} from '../lib/storage';
import { TodoItem } from '../types/todo';

describe('Storage Engine (localStorage v1)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('유효한 TodoItem 객체를 올바르게 검증한다', () => {
    const valid: TodoItem = {
      id: 'task-1',
      text: '테스트 할 일',
      completed: false,
      createdAt: '2026-11-26T10:00:00.000Z',
      updatedAt: '2026-11-26T10:00:00.000Z',
    };
    expect(isValidTodoItem(valid)).toBe(true);

    expect(isValidTodoItem(null)).toBe(false);
    expect(isValidTodoItem({})).toBe(false);
    expect(isValidTodoItem({ ...valid, id: '' })).toBe(false);
    expect(isValidTodoItem({ ...valid, createdAt: 'invalid-date' })).toBe(false);
    expect(isValidTodoItem({ ...valid, completed: 'not-bool' })).toBe(false);
  });

  it('데이터가 없을 때 빈 목록을 반환한다', () => {
    const result = loadTodosFromStorage();
    expect(result.tasks).toEqual([]);
    expect(result.error).toBeUndefined();
  });

  it('정상적인 할 일 목록을 저장하고 복원한다 (createdAt 내림차순 정렬)', () => {
    const tasks: TodoItem[] = [
      {
        id: '1',
        text: '오래된 할 일',
        completed: false,
        createdAt: '2026-11-26T08:00:00.000Z',
        updatedAt: '2026-11-26T08:00:00.000Z',
      },
      {
        id: '2',
        text: '최신 할 일',
        completed: true,
        createdAt: '2026-11-26T09:00:00.000Z',
        updatedAt: '2026-11-26T09:00:00.000Z',
      },
    ];

    const saved = saveTodosToStorage(tasks);
    expect(saved).toBe(true);

    const loaded = loadTodosFromStorage();
    expect(loaded.error).toBeUndefined();
    expect(loaded.tasks.length).toBe(2);
    // 최신 항목이 첫 번째로 정렬되어야 함
    expect(loaded.tasks[0].id).toBe('2');
    expect(loaded.tasks[1].id).toBe('1');
  });

  it('잘못된 JSON 형식일 때 CORRUPTED 또는 READ_ERROR 에러를 반환하고 빈 배열을 반환한다', () => {
    localStorage.setItem(STORAGE_KEY, '{ invalid json');
    const result = loadTodosFromStorage();
    expect(result.tasks).toEqual([]);
    expect(result.error).toBe('READ_ERROR');
  });

  it('상위 스키마 버전(schemaVersion: 2)인 경우 데이터를 임의 덮어쓰지 않고 에러를 반환한다', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 2,
        tasks: [],
      })
    );
    const result = loadTodosFromStorage();
    expect(result.tasks).toEqual([]);
    expect(result.error).toBe('UNSUPPORTED_VERSION');
  });

  it('localStorage 접근/저장 실패(QuotaExceeded 등) 시 false를 반환하여 크래시를 방지한다', () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const tasks: TodoItem[] = [
      {
        id: '1',
        text: '할 일',
        completed: false,
        createdAt: '2026-11-26T08:00:00.000Z',
        updatedAt: '2026-11-26T08:00:00.000Z',
      },
    ];
    const success = saveTodosToStorage(tasks);
    expect(success).toBe(false);
  });
});

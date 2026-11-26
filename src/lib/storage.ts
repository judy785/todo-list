import { TodoItem, StorageSchemaV1 } from '../types/todo';

export const STORAGE_KEY = 'todo-app:v1';
export const CURRENT_SCHEMA_VERSION = 1;

export interface StorageLoadResult {
  tasks: TodoItem[];
  error?: 'CORRUPTED' | 'UNSUPPORTED_VERSION' | 'READ_ERROR';
}

/**
 * 객체가 유효한 TodoItem인지 검증
 */
export function isValidTodoItem(item: unknown): item is TodoItem {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Partial<TodoItem>;
  if (typeof candidate.id !== 'string' || candidate.id.trim() === '') return false;
  if (typeof candidate.text !== 'string') return false;
  if (typeof candidate.completed !== 'boolean') return false;
  if (typeof candidate.createdAt !== 'string' || isNaN(Date.parse(candidate.createdAt))) return false;
  if (typeof candidate.updatedAt !== 'string' || isNaN(Date.parse(candidate.updatedAt))) return false;
  return true;
}

/**
 * localStorage에서 할 일 목록 로드
 */
export function loadTodosFromStorage(): StorageLoadResult {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { tasks: [] };
    }

    const parsed = JSON.parse(raw);

    // 스키마 버전 검증
    if (!parsed || typeof parsed !== 'object') {
      return { tasks: [], error: 'CORRUPTED' };
    }

    if (parsed.schemaVersion > CURRENT_SCHEMA_VERSION) {
      return { tasks: [], error: 'UNSUPPORTED_VERSION' };
    }

    if (!Array.isArray(parsed.tasks)) {
      return { tasks: [], error: 'CORRUPTED' };
    }

    const validTasks: TodoItem[] = [];
    const seenIds = new Set<string>();

    for (const item of parsed.tasks) {
      if (isValidTodoItem(item) && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        validTasks.push(item);
      }
    }

    // createdAt 내림차순 정렬 보장
    validTasks.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    return { tasks: validTasks };
  } catch {
    return { tasks: [], error: 'READ_ERROR' };
  }
}

/**
 * localStorage에 할 일 목록 저장
 * 실패 시 boolean false 반환 (앱 크래시 방지)
 */
export function saveTodosToStorage(tasks: TodoItem[]): boolean {
  try {
    const payload: StorageSchemaV1 = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      tasks,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

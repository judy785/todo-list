export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string; // ISO 8601 문자열
  updatedAt: string; // ISO 8601 문자열
}

export type TodoFilter = 'all' | 'active' | 'completed';

export interface StorageSchemaV1 {
  schemaVersion: 1;
  tasks: TodoItem[];
}

export interface DeletedTodoRestoreTarget {
  todo: TodoItem;
  originalIndex: number;
}

export type StorageSaveStatus = 'idle' | 'saved' | 'error';

import React from 'react';
import { TodoFilter } from '../types/todo';

interface FilterAndSearchProps {
  currentFilter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  resultCount: number;
}

export const FilterAndSearch: React.FC<FilterAndSearchProps> = ({
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onClearSearch,
  resultCount,
}) => {
  return (
    <div className="filter-search-container">
      {/* 상태 필터 버튼 그룹 */}
      <div className="filter-group" role="group" aria-label="할 일 상태 필터">
        <button
          type="button"
          className="filter-btn"
          aria-pressed={currentFilter === 'all'}
          onClick={() => onFilterChange('all')}
        >
          전체
        </button>
        <button
          type="button"
          className="filter-btn"
          aria-pressed={currentFilter === 'active'}
          onClick={() => onFilterChange('active')}
        >
          진행 중
        </button>
        <button
          type="button"
          className="filter-btn"
          aria-pressed={currentFilter === 'completed'}
          onClick={() => onFilterChange('completed')}
        >
          완료
        </button>
      </div>

      {/* 검색창 */}
      <div className="search-wrapper">
        <label htmlFor="todo-search-input" className="sr-only">
          할 일 검색
        </label>
        <input
          id="todo-search-input"
          type="text"
          className="search-input"
          placeholder="할 일 검색"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="search-clear-btn"
            aria-label="검색어 초기화"
            onClick={onClearSearch}
          >
            ✕
          </button>
        )}
      </div>

      {/* 검색 결과 수 스크린 리더 안내 */}
      {searchQuery && (
        <span className="sr-only" role="status">
          검색 결과 {resultCount}개
        </span>
      )}
    </div>
  );
};

import React from 'react';

interface HeaderProps {
  totalCount: number;
  completedCount: number;
  completionRate: number;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  completedCount,
  completionRate,
}) => {
  // 기기 로컬 날짜 한국어 서식 (예: 2026년 11월 26일 목요일)
  const todayString = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date());

  return (
    <header className="header">
      <div className="header-top">
        <h1 className="header-title">꼭 해야 할 일</h1>
        <time className="header-date" dateTime={new Date().toISOString().split('T')[0]}>
          {todayString}
        </time>
      </div>
      <p className="header-subtitle">작은 실천으로 채우는 하루</p>

      <section className="progress-section" aria-label="할 일 달성 현황">
        <div className="progress-meta">
          <span>
            전체 {totalCount} · 완료 {completedCount}
          </span>
          <span>{completionRate}%</span>
        </div>
        <div
          className="progress-bar-track"
          role="progressbar"
          aria-label="할 일 진행률"
          aria-valuenow={completionRate}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="progress-bar-fill"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </section>
    </header>
  );
};

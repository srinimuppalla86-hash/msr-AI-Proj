import React from 'react';

export default function AppHeader({ onViewHistory }) {
  return (
    <header className="app-header">
      <div className="app-header-left">
        <div className="app-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        </div>
        <div className="app-title">
          <h1>Intelligent Test Planning Agent</h1>
          <p>Generate comprehensive test plans from Jira requirements using AI</p>
        </div>
      </div>

      <button className="btn-view-history" onClick={onViewHistory} id="btn-view-history">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        View History
      </button>
    </header>
  );
}

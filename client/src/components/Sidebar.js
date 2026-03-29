import React from 'react';

export default function Sidebar({ currentPage }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'curriculum', label: 'Curriculum', icon: '📚' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const planningItems = [
    { id: 'test-planner', label: 'Intelligent Test Planning Agent', icon: '🧪' },
  ];

  return (
    <nav className="sidebar" role="navigation" aria-label="Main Navigation">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">TB</div>
        <div className="sidebar-brand-text">
          <h2>TestingBuddy AI</h2>
          <span>Testing Platform</span>
        </div>
      </div>

      {/* Main Nav */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Main</div>
        {navItems.map(item => (
          <div
            key={item.id}
            className={`sidebar-nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => currentPage !== item.id && alert('This module will be automatically available upon connecting your corresponding project context.')}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>

      {/* Planning & Strategy */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Planning & Strategy</div>
        {planningItems.map(item => (
          <div
            key={item.id}
            className={`sidebar-nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => currentPage !== item.id && alert('This module will be automatically available upon connecting your corresponding project context.')}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>
    </nav>
  );
}

import React from 'react';
import ReactMarkdown from 'react-markdown';

const API_URL = 'http://localhost:5000/api';

export default function StepTestPlan({ plan }) {
  if (!plan) {
    return (
      <div className="card">
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <h3>No test plan generated yet</h3>
          <p>Complete the previous steps to generate your test plan</p>
        </div>
      </div>
    );
  }

  const handleDownload = async (format) => {
    try {
      const response = await fetch(`${API_URL}/test-plan/${plan.id}/download/${format}`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${plan.title}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Download failed. Please try again.');
    }
  };

  return (
    <div className="test-plan-display">
      {/* Toolbar */}
      <div className="test-plan-toolbar">
        <div className="test-plan-toolbar-left">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{plan.title}</span>
          <span className="badge badge-success" style={{ marginLeft: 8 }}>Generated</span>
        </div>
        <div className="test-plan-toolbar-right">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => handleDownload('pdf')}
            id="btn-download-pdf"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            PDF
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleDownload('docx')}
            id="btn-download-docx"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            DOCX
          </button>
        </div>
      </div>

      {/* Meta info */}
      <div style={{ padding: '12px 32px', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)', display: 'flex', gap: 24, fontSize: 13, color: 'var(--gray-500)' }}>
        <span><strong>Project:</strong> {plan.projectKey}</span>
        <span><strong>LLM:</strong> {plan.llmProvider}</span>
        <span><strong>Issues:</strong> {plan.sourceIssues?.length || 0}</span>
        <span><strong>Generated:</strong> {new Date(plan.generatedAt).toLocaleString()}</span>
      </div>

      {/* Test Plan Content */}
      <div className="test-plan-content">
        <ReactMarkdown>{plan.rawMarkdown}</ReactMarkdown>
      </div>
    </div>
  );
}

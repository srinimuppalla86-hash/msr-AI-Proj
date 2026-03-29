import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function StepReview({
  connection,
  issues,
  selectedIssues,
  setSelectedIssues,
  projectDetails,
  setProjectDetails,
  llmProvider,
  llmApiKey,
  onGenerateTestPlan,
  onRefreshIssues
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewIssue, setPreviewIssue] = useState(null);

  const toggleIssue = (issue) => {
    const isSelected = selectedIssues.find(i => i.key === issue.key);
    if (isSelected) {
      setSelectedIssues(prev => prev.filter(i => i.key !== issue.key));
    } else {
      setSelectedIssues(prev => [...prev, issue]);
    }
  };

  const toggleAll = () => {
    if (selectedIssues.length === issues.length) {
      setSelectedIssues([]);
    } else {
      setSelectedIssues([...issues]);
    }
  };

  const handlePreview = (issue) => {
    setPreviewIssue(previewIssue?.key === issue.key ? null : issue);
  };

  const handleGenerate = async () => {
    if (!llmApiKey.trim()) {
      setError('Please enter your LLM API key');
      return;
    }
    if (selectedIssues.length === 0) {
      setError('Please select at least one issue');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/test-plan/generate`, {
        connectionId: connection?.id,
        productName: projectDetails.productName,
        projectKey: projectDetails.projectKey,
        additionalContext: projectDetails.additionalContext,
        selectedIssues,
        llmProvider,
        llmApiKey: llmApiKey.trim()
      });

      onGenerateTestPlan(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate test plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getIssueTypeBadgeClass = (type) => {
    const lower = (type || '').toLowerCase();
    if (lower.includes('story')) return 'story';
    if (lower.includes('bug')) return 'bug';
    if (lower.includes('epic')) return 'epic';
    return 'task';
  };

  return (
    <>
      {/* Connection / Refresh bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div className="connection-badge">
          <span className="dot"></span>
          {connection?.name} ({connection?.url})
        </div>
        <button className="btn btn-outline btn-sm" onClick={onRefreshIssues}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
          </svg>
          Refresh Issues
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Additional Context */}
      <div className="card">
        <div className="card-header">
          <h2>Additional Context & Notes</h2>
          <p>Add any additional context, special requirements, or constraints</p>
        </div>
        <textarea
          className="form-input"
          placeholder="Add any additional context about the testing approach, special requirements, constraints, team structure, or specific areas of focus..."
          value={projectDetails.additionalContext}
          onChange={(e) => setProjectDetails({ ...projectDetails, additionalContext: e.target.value })}
          id="input-review-context"
        />
      </div>

      {/* Issues Table */}
      <div className="card">
        <div className="card-header">
          <h2>Review Jira Issues ({issues.length})</h2>
          <p>Issues that will be used to generate the test plan</p>
        </div>

        {issues.length > 0 ? (
          <table className="issues-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="issue-checkbox"
                    checked={selectedIssues.length === issues.length}
                    onChange={toggleAll}
                  />
                </th>
                <th>Key</th>
                <th>Summary</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Preview</th>
              </tr>
            </thead>
            <tbody>
              {issues.map(issue => (
                <React.Fragment key={issue.key}>
                  <tr>
                    <td>
                      <input
                        type="checkbox"
                        className="issue-checkbox"
                        checked={!!selectedIssues.find(i => i.key === issue.key)}
                        onChange={() => toggleIssue(issue)}
                      />
                    </td>
                    <td className="issue-key">{issue.key}</td>
                    <td>{issue.summary}</td>
                    <td>
                      <span className={`issue-type-badge ${getIssueTypeBadgeClass(issue.issueType)}`}>
                        {issue.issueType}
                      </span>
                    </td>
                    <td>{issue.priority}</td>
                    <td>{issue.status}</td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handlePreview(issue)}
                        id={`btn-preview-${issue.key}`}
                      >
                        {previewIssue?.key === issue.key ? 'Hide' : 'Preview'}
                      </button>
                    </td>
                  </tr>
                  {previewIssue?.key === issue.key && (
                    <tr>
                      <td colSpan="7" style={{ padding: 0, border: 'none' }}>
                        <div className="preview-card">
                          <h3>{issue.key}: {issue.summary}</h3>
                          <div className="preview-meta">
                            <span className="preview-meta-item"><strong>Type:</strong> {issue.issueType}</span>
                            <span className="preview-meta-item"><strong>Priority:</strong> {issue.priority}</span>
                            <span className="preview-meta-item"><strong>Status:</strong> {issue.status}</span>
                            <span className="preview-meta-item"><strong>Assignee:</strong> {issue.assignee}</span>
                            <span className="preview-meta-item"><strong>Reporter:</strong> {issue.reporter}</span>
                          </div>
                          {issue.labels?.length > 0 && (
                            <div className="preview-meta">
                              <span className="preview-meta-item"><strong>Labels:</strong> {issue.labels.join(', ')}</span>
                            </div>
                          )}
                          <div className="preview-description">
                            <strong>Description:</strong><br />
                            {issue.description || 'No description available'}
                          </div>
                          {issue.acceptanceCriteria && (
                            <div className="preview-description" style={{ marginTop: 8 }}>
                              <strong>Acceptance Criteria:</strong><br />
                              {issue.acceptanceCriteria}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3>No issues fetched</h3>
            <p>Go back to fetch issues from your Jira project</p>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <button
        className="btn btn-primary btn-full"
        onClick={handleGenerate}
        disabled={loading || selectedIssues.length === 0 || !llmApiKey.trim()}
        id="btn-generate-test-plan"
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Generating Test Plan...
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            Generate Test Plan
          </>
        )}
      </button>
    </>
  );
}

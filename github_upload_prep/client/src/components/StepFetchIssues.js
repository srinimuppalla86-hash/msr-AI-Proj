import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function StepFetchIssues({ connection, onIssuesFetched, onChangeConnection }) {
  const [productName, setProductName] = useState('');
  const [projectKey, setProjectKey] = useState('');
  const [sprintVersion, setSprintVersion] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  
  const [ticketId, setTicketId] = useState('');
  const [singleIssuePreview, setSingleIssuePreview] = useState(null);
  const [fetchingSingle, setFetchingSingle] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!projectKey.trim()) {
      setError('Project Key is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/jira/fetch-issues`, {
        connectionId: connection.id,
        projectKey: projectKey.trim(),
        sprintVersion: sprintVersion.trim() || null
      });

      onIssuesFetched(res.data.issues, {
        productName,
        projectKey: projectKey.trim(),
        sprintVersion: sprintVersion.trim(),
        additionalContext
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch issues from Jira');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchSingle = async (e) => {
    e.preventDefault();
    if (!ticketId.trim()) {
      setError('Ticket ID is required');
      return;
    }

    setFetchingSingle(true);
    setError('');
    setSingleIssuePreview(null);

    try {
      const res = await axios.post(`${API_URL}/jira/fetch-issue`, {
        connectionId: connection.id,
        issueKey: ticketId.trim()
      });
      setSingleIssuePreview(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch the ticket');
    } finally {
      setFetchingSingle(false);
    }
  };

  const handleProceedWithSingle = () => {
    onIssuesFetched([singleIssuePreview], {
      productName: '',
      projectKey: singleIssuePreview.key,
      sprintVersion: '',
      additionalContext: ''
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Fetch Jira Requirements</h2>
        <p>Enter project details to fetch user stories and requirements</p>
      </div>

      {/* Connected to badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 'var(--border-radius-sm)', marginBottom: 24 }}>
        <div>
          <strong style={{ fontSize: 13, color: 'var(--gray-700)' }}>Connected to:</strong>
          <div style={{ fontSize: 14, color: 'var(--gray-500)' }}>
            {connection?.name} ({connection?.url})
          </div>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={onChangeConnection}
          style={{ cursor: 'pointer' }}
        >
          Change
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ marginBottom: 16 }}>Option 1: Fetch a Single Ticket</h3>
        <form onSubmit={handleFetchSingle}>
          <div className="form-group">
            <label>Jira Ticket ID <span className="required">*</span></label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., VWOAPP-123"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                required
                id="input-ticket-id"
              />
              <button
                type="submit"
                className="btn btn-outline"
                disabled={fetchingSingle || !ticketId.trim()}
              >
                {fetchingSingle ? <span className="spinner"></span> : null}
                Fetch & Preview
              </button>
            </div>
          </div>
        </form>

        {singleIssuePreview && (
          <div className="preview-card" style={{ marginTop: 16 }}>
            <h3>{singleIssuePreview.key}: {singleIssuePreview.summary}</h3>
            <div className="preview-meta">
              <span className="preview-meta-item"><strong>Type:</strong> {singleIssuePreview.issueType}</span>
              <span className="preview-meta-item"><strong>Status:</strong> {singleIssuePreview.status}</span>
              <span className="preview-meta-item"><strong>Assignee:</strong> {singleIssuePreview.assignee}</span>
            </div>
            <div className="preview-description">
              <strong>Description:</strong><br />
              {singleIssuePreview.description || 'No description available'}
            </div>
            
            <button 
              className="btn btn-primary" 
              style={{ marginTop: 16 }}
              onClick={handleProceedWithSingle}
            >
              Continue to Review Plan with this Ticket
            </button>
          </div>
        )}
      </div>

      <hr className="divider" />

      <div>
        <h3 style={{ marginBottom: 16 }}>Option 2: Fetch Entire Project</h3>
        <form onSubmit={handleFetch}>
          <div className="form-row">
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., App.vwo.com"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                id="input-product-name"
              />
            </div>
            <div className="form-group">
              <label>Project Key <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., VWOAPP"
                value={projectKey}
                onChange={(e) => setProjectKey(e.target.value)}
                required={!singleIssuePreview} // Only required if Option 1 is not used
                id="input-project-key"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Sprint/Fix Version (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Sprint 15 or leave empty for all open issues"
              value={sprintVersion}
              onChange={(e) => setSprintVersion(e.target.value)}
              id="input-sprint-version"
            />
          </div>

          <div className="form-group">
            <label>Additional Context (Optional)</label>
            <textarea
              className="form-input"
              placeholder="Any additional information about the product, testing goals, or constraints..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              id="input-additional-context"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading || !projectKey.trim()}
            id="btn-fetch-issues"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Fetching Project Issues...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Fetch Multiple Issues
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

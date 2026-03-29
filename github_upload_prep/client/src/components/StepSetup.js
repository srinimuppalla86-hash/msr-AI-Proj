import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const integrations = [
  {
    id: 'jira', name: 'Jira', icon: 'J', iconClass: 'jira',
    description: 'Import requirements and user stories from Atlassian Jira',
    features: ['Requirements import', 'User stories', 'Acceptance criteria'],
    available: true
  },
  {
    id: 'testrail', name: 'TestRail', icon: 'TR', iconClass: 'testrail',
    description: 'Import existing test cases and test suites from TestRail',
    features: ['Test cases', 'Test suites', 'Test runs'],
    available: false
  },
  {
    id: 'zephyr', name: 'Zephyr', icon: 'Z', iconClass: 'zephyr',
    description: 'Sync test cases from Zephyr Scale or Zephyr Squad',
    features: ['Test cases', 'Test cycles', 'Test execution'],
    available: false
  },
  {
    id: 'xray', name: 'Xray', icon: 'X', iconClass: 'xray',
    description: 'Import test cases and test plans from Xray',
    features: ['Test cases', 'Test plans', 'Test executions'],
    available: false
  },
  {
    id: 'qase', name: 'Qase', icon: 'Q', iconClass: 'qase',
    description: 'Import test cases and test plans from Qase',
    features: ['Test cases', 'Test suites', 'Shared steps'],
    available: false
  },
  {
    id: 'azure', name: 'Azure DevOps', icon: 'A', iconClass: 'azure',
    description: 'Import test plans and test cases from Azure',
    features: ['Test plans', 'Test cases', 'Work items'],
    available: false
  }
];

export default function StepSetup({
  selectedConnection,
  onConnectionSelect,
  onContinue,
  llmProvider,
  setLlmProvider,
  llmApiKey,
  setLlmApiKey
}) {
  const [connections, setConnections] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', url: '', email: '', apiToken: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [testingJira, setTestingJira] = useState(false);
  const [showJiraToken, setShowJiraToken] = useState(false);
  
  const [testingLlm, setTestingLlm] = useState(false);
  const [llmTestResult, setLlmTestResult] = useState(null);
  const [showLlmKey, setShowLlmKey] = useState(false);

  useEffect(() => {
    fetchConnections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTestJiraConnection = async () => {
    setTestingJira(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.post(`${API_URL}/connections/test`, formData);
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to test connection');
    } finally {
      setTestingJira(false);
    }
  };

  const handleTestLlmConnection = async () => {
    if (!llmApiKey.trim()) return;
    setTestingLlm(true);
    setLlmTestResult(null);
    try {
      const res = await axios.post(`${API_URL}/test-plan/test-llm`, {
        llmProvider,
        llmApiKey: llmApiKey.trim()
      });
      setLlmTestResult({ type: 'success', message: res.data.message });
    } catch (err) {
      setLlmTestResult({ type: 'error', message: err.response?.data?.error || 'Connection failed' });
    } finally {
      setTestingLlm(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${API_URL}/connections`);
      setConnections(res.data);
      if (res.data.length > 0 && !selectedConnection) {
        onConnectionSelect(res.data[0]);
      }
    } catch (err) {
      // Server might not be running yet
    }
  };

  const handleSaveConnection = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.post(`${API_URL}/connections`, formData);
      setSuccess(`Connected successfully! Authenticated as ${res.data.connectedUser}`);
      setConnections(prev => [...prev, res.data]);
      onConnectionSelect(res.data);
      setShowForm(false);
      setFormData({ name: '', url: '', email: '', apiToken: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Jira Connection Card */}
      <div className="card">
        <div className="card-header">
          <h2>Jira Connection</h2>
          <p>Connect to your Jira instance to fetch requirements</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Show existing connections or form */}
        {connections.length > 0 && !showForm ? (
          <>
            <div className="form-group">
              <label>Select Jira Connection</label>
              <select
                className="form-select"
                value={selectedConnection?.id || ''}
                onChange={(e) => {
                  const conn = connections.find(c => c.id === e.target.value);
                  onConnectionSelect(conn);
                }}
                id="select-connection"
              >
                <option value="">-- Select a connection --</option>
                {connections.map(conn => (
                  <option key={conn.id} value={conn.id}>
                    {conn.name} ({conn.url})
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-outline"
              onClick={() => setShowForm(true)}
              id="btn-add-connection"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              Add New Connection
            </button>
          </>
        ) : (
          /* Connection Form */
          <form onSubmit={handleSaveConnection}>
            {connections.length > 0 && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowForm(false)}
                style={{ marginBottom: 20 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
                Cancel
              </button>
            )}

            <hr className="divider" />

            <div className="form-group">
              <label>Connection Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., VWO Production"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                id="input-connection-name"
              />
            </div>

            <div className="form-group">
              <label>Jira URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://yourcompany.atlassian.net"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
                id="input-jira-url"
              />
            </div>

            <div className="form-group">
              <label>Jira Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="your-email@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                id="input-jira-email"
              />
            </div>

            <div className="form-group">
              <label>API Token</label>
              <input
                type="password"
                className="form-input"
                placeholder="Your Jira API token"
                value={formData.apiToken}
                onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
                required
                id="input-api-token"
              />
              <p className="form-input-hint">
                Generate at: <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noreferrer">https://id.atlassian.com/manage-profile/security/api-tokens</a>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleTestJiraConnection}
                disabled={testingJira || !formData.url || !formData.email || !formData.apiToken}
              >
                {testingJira ? <span className="spinner"></span> : null}
                {testingJira ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                id="btn-save-connection"
              >
                {loading ? <span className="spinner"></span> : null}
                {loading ? 'Connecting...' : 'Save Connection'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* LLM Provider Selection */}
      <div className="card" style={{ marginTop: 24, marginBottom: 24 }}>
        <div className="card-header">
          <h2>AI Model Selection</h2>
          <p>Choose and connect the LLM provider for test plan generation</p>
        </div>

        <div className="llm-provider-grid">
          <div
            className={`llm-provider-card ${llmProvider === 'openai' ? 'selected' : ''}`}
            onClick={() => setLlmProvider('openai')}
          >
            <h4>🤖 OpenAI GPT-4</h4>
            <p>Most capable model</p>
          </div>
          <div
            className={`llm-provider-card ${llmProvider === 'gemini' ? 'selected' : ''}`}
            onClick={() => setLlmProvider('gemini')}
          >
            <h4>💎 Google Gemini</h4>
            <p>Google's AI model</p>
          </div>
          <div
            className={`llm-provider-card ${llmProvider === 'groq' ? 'selected' : ''}`}
            onClick={() => setLlmProvider('groq')}
          >
            <h4>⚡ Groq</h4>
            <p>Ultra-fast inference</p>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: 20 }}>
          <label>{llmProvider === 'openai' ? 'OpenAI' : llmProvider === 'gemini' ? 'Gemini' : 'Groq'} API Key <span className="required">*</span></label>
          <input
            type="password"
            className="form-input"
            placeholder={`Enter your ${llmProvider === 'openai' ? 'OpenAI' : llmProvider === 'gemini' ? 'Gemini' : 'Groq'} API key`}
            value={llmApiKey}
            onChange={(e) => setLlmApiKey(e.target.value)}
            id="input-llm-api-key"
          />
          
          <div style={{ marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleTestLlmConnection}
              disabled={testingLlm || !llmApiKey.trim()}
            >
              {testingLlm ? <span className="spinner"></span> : null}
              {testingLlm ? 'Testing...' : 'Test LLM Connection'}
            </button>
            
            {llmTestResult && (
              <span className={`alert ${llmTestResult.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginLeft: 16, padding: '8px 12px', display: 'inline-block', marginBottom: 0 }}>
                {llmTestResult.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <button
        className="btn btn-primary btn-full"
        onClick={onContinue}
        disabled={!selectedConnection || !llmApiKey.trim()}
        id="btn-continue-fetch"
      >
        Continue to Fetch Issues
      </button>

      {/* Integration Cards */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <h2>Import from Test Management Tools</h2>
          <p>Connect to your existing test case repositories and management platforms</p>
        </div>

        <div className="integration-grid">
          {integrations.map(integ => (
            <div
              key={integ.id}
              className={`integration-card ${integ.id === 'jira' && selectedConnection ? 'connected' : ''}`}
            >
              <div className="integration-card-header">
                <div className="integration-card-header-left">
                  <div className={`integration-icon ${integ.iconClass}`}>{integ.icon}</div>
                  <h3>{integ.name}</h3>
                </div>
                {integ.id === 'jira' && selectedConnection ? (
                  <span className="badge badge-success">✓ Connected</span>
                ) : null}
              </div>

              {integ.available ? (
                <span className="badge badge-available">Available</span>
              ) : (
                <span className="badge badge-coming-soon">Coming Soon</span>
              )}

              <p>{integ.description}</p>

              <div className="features">
                <h4>Key Features:</h4>
                <ul>
                  {integ.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>

              <div className="card-action">
                {integ.id === 'jira' && selectedConnection ? (
                  <button
                    className="btn btn-outline btn-full btn-sm"
                    onClick={() => setShowForm(true)}
                  >
                    Manage Connection
                  </button>
                ) : integ.available ? (
                  <button
                    className="btn btn-primary btn-full btn-sm"
                    onClick={() => setShowForm(true)}
                  >
                    Connect
                  </button>
                ) : (
                  <button className="btn-notify">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 01-3.46 0" />
                    </svg>
                    Notify Me
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function HistoryModal({ onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history`);
      setHistory(res.data);
    } catch (err) {
      // Server might not be running
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>📋 Generation History</h2>
          <button className="modal-close" onClick={onClose} id="btn-close-history">×</button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div className="loading-overlay">
              <div className="spinner dark spinner-lg"></div>
              <p>Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 48, height: 48 }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <h3>No history yet</h3>
              <p>Your test plan generation history will appear here</p>
            </div>
          ) : (
            <table className="issues-table">
              <thead>
                <tr>
                  <th>Test Plan</th>
                  <th>Project</th>
                  <th>LLM</th>
                  <th>Issues</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ fontWeight: 500 }}>{entry.testPlanTitle}</td>
                    <td>{entry.projectKey}</td>
                    <td>
                      <span className="badge badge-available">{entry.llmProvider}</span>
                    </td>
                    <td>{entry.issueCount}</td>
                    <td>
                      <span className={`badge ${entry.status === 'completed' ? 'badge-success' : 'badge-coming-soon'}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                      {new Date(entry.generatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

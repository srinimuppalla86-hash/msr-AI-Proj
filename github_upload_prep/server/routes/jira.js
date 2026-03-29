const express = require('express');
const router = express.Router();
const store = require('../store');
const jiraService = require('../services/jiraService');

// POST /api/jira/fetch-issues - Fetch issues from a project
router.post('/fetch-issues', async (req, res) => {
  try {
    const { connectionId, projectKey, sprintVersion } = req.body;

    if (!connectionId || !projectKey) {
      return res.status(400).json({ error: 'connectionId and projectKey are required' });
    }

    const connection = store.getConnectionById(connectionId);
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    const result = await jiraService.fetchIssues(connection, projectKey, sprintVersion);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/jira/fetch-issue - Fetch a single issue by key (for instant preview)
router.post('/fetch-issue', async (req, res) => {
  try {
    const { connectionId, issueKey } = req.body;

    if (!connectionId || !issueKey) {
      return res.status(400).json({ error: 'connectionId and issueKey are required' });
    }

    const connection = store.getConnectionById(connectionId);
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    const issue = await jiraService.fetchIssueByKey(connection, issueKey);
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

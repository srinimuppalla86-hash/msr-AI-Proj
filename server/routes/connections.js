const express = require('express');
const router = express.Router();
const store = require('../store');
const jiraService = require('../services/jiraService');

// POST /api/connections/test - Test connection without saving
router.post('/test', async (req, res) => {
  try {
    const { url, email, apiToken } = req.body;
    if (!url || !email || !apiToken) {
      return res.status(400).json({ error: 'url, email, and apiToken are required' });
    }
    const testResult = await jiraService.testConnection(url, email, apiToken);
    if (!testResult.success) {
      return res.status(400).json({ error: testResult.error });
    }
    res.json({ success: true, message: `Connected successfully as ${testResult.user}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/connections - Save a new connection
router.post('/', async (req, res) => {
  try {
    const { name, url, email, apiToken, platform } = req.body;

    if (!name || !url || !email || !apiToken) {
      return res.status(400).json({ error: 'All fields are required: name, url, email, apiToken' });
    }

    // Test the connection first
    const testResult = await jiraService.testConnection(url, email, apiToken);

    if (!testResult.success) {
      return res.status(400).json({ error: testResult.error });
    }

    const connection = store.addConnection({
      name,
      platform: platform || 'jira',
      url,
      email,
      apiToken
    });

    res.status(201).json({
      ...connection,
      apiToken: '***hidden***',
      connectedUser: testResult.user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/connections - List all connections
router.get('/', (req, res) => {
  const connections = store.getConnections();
  res.json(connections);
});

// DELETE /api/connections/:id - Delete a connection
router.delete('/:id', (req, res) => {
  const deleted = store.deleteConnection(req.params.id);
  if (deleted) {
    res.json({ message: 'Connection deleted' });
  } else {
    res.status(404).json({ error: 'Connection not found' });
  }
});

// POST /api/connections/:id/test - Test an existing connection
router.post('/:id/test', async (req, res) => {
  try {
    const connection = store.getConnectionById(req.params.id);
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    const result = await jiraService.testConnection(connection.url, connection.email, connection.apiToken);
    if (result.success) {
      store.updateConnectionStatus(req.params.id, 'connected');
    } else {
      store.updateConnectionStatus(req.params.id, 'disconnected');
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const store = require('../store');
const llmService = require('../services/llmService');
const exportService = require('../services/exportService');

// POST /api/test-plan/test-llm - Test LLM Connection
router.post('/test-llm', async (req, res) => {
  try {
    const { llmProvider, llmApiKey } = req.body;
    if (!llmProvider || !llmApiKey) {
      return res.status(400).json({ error: 'LLM provider and API key are required' });
    }
    const result = await llmService.testConnection(llmProvider, llmApiKey);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/test-plan/generate - Generate a test plan
router.post('/generate', async (req, res) => {
  try {
    const {
      connectionId,
      productName,
      projectKey,
      additionalContext,
      selectedIssues,
      llmProvider,
      llmApiKey
    } = req.body;

    if (!selectedIssues || selectedIssues.length === 0) {
      return res.status(400).json({ error: 'At least one issue is required' });
    }
    if (!llmProvider || !llmApiKey) {
      return res.status(400).json({ error: 'LLM provider and API key are required' });
    }

    // Get connection info for title
    const connection = connectionId ? store.getConnectionById(connectionId) : null;

    // Generate test plan using LLM
    const rawMarkdown = await llmService.generateTestPlan(
      llmProvider,
      llmApiKey,
      selectedIssues,
      productName,
      projectKey,
      additionalContext
    );

    // Parse into sections
    const sections = llmService.parseSections(rawMarkdown);

    // Store the test plan
    const testPlan = store.addTestPlan({
      title: `Test Plan - ${productName || projectKey} - ${new Date().toLocaleDateString()}`,
      connectionName: connection?.name || 'Direct',
      projectKey,
      llmProvider,
      sections,
      rawMarkdown,
      sourceIssues: selectedIssues
    });

    res.json(testPlan);
  } catch (error) {
    // Add failed entry to history
    store.addHistoryEntry({
      testPlanTitle: `Failed - ${req.body?.projectKey || 'Unknown'}`,
      projectKey: req.body?.projectKey || '',
      llmProvider: req.body?.llmProvider || '',
      issueCount: req.body?.selectedIssues?.length || 0,
      status: 'failed'
    });

    res.status(500).json({ error: error.message });
  }
});

// GET /api/test-plan/:id - Get a specific test plan
router.get('/:id', (req, res) => {
  const plan = store.getTestPlanById(req.params.id);
  if (!plan) {
    return res.status(404).json({ error: 'Test plan not found' });
  }
  res.json(plan);
});

// GET /api/test-plan/:id/download/:format - Download test plan
router.get('/:id/download/:format', async (req, res) => {
  try {
    const plan = store.getTestPlanById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Test plan not found' });
    }

    const format = req.params.format.toLowerCase();

    if (format === 'docx') {
      const buffer = await exportService.generateDocx(plan);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${plan.title}.docx"`);
      res.send(buffer);
    } else if (format === 'pdf') {
      const buffer = await exportService.generatePdf(plan);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${plan.title}.pdf"`);
      res.send(buffer);
    } else {
      res.status(400).json({ error: 'Supported formats: docx, pdf' });
    }
  } catch (error) {
    res.status(500).json({ error: `Export failed: ${error.message}` });
  }
});

// GET /api/test-plan - List all test plans
router.get('/', (req, res) => {
  const plans = store.getTestPlans();
  res.json(plans);
});

module.exports = router;

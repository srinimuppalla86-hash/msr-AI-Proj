const { v4: uuidv4 } = require('uuid');

// In-memory storage
const connections = [];
const testPlans = [];
const history = [];

const store = {
  // --- Connections ---
  addConnection(connectionData) {
    const connection = {
      id: uuidv4(),
      name: connectionData.name,
      platform: connectionData.platform || 'jira',
      url: connectionData.url,
      email: connectionData.email,
      apiToken: connectionData.apiToken,
      status: 'connected',
      createdAt: new Date().toISOString()
    };
    connections.push(connection);
    return connection;
  },

  getConnections() {
    return connections.map(c => ({
      ...c,
      apiToken: '***hidden***'
    }));
  },

  getConnectionById(id) {
    return connections.find(c => c.id === id);
  },

  deleteConnection(id) {
    const index = connections.findIndex(c => c.id === id);
    if (index !== -1) {
      connections.splice(index, 1);
      return true;
    }
    return false;
  },

  updateConnectionStatus(id, status) {
    const connection = connections.find(c => c.id === id);
    if (connection) {
      connection.status = status;
      return connection;
    }
    return null;
  },

  // --- Test Plans ---
  addTestPlan(planData) {
    const plan = {
      id: uuidv4(),
      ...planData,
      generatedAt: new Date().toISOString()
    };
    testPlans.push(plan);

    // Add to history
    history.push({
      id: plan.id,
      testPlanTitle: plan.title,
      projectKey: plan.projectKey,
      generatedAt: plan.generatedAt,
      llmProvider: plan.llmProvider,
      issueCount: plan.sourceIssues ? plan.sourceIssues.length : 0,
      status: 'completed'
    });

    return plan;
  },

  getTestPlans() {
    return testPlans;
  },

  getTestPlanById(id) {
    return testPlans.find(p => p.id === id);
  },

  // --- History ---
  getHistory() {
    return history.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
  },

  addHistoryEntry(entry) {
    history.push({
      id: uuidv4(),
      ...entry,
      generatedAt: new Date().toISOString()
    });
  }
};

module.exports = store;

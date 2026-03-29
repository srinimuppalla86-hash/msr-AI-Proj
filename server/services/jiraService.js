const axios = require('axios');

class JiraService {
  /**
   * Fetch issues from Jira using REST API v3
   */
  async fetchIssues(connection, projectKey, sprintVersion = null) {
    const { url, email, apiToken } = connection;

    // Build JQL query
    let jql = `project = "${projectKey}"`;
    if (sprintVersion) {
      jql += ` AND (sprint = "${sprintVersion}" OR fixVersion = "${sprintVersion}")`;
    }
    jql += ' ORDER BY created DESC';

    const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    const apiUrl = `${baseUrl}/rest/api/3/search`;

    try {
      const response = await axios.get(apiUrl, {
        params: {
          jql,
          maxResults: 50,
          fields: 'summary,description,status,issuetype,priority,assignee,reporter,labels,customfield_10016,fixVersions,created,updated,sprint'
        },
        auth: {
          username: email,
          password: apiToken
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const issues = response.data.issues.map(issue => this._mapIssue(issue));
      return {
        total: response.data.total,
        issues
      };
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          throw new Error('Authentication failed. Please check your email and API token.');
        } else if (status === 404) {
          throw new Error('Jira instance not found. Please check your Jira URL.');
        } else if (status === 403) {
          throw new Error('Access forbidden. Please check your permissions.');
        } else {
          throw new Error(`Jira API error (${status}): ${error.response.data?.errorMessages?.join(', ') || 'Unknown error'}`);
        }
      }
      throw new Error(`Failed to connect to Jira: ${error.message}`);
    }
  }

  /**
   * Fetch a single issue by key
   */
  async fetchIssueByKey(connection, issueKey) {
    const { url, email, apiToken } = connection;
    const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    const apiUrl = `${baseUrl}/rest/api/3/issue/${issueKey}`;

    try {
      const response = await axios.get(apiUrl, {
        params: {
          fields: 'summary,description,status,issuetype,priority,assignee,reporter,labels,customfield_10016,fixVersions,created,updated,sprint'
        },
        auth: {
          username: email,
          password: apiToken
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      return this._mapIssue(response.data);
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          throw new Error(`Issue ${issueKey} not found.`);
        }
        throw new Error(`Failed to fetch issue: ${error.response.data?.errorMessages?.join(', ') || 'Unknown error'}`);
      }
      throw new Error(`Failed to connect to Jira: ${error.message}`);
    }
  }

  /**
   * Test connection to Jira
   */
  async testConnection(url, email, apiToken) {
    try {
      if (url.includes('home.atlassian.com') || url.includes('id.atlassian.com')) {
        return {
          success: false,
          error: "Invalid Jira URL. Please use your specific instance URL (e.g., https://yourcompany.atlassian.net) rather than the generic Atlassian portal."
        };
      }

      const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
      const apiUrl = `${baseUrl}/rest/api/3/myself`;

      const response = await axios.get(apiUrl, {
        auth: {
          username: email,
          password: apiToken
        },
        headers: {
          'Accept': 'application/json'
        }
      });

      return {
        success: true,
        user: response.data.displayName,
        email: response.data.emailAddress
      };
    } catch (error) {
      return {
        success: false,
        error: error.response
          ? `Authentication failed (${error.response.status})`
          : `Connection failed: ${error.message}`
      };
    }
  }

  /**
   * Map Jira API response to our schema
   */
  _mapIssue(issue) {
    const fields = issue.fields || {};

    // Extract description text from Atlassian Document Format
    let description = '';
    if (fields.description) {
      if (typeof fields.description === 'string') {
        description = fields.description;
      } else if (fields.description.content) {
        description = this._extractTextFromADF(fields.description);
      }
    }

    // Extract acceptance criteria from description or custom field
    let acceptanceCriteria = '';
    if (fields.customfield_10016) {
      if (typeof fields.customfield_10016 === 'string') {
        acceptanceCriteria = fields.customfield_10016;
      } else if (fields.customfield_10016.content) {
        acceptanceCriteria = this._extractTextFromADF(fields.customfield_10016);
      }
    }

    return {
      id: issue.id,
      key: issue.key,
      summary: fields.summary || '',
      description,
      status: fields.status?.name || '',
      issueType: fields.issuetype?.name || '',
      priority: fields.priority?.name || '',
      assignee: fields.assignee?.displayName || 'Unassigned',
      reporter: fields.reporter?.displayName || '',
      labels: fields.labels || [],
      acceptanceCriteria,
      sprintName: fields.sprint?.name || '',
      fixVersion: fields.fixVersions?.[0]?.name || '',
      createdDate: fields.created || '',
      updatedDate: fields.updated || ''
    };
  }

  /**
   * Extract plain text from Atlassian Document Format
   */
  _extractTextFromADF(adf) {
    if (!adf || !adf.content) return '';

    let text = '';
    const extractFromNode = (node) => {
      if (node.type === 'text') {
        text += node.text;
      }
      if (node.content) {
        node.content.forEach(child => extractFromNode(child));
        if (['paragraph', 'heading', 'bulletList', 'orderedList', 'listItem'].includes(node.type)) {
          text += '\n';
        }
      }
    };

    adf.content.forEach(node => extractFromNode(node));
    return text.trim();
  }
}

module.exports = new JiraService();

const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

const TEST_PLAN_TEMPLATE = `
You are an expert QA engineer and test planning specialist. Generate a comprehensive test plan based on the provided Jira issues and context.

**CRITICAL RULES:**
- Base ALL content on the actual Jira issue data provided. Do NOT invent or hallucinate details.
- If information is missing, use "[TO BE DEFINED]" as placeholder.
- Follow the exact 12-section structure below.
- Use professional, enterprise-grade language.
- Output in clean Markdown format.

**CONTEXT:**
- Product Name: {{productName}}
- Project Key: {{projectKey}}
- Additional Context: {{additionalContext}}
- Number of Issues: {{issueCount}}

**JIRA ISSUES DATA:**
{{issuesData}}

**GENERATE A TEST PLAN WITH EXACTLY THESE 12 SECTIONS:**

## 1. Objective
Write the objective of this test plan covering the features described in the Jira issues.

## 2. Scope
Define what's in scope based on the Jira issues - features, functionality, testing types, environments, success criteria, roles/responsibilities.

## 3. Inclusions
List specific modules/features to be tested based on the Jira issues.

## 4. Test Environments
Define the environments (OS, browsers, devices, URLs) where testing will occur. Use a table format.

## 5. Defect Reporting Procedure
Define the defect lifecycle, severity levels, tools, and escalation process.

## 6. Test Strategy
Define testing techniques (Equivalence Partitioning, BVA, Decision Table, State Transition, Use Case Testing, Exploratory Testing). Include the testing process steps.

## 7. Test Schedule
Create a schedule table with tasks and dates for test planning, creation, execution, and reporting.

## 8. Test Deliverables
List all deliverables: test plan, test cases, test scripts, defect reports, summary reports.

## 9. Entry and Exit Criteria
Define entry and exit criteria for: Requirements Analysis, Test Execution, and Test Closure phases.

## 10. Tools
List all tools needed (bug tracking, test management, screenshot tools, documentation).

## 11. Risks and Mitigations
Create a risk table with risk descriptions and mitigation strategies.

## 12. Approvals
Define what documents need client approval and the approval workflow.
`;

class LLMService {
  /**
   * Generate test plan using selected LLM provider
   */
  async generateTestPlan(provider, apiKey, issues, productName, projectKey, additionalContext) {
    const prompt = this._buildPrompt(issues, productName, projectKey, additionalContext);

    switch (provider.toLowerCase()) {
      case 'openai':
        return await this._generateWithOpenAI(apiKey, prompt);
      case 'gemini':
        return await this._generateWithGemini(apiKey, prompt);
      case 'groq':
        return await this._generateWithGroq(apiKey, prompt);
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }

  /**
   * Test connection and validity of API key by sending a minimal ping request
   */
  async testConnection(provider, apiKey) {
    try {
      switch (provider.toLowerCase()) {
        case 'openai':
          const openai = new OpenAI({ apiKey });
          await openai.models.list();
          return { success: true, message: 'OpenAI connection successful' };
        
        case 'gemini':
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
          await model.generateContent("ping");
          return { success: true, message: 'Gemini connection successful' };
        
        case 'groq':
          const groq = new Groq({ apiKey });
          await groq.models.list();
          return { success: true, message: 'Groq connection successful' };
          
        default:
          return { success: false, error: `Unsupported LLM provider: ${provider}` };
      }
    } catch (error) {
      if (error.status === 401 || error.message?.includes('API_KEY_INVALID')) {
        return { success: false, error: `Invalid ${provider} API key` };
      }
      return { success: false, error: `${provider} connection failed: ${error.message}` };
    }
  }

  /**
   * Build the prompt from template and data
   */
  _buildPrompt(issues, productName, projectKey, additionalContext) {
    const issuesData = issues.map(issue => {
      return `
**${issue.key}: ${issue.summary}**
- Type: ${issue.issueType}
- Status: ${issue.status}
- Priority: ${issue.priority}
- Assignee: ${issue.assignee}
- Description: ${issue.description || '[No description]'}
- Acceptance Criteria: ${issue.acceptanceCriteria || '[Not specified]'}
- Labels: ${issue.labels?.join(', ') || '[None]'}
`;
    }).join('\n---\n');

    return TEST_PLAN_TEMPLATE
      .replace('{{productName}}', productName || '[TO BE DEFINED]')
      .replace('{{projectKey}}', projectKey)
      .replace('{{additionalContext}}', additionalContext || 'None provided')
      .replace('{{issueCount}}', issues.length.toString())
      .replace('{{issuesData}}', issuesData);
  }

  /**
   * Generate using OpenAI GPT-4
   */
  async _generateWithOpenAI(apiKey, prompt) {
    const client = new OpenAI({ apiKey });

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert QA Test Planning specialist. Generate comprehensive, professional test plans in Markdown format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4096,
        temperature: 0.3
      });

      return response.choices[0].message.content;
    } catch (error) {
      if (error.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check and try again.');
      }
      throw new Error(`OpenAI generation failed: ${error.message}`);
    }
  }

  /**
   * Generate using Google Gemini
   */
  async _generateWithGemini(apiKey, prompt) {
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Gemini API key. Please check and try again.');
      }
      throw new Error(`Gemini generation failed: ${error.message}`);
    }
  }

  /**
   * Generate using Groq
   */
  async _generateWithGroq(apiKey, prompt) {
    const client = new Groq({ apiKey });

    try {
      const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert QA Test Planning specialist. Generate comprehensive, professional test plans in Markdown format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4096,
        temperature: 0.3
      });

      return response.choices[0].message.content;
    } catch (error) {
      if (error.status === 401) {
        throw new Error('Invalid Groq API key. Please check and try again.');
      }
      throw new Error(`Groq generation failed: ${error.message}`);
    }
  }

  /**
   * Parse generated markdown into sections
   */
  parseSections(markdown) {
    const sections = {
      objective: '',
      scope: '',
      inclusions: '',
      testEnvironments: '',
      defectReportingProcedure: '',
      testStrategy: '',
      testSchedule: '',
      testDeliverables: '',
      entryAndExitCriteria: '',
      tools: '',
      risksAndMitigations: '',
      approvals: ''
    };

    const sectionMap = {
      'objective': 'objective',
      'scope': 'scope',
      'inclusions': 'inclusions',
      'test environments': 'testEnvironments',
      'test environment': 'testEnvironments',
      'defect reporting': 'defectReportingProcedure',
      'defect reporting procedure': 'defectReportingProcedure',
      'test strategy': 'testStrategy',
      'test schedule': 'testSchedule',
      'test deliverables': 'testDeliverables',
      'entry and exit criteria': 'entryAndExitCriteria',
      'entry & exit criteria': 'entryAndExitCriteria',
      'tools': 'tools',
      'risks and mitigations': 'risksAndMitigations',
      'risks & mitigations': 'risksAndMitigations',
      'approvals': 'approvals'
    };

    const lines = markdown.split('\n');
    let currentSection = null;
    let currentContent = [];

    for (const line of lines) {
      const headerMatch = line.match(/^##\s*\d*\.?\s*(.+)/);
      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n').trim();
        }

        // Find matching section
        const headerText = headerMatch[1].trim().toLowerCase();
        currentSection = null;
        for (const [key, value] of Object.entries(sectionMap)) {
          if (headerText.includes(key)) {
            currentSection = value;
            break;
          }
        }
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }

    // Save last section
    if (currentSection) {
      sections[currentSection] = currentContent.join('\n').trim();
    }

    return sections;
  }
}

module.exports = new LLMService();

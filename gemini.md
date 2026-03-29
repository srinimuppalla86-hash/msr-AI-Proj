# 📜 Project Constitution — Intelligent Test Planning Agent

## Identity
**Name:** Intelligent Test Planning Agent  
**Tagline:** Generate comprehensive test plans from Jira requirements using AI  
**Tech Stack:** React (Frontend) + Node.js/Express (Backend)  
**Storage:** In-memory (MVP)

---

## 🗃️ Data Schemas

### Connection Schema
```json
{
  "id": "uuid",
  "name": "string (e.g., VWO Production)",
  "platform": "jira",
  "url": "string (e.g., https://yourcompany.atlassian.net)",
  "email": "string",
  "apiToken": "string",
  "status": "connected | disconnected",
  "createdAt": "ISO 8601 timestamp"
}
```

### Jira Issue Schema (Fetched)
```json
{
  "id": "string (e.g., VWOAPP-123)",
  "key": "string",
  "summary": "string",
  "description": "string",
  "status": "string",
  "issueType": "string (Story, Bug, Task, Epic)",
  "priority": "string",
  "assignee": "string",
  "reporter": "string",
  "labels": ["string"],
  "acceptanceCriteria": "string",
  "sprintName": "string",
  "fixVersion": "string",
  "createdDate": "ISO 8601",
  "updatedDate": "ISO 8601"
}
```

### Test Plan Generation Request
```json
{
  "connectionId": "uuid",
  "productName": "string",
  "projectKey": "string",
  "sprintVersion": "string | null",
  "additionalContext": "string | null",
  "selectedIssues": ["JiraIssue"],
  "llmProvider": "openai | gemini | groq",
  "llmApiKey": "string",
  "templateSections": ["string"]
}
```

### Generated Test Plan Schema
```json
{
  "id": "uuid",
  "title": "string",
  "generatedAt": "ISO 8601",
  "connectionName": "string",
  "projectKey": "string",
  "llmProvider": "string",
  "sections": {
    "objective": "string (markdown)",
    "scope": "string (markdown)",
    "inclusions": "string (markdown)",
    "testEnvironments": "string (markdown)",
    "defectReportingProcedure": "string (markdown)",
    "testStrategy": "string (markdown)",
    "testSchedule": "string (markdown)",
    "testDeliverables": "string (markdown)",
    "entryAndExitCriteria": "string (markdown)",
    "tools": "string (markdown)",
    "risksAndMitigations": "string (markdown)",
    "approvals": "string (markdown)"
  },
  "rawMarkdown": "string",
  "sourceIssues": ["JiraIssue"]
}
```

### History Entry Schema
```json
{
  "id": "uuid",
  "testPlanTitle": "string",
  "projectKey": "string",
  "generatedAt": "ISO 8601",
  "llmProvider": "string",
  "issueCount": "number",
  "status": "completed | failed"
}
```

---

## 📏 Behavioral Rules

1. **Instant Fetch:** When user provides a Jira ID / Project Key, fetch immediately — no unnecessary confirmation dialogs.
2. **Preview Before Generate:** After fetching, show a Preview button so user can verify ticket details before committing to generation.
3. **Template Fidelity:** All generated test plans MUST follow the 12-section template structure (Objective, Scope, Inclusions, Test Environments, Defect Reporting, Test Strategy, Test Schedule, Test Deliverables, Entry/Exit Criteria, Tools, Risks & Mitigations, Approvals).
4. **No Hallucination:** The LLM must base the test plan on actual Jira issue data. If data is missing, flag it as "[TO BE DEFINED]" rather than inventing details.
5. **Multi-LLM Support:** User can choose between OpenAI GPT-4, Google Gemini, or Groq for generation.
6. **Download Formats:** Generated test plan must be downloadable as both PDF and DOCX.
7. **Graceful Degradation:** If Jira connection fails, show clear error messages. If LLM fails, allow retry.
8. **Coming Soon Cards:** TestRail, Zephyr, Xray, Qase, Azure DevOps are shown as "Coming Soon" with "Notify Me" buttons.

---

## 🏛️ Architectural Invariants

1. **React Frontend** with component-based 4-step wizard
2. **Node.js/Express Backend** with RESTful API
3. **In-Memory Storage** — all data stored in server-side variables (no database)
4. **API Keys** stored in `.env` file, never exposed to frontend
5. **LLM calls** happen server-side only
6. **CORS** enabled for local development
7. **Separation of concerns:** Jira fetching, LLM generation, and document export are separate service modules

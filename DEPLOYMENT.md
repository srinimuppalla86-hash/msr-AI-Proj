# 🚀 Deployment Guide: Intelligent Test Planning Agent

## 1. Prerequisites
- Node.js (v18 or higher)
- API Keys:
  - Jira API Token
  - OpenAI API Key (or Gemini/Groq depending on usage)

## 2. Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
```
*Note: API keys and Jira credentials are intentionally not hardcoded. Users provide them securely via the application UI per the architecture rules.*

## 3. Running Locally

**Terminal 1 (Backend):**
```bash
cd server
npm install
npm start
```

**Terminal 2 (Frontend):**
```bash
cd client
npm install
npm start
```

## 4. Production Deployment

### Option A: Vercel (Recommended for Frontend) + Render (Backend)

**Frontend (Vercel):**
1. Update `client/package.json` proxy to point to your deployed backend URL instead of `localhost:5000`.
2. Connect your GitHub repository to Vercel.
3. Set the Root Directory to `client`.
4. Deploy.

**Backend (Render/Heroku/Railway):**
1. Connect your GitHub repository to Render as a Web Service.
2. Set the Root Directory to `server`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Map the `PORT` environment variable if required by the cloud provider.

---

## 5. Maintenance & Limitations

1. **In-Memory Storage Limitations**:
   - The current MVP uses in-memory storage. All connection settings, generated test plans, and history will be lost when the Node.js backend server restarts.
   - For a production deployment, replace `server/store.js` with a database integration (e.g., MongoDB, PostgreSQL, or DynamoDB).

2. **CORS**:
   - The backend currently allows all CORS requests. For production, update `server/index.js` to restrict CORS to your specific frontend domain.

3. **Rate Limits**:
   - The application does not handle provider rate limits. If you process hundreds of Jira tickets at once, consider adding a retry mechanism with exponential backoff in `llmService.js`.

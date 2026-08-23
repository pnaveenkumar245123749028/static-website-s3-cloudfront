# Agentflow_AI — Agentic AI Operations Automation Platform

**Agentflow_AI** is a full-stack, enterprise-grade AI Operations Automation Platform that empowers operators to describe automations in plain natural language and transform them into executable visual workflows.

Equipped with a **5-Agent cooperating reasoning engine** (Planner, Execution, Validation, Recovery, and Monitoring), real-time event streaming over **Socket.IO**, drag-and-drop **React Flow** canvas, and third-party integrations (Gmail, Slack, Discord, Google Sheets) encrypted at rest with AES-256.

---

## 🌟 Key Features


1. **Natural Language to Visual Workflow**: Describe your automation in English (e.g. *"When a new invoice arrives via Webhook, analyze it with AI, notify Slack #finance, and log a row in Google Sheets"*), and Agentflow automatically generates complete nodes, edges, and configurations.
2. **Interactive Drag-and-Drop Studio**: Powered by React Flow (`@xyflow/react`), featuring a rich Node Palette, dynamic configuration panels, and glowing animated edges.
3. **5-Agent Cooperating Orchestration Chain**:
   - 🧭 **Planner Agent**: Performs DAG analysis and topological sorting to construct execution plans with confidence scoring.
   - ⚡ **Execution Agent**: Resolves template variables and executes steps against external OAuth integrations and AI providers.
   - 🛡️ **Validation Agent**: Verifies schema integrity and required fields for step outputs.
   - 🛟 **Recovery Agent**: Classifies failure types (`MISSING_FIELDS`, `API_FAILURE`, `AUTH_EXPIRED`, `RATE_LIMIT`, `TRANSIENT`) and applies automated exponential backoff or operator escalation.
   - 📡 **Monitoring Agent**: Emits structured timeline logs and pushes live events via Socket.IO.
4. **Third-Party Integrations Hub**: Real OAuth & test simulator connections for Gmail, Slack, Discord, Google Sheets, OpenRouter, and Google Gemini with AES-256 encryption at rest.
5. **Zero-Setup Local Development**: Built-in in-memory fallback stores for MongoDB and Redis/BullMQ, allowing immediate out-of-the-box local operation without requiring external database or Redis instances.
6. **Audited Execution Timelines**: Live event streaming, payload inspectors, and real-time execution controls (Pause, Resume, Cancel).

---

## 🏗️ Architecture & Tech Stack

### Frontend (`/client`)
- **Framework**: Next.js (Pages Router), React 19
- **Styling**: Tailwind CSS, PostCSS, Lucide Icons
- **Workflow Canvas**: React Flow (`@xyflow/react`)
- **State Management**: Zustand
- **Real-Time Client**: Socket.IO Client
- **HTTP Client**: Axios

### Backend (`/server`)
- **Runtime**: Node.js (ES Modules), Express
- **Real-Time Engine**: Socket.IO
- **Database**: MongoDB & Mongoose (with automated in-memory store fallback)
- **Background Queue**: BullMQ on Redis (with automated in-memory async job queue fallback)
- **Authentication**: JWT, bcryptjs (cost 12), express-rate-limit, express-validator
- **Security & Cryptography**: AES-256-GCM token encryption, helmet, CORS, compression
- **AI Models**: OpenRouter API, Google Gemini AI SDK, Deterministic Rule Engine

---

## 🚀 Step-by-Step Local Setup Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher (`v20+` recommended)
- **npm**: `v9.0.0` or higher
- *(Optional)*: Local MongoDB or MongoDB Atlas URI
- *(Optional)*: Local Redis instance

---

### Step 1: Clone or Navigate to Project Directory
```bash
cd "project folder"
```

---

### Step 2: Install Dependencies

#### Install Server Dependencies:
```bash
cd server
npm install
```

#### Install Client Dependencies:
```bash
cd ../client
npm install
```

---

### Step 3: Configure Environment Variables

#### Backend (`server/.env`):
A default `.env` file is already provided. You can customize API keys as needed:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
JWT_SECRET=agentflow_production_grade_jwt_secret_token_2026_superkey!
JWT_EXPIRES_IN=7d
CREDENTIAL_ENCRYPTION_KEY=agentflow_32_byte_aes_secret_key_2026!

# (Optional) Real MongoDB connection URI - leave empty to use built-in In-Memory store
MONGODB_URI=

# (Optional) Real Redis connection URL - leave empty to use built-in In-Memory background queue
REDIS_URL=

# (Optional) AI Provider Keys for live AI generation and execution
OPENROUTER_API_KEY=
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash

# (Optional) OAuth Credentials for Gmail, Slack, Discord, Google Sheets
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REDIRECT_URI=http://localhost:5000/api/integrations/oauth/gmail/callback

SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_REDIRECT_URI=http://localhost:5000/api/integrations/oauth/slack/callback

DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=
DISCORD_REDIRECT_URI=http://localhost:5000/api/integrations/oauth/discord/callback

SHEETS_CLIENT_ID=
SHEETS_CLIENT_SECRET=
SHEETS_REDIRECT_URI=http://localhost:5000/api/integrations/oauth/sheets/callback
```

#### Frontend (`client/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

### Step 4: Run Automated Backend Verification Tests

Before launching, you can run the built-in test suite to verify the database, encryption, AI generation, and the 5-agent orchestrator:
```bash
cd server
npm test
```

---

### Step 5: Start the Development Servers

Open two terminal windows:

#### Terminal 1 — Start the Backend Server:
```bash
cd server
npm run dev
```
> Server runs on `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`)

#### Terminal 2 — Start the Next.js Frontend:
```bash
cd client
npm run dev
```
> Frontend runs on `http://localhost:3000`

---

## 💻 Using the Platform

1. **Sign In / Register**: Open `http://localhost:3000` in your browser and click **Get Started** to register an operator account.
2. **AI Workflow Builder**: Navigate to `/workflows/builder` and type your prompt (e.g. *"When invoice webhook arrives, summarize with AI and send to Slack"*). Click **Generate Workflow** to see the graph materialize on the canvas.
3. **Edit & Configure Nodes**: Click any node on the canvas to open the right-hand **Configuration Panel** and adjust settings or add new nodes from the **Node Palette** on the left.
4. **Execute & Live Stream**: Click **Execute Agent Chain** to watch the Planner, Execution, Validation, Recovery, and Monitoring agents work in real time.
5. **Integrations Hub**: Manage Gmail, Slack, Discord, Google Sheets, OpenRouter, and Gemini credentials under `/integrations`.
6. **Execution Audit**: Browse full execution logs, durations, and payload inspectors under `/executions`.

---

## 📡 REST API Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service heartbeat & subsystems diagnostic |
| `POST` | `/api/auth/register` | Register operator account (bcrypt cost 12) |
| `POST` | `/api/auth/login` | Login and issue JWT |
| `GET` | `/api/auth/me` | Authenticated profile information |
| `GET` | `/api/workflows/dashboard` | Aggregated operator KPI metrics |
| `GET` | `/api/workflows` | List workflows with filtering & pagination |
| `POST` | `/api/workflows` | Create a workflow |
| `POST` | `/api/workflows/generate` | AI prompt-to-graph generator |
| `GET` | `/api/workflows/:id` | Get single workflow canvas data |
| `PUT` | `/api/workflows/:id` | Update workflow canvas and version |
| `POST` | `/api/workflows/:id/duplicate` | Clone workflow |
| `POST` | `/api/workflows/:id/execute` | Dispatch execution to agent orchestrator |
| `DELETE` | `/api/workflows/:id` | Delete workflow |
| `GET` | `/api/executions` | List execution sessions |
| `GET` | `/api/executions/:id` | Execution details and snapshot |
| `GET` | `/api/executions/:id/timeline` | Stream agent logs & execution events |
| `POST` | `/api/executions/:id/pause` | Pause active execution |
| `POST` | `/api/executions/:id/resume` | Resume paused execution |
| `POST` | `/api/executions/:id/cancel` | Cancel running execution |
| `GET` | `/api/integrations` | List integration providers & status |
| `GET` | `/api/integrations/oauth/:provider/start` | Initiate OAuth flow |
| `POST` | `/api/integrations` | Save encrypted API key / toggle |
| `POST` | `/api/integrations/:provider/test` | Test integration connection |
| `GET` | `/api/notifications` | List user execution notifications |
| `PUT` | `/api/notifications/:id/read` | Mark notification as read |

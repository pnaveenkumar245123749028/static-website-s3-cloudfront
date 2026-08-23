# Deployment Guide

**Overview**

This document shows how to deploy the backend to Vercel and the frontend to Render. It assumes your repository is hosted on GitHub (or GitLab) and that you have accounts on Vercel and Render.

**Prerequisites**
- A Git remote (GitHub/GitLab) with this repository
- Vercel account and access to the Git repo
- Render account and access to the Git repo
- Environment variables (Mongo URI, JWT secret, Redis URL, etc.)

**Backend — Vercel (recommended for serverless / lightweight APIs)**

1. Prepare the project
   - The backend lives in the `server` folder and has a `start` script: `node src/server.js`.
   - Ensure any sensitive values are in environment variables (do not commit `.env`).

2. Import to Vercel
   - Login to Vercel → New Project → Import Git Repository.
   - Set the **Root Directory** to `server` when prompted.
   - Set **Framework Preset** to "Other" or "Node.js".
   - Build Command: `npm install` (or `npm install && npm run build` if you add a build step).
   - Output Directory: leave empty.
   - Vercel will use the `start` script from `server/package.json` when running server previews, but note the next section about limitations.

3. Environment variables
   - Add the required env vars in the Vercel Project Settings → Environment Variables. Typical keys used by this project include:
     - `MONGO_URI` — MongoDB connection string
     - `JWT_SECRET`
     - `REDIS_URL` — Redis connection for `bullmq`
     - `NODE_ENV` — production
     - `PORT` — Vercel sets the port automatically; don't hardcode a port.

4. Important notes & limitations
   - Vercel is optimized for frontends and serverless functions. It is not intended for long-running processes, persistent WebSocket servers or background workers.
   - Your backend uses `socket.io` and `bullmq` (Redis) — these require persistent connections & background processing. Deploying the backend on Vercel may break these features.
   - Recommended alternative for full backend functionality: deploy the backend on Render (or another VPS/Platform-as-a-Service) which supports persistent Node processes and background workers. If you must use Vercel, refactor APIs to serverless functions (move endpoints into an `/api` functions structure) and offload sockets/queues to external services.

**Frontend — Render (Next.js app)**

1. Prepare the project
   - The frontend lives in the `client` folder and is a Next.js app. It has scripts: `build` and `start` (Next production server).

2. Create a new service on Render
   - Login to Render → New → Web Service.
   - Connect the same Git repo and select the `client` subdirectory as the Root Directory.
   - Branch: select the branch you want to deploy (e.g., `main`).
   - Build Command: `npm install && npm run build`.
   - Start Command: `npm run start` (Render will set `PORT` automatically).

3. Environment variables
   - Add environment variables in Render’s dashboard (e.g., `NEXT_PUBLIC_API_BASE_URL` pointing at your backend URL on Vercel).

4. Notes
   - If you prefer a fully static site, you can use `next export` and a Static Site on Render, but the app must be compatible with static export.

**If you switch: Backend on Render (recommended for sockets & workers)**

1. Create a new Web Service on Render for the `server` folder
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables (`MONGO_URI`, `REDIS_URL`, `JWT_SECRET`, etc.)
   - If you need a worker process for `bullmq`, create a second Render "Background Worker" using the same repo and point it to a worker start command (e.g., `node src/worker.js` or `node src/server.js --worker` if you add support).

**Common steps (commit & push)**

1. Add these files and push to your remote:

```bash
git add .gitignore deploy.md
git commit -m "Add deploy instructions and .gitignore"
git push
```

2. On Vercel and Render dashboards, when importing the repository, select the appropriate subdirectory (`server` or `client`) and configure environment variables.

**Troubleshooting & tips**
- If your backend needs WebSocket support, prefer Render or a dedicated socket-hosting solution.
- Use an external Redis (e.g., Upstash, Render Redis or a managed Redis) for queues.
- For quick testing, you can run the services locally:

```bash
# Backend (server)
cd server
npm install
npm run dev

# Frontend (client)
cd ../client
npm install
npm run dev
```

If you want, I can also create Vercel/Render specific configuration files (`vercel.json`, `render.yaml`) or prepare `Procfile`/Dockerfile for a more controlled deployment — tell me which you'd prefer.

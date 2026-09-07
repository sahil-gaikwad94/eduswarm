# EduSwarm

EduSwarm is a multi-agent AI learning platform for GATE CS, Web Development, and AI/ML. The repository now contains a real inspectable agentic vertical slice rather than a simulated list of stages: a Dean plans the work, a Researcher searches trusted sources, specialist agents compose and derive study artifacts, and a Fact-Checker can block publication.

## What is genuinely agentic here

The Python runtime uses a LangGraph state machine with Gemini and Qdrant. Knowledge must first be ingested into Qdrant through `POST /v1/knowledge/documents`; the Researcher semantically retrieves source chunks, Gemini generates structured artifacts from those chunks only, and the Fact-Checker rejects any claim without two retrieved chunk citations. Jobs can be inspected at `/v1/topic-jobs/:id/trace` and resumed from their last checkpoint at `/v1/topic-jobs/:id/resume`.

The live runtime requires `GEMINI_API_KEY` and a reachable Qdrant instance. Tests replace the Gemini/Qdrant adapter with a deterministic fake; production never falls back to fabricated source material.

## Architecture

- `apps/web`: React + Vite + TypeScript frontend.
- `apps/api`: Express API for onboarding, goals, curriculum, job submission, SSE progress, content access, and trace proxying.
- `services/agent-runtime`: FastAPI stateful agent graph with checkpoints, tools, provenance, verification, and resume endpoint.
- `packages/contracts`: shared domain contracts.
- `infra`: Docker Compose and Render Blueprint configuration.

## Local run

1. `cp .env.example .env`
2. `npm install`
3. Start infrastructure if needed: `docker compose -f infra/docker-compose.yml up -d mongo redis qdrant`
4. Start the agent runtime: `cd services/agent-runtime && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000`
5. Start the API in another terminal: `npm run dev:api`
6. Start the web app in another terminal: `npm run dev:web`
7. Open `http://localhost:5173`.

Before creating a topic job, ingest approved source text with `POST /v1/knowledge/documents`. The runtime fails closed when its Qdrant collection has fewer than two independent sources for a topic.

The UI has a demo identity header only in local development and test mode. In production, the API uses the Google OAuth authorization-code flow and signed, HTTP-only sessions. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, `PUBLIC_API_URL` (the public API callback origin), and `WEB_APP_URL` (the frontend redirect origin) before deployment. Persistent Mongo/Redis repositories are still required before horizontal scaling.

## Testing

- `npm test`: API unit and fail-closed runtime-unavailable tests.
- `npm run build`: API and frontend production builds.
- `pytest -q services/agent-runtime/test_main.py`: graph execution, verification, trace, and checkpoint tests.
- Live integration: run both services, submit `POST /api/jobs`, poll the job, fetch `/api/content/:jobId`, and inspect `/api/jobs/:id/trace`.

## Render deployment

The repository includes `render.yaml` for the API, agent runtime, and static frontend. Configure `MONGODB_URI`, `REDIS_URL`, `QDRANT_URL`, OAuth credentials, and provider keys in Render. The current file-backed checkpoint store is suitable for local development; production should set `EDUSWARM_STATE_DIR` only on a persistent volume or replace it with the planned Mongo checkpoint repository before horizontal scaling.

## Security and production boundaries

Generated code is never executed by the API or worker. External content and model output must be treated as untrusted. Any future code runner needs an isolated sandbox with strict CPU, memory, time, and network limits. Never commit `.env` files or provider credentials. Publication is fail-closed: no verified state means no user-visible content.

# EduSwarm

EduSwarm is a multi-agent AI learning platform for GATE CS, Web Development, and AI/ML. This repository contains the first production-minded vertical slice: onboarding, independent goals, a GATE Algorithms curriculum, asynchronous topic jobs, live progress, verified notes, flashcards, quizzes, and PYQ metadata.

## Architecture

- `apps/web`: React + Vite + TypeScript frontend.
- `apps/api`: Express API with demo auth mode, profile/goals, curriculum, job submission, SSE progress, and content endpoints.
- `services/agent-runtime`: FastAPI runtime with a LangGraph-compatible explicit pipeline and deterministic demo provider.
- `infra`: Docker Compose and Render Blueprint configuration.

The runtime deliberately uses deterministic providers by default so the app is runnable without paid credentials. Replace the provider adapter with an LLM/retrieval implementation when `LLM_API_KEY`, source credentials, and the approved PYQ corpus are available. Unverified content is never published.

## Local run

1. `cp .env.example .env`
2. `npm install`
3. `npm run dev:api`
4. In another terminal: `npm run dev:web`
5. Open `http://localhost:5173`.

The default demo sign-in creates a local learner. For production, configure Google OAuth and replace demo auth with the OAuth callback adapter.

## Render deployment

The repository includes `render.yaml`. Create a new Render Blueprint from this repository, provision the managed Redis and Mongo-compatible database offered by your Render account, and set the secret environment variables in the Render dashboard. The API and agent runtime are separate web services; the frontend is a static site. For a managed vector store, set `QDRANT_URL` to the hosted endpoint.

## Quality gates

`npm test` runs API unit tests. `npm run build` builds both applications. The agent runtime has Python unit tests under `services/agent-runtime/tests` and a deterministic evaluation fixture under `tests/evaluation`.

## Security notes

Generated code is not executed by the API or worker. Any future code runner must be isolated with strict CPU, memory, time, and network limits. Never commit `.env` files or provider credentials.
